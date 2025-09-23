import { StyleSheet } from 'react-native';
import { COLORS } from '../constants/colors';
import { SPACING } from '../constants/spacing';

export const attendanceStyles = StyleSheet.create({
  // Container styles
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingBottom: SPACING.xl,
  },
  contentContainer: {
    padding: SPACING.md,
  },

  // Header styles
  headerContainer: {
    height: 120,
    justifyContent: 'space-between',
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.xl,
  },
  headerButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 25,
    width: 50,
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    color: COLORS.text.white,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    flex: 1,
    marginHorizontal: SPACING.md,
  },

  // Card styles
  cardContainer: {
    gap: SPACING.md,
    marginTop: SPACING.md,
  },
  cardContent: {
    padding: SPACING.lg,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  cardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
    textTransform: 'capitalize',
  },
  cardTime: {
    fontSize: 14,
    color: COLORS.text.secondary,
    marginTop: 2,
  },
  cardAddress: {
    fontSize: 12,
    color: COLORS.text.secondary,
    marginTop: SPACING.xs,
    lineHeight: 16,
  },
  cardImageContainer: {
    marginTop: SPACING.md,
    alignItems: 'center',
  },
  cardImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  cardImageLabel: {
    fontSize: 12,
    color: COLORS.text.secondary,
    marginTop: SPACING.xs,
  },

  // Summary styles
  summaryContainer: {
    backgroundColor: COLORS.background.surface,
    borderRadius: 12,
    marginBottom: SPACING.md,
    padding: SPACING.lg,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
    textAlign: 'center',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.glass.border,
  },
  summaryRowLast: {
    borderBottomWidth: 0,
  },
  summaryLabel: {
    fontSize: 14,
    color: COLORS.text.secondary,
    flex: 1,
  },
  summaryValue: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  summaryIcon: {
    marginRight: SPACING.sm,
  },

  // Empty state styles
  emptyStateContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  emptyStateIcon: {
    marginBottom: SPACING.lg,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginBottom: SPACING.sm,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
    lineHeight: 20,
  },
  emptyStateButton: {
    borderRadius: 25,
    paddingHorizontal: SPACING.xl,
    paddingVertical: SPACING.md,
  },

  // Loading styles
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background.primary,
  },
  loadingText: {
    marginTop: SPACING.md,
    fontSize: 16,
    color: COLORS.text.secondary,
  },

  // Error styles
  errorContainer: {
    backgroundColor: COLORS.status.error + '10',
    borderColor: COLORS.status.error,
    borderWidth: 1,
    borderRadius: 8,
    padding: SPACING.md,
    margin: SPACING.md,
  },
  errorText: {
    color: COLORS.status.error,
    fontSize: 14,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: SPACING.md,
    paddingHorizontal: SPACING.lg,
  },
});

export const gradientColors = {
  primary: ['#667eea', '#764ba2'],
  secondary: ['#f093fb', '#f5576c'],
  success: ['#4facfe', '#00f2fe'],
  warning: ['#f093fb', '#f5576c'],
};