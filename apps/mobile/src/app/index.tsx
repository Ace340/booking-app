import { Redirect } from 'expo-router';
import { useAuth } from '@clerk/expo';

export default function Index() {
  const { isSignedIn, isLoaded } = useAuth();

  console.log('📍 Index rendering, isLoaded:', isLoaded, 'isSignedIn:', isSignedIn);

  if (!isLoaded) {
    console.log('⏳ Loading auth...');
    return null;
  }

  if (isSignedIn) {
    console.log('✅ Redirecting to /profile instead of /home to test');
    return <Redirect href="/(app)/profile" />;
  }

  console.log('🔐 Redirecting to sign-in');
  return <Redirect href="/(auth)/sign-in" />;
}
