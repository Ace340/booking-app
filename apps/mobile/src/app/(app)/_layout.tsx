import { Redirect, Tabs } from 'expo-router';
import { Text, StyleSheet } from 'react-native';
import { useAuthStore } from '@/store';
import { COLORS, SPACING, TYPOGRAPHY } from '@/theme';

function TabIcon({ title, focused }: { title: string; focused: boolean }) {
  return (
    <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>
      {title}
    </Text>
  );
}

export default function AppLayout() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: true,
        headerStyle: styles.header,
        headerTitleStyle: styles.headerTitle,
        headerTintColor: COLORS.primary,
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.gray400,
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
  header: {
    backgroundColor: COLORS.surface,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '600',
    color: COLORS.primary,
  },
  tabBar: {
    backgroundColor: COLORS.surface,
    borderTopColor: COLORS.gray200,
    borderTopWidth: 1,
    paddingBottom: SPACING.sm,
    paddingTop: SPACING.sm,
    height: 60,
  },
  tabLabel: {
    fontSize: TYPOGRAPHY.sizes.xs,
    color: COLORS.gray400,
  },
  tabLabelActive: {
    color: COLORS.primary,
    fontWeight: '600',
  },
});
