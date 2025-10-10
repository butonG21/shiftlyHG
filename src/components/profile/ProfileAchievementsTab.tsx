// src/components/profile/ProfileAchievementsTab.tsx
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
  Chip,
  ProgressBar,
  SegmentedButtons,
  IconButton,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  FadeInDown,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  interpolate,
} from 'react-native-reanimated';

import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';
import { SPACING, BORDER_RADIUS } from '../../constants/spacing';
import { Achievement } from '../../types/profile';

const { width } = Dimensions.get('window');

interface AchievementCardProps {
  achievement: Achievement;
  index: number;
  onPress: () => void;
}

const AchievementCard: React.FC<AchievementCardProps> = ({
  achievement,
  index,
  onPress,
}) => {
  const scale = useSharedValue(1);
  const opacity = useSharedValue(achievement.isEarned ? 1 : 0.6);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  const getCategoryColor = () => {
    switch (achievement.category) {
      case 'attendance':
        return COLORS.gradient.primary;
      case 'punctuality':
        return COLORS.gradient.secondary;
      case 'performance':
        return COLORS.gradient.warning;
      case 'milestone':
        return COLORS.gradient.success;
      default:
        return COLORS.gradient.primary;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 100)}
      style={[styles.achievementCard, animatedStyle]}
    >
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
      >
        <Card style={[
          styles.card,
          !achievement.isEarned && styles.lockedCard
        ]}>
          <LinearGradient
            colors={achievement.isEarned ? getCategoryColor() : ['#E0E0E0', '#BDBDBD']}
            style={styles.cardGradient}
          >
            {/* Achievement Icon */}
            <View style={styles.achievementIcon}>
              <Text style={styles.achievementEmoji}>
                {achievement.isEarned ? achievement.icon : '🔒'}
              </Text>
            </View>

            {/* Achievement Info */}
            <View style={styles.achievementInfo}>
              <Text style={styles.achievementTitle}>
                {achievement.isEarned ? achievement.title : '???'}
              </Text>
              <Text style={styles.achievementDescription}>
                {achievement.isEarned ? achievement.description : 'Achievement locked'}
              </Text>
            </View>

            {/* Category Badge */}
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>
                {achievement.category.toUpperCase()}
              </Text>
            </View>

            {/* Earned Date */}
            {achievement.isEarned && achievement.earnedDate && (
              <View style={styles.earnedDate}>
                <MaterialCommunityIcons
                  name="calendar"
                  size={12}
                  color={COLORS.text.white}
                />
                <Text style={styles.earnedDateText}>
                  {formatDate(achievement.earnedDate)}
                </Text>
              </View>
            )}

            {/* Progress Bar for Locked Achievements */}
            {!achievement.isEarned && achievement.progress !== undefined && (
              <View style={styles.progressContainer}>
                <ProgressBar
                  progress={achievement.progress / 100}
                  color={COLORS.text.white}
                  style={styles.progressBar}
                />
                <Text style={styles.progressText}>
                  {achievement.progress}%
                </Text>
              </View>
            )}
          </LinearGradient>
        </Card>
      </Pressable>
    </Animated.View>
  );
};

const ProfileAchievementsTab: React.FC = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  // Mock data - replace with real data from API
  const mockAchievements: Achievement[] = [
    {
      id: '1',
      title: 'Perfect Attendance',
      description: 'No absences for 30 consecutive days',
      icon: '🏆',
      emoji: '🏆',
      badgeColor: '#FFD700',
      category: 'attendance',
      earnedDate: '2024-01-15',
      isEarned: true,
    },
    {
      id: '2',
      title: 'Early Bird',
      description: 'Arrive on time for 7 consecutive days',
      icon: '🌅',
      emoji: '🌅',
      badgeColor: '#FF6B6B',
      category: 'punctuality',
      earnedDate: '2024-01-10',
      isEarned: true,
    },
    {
      id: '3',
      title: 'Team Player',
      description: 'Help 5 colleagues with their tasks',
      icon: '🤝',
      emoji: '🤝',
      badgeColor: '#4ECDC4',
      category: 'performance',
      earnedDate: '2024-01-08',
      isEarned: true,
    },
    {
      id: '4',
      title: 'Overtime Hero',
      description: 'Complete 20 hours of overtime in a month',
      icon: '⚡',
      emoji: '⚡',
      badgeColor: '#FFA500',
      category: 'performance',
      earnedDate: '2024-01-05',
      isEarned: true,
    },
    {
      id: '5',
      title: 'First Month',
      description: 'Complete your first month at the company',
      icon: '🎉',
      emoji: '🎉',
      badgeColor: '#9B59B6',
      category: 'milestone',
      earnedDate: '2023-12-15',
      isEarned: true,
    },
    {
      id: '6',
      title: 'Punctuality Master',
      description: 'Arrive on time for 30 consecutive days',
      icon: '⏰',
      emoji: '⏰',
      badgeColor: '#3498DB',
      category: 'punctuality',
      earnedDate: '',
      isEarned: false,
      progress: 75,
    },
    {
      id: '7',
      title: 'Mentor',
      description: 'Train 3 new employees',
      icon: '👨‍🏫',
      emoji: '👨‍🏫',
      badgeColor: '#E74C3C',
      category: 'performance',
      earnedDate: '',
      isEarned: false,
      progress: 33,
    },
    {
      id: '8',
      title: 'Productivity Star',
      description: 'Complete 100 tasks in a month',
      icon: '⭐',
      emoji: '⭐',
      badgeColor: '#F39C12',
      category: 'performance',
      earnedDate: '',
      isEarned: false,
      progress: 60,
    },
    {
      id: '9',
      title: 'One Year Anniversary',
      description: 'Complete one year at the company',
      icon: '🎂',
      emoji: '🎂',
      badgeColor: '#8E44AD',
      category: 'milestone',
      earnedDate: '',
      isEarned: false,
      progress: 85,
    },
  ];

  useEffect(() => {
    setAchievements(mockAchievements);
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  };

  const categoryButtons = [
    { value: 'all', label: 'All' },
    { value: 'attendance', label: 'Attendance' },
    { value: 'punctuality', label: 'Punctuality' },
    { value: 'collaboration', label: 'Team' },
    { value: 'performance', label: 'Performance' },
    { value: 'milestone', label: 'Milestone' },
  ];

  const filteredAchievements = achievements.filter(achievement =>
    selectedCategory === 'all' || achievement.category === selectedCategory
  );

  const unlockedAchievements = achievements.filter(a => a.isEarned);
  const totalAchievements = achievements.length;
  const completionRate = totalAchievements > 0 ? (unlockedAchievements.length / totalAchievements) * 100 : 0;

  const getStatsByCategory = () => {
    const stats = {
      attendance: 0,
      punctuality: 0,
      performance: 0,
      milestone: 0,
    };

    unlockedAchievements.forEach(achievement => {
      stats[achievement.category as keyof typeof stats]++;
    });

    return stats;
  };

  const categoryStats = getStatsByCategory();

  const handleAchievementPress = (achievement: Achievement) => {
    // Handle achievement detail view
    console.log('Achievement pressed:', achievement.title);
  };

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Achievement Summary */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Achievement Summary</Text>
          <IconButton
            icon="refresh"
            size={20}
            onPress={onRefresh}
            iconColor={COLORS.text.secondary}
          />
        </View>

        <Card style={styles.summaryCard}>
          <LinearGradient
            colors={COLORS.gradient.primary}
            style={styles.summaryGradient}
          >
            <View style={styles.summaryContent}>
              <View style={styles.summaryMain}>
                <Text style={styles.summaryTitle}>Achievements Unlocked</Text>
                <Text style={styles.summaryValue}>
                  {unlockedAchievements.length} / {totalAchievements}
                </Text>
                <View style={styles.progressContainer}>
                  <ProgressBar
                    progress={completionRate / 100}
                    color={COLORS.text.white}
                    style={styles.summaryProgressBar}
                  />
                  <Text style={styles.summaryProgressText}>
                    {Math.round(completionRate)}%
                  </Text>
                </View>
              </View>
              
              <View style={styles.summaryStats}>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{categoryStats.attendance}</Text>
                  <Text style={styles.statLabel}>Attendance</Text>
                </View>
                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{categoryStats.punctuality}</Text>
                  <Text style={styles.statLabel}>Punctuality</Text>
                </View>

                <View style={styles.statItem}>
                  <Text style={styles.statValue}>{categoryStats.performance}</Text>
                  <Text style={styles.statLabel}>Performance</Text>
                </View>
              </View>
            </View>
          </LinearGradient>
        </Card>
      </View>

      {/* Category Filter */}
      <View style={styles.section}>
        <SegmentedButtons
          value={selectedCategory}
          onValueChange={setSelectedCategory}
          buttons={categoryButtons}
          style={styles.filterButtons}
        />
      </View>

      {/* Achievements Gallery */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>
          {selectedCategory === 'all' ? 'All Achievements' : 
           `${selectedCategory.charAt(0).toUpperCase() + selectedCategory.slice(1)} Achievements`}
        </Text>
        
        <View style={styles.achievementsGrid}>
          {filteredAchievements.map((achievement, index) => (
            <AchievementCard
              key={achievement.id}
              achievement={achievement}
              index={index}
              onPress={() => handleAchievementPress(achievement)}
            />
          ))}
        </View>

        {filteredAchievements.length === 0 && (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons
              name="trophy-outline"
              size={64}
              color={COLORS.text.secondary}
            />
            <Text style={styles.emptyStateTitle}>No Achievements</Text>
            <Text style={styles.emptyStateDescription}>
              No achievements found in this category. Keep working to unlock new achievements!
            </Text>
          </View>
        )}
      </View>

      {/* Recent Achievements */}
      {selectedCategory === 'all' && unlockedAchievements.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Achievements</Text>
          <View style={styles.recentAchievements}>
            {unlockedAchievements
              .sort((a, b) => new Date(b.earnedDate!).getTime() - new Date(a.earnedDate!).getTime())
              .slice(0, 3)
              .map((achievement, index) => (
                <Card key={achievement.id} style={styles.recentCard}>
                  <Card.Content style={styles.recentContent}>
                    <View style={styles.recentIcon}>
                      <Text style={styles.recentEmoji}>{achievement.icon}</Text>
                    </View>
                    <View style={styles.recentInfo}>
                      <Text style={styles.recentTitle}>{achievement.title}</Text>
                      <Text style={styles.recentDescription}>
                        {achievement.description}
                      </Text>
                      <View style={styles.recentMeta}>
                        <Chip
                          mode="outlined"
                          style={styles.recentCategory}
                          textStyle={styles.recentCategoryText}
                        >
                          {achievement.category}
                        </Chip>
                        <Text style={styles.recentDate}>
                          {new Date(achievement.earnedDate!).toLocaleDateString('id-ID', {
                            day: 'numeric',
                            month: 'short',
                          })}
                        </Text>
                      </View>
                    </View>
                  </Card.Content>
                </Card>
              ))}
          </View>
        </View>
      )}

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
  summaryCard: {
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
  },
  summaryGradient: {
    padding: SPACING.lg,
  },
  summaryContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryMain: {
    flex: 1,
  },
  summaryTitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.text.white,
    marginBottom: SPACING.xs,
    opacity: 0.9,
  },
  summaryValue: {
    fontSize: TYPOGRAPHY.fontSize['3xl'],
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text.white,
    marginBottom: SPACING.sm,
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.sm,
  },
  summaryProgressBar: {
    flex: 1,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  summaryProgressText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.white,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  summaryStats: {
    gap: SPACING.md,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text.white,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.text.white,
    opacity: 0.8,
    textAlign: 'center',
  },
  filterButtons: {
    marginBottom: SPACING.md,
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SPACING.md,
  },
  achievementCard: {
    width: (width - SPACING.lg * 2 - SPACING.md) / 2,
  },
  card: {
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  lockedCard: {
    opacity: 0.7,
  },
  cardGradient: {
    padding: SPACING.md,
    minHeight: 160,
    justifyContent: 'space-between',
  },
  achievementIcon: {
    alignSelf: 'center',
    marginBottom: SPACING.sm,
  },
  achievementEmoji: {
    fontSize: 32,
  },
  achievementInfo: {
    flex: 1,
    alignItems: 'center',
  },
  achievementTitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text.white,
    textAlign: 'center',
    marginBottom: SPACING.xs,
  },
  achievementDescription: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.white,
    textAlign: 'center',
    opacity: 0.9,
    marginBottom: SPACING.sm,
  },
  categoryBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: SPACING.xs,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.sm,
    alignSelf: 'center',
    marginBottom: SPACING.xs,
  },
  categoryText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.text.white,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  earnedDate: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
  },
  earnedDateText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.text.white,
    opacity: 0.8,
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
  emptyState: {
    alignItems: 'center',
    paddingVertical: SPACING.xl * 2,
  },
  emptyStateTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text.secondary,
    marginTop: SPACING.md,
    marginBottom: SPACING.xs,
  },
  emptyStateDescription: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
    textAlign: 'center',
    paddingHorizontal: SPACING.xl,
  },
  recentAchievements: {
    gap: SPACING.md,
  },
  recentCard: {
    backgroundColor: COLORS.background.surface,
    borderRadius: BORDER_RADIUS.lg,
    elevation: 2,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  recentContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.md,
  },
  recentIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: COLORS.background.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: SPACING.md,
  },
  recentEmoji: {
    fontSize: 24,
  },
  recentInfo: {
    flex: 1,
  },
  recentTitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text.primary,
    marginBottom: 2,
  },
  recentDescription: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
    marginBottom: SPACING.xs,
  },
  recentMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  recentCategory: {
    height: 24,
    backgroundColor: COLORS.background.primary,
    borderColor: COLORS.primary,
  },
  recentCategoryText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.primary,
  },
  recentDate: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.text.secondary,
  },
  bottomSpacing: {
    height: SPACING.xl,
  },
});

export default ProfileAchievementsTab;