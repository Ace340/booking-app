import { useSignUp, useAuth } from '@clerk/expo';
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

export default function SignUpScreen() {
  const { signUp } = useSignUp();
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = useState('');
  const [password, setPassword] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [pendingVerification, setPendingVerification] = useState(false);

  const handleSignUp = async () => {
    if (!isLoaded) return;

    setLoading(true);
    setError('');

    try {
      const { error: signUpError } = await signUp.password({
        emailAddress,
        password,
      });

      if (signUpError) {
        setError(signUpError.longMessage ?? signUpError.message);
        return;
      }

      await signUp.verifications.sendEmailCode();
      setPendingVerification(true);
    } catch (err: any) {
      const message =
        err?.errors?.[0]?.message ?? err?.message ?? 'Sign up failed';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!isLoaded) return;

    setLoading(true);
    setError('');

    try {
      const { error: verifyError } =
        await signUp.verifications.verifyEmailCode({ code });

      if (verifyError) {
        setError(verifyError.longMessage ?? verifyError.message);
        return;
      }

      if (signUp.status === 'complete') {
        await signUp.finalize({
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
      } else {
        setError(`Verification status: ${signUp.status}`);
      }
    } catch (err: any) {
      const message =
        err?.errors?.[0]?.message ?? err?.message ?? 'Verification failed';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  if (isSignedIn) return null;

  if (pendingVerification) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Verify your email</Text>
        <Text style={styles.subtitle}>We sent a code to {emailAddress}</Text>

        {error ? <Text style={styles.error}>{error}</Text> : null}

        <TextInput
          style={styles.input}
          value={code}
          placeholder="Enter verification code"
          placeholderTextColor="#666"
          onChangeText={setCode}
          keyboardType="numeric"
        />

        <Pressable
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleVerify}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Verify</Text>
          )}
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Account</Text>
      <Text style={styles.subtitle}>Sign up to get started</Text>

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
        onPress={handleSignUp}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Sign Up</Text>
        )}
      </Pressable>

      <Pressable onPress={() => router.push('/(auth)/sign-in' as Href)}>
        <Text style={styles.link}>
          Already have an account?{' '}
          <Text style={styles.linkBold}>Sign In</Text>
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
