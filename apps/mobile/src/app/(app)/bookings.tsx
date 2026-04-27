import { View, Text, StyleSheet } from 'react-native';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '@/theme';

export default function BookingsScreen() {
  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Bookings</Text>
      </View>

      <View style={styles.emptyState}>
        <Text style={styles.emptyEmoji}>📭</Text>
        <Text style={styles.emptyTitle}>No bookings yet</Text>
        <Text style={styles.emptySubtext}>
          When you make a booking, it will appear here with all the details.
        </Text>
      </View>

      <View style={styles.filterRow}>
        <View style={[styles.filterChip, styles.filterChipActive]}>
          <Text style={[styles.filterText, styles.filterTextActive]}>All</Text>
        </View>
        <View style={styles.filterChip}>
          <Text style={styles.filterText}>Upcoming</Text>
        </View>
        <View style={styles.filterChip}>
          <Text style={styles.filterText}>Past</Text>
        </View>
        <View style={styles.filterChip}>
          <Text style={styles.filterText}>Cancelled</Text>
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
  header: {
    marginBottom: SPACING.lg,
  },
  title: {
    fontSize: TYPOGRAPHY.sizes.xxl,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  emptyState: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xxxl,
    alignItems: 'center',
    marginBottom: SPACING.xl,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: SPACING.md,
  },
  emptyTitle: {
    fontSize: TYPOGRAPHY.sizes.lg,
    fontWeight: '600',
    color: COLORS.gray700,
    marginBottom: SPACING.sm,
  },
  emptySubtext: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.gray500,
    textAlign: 'center',
    lineHeight: 20,
  },
  filterRow: {
    flexDirection: 'row',
    gap: SPACING.sm,
  },
  filterChip: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.full,
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.sm,
    borderWidth: 1,
    borderColor: COLORS.gray200,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterText: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.gray600,
  },
  filterTextActive: {
    color: COLORS.white,
    fontWeight: '500',
  },
});
