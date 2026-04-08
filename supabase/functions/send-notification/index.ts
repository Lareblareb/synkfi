import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

// Firebase service account credentials (stored as a JSON string in env)
const firebaseProjectId = Deno.env.get("FIREBASE_PROJECT_ID")!;
const firebaseClientEmail = Deno.env.get("FIREBASE_CLIENT_EMAIL")!;
const firebasePrivateKey = (Deno.env.get("FIREBASE_PRIVATE_KEY") ?? "").replace(
  /\\n/g,
  "\n",
);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// ---------------------------------------------------------------------------
// Google OAuth2 access token via Service Account JWT
// ---------------------------------------------------------------------------

async function getFirebaseAccessToken(): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const payload = {
    iss: firebaseClientEmail,
    sub: firebaseClientEmail,
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
    scope: "https://www.googleapis.com/auth/firebase.messaging",
  };

  const encode = (obj: Record<string, unknown>) =>
    btoa(JSON.stringify(obj))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/, "");

  const headerB64 = encode(header);
  const payloadB64 = encode(payload as unknown as Record<string, unknown>);
  const unsignedToken = `${headerB64}.${payloadB64}`;

  // Import the RSA private key and sign the JWT
  const pemBody = firebasePrivateKey
    .replace(/-----BEGIN PRIVATE KEY-----/, "")
    .replace(/-----END PRIVATE KEY-----/, "")
    .replace(/\s/g, "");
  const binaryKey = Uint8Array.from(atob(pemBody), (c) => c.charCodeAt(0));

  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    binaryKey.buffer,
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );

  const signatureBuffer = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    cryptoKey,
    new TextEncoder().encode(unsignedToken),
  );

  const signatureB64 = btoa(String.fromCharCode(...new Uint8Array(signatureBuffer)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");

  const jwt = `${unsignedToken}.${signatureB64}`;

  // Exchange JWT for access token
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  if (!tokenRes.ok) {
    const errBody = await tokenRes.text();
    throw new Error(`Failed to get Firebase access token: ${errBody}`);
  }

  const { access_token } = await tokenRes.json();
  return access_token as string;
}

// ---------------------------------------------------------------------------
// Main handler
// ---------------------------------------------------------------------------

interface NotificationRequest {
  user_id: string;
  type: string;
  title_en: string;
  title_fi: string;
  body_en: string;
  body_fi: string;
  data?: Record<string, string>;
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const {
      user_id,
      type,
      title_en,
      title_fi,
      body_en,
      body_fi,
      data,
    }: NotificationRequest = await req.json();

    if (!user_id || !type) {
      return new Response(
        JSON.stringify({ error: "user_id and type are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // ---- Persist the notification in the database ----
    const { error: insertError } = await supabase.from("notifications").insert({
      user_id,
      type,
      title_en: title_en ?? null,
      title_fi: title_fi ?? null,
      body_en: body_en ?? null,
      body_fi: body_fi ?? null,
      data: data ?? null,
      read: false,
    });

    if (insertError) {
      console.error("Failed to insert notification:", insertError);
      // Continue to attempt push delivery even if DB insert fails
    }

    // ---- Look up the user's FCM token and preferred language ----
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select("fcm_token, preferred_language")
      .eq("id", user_id)
      .single();

    if (userError || !userData) {
      console.warn("User not found for notification:", user_id);
      return new Response(
        JSON.stringify({ success: true, push_sent: false, reason: "user_not_found" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    if (!userData.fcm_token) {
      console.log("No FCM token for user:", user_id);
      return new Response(
        JSON.stringify({ success: true, push_sent: false, reason: "no_fcm_token" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    // Pick locale-appropriate title/body
    const lang = userData.preferred_language ?? "en";
    const title = lang === "fi" ? (title_fi || title_en) : (title_en || title_fi);
    const body = lang === "fi" ? (body_fi || body_en) : (body_en || body_fi);

    // ---- Send push via Firebase Cloud Messaging HTTP v1 API ----
    const accessToken = await getFirebaseAccessToken();

    const fcmResponse = await fetch(
      `https://fcm.googleapis.com/v1/projects/${firebaseProjectId}/messages:send`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: {
            token: userData.fcm_token,
            notification: {
              title: title ?? "Synk",
              body: body ?? "",
            },
            data: {
              type,
              ...(data ?? {}),
            },
            android: {
              priority: "high",
              notification: {
                channel_id: "synk_default",
                sound: "default",
              },
            },
            apns: {
              payload: {
                aps: {
                  alert: {
                    title: title ?? "Synk",
                    body: body ?? "",
                  },
                  sound: "default",
                  badge: 1,
                },
              },
            },
          },
        }),
      },
    );

    if (!fcmResponse.ok) {
      const errBody = await fcmResponse.text();
      console.error("FCM send failed:", fcmResponse.status, errBody);

      // If the token is invalid/expired, clear it from the user record
      if (fcmResponse.status === 404 || fcmResponse.status === 400) {
        await supabase
          .from("users")
          .update({ fcm_token: null })
          .eq("id", user_id);
      }

      return new Response(
        JSON.stringify({ success: true, push_sent: false, reason: "fcm_error", detail: errBody }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
      );
    }

    const fcmResult = await fcmResponse.json();

    return new Response(
      JSON.stringify({ success: true, push_sent: true, fcm_message_id: fcmResult.name }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("send-notification error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } },
    );
  }
});
