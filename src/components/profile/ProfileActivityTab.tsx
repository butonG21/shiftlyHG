// src/components/profile/ProfileActivityTab.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Dimensions,
  RefreshControl,
  Pressable,
} from 'react-native';
import {
  Text,
  Card,
  Chip,
  IconButton,
  Searchbar,
  SegmentedButtons,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  interpolate,
  FadeInDown,
} from 'react-native-reanimated';

import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';
import { SPACING, BORDER_RADIUS } from '../../constants/spacing';
import { ActivityLog } from '../../types/profile';

const { width } = Dimensions.get('window');

interface TimelineItemProps {
  activity: ActivityLog;
  index: number;
  isLast: boolean;
}

const TimelineItem: React.FC<TimelineItemProps> = ({ activity, index, isLast }) => {
  const getActivityIcon = () => {
    switch (activity.type) {
      case 'check_in':
        return 'clock-in';
      case 'check_out':
        return 'clock-out';
      case 'break':
        return 'coffee';
      case 'overtime':
        return 'clock-time-eight';
      case 'leave':
        return 'beach';
      case 'meeting':
        return 'account-group';
      case 'task':
        return 'check-circle';
      case 'announcement':
        return 'bullhorn';
      case 'achievement':
        return 'trophy';
      default:
        return 'circle';
    }
  };

  const getActivityColor = () => {
    switch (activity.type) {
      case 'check_in':
        return COLORS.status.success;
      case 'check_out':
        return COLORS.status.error;
      case 'break':
        return COLORS.status.warning;
      case 'overtime':
        return COLORS.primary;
      case 'leave':
        return COLORS.status.info;
      case 'meeting':
        return COLORS.primary;
      case 'task':
        return COLORS.status.success;
      case 'announcement':
        return COLORS.status.info;
      case 'achievement':
        return COLORS.status.success;
      default:
        return COLORS.text.secondary;
    }
  };

  const getStatusChipColor = () => {
    switch (activity.status) {
      case 'success':
        return COLORS.status.success;
      case 'error':
        return COLORS.status.error;
      case 'warning':
        return COLORS.status.warning;
      case 'info':
        return COLORS.status.info;
      default:
        return COLORS.text.secondary;
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString('id-ID', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <Animated.View
      entering={FadeInDown.delay(index * 100)}
      style={styles.timelineItem}
    >
      <View style={styles.timelineLeft}>
        <View style={styles.timelineDate}>
          <Text style={styles.timelineDateText}>{formatDate(activity.timestamp)}</Text>
          <Text style={styles.timelineTimeText}>{formatTime(activity.timestamp)}</Text>
        </View>
      </View>

      <View style={styles.timelineCenter}>
        <View style={[styles.timelineIcon, { backgroundColor: getActivityColor() }]}>
          <MaterialCommunityIcons
            name={getActivityIcon() as any}
            size={16}
            color={COLORS.text.white}
          />
        </View>
        {!isLast && <View style={styles.timelineLine} />}
      </View>

      <View style={styles.timelineRight}>
        <Card style={styles.activityCard}>
          <Card.Content style={styles.activityContent}>
            <View style={styles.activityHeader}>
              <Text style={styles.activityTitle}>{activity.title}</Text>
              <Chip
                mode="outlined"
                style={[
                  styles.statusChip,
                  { borderColor: getStatusChipColor() },
                ]}
                textStyle={[
                  styles.statusChipText,
                  { color: getStatusChipColor() },
                ]}
              >
                {activity.status}
              </Chip>
            </View>

            <Text style={styles.activityDescription}>{activity.description}</Text>

             {activity.location && (
               <View style={styles.activityLocation}>
                 <MaterialCommunityIcons
                   name="map-marker"
                   size={14}
                   color={COLORS.text.secondary}
                 />
                 <Text style={styles.locationText}>{activity.location}</Text>
               </View>
             )}
           </Card.Content>
        </Card>
      </View>
    </Animated.View>
  );
};

const ProfileActivityTab: React.FC = () => {
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [activities, setActivities] = useState<ActivityLog[]>([]);

  // Mock data - replace with real data from API
  const mockActivities: ActivityLog[] = [
    {
      id: '1',
      type: 'check_in',
      title: 'Clock In',
      description: 'Started work day',
      timestamp: '2024-01-15T08:00:00Z',
      status: 'success',
      location: 'Office Building A',
    },
    {
      id: '2',
      type: 'break',
      title: 'Break Started',
      description: 'Lunch break started',
      timestamp: '2024-01-15T12:00:00Z',
      status: 'info',
      location: 'Cafeteria',
    },
    {
      id: '3',
      type: 'break',
      title: 'Break Ended',
      description: 'Lunch break ended',
      timestamp: '2024-01-15T13:00:00Z',
      status: 'success',
      location: 'Cafeteria',
    },
    {
      id: '4',
      type: 'overtime',
      title: 'Overtime Started',
      description: 'Working extra hours',
      timestamp: '2024-01-15T17:00:00Z',
      status: 'warning',
      location: 'Office Building A',
    },
    {
      id: '5',
      type: 'check_out',
      title: 'Clock Out',
      description: 'Ended work day',
      timestamp: '2024-01-15T19:30:00Z',
      status: 'success',
      location: 'Office Building A',
    },
    {
      id: '6',
      type: 'check_in',
      title: 'Clock In',
      description: 'Started work day',
      timestamp: '2024-01-14T08:15:00Z',
      status: 'warning',
      location: 'Office Building A',
    },
    {
      id: '7',
      type: 'check_out',
      title: 'Clock Out',
      description: 'Ended work day',
      timestamp: '2024-01-14T17:00:00Z',
      status: 'info',
      location: 'Office Building A',
    },
  ];

  useEffect(() => {
    setActivities(mockActivities);
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 2000);
  };

  const filterButtons = [
    { value: 'all', label: 'All' },
    { value: 'check_in', label: 'Clock In' },
    { value: 'check_out', label: 'Clock Out' },
    { value: 'break', label: 'Breaks' },
    { value: 'overtime', label: 'Overtime' },
  ];

  const filteredActivities = activities.filter((activity) => {
    const matchesSearch = activity.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase()) ||
      activity.description
        .toLowerCase()
        .includes(searchQuery.toLowerCase());

    const matchesFilter = 
      filterType === 'all' ||
      activity.type === filterType;

    return matchesSearch && matchesFilter;
  });

  const getTodayStats = () => {
    const today = new Date().toDateString();
    const todayActivities = activities.filter(
      (activity) => new Date(activity.timestamp).toDateString() === today
    );

    const checkIn = todayActivities.find((a) => a.type === 'check_in');
    const checkOut = todayActivities.find((a) => a.type === 'check_out');
    const breaks = todayActivities.filter((a) => a.type === 'break');
    const overtime = todayActivities.filter((a) => a.type === 'overtime');

    return {
      clockIn: checkIn ? new Date(checkIn.timestamp).toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
      }) : null,
      clockOut: checkOut ? new Date(checkOut.timestamp).toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
      }) : null,
      totalBreaks: breaks.length,
      totalOvertime: overtime.length,
    };
  };

  const todayStats = getTodayStats();

  return (
    <ScrollView
      style={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      {/* Today's Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Today's Summary</Text>
        <Card style={styles.summaryCard}>
          <LinearGradient
            colors={[...COLORS.gradient.primary]}
            style={styles.summaryGradient}
          >
            <View style={styles.summaryGrid}>
              <View style={styles.summaryItem}>
                <MaterialCommunityIcons
                  name="login"
                  size={24}
                  color={COLORS.text.white}
                />
                <Text style={styles.summaryLabel}>Clock In</Text>
                <Text style={styles.summaryValue}>
                  {todayStats.clockIn || '--:--'}
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <MaterialCommunityIcons
                  name="logout"
                  size={24}
                  color={COLORS.text.white}
                />
                <Text style={styles.summaryLabel}>Clock Out</Text>
                <Text style={styles.summaryValue}>
                  {todayStats.clockOut || '--:--'}
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <MaterialCommunityIcons
                  name="coffee"
                  size={24}
                  color={COLORS.text.white}
                />
                <Text style={styles.summaryLabel}>Breaks</Text>
                <Text style={styles.summaryValue}>{todayStats.totalBreaks}</Text>
              </View>
              <View style={styles.summaryItem}>
                <MaterialCommunityIcons
                  name="clock-plus"
                  size={24}
                  color={COLORS.text.white}
                />
                <Text style={styles.summaryLabel}>Overtime</Text>
                <Text style={styles.summaryValue}>{todayStats.totalOvertime}</Text>
              </View>
            </View>
          </LinearGradient>
        </Card>
      </View>

      {/* Search and Filter */}
      <View style={styles.section}>
        <Searchbar
          placeholder="Search activities..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchBar}
          inputStyle={styles.searchInput}
        />
        
        <SegmentedButtons
          value={filterType}
          onValueChange={setFilterType}
          buttons={filterButtons}
          style={styles.filterButtons}
        />
      </View>

      {/* Activity Timeline */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Activity Timeline</Text>
          <IconButton
            icon="refresh"
            size={20}
            onPress={onRefresh}
            iconColor={COLORS.text.secondary}
          />
        </View>

        <View style={styles.timeline}>
          {filteredActivities.map((activity, index) => (
            <TimelineItem
              key={activity.id}
              activity={activity}
              index={index}
              isLast={index === filteredActivities.length - 1}
            />
          ))}
        </View>

        {filteredActivities.length === 0 && (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons
              name="timeline-clock"
              size={64}
              color={COLORS.text.secondary}
            />
            <Text style={styles.emptyStateTitle}>No Activities Found</Text>
            <Text style={styles.emptyStateDescription}>
              {searchQuery || filterType !== 'all'
                ? 'Try adjusting your search or filter'
                : 'Your activity timeline will appear here'}
            </Text>
          </View>
        )}
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
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryItem: {
    alignItems: 'center',
    flex: 1,
  },
  summaryLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.text.white,
    marginTop: SPACING.xs,
    marginBottom: 2,
    opacity: 0.9,
  },
  summaryValue: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text.white,
  },
  searchBar: {
    backgroundColor: COLORS.background.surface,
    borderRadius: BORDER_RADIUS.md,
    elevation: 2,
    marginBottom: SPACING.md,
  },
  searchInput: {
    fontSize: TYPOGRAPHY.fontSize.base,
  },
  filterButtons: {
    marginBottom: SPACING.md,
  },
  timeline: {
    paddingVertical: SPACING.md,
  },
  timelineItem: {
    flexDirection: 'row',
    marginBottom: SPACING.lg,
  },
  timelineLeft: {
    width: 80,
    alignItems: 'flex-end',
    paddingRight: SPACING.md,
  },
  timelineDate: {
    alignItems: 'flex-end',
  },
  timelineDateText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.text.secondary,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  timelineTimeText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.primary,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  timelineCenter: {
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
  },
  timelineIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: COLORS.border,
    marginTop: SPACING.xs,
  },
  timelineRight: {
    flex: 1,
  },
  activityCard: {
    backgroundColor: COLORS.background.surface,
    borderRadius: BORDER_RADIUS.md,
    elevation: 2,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  activityContent: {
    padding: SPACING.md,
  },
  activityHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  activityTitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text.primary,
    flex: 1,
  },
  statusChip: {
    height: 24,
    backgroundColor: 'transparent',
  },
  statusChipText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    textTransform: 'capitalize',
  },
  activityDescription: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
    marginBottom: SPACING.xs,
  },
  activityLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  locationText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.text.secondary,
    marginLeft: 4,
  },
  activityDuration: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  durationText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.text.secondary,
    marginLeft: 4,
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
  bottomSpacing: {
    height: SPACING.xl,
  },
});

export default ProfileActivityTab;