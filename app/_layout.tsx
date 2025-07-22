import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar'
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { ErrorBoundary } from '@appsignal/react';
import { appsignal } from '@/utils/appsignal';
import { useMemo, useCallback } from 'react';
import { View, Text, StyleSheet } from 'react-native';

// Fallback component to show when an error occurs
const ErrorFallback = ({ error }: { error?: Error }) => (
  <View style={styles.errorContainer}>
    <Text style={styles.errorTitle}>Oops! Something went wrong</Text>
    <Text style={styles.errorMessage}>
      We've been notified about this issue and are working to fix it.
    </Text>
    {__DEV__ && error && (
      <Text style={styles.errorDetails}>{error.message}</Text>
    )}
  </View>
);

export default function RootLayout() {
  useFrameworkReady();
  
  // Memoize the fallback component to prevent unnecessary re-renders
  const fallback = useCallback((error?: Error) => <ErrorFallback error={error} />, []);
  
  // Memoize tags for the error boundary
  const tags = useMemo(() => ({ 
    component: 'RootLayout',
    platform: 'react-native'
  }), []);

  return (
    <>
      <ErrorBoundary
        instance={appsignal}
        action="RootApp"
        tags={tags}
        fallback={fallback}
      >
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="+not-found" />
        </Stack>
      </ErrorBoundary>
      <StatusBar style="auto" />
    </>
  );
}

const styles = StyleSheet.create({
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#ffffff',
  },
  errorTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#ef4444',
    marginBottom: 16,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: '#6b7280',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 16,
  },
  errorDetails: {
    fontSize: 12,
    color: '#9ca3af',
    fontFamily: 'monospace',
    textAlign: 'center',
    marginTop: 16,
    padding: 12,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
  },
});
