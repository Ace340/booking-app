import { useSignIn, useAuth } from '@clerk/expo';
import { type Href, useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Pressable,
  StyleSheet,
  TextInput,
  View,
  Text,
  ActivityIndicator,
} from 'react-native';

export default function SignInScreen() {
  const { signIn } = useSignIn();
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignIn = async () => {
    if (!isLoaded) {
      setError('Authentication service is loading. Please wait...');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { error: signInError } = await signIn.password({
        emailAddress,
        password,
      });

      if (signInError) {
        setError(signInError.longMessage ?? signInError.message);
        return;
      }

      if (signIn.status === 'complete') {
        await signIn.finalize({
          navigate: ({ session, decorateUrl }) => {
            if (session?.currentTask) return;
            const url = decorateUrl('/');
            if (url.startsWith('http')) {
              // handled by Clerk
            } else {
              router.replace(url as Href);
            }
          },
        });
      } else if (signIn.status === 'needs_second_factor') {
        setError('Two-factor authentication is required');
      } else {
        setError(`Sign in status: ${signIn.status}`);
      }
    } catch (err: any) {
      const message =
        err?.errors?.[0]?.message ?? err?.message ?? 'Sign in failed';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (isSignedIn) return null;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Back</Text>
      <Text style={styles.subtitle}>Sign in to your account</Text>

      {error ? <Text style={styles.error}>{error}</Text> : null}

      <TextInput
        style={styles.input}
        value={emailAddress}
        placeholder="Email"
        placeholderTextColor="#666"
        onChangeText={setEmailAddress}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
      />
      <TextInput
        style={styles.input}
        value={password}
        placeholder="Password"
        placeholderTextColor="#666"
        onChangeText={setPassword}
        secureTextEntry
      />

      <Pressable
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleSignIn}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Sign In</Text>
        )}
      </Pressable>

      <Pressable onPress={() => router.push('/(auth)/sign-up' as Href)}>
        <Text style={styles.link}>
          Don&apos;t have an account?{' '}
          <Text style={styles.linkBold}>Sign Up</Text>
        </Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 32,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 14,
    fontSize: 16,
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#6c47ff',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  error: {
    color: '#e74c3c',
    marginBottom: 16,
    fontSize: 14,
  },
  link: {
    textAlign: 'center',
    color: '#666',
    fontSize: 14,
  },
  linkBold: {
    color: '#6c47ff',
    fontWeight: '600',
  },
});
