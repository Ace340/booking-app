import { Redirect, Tabs } from 'expo-router';
import { Text, StyleSheet } from 'react-native';
import { useAuth } from '@clerk/expo';

console.log('🚀 AppLayout rendering...');

function TabIcon({ title, focused }: { title: string; focused: boolean }) {
  return (
    <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>
      {title}
    </Text>
  );
}

export default function AppLayout() {
  console.log('📱 AppLayout component rendering...');
  const { isSignedIn } = useAuth();

  console.log('🔐 AppLayout isSignedIn:', isSignedIn);

  if (!isSignedIn) {
    console.log('🔴 Redirecting to sign-in');
    return <Redirect href="/(auth)/sign-in" />;
  }

  console.log('✅ Showing tabs');
  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerStyle: { backgroundColor: '#fff' },
        headerTitleStyle: { fontSize: 18, fontWeight: '600', color: '#1e3a8a' },
        headerTintColor: '#1e3a8a',
        tabBarStyle: { backgroundColor: '#fff', borderTopColor: '#e2e8f0', borderTopWidth: 1, paddingBottom: 8, paddingTop: 8, height: 60 },
        tabBarActiveTintColor: '#1e3a8a',
        tabBarInactiveTintColor: '#94a3b8',
      }}
    >
      <Tabs.Screen
        name="home"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => <TabIcon title="Home" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="bookings"
        options={{
          title: 'Bookings',
          tabBarIcon: ({ focused }) => <TabIcon title="Bookings" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ focused }) => <TabIcon title="Profile" focused={focused} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabLabel: {
    fontSize: 12,
    color: '#94a3b8',
  },
  tabLabelActive: {
    color: '#1e3a8a',
    fontWeight: '600',
  },
});
