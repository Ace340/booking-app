import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ClerkProvider, useAuth } from '@clerk/expo';
import { tokenCache } from '@clerk/expo/token-cache';
import { StyleSheet } from 'react-native';
import React, { useEffect } from 'react';

const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

// Log Clerk configuration for debugging
console.log('🔑 Clerk Configuration:');
console.log('  Key loaded:', !!publishableKey);
console.log('  Key preview:', publishableKey?.substring(0, 20) + '...');

if (!publishableKey) {
  throw new Error(
    'Add EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY to your .env file. ' +
    'Get it from https://dashboard.clerk.com'
  );
}

export default function RootLayout() {
  console.log('🏗️ RootLayout rendering...');
  return (
    <ClerkProvider
      publishableKey={publishableKey}
      tokenCache={tokenCache}
    >
      <ClerkMonitor />
      <GestureHandlerRootView style={styles.container}>
        <StatusBar style="auto" />
        <Slot />
      </GestureHandlerRootView>
    </ClerkProvider>
  );
}

// Component to monitor Clerk initialization
function ClerkMonitor() {
  const { isLoaded, isSignedIn } = useAuth();

  useEffect(() => {
    console.log('🔐 Clerk Monitor Effect:');
    console.log('  isLoaded:', isLoaded);
    console.log('  isSignedIn:', isSignedIn);
  }, [isLoaded, isSignedIn]);

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
