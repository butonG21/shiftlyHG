import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  StatusBar,
  Image,
} from 'react-native';
import {
  Appbar,
  Text,
  ActivityIndicator,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { useAttendance } from '../hooks';
import { COLORS } from '../constants/colors';
import { TYPOGRAPHY } from '../constants/typography';
import { SPACING, BORDER_RADIUS, SHADOWS } from '../constants/spacing';
import { DatePickerModal } from 'react-native-paper-dates';
import type { DatePickerModalSingleProps } from 'react-native-paper-dates';

const AttendanceScreen = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const {
    attendance,
    loading,
    error,
    refetch,
    filterAttendance,
  } = useAttendance();

  const [refreshing, setRefreshing] = useState(false);
  const [datePickerVisible, setDatePickerVisible] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleDateConfirm: DatePickerModalSingleProps['onConfirm'] = ({ date }) => {
    if (date) {
      const selectedDate = new Date(date);
      filterAttendance({
        date: selectedDate.getDate().toString(),
        month: selectedDate.getMonth() + 1,
        year: selectedDate.getFullYear()
      });
    }
    setDatePickerVisible(false);
  };

  const getStatusColor = (type: string): string => {
    switch (type.toLowerCase()) {
      case 'check in':
        return COLORS.status.success;
      case 'break start':
        return COLORS.status.warning;
      case 'break end':
        return COLORS.status.info;
      case 'check out':
        return COLORS.status.error;
      default:
        return COLORS.text.secondary;
    }
  };

  const renderHeader = () => (
    <LinearGradient
      colors={COLORS.gradient.primary}
      style={[styles.header, { paddingTop: insets.top }]}
    >
      <Appbar.Header style={styles.appbar}>
        <Appbar.BackAction
          onPress={() => navigation.goBack()}
          iconColor={COLORS.text.white}
        />
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Attendance Record</Text>
          {attendance?.data && (
            <Text style={styles.headerDate}>
              {new Date(attendance.data.date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}
            </Text>
          )}
        </View>
        <Appbar.Action
          icon="calendar"
          iconColor={COLORS.text.white}
          onPress={() => setDatePickerVisible(true)}
        />
      </Appbar.Header>
      
      <DatePickerModal
        visible={datePickerVisible}
        onDismiss={() => setDatePickerVisible(false)}
        date={new Date()}
        onConfirm={handleDateConfirm}
        locale="en"
        mode="single"
        presentationStyle="pageSheet"
      />
    </LinearGradient>
  );

  const renderDailySummary = () => (
    <View style={styles.summaryContainer}>
      <Text style={styles.summaryTitle}>Daily Summary</Text>
      <View style={styles.summaryGrid}>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>10h 16m</Text>
          <Text style={styles.summaryLabel}>TOTAL TIME</Text>
        </View>
        <View style={styles.summaryItem}>
          <Text style={styles.summaryValue}>57m</Text>
          <Text style={styles.summaryLabel}>BREAK TIME</Text>
        </View>
      </View>
    </View>
  );

  const renderStatusBadge = (type: string) => (
    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(type) }]}>
      <Text style={styles.statusText}>{type === 'check in' ? 'VERIFIED' : type.toUpperCase()}</Text>
    </View>
  );

  const renderTimelineItem = (
    type: string,
    time: string,
    address: string,
    image: string,
    isLast: boolean
  ) => (
    <View style={styles.timelineItem}>
      <View style={styles.timelineLeft}>
        <View 
          style={[
            styles.timelineDot,
            { backgroundColor: getStatusColor(type) }
          ]}
        >
          <MaterialCommunityIcons
            name={type.toLowerCase().includes('check') ? 'check' : 'coffee'}
            size={12}
            color={COLORS.text.white}
          />
        </View>
        {!isLast && <View style={styles.timelineLine} />}
      </View>
      
      <View style={styles.timelineContent}>
        <LinearGradient
          colors={[COLORS.background.surface, COLORS.glass.background]}
          style={styles.timelineCard}
        >
          <View style={styles.timelineHeader}>
            <Text style={styles.timelineType}>{type}</Text>
            <View style={[styles.timeBadge, { backgroundColor: getStatusColor(type) }]}>
              <Text style={styles.timeText}>{time || '--:--'}</Text>
            </View>
          </View>
          
          {address && (
            <View style={styles.locationContainer}>
              <MaterialCommunityIcons
                name="map-marker"
                size={16}
                color={COLORS.text.secondary}
              />
              <Text style={styles.locationText} numberOfLines={2}>{address}</Text>
            </View>
          )}
          
          {image && (
            <View style={styles.imageWrapper}>
              <Image
                source={{ uri: image }}
                style={styles.timelineImage}
                resizeMode="cover"
              />
              {renderStatusBadge(type)}
            </View>
          )}
        </LinearGradient>
      </View>
    </View>
  );

  const renderAttendanceList = () => {
    if (!attendance?.success || !attendance?.data) {
      return (
        <View style={styles.emptyState}>
          <MaterialCommunityIcons
            name="calendar-blank"
            size={64}
            color={COLORS.text.secondary}
          />
          <Text style={styles.emptyStateText}>No attendance record found</Text>
        </View>
      );
    }

    const { data } = attendance;

    return (
      <View style={styles.timelineContainer}>
        {renderTimelineItem(
          'Check In',
          data.start_time,
          data.start_address,
          data.start_image,
          false
        )}
        {renderTimelineItem(
          'Break Start',
          data.break_out_time,
          data.break_out_address,
          data.break_out_image,
          false
        )}
        {renderTimelineItem(
          'Break End',
          data.break_in_time,
          data.break_in_address,
          data.break_in_image,
          false
        )}
        {renderTimelineItem(
          'Check Out',
          data.end_time,
          data.end_address,
          data.end_image,
          true
        )}
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.container}>
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading attendance records...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
      {renderHeader()}
      
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
          />
        }
        style={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {renderAttendanceList()}
        {renderDailySummary()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background.primary,
  },
  header: {
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  appbar: {
    backgroundColor: 'transparent',
    elevation: 0,
  },
  headerContent: {
    flex: 1,
    marginLeft: SPACING.sm,
  },
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.text.white,
    marginBottom: SPACING.xs,
    lineHeight: TYPOGRAPHY.lineHeight.tight,
  },
  headerDate: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.normal,
    color: COLORS.text.white,
    opacity: 0.9,
    lineHeight: TYPOGRAPHY.lineHeight.normal,
  },
  content: {
    flex: 1,
    padding: SPACING.md,
  },
  timelineContainer: {
    padding: SPACING.lg,
    paddingTop: SPACING.xl,
  },
  timelineItem: {
    flexDirection: 'row',
    minHeight: 120,
  },
  timelineLeft: {
    width: 40,
    alignItems: 'center',
  },
  dotContainer: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: COLORS.background.surface,
    justifyContent: 'center',
    alignItems: 'center',
    ...SHADOWS.sm,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: COLORS.background.surface,
  },
  timelineLine: {
    width: 2,
    flex: 1,
    backgroundColor: COLORS.professional.silver,
    opacity: 0.3,
    marginTop: SPACING.xs,
  },
  timelineContent: {
    flex: 1,
    marginLeft: SPACING.md,
    paddingBottom: SPACING.xl,
  },
  timelineHeader: {
    marginBottom: SPACING.sm,
  },
  timelineInfo: {
    backgroundColor: COLORS.background.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    ...SHADOWS.sm,
  },
  timelineType: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  timelineTime: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text.primary,
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: COLORS.background.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.xs,
    marginTop: SPACING.sm,
    ...SHADOWS.sm,
  },
  locationText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.text.secondary,
    flex: 1,
    marginLeft: SPACING.xs,
    lineHeight: TYPOGRAPHY.lineHeight.relaxed,
  },
  imageContainer: {
    marginTop: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
    ...SHADOWS.sm,
  },
  timelineImage: {
    width: '100%',
    height: 200,
    backgroundColor: COLORS.background.surface,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: SPACING.xl,
  },
  emptyStateText: {
    marginTop: SPACING.md,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: SPACING.md,
    color: COLORS.text.secondary,
  },
  timelineCard: {
    backgroundColor: COLORS.background.surface,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    ...SHADOWS.md,
    borderWidth: 1,
    borderColor: COLORS.glass.border,
  },
  timeBadge: {
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
  },
  timeText: {
    color: COLORS.text.white,
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  imageWrapper: {
    position: 'relative',
    marginTop: SPACING.sm,
    borderRadius: BORDER_RADIUS.lg,
    overflow: 'hidden',
  },
  statusBadge: {
    position: 'absolute',
    top: SPACING.sm,
    right: SPACING.sm,
    paddingHorizontal: SPACING.sm,
    paddingVertical: SPACING.xs,
    borderRadius: BORDER_RADIUS.full,
  },
  statusText: {
    color: COLORS.text.white,
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  summaryContainer: {
    margin: SPACING.md,
    padding: SPACING.lg,
    backgroundColor: COLORS.background.surface,
    borderRadius: BORDER_RADIUS.lg,
    ...SHADOWS.md,
  },
  summaryTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  summaryItem: {
    alignItems: 'center',
  },
  summaryValue: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text.primary,
  },
  summaryLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.text.secondary,
    marginTop: SPACING.xs,
  },
});

export default AttendanceScreen;
