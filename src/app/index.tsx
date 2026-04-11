import React, { useEffect, useState } from 'react';
import { StatusBar, View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as SplashScreen from 'expo-splash-screen';
import { initI18n } from '../i18n';
import { RootNavigator } from '../navigation/RootNavigator';
import { useAuth } from '../hooks/useAuth';
import { colors } from '../theme/colors';

let StripeProviderComponent: React.ComponentType<{
  publishableKey: string;
  merchantIdentifier?: string;
  children: React.ReactNode;
}> | null = null;

try {
  StripeProviderComponent =
    require('@stripe/stripe-react-native').StripeProvider;
} catch {
  StripeProviderComponent = null;
}

let publishableKey = 'pk_test_placeholder';
try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const env = require('@env');
  publishableKey = env.STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder';
} catch {
  publishableKey = 'pk_test_placeholder';
}

try {
  SplashScreen.preventAutoHideAsync().catch(() => {
    // ignore - splash screen may already be hidden
  });
} catch {
  // expo-splash-screen unavailable - ignore
}

const navigationTheme = {
  ...DarkTheme,
  colors: {
    ...DarkTheme.colors,
    primary: colors.accent.lime,
    background: colors.bg.primary,
    card: colors.bg.surface,
    text: colors.text.primary,
    border: colors.border.subtle,
    notification: colors.accent.lime,
  },
};

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: Error | null }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('App crashed:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.errorContainer}>
          <Text style={styles.errorTitle}>Something went wrong</Text>
          <Text style={styles.errorText}>
            {this.state.error?.message ?? 'Unknown error'}
          </Text>
        </View>
      );
    }
    return this.props.children;
  }
}

const AppContent: React.FC = () => {
  useAuth();

  return (
    <>
      <StatusBar barStyle="light-content" backgroundColor={colors.bg.primary} />
      <RootNavigator />
    </>
  );
};

const AppShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  if (StripeProviderComponent) {
    const SP = StripeProviderComponent;
    return (
      <SP
        publishableKey={publishableKey}
        merchantIdentifier="merchant.com.synk.app"
      >
        {children}
      </SP>
    );
  }
  return <>{children}</>;
};

const App: React.FC = () => {
  const [isReady, setIsReady] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        await initI18n();
      } catch (err) {
        console.error('Init failed:', err);
        setInitError((err as Error)?.message ?? 'Failed to initialize');
      } finally {
        setIsReady(true);
        try {
          await SplashScreen.hideAsync();
        } catch {
          // ignore
        }
      }
    };
    init();
  }, []);

  if (!isReady) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color={colors.accent.lime} />
      </View>
    );
  }

  if (initError) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorTitle}>Initialization Error</Text>
        <Text style={styles.errorText}>{initError}</Text>
      </View>
    );
  }

  return (
    <ErrorBoundary>
      <GestureHandlerRootView style={styles.root}>
        <SafeAreaProvider>
          <AppShell>
            <NavigationContainer theme={navigationTheme}>
              <AppContent />
            </NavigationContainer>
          </AppShell>
        </SafeAreaProvider>
      </GestureHandlerRootView>
    </ErrorBoundary>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  loading: {
    flex: 1,
    backgroundColor: colors.bg.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    backgroundColor: colors.bg.primary,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  errorTitle: {
    color: colors.accent.lime,
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 12,
  },
  errorText: {
    color: colors.text.secondary,
    fontSize: 14,
    textAlign: 'center',
  },
});

export default App;
