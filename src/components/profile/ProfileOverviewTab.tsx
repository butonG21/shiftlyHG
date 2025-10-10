// src/components/profile/ProfileOverviewTab.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Dimensions,
  Pressable,
  RefreshControl,
} from 'react-native';
import {
  Text,
  Card,
  ProgressBar,
  Chip,
  Divider,
  IconButton,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  interpolate,
} from 'react-native-reanimated';

import { useAuth } from '../../contexts/AuthContext';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';
import { SPACING, BORDER_RADIUS } from '../../constants/spacing';
import { ProfileStatistics, Achievement } from '../../types/profile';

const { width } = Dimensions.get('window');

interface StatCardProps {
  title: string;
  value: string;
  subtitle: string;
  icon: string;
  gradient: readonly string[];
  progress?: number;
  trend?: 'up' | 'down' | 'stable';
  trendValue?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  gradient,
  progress,
  trend,
  trendValue,
}) => {
  const animatedValue = useSharedValue(0);

  useEffect(() => {
    animatedValue.value = withTiming(1, { duration: 800 });
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    opacity: animatedValue.value,
    transform: [
      {
        translateY: interpolate(animatedValue.value, [0, 1], [20, 0]),
      },
    ],
  }));

  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return 'trending-up';
      case 'down':
        return 'trending-down';
      default:
        return 'trending-neutral';
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return COLORS.status.success;
      case 'down':
        return COLORS.status.error;
      default:
        return COLORS.text.secondary;
    }
  };

  return (
    <Animated.View style={[styles.statCard, animatedStyle]}>
      <LinearGradient colors={[gradient[0] || COLORS.primary, gradient[1] || gradient[0] || COLORS.primary]} style={styles.statCardGradient}>
        <View style={styles.statCardHeader}>
          <View style={styles.statCardIcon}>
            <MaterialCommunityIcons
              name={icon as any}
              size={24}
              color={COLORS.text.white}
            />
          </View>
          {trend && (
            <View style={styles.trendContainer}>
              <MaterialCommunityIcons
                name={getTrendIcon() as any}
                size={16}
                color={getTrendColor()}
              />
              <Text style={[styles.trendText, { color: getTrendColor() }]}>
                {trendValue}
              </Text>
            </View>
          )}
        </View>

        <View style={styles.statCardContent}>
          <Text style={styles.statValue}>{value}</Text>
          <Text style={styles.statTitle}>{title}</Text>
          <Text style={styles.statSubtitle}>{subtitle}</Text>

          {progress !== undefined && (
            <View style={styles.progressContainer}>
              <ProgressBar
                progress={progress / 100}
                color={COLORS.text.white}
                style={styles.progressBar}
              />
              <Text style={styles.progressText}>{progress}%</Text>
            </View>
          )}
        </View>
      </LinearGradient>
    </Animated.View>
  );
};

const ProfileOverviewTab: React.FC = () => {
  const { user } = useAuth();
  const [refreshing, setRefreshing] = useState(false);
  const [editMode, setEditMode] = useState(false);

  // Mock data - replace with real data from API
  const statistics: ProfileStatistics = {
    totalAttendance: 95,
    punctualityRate: 88,
    overtimeHours: 24,
    leaveBalance: 12,
    averageWorkHours: 8.5,
    presentDays: 22,
    lateDays: 2,
    absentDays: 1,
    attendanceRate: 95,
    thisMonthAttendance: 95,
    lastMonthAttendance: 92,
  };

  const achievements: Achievement[] = [
    {
      id: '1',
      title: 'Perfect Attendance',
      description: 'No absences for 30 days',
      icon: '🏆',
      emoji: '🏆',
      badgeColor: COLORS.status.success,
      category: 'attendance',
      earnedDate: '2024-01-15',
      isEarned: true,
    },
    {
      id: '2',
      title: 'Early Bird',
      description: 'Always on time for a week',
      icon: '🌅',
      emoji: '🌅',
      badgeColor: COLORS.status.info,
      category: 'punctuality',
      earnedDate: '2024-01-10',
      isEarned: true,
    },
    {
      id: '3',
      title: 'Team Player',
      description: 'Helped 5 colleagues',
      icon: '🤝',
      emoji: '🤝',
      badgeColor: COLORS.status.warning,
      category: 'performance',
      earnedDate: '2024-01-08',
      isEarned: true,
    },
  ];

  const personalInfo = [
    {
      label: 'Employee ID',
      value: user?.uid?.slice(-6) || 'EMP001',
      icon: 'badge-account',
      editable: false,
    },
    {
      label: 'Email',
      value: user?.email || 'user@company.com',
      icon: 'email',
      editable: false,
    },
    {
      label: 'Phone',
      value: user?.phoneNumber || '+62 812 3456 7890',
      icon: 'phone',
      editable: true,
    },
    {
      label: 'Department',
      value: user?.department || 'Engineering',
      icon: 'domain',
      editable: false,
    },
    {
      label: 'Join Date',
      value: user?.joinDate || '2023-01-15',
      icon: 'calendar',
      editable: false,
    },
    {
      label: 'Manager',
      value: user?.department || 'IT Department',
      icon: 'account-supervisor',
      editable: false,
    },
  ];

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => setRefreshing(false), 2000);
  };

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Statistics Dashboard */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Statistics Dashboard</Text>
          <IconButton
            icon="refresh"
            size={20}
            onPress={onRefresh}
            iconColor={COLORS.text.secondary}
          />
        </View>

        <View style={styles.statsGrid}>
          <StatCard
            title="Attendance Rate"
            value={`${statistics.totalAttendance}%`}
            subtitle="This month"
            icon="calendar-check"
            gradient={COLORS.gradient.primary}
            progress={statistics.totalAttendance}
            trend="up"
            trendValue="+5%"
          />
          <StatCard
            title="Punctuality"
            value={`${statistics.punctualityRate}%`}
            subtitle="On time arrivals"
            icon="clock-check"
            gradient={COLORS.gradient.secondary}
            progress={statistics.punctualityRate}
            trend="up"
            trendValue="+2%"
          />
          <StatCard
            title="Overtime Hours"
            value={`${statistics.overtimeHours}h`}
            subtitle="This month"
            icon="clock-plus"
            gradient={COLORS.gradient.accent}
            trend="down"
            trendValue="-3h"
          />
          <StatCard
            title="Leave Balance"
            value={`${statistics.leaveBalance}`}
            subtitle="Days remaining"
            icon="beach"
            gradient={COLORS.gradient.warning}
            trend="stable"
            trendValue="0"
          />
        </View>
      </View>

      {/* Personal Information */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <Pressable
            style={styles.editButton}
            onPress={() => setEditMode(!editMode)}
          >
            <MaterialCommunityIcons
              name={editMode ? 'check' : 'pencil'}
              size={20}
              color={COLORS.primary}
            />
            <Text style={styles.editButtonText}>
              {editMode ? 'Save' : 'Edit'}
            </Text>
          </Pressable>
        </View>

        <Card style={styles.infoCard}>
          <Card.Content style={styles.infoCardContent}>
            {personalInfo.map((info, index) => (
              <View key={index}>
                <View style={styles.infoRow}>
                  <View style={styles.infoIcon}>
                    <MaterialCommunityIcons
                      name={info.icon as any}
                      size={20}
                      color={COLORS.primary}
                    />
                  </View>
                  <View style={styles.infoContent}>
                    <Text style={styles.infoLabel}>{info.label}</Text>
                    <Text
                      style={[
                        styles.infoValue,
                        !info.editable && styles.infoValueReadonly,
                      ]}
                    >
                      {info.value}
                    </Text>
                  </View>
                  {info.editable && editMode && (
                    <IconButton
                      icon="pencil"
                      size={16}
                      onPress={() => {}}
                      iconColor={COLORS.text.secondary}
                    />
                  )}
                </View>
                {index < personalInfo.length - 1 && (
                  <Divider style={styles.infoDivider} />
                )}
              </View>
            ))}
          </Card.Content>
        </Card>
      </View>

      {/* Recent Achievements */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recent Achievements</Text>
          <Pressable style={styles.viewAllButton}>
            <Text style={styles.viewAllText}>View All</Text>
            <MaterialCommunityIcons
              name="chevron-right"
              size={16}
              color={COLORS.primary}
            />
          </Pressable>
        </View>

        <View style={styles.achievementsContainer}>
          {achievements.slice(0, 3).map((achievement) => (
            <Card key={achievement.id} style={styles.achievementCard}>
              <Card.Content style={styles.achievementContent}>
                <View style={styles.achievementIcon}>
                  <Text style={styles.achievementEmoji}>{achievement.icon}</Text>
                </View>
                <View style={styles.achievementInfo}>
                  <Text style={styles.achievementTitle}>
                    {achievement.title}
                  </Text>
                  <Text style={styles.achievementDescription}>
                    {achievement.description}
                  </Text>
                  <View style={styles.achievementMeta}>
                    <Chip
                      mode="outlined"
                      style={styles.achievementCategory}
                      textStyle={styles.achievementCategoryText}
                    >
                      {achievement.category}
                    </Chip>
                    <Text style={styles.achievementDate}>
                      {new Date(achievement.earnedDate).toLocaleDateString()}
                    </Text>
                  </View>
                </View>
              </Card.Content>
            </Card>
          ))}
        </View>
      </View>

      {/* Bottom Spacing */}
      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  section: {
    marginBottom: SPACING.xl,
    paddingHorizontal: SPACING.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  sectionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text.primary,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  statCard: {
    width: (width - SPACING.lg * 2 - SPACING.md) / 2,
    height: 140,
  },
  statCardGradient: {
    flex: 1,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    justifyContent: 'space-between',
  },
  statCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  statCardIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 12,
  },
  trendText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    marginLeft: 2,
  },
  statCardContent: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  statValue: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text.white,
    marginBottom: 2,
  },
  statTitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.text.white,
    marginBottom: 2,
  },
  statSubtitle: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.text.white,
    opacity: 0.8,
    marginBottom: SPACING.xs,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  progressBar: {
    flex: 1,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  progressText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.text.white,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  editButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  editButtonText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.primary,
  },
  infoCard: {
    backgroundColor: COLORS.background.surface,
    borderRadius: BORDER_RADIUS.lg,
    elevation: 2,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  infoCardContent: {
    padding: SPACING.lg,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.sm,
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
    marginBottom: 2,
  },
  infoValue: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.text.primary,
  },
  infoValueReadonly: {
    color: COLORS.text.secondary,
  },
  infoDivider: {
    marginVertical: SPACING.xs,
    backgroundColor: COLORS.border,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewAllText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.primary,
  },
  achievementsContainer: {
    gap: SPACING.md,
  },
  achievementCard: {
    backgroundColor: COLORS.background.surface,
    borderRadius: BORDER_RADIUS.lg,
    elevation: 2,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  achievementContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
  },
  achievementIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  achievementEmoji: {
    fontSize: 24,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text.primary,
    marginBottom: 2,
  },
  achievementDescription: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
    marginBottom: SPACING.xs,
  },
  achievementMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  achievementCategory: {
    height: 24,
    backgroundColor: COLORS.background.primary,
    borderColor: COLORS.primary,
  },
  achievementCategoryText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.primary,
  },
  achievementDate: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.text.secondary,
  },
  bottomSpacing: {
    height: SPACING.xl,
  },
});

export default ProfileOverviewTab;