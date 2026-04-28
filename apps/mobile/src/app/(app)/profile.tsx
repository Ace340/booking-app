import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuth, useUser, useClerk } from '@clerk/expo';
import { COLORS, SPACING, BORDER_RADIUS, TYPOGRAPHY } from '@/theme';

export default function ProfileScreen() {
  const { isSignedIn } = useAuth();
  const { user: clerkUser } = useUser();
  const { signOut } = useClerk();

  const displayName = clerkUser?.fullName ?? 'Guest';
  const email = clerkUser?.primaryEmailAddress?.emailAddress ?? 'No email';

  return (
    <View style={styles.container}>
      <View style={styles.avatarSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>
            {displayName.charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.userName}>{displayName}</Text>
        <Text style={styles.userEmail}>{email}</Text>
      </View>

      <View style={styles.menuSection}>
        <View style={styles.menuItem}>
          <Text style={styles.menuLabel}>Edit Profile</Text>
          <Text style={styles.menuChevron}>›</Text>
        </View>

        <View style={styles.menuDivider} />

        <View style={styles.menuItem}>
          <Text style={styles.menuLabel}>Notifications</Text>
          <Text style={styles.menuChevron}>›</Text>
        </View>

        <View style={styles.menuDivider} />

        <View style={styles.menuItem}>
          <Text style={styles.menuLabel}>Settings</Text>
          <Text style={styles.menuChevron}>›</Text>
        </View>

        <View style={styles.menuDivider} />

        <View style={styles.menuItem}>
          <Text style={styles.menuLabel}>Help & Support</Text>
          <Text style={styles.menuChevron}>›</Text>
        </View>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={() => signOut()}>
        <Text style={styles.logoutText}>Sign Out</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    padding: SPACING.xl,
  },
  avatarSection: {
    alignItems: 'center',
    paddingVertical: SPACING.xxxl,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: BORDER_RADIUS.full,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SPACING.md,
  },
  avatarText: {
    fontSize: TYPOGRAPHY.sizes.xxl,
    fontWeight: 'bold',
    color: COLORS.white,
  },
  userName: {
    fontSize: TYPOGRAPHY.sizes.xl,
    fontWeight: '600',
    color: COLORS.gray800,
    marginBottom: SPACING.xs,
  },
  userEmail: {
    fontSize: TYPOGRAPHY.sizes.sm,
    color: COLORS.gray500,
  },
  menuSection: {
    backgroundColor: COLORS.surface,
    borderRadius: BORDER_RADIUS.lg,
    paddingVertical: SPACING.sm,
    marginBottom: SPACING.xxl,
  },
  menuItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingVertical: SPACING.md,
  },
  menuLabel: {
    fontSize: TYPOGRAPHY.sizes.md,
    color: COLORS.gray700,
  },
  menuChevron: {
    fontSize: TYPOGRAPHY.sizes.xl,
    color: COLORS.gray400,
  },
  menuDivider: {
    height: 1,
    backgroundColor: COLORS.gray100,
    marginHorizontal: SPACING.lg,
  },
  logoutButton: {
    backgroundColor: COLORS.errorLight,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    alignItems: 'center',
  },
  logoutText: {
    color: COLORS.error,
    fontSize: TYPOGRAPHY.sizes.md,
    fontWeight: '600',
  },
});
