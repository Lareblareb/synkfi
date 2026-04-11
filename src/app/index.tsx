import React, { useEffect, useState } from 'react';
import { StatusBar, View, ActivityIndicator, StyleSheet, Text } from 'react-native';
import { NavigationContainer, DarkTheme } from '@react-navigation/native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StripeProvider } from '@stripe/stripe-react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { STRIPE_PUBLISHABLE_KEY } from '@env';
import { initI18n } from '../i18n';
import { RootNavigator } from '../navigation/RootNavigator';
import { useAuth } from '../hooks/useAuth';
import { colors } from '../theme/colors';

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

const App: React.FC = () => {
  const [isReady, setIsReady] = useState(false);
  const [initError, setInitError] = useState<string | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        await initI18n();
        setIsReady(true);
      } catch (err) {
        console.error('Init failed:', err);
        setInitError((err as Error)?.message ?? 'Failed to initialize');
        setIsReady(true);
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
          <StripeProvider
            publishableKey={STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder'}
            merchantIdentifier="merchant.com.synk.app"
          >
            <NavigationContainer theme={navigationTheme}>
              <AppContent />
            </NavigationContainer>
          </StripeProvider>
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
