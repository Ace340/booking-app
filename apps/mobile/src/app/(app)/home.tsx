import { View, Text, StyleSheet } from 'react-native';
import { useAuthStore } from '@/store';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '@/theme';

export default function HomeScreen() {
  const user = useAuthStore((state) => state.user);

  return (
    <View style={styles.container}>
      <View style={styles.welcomeCard}>
        <Text style={styles.greeting}>Hello, {user?.name ?? 'Guest'} 👋</Text>
        <Text style={styles.subtitle}>What would you like to book today?</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Quick Actions</Text>

        <View style={styles.actionsGrid}>
          <View style={styles.actionCard}>
            <Text style={styles.actionEmoji}>📅</Text>
            <Text style={styles.actionLabel}>New Booking</Text>
          </View>

          <View style={styles.actionCard}>
            <Text style={styles.actionEmoji}>📋</Text>
            <Text style={styles.actionLabel}>My Bookings</Text>
          </View>

          <View style={styles.actionCard}>
            <Text style={styles.actionEmoji}>🏢</Text>
            <Text style={styles.actionLabel}>Resources</Text>
          </View>

          <View style={styles.actionCard}>
            <Text style={styles.actionEmoji}>⏰</Text>
            <Text style={styles.actionLabel}>Upcoming</Text>
          </View>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Activity</Text>
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>No recent activity</Text>
          <Text style={styles.emptySubtext}>Your bookings will appear here</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SPACING.xl,
  },
  welcomeCard: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xxl,
    marginBottom: SPACING.xl,
  },
  greeting: {
    fontSize: TYPOGRAPHY.sizes.xxl,
    fontWeight: 'bold',
    color: COLORS.white,
    marginBottom: SPACING.xs,
  },
  subtitle: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.gray200,
  },
  section: {
    marginBottom: SPACING.xl,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '600',
    color: COLORS.gray800,
    marginBottom: SPACING.md,
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  actionCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xl,
    width: '47%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  actionEmoji: {
    fontSize: 28,
    marginBottom: SPACING.sm,
  },
  actionLabel: {
    fontSize: TYPOGRAPHY.sizes.sm,
    fontWeight: '500',
    color: COLORS.gray700,
  },
  emptyCard: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xxl,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '500',
    color: COLORS.gray500,
    marginBottom: SPACING.xs,
  },
  emptySubtext: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.gray400,
  },
});
