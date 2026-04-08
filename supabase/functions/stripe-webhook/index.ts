import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import Stripe from "https://esm.sh/stripe@14.14.0?target=deno";

const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") as string, {
  apiVersion: "2023-10-16",
  httpClient: Stripe.createFetchHttpClient(),
});

const endpointSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;
const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

serve(async (req: Request) => {
  const signature = req.headers.get("stripe-signature");
  if (!signature) {
    return new Response("Missing stripe-signature header", { status: 400 });
  }

  const body = await req.text();

  let event: Stripe.Event;
  try {
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      endpointSecret,
    );
  } catch (err) {
    console.error("Webhook signature verification failed:", err);
    return new Response(
      JSON.stringify({ error: `Webhook Error: ${(err as Error).message}` }),
      { status: 400 },
    );
  }

  // Use service_role to bypass RLS
  const supabase = createClient(supabaseUrl, supabaseServiceKey);

  // ---- Idempotency: store the webhook event ----
  const { error: insertError } = await supabase.from("stripe_webhooks").insert({
    event_type: event.type,
    stripe_event_id: event.id,
    payload: event.data,
    processed: false,
  });

  // If the event was already recorded, return 200 to acknowledge but skip processing
  if (insertError) {
    if (insertError.code === "23505") {
      // unique violation - already processed
      return new Response(JSON.stringify({ received: true, duplicate: true }), {
        status: 200,
        headers: { "Content-Type": "application/json" },
      });
    }
    console.error("Failed to store webhook event:", insertError);
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        await handlePaymentIntentSucceeded(supabase, event.data.object as Stripe.PaymentIntent);
        break;
      }
      case "payment_intent.payment_failed": {
        await handlePaymentIntentFailed(supabase, event.data.object as Stripe.PaymentIntent);
        break;
      }
      case "charge.refunded": {
        await handleChargeRefunded(supabase, event.data.object as Stripe.Charge);
        break;
      }
      default:
        console.log(`Unhandled event type: ${event.type}`);
    }

    // Mark as processed
    await supabase
      .from("stripe_webhooks")
      .update({ processed: true })
      .eq("stripe_event_id", event.id);
  } catch (err) {
    console.error(`Error processing ${event.type}:`, err);
    // Still return 200 so Stripe does not retry endlessly; the processed flag stays false
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
});

// ---------------------------------------------------------------------------
// Handlers
// ---------------------------------------------------------------------------

async function handlePaymentIntentSucceeded(
  supabase: ReturnType<typeof createClient>,
  paymentIntent: Stripe.PaymentIntent,
) {
  const { event_id, user_id } = paymentIntent.metadata;
  if (!event_id || !user_id) {
    console.warn("payment_intent.succeeded missing metadata", paymentIntent.id);
    return;
  }

  // Update participant payment status
  await supabase
    .from("event_participants")
    .update({ payment_status: "paid" })
    .eq("event_id", event_id)
    .eq("user_id", user_id);

  // Fetch event title for the notification
  const { data: eventData } = await supabase
    .from("events")
    .select("title")
    .eq("id", event_id)
    .single();

  const eventTitle = eventData?.title ?? "your event";

  // Send notification to the user
  await sendNotification(supabase, {
    user_id,
    type: "payment_success",
    title_en: "Payment Successful",
    title_fi: "Maksu onnistui",
    body_en: `Your payment for "${eventTitle}" has been confirmed.`,
    body_fi: `Maksusi tapahtumaan "${eventTitle}" on vahvistettu.`,
    data: { event_id, payment_intent_id: paymentIntent.id },
  });
}

async function handlePaymentIntentFailed(
  supabase: ReturnType<typeof createClient>,
  paymentIntent: Stripe.PaymentIntent,
) {
  const { event_id, user_id } = paymentIntent.metadata;
  if (!event_id || !user_id) {
    console.warn("payment_intent.payment_failed missing metadata", paymentIntent.id);
    return;
  }

  await supabase
    .from("event_participants")
    .update({ payment_status: "failed" })
    .eq("event_id", event_id)
    .eq("user_id", user_id);

  const { data: eventData } = await supabase
    .from("events")
    .select("title")
    .eq("id", event_id)
    .single();

  const eventTitle = eventData?.title ?? "your event";

  await sendNotification(supabase, {
    user_id,
    type: "payment_failed",
    title_en: "Payment Failed",
    title_fi: "Maksu epäonnistui",
    body_en: `Your payment for "${eventTitle}" could not be processed. Please try again.`,
    body_fi: `Maksusi tapahtumaan "${eventTitle}" epäonnistui. Yritä uudelleen.`,
    data: { event_id, payment_intent_id: paymentIntent.id },
  });
}

async function handleChargeRefunded(
  supabase: ReturnType<typeof createClient>,
  charge: Stripe.Charge,
) {
  const paymentIntentId =
    typeof charge.payment_intent === "string"
      ? charge.payment_intent
      : charge.payment_intent?.id;

  if (!paymentIntentId) {
    console.warn("charge.refunded missing payment_intent", charge.id);
    return;
  }

  // Retrieve the PaymentIntent to get metadata
  const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
  const { event_id, user_id } = paymentIntent.metadata;

  if (!event_id || !user_id) {
    console.warn("charge.refunded: PaymentIntent missing metadata", paymentIntentId);
    return;
  }

  await supabase
    .from("event_participants")
    .update({ payment_status: "refunded" })
    .eq("event_id", event_id)
    .eq("user_id", user_id);

  const { data: eventData } = await supabase
    .from("events")
    .select("title")
    .eq("id", event_id)
    .single();

  const eventTitle = eventData?.title ?? "your event";

  await sendNotification(supabase, {
    user_id,
    type: "payment_refunded",
    title_en: "Payment Refunded",
    title_fi: "Maksu palautettu",
    body_en: `Your payment for "${eventTitle}" has been refunded.`,
    body_fi: `Maksusi tapahtumaan "${eventTitle}" on palautettu.`,
    data: { event_id, payment_intent_id: paymentIntentId },
  });
}

// ---------------------------------------------------------------------------
// Inline notification helper (inserts DB row + invokes send-notification fn)
// ---------------------------------------------------------------------------

interface NotificationPayload {
  user_id: string;
  type: string;
  title_en: string;
  title_fi: string;
  body_en: string;
  body_fi: string;
  data: Record<string, string>;
}

async function sendNotification(
  supabase: ReturnType<typeof createClient>,
  payload: NotificationPayload,
) {
  // Insert notification record directly (service role bypasses RLS)
  await supabase.from("notifications").insert({
    user_id: payload.user_id,
    type: payload.type,
    title_en: payload.title_en,
    title_fi: payload.title_fi,
    body_en: payload.body_en,
    body_fi: payload.body_fi,
    data: payload.data,
    read: false,
  });

  // Invoke the send-notification Edge Function for push delivery
  try {
    await supabase.functions.invoke("send-notification", {
      body: payload,
    });
  } catch (err) {
    // Push failure should not break webhook processing
    console.error("Failed to invoke send-notification:", err);
  }
}
