import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  StatusBar,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import {
  Appbar,
  Text,
  ActivityIndicator,
  Card,
  Button,
  IconButton,
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

const { width } = Dimensions.get('window');

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

  const getStatusInfo = (type: string) => {
    switch (type.toLowerCase()) {
      case 'check in':
        return {
          color: COLORS.status.success,
          icon: 'login',
          bgColor: '#f0fdf4',
          borderColor: '#22c55e'
        };
      case 'break start':
        return {
          color: COLORS.status.warning,
          icon: 'coffee',
          bgColor: '#fffbeb',
          borderColor: '#f59e0b'
        };
      case 'break end':
        return {
          color: COLORS.status.info,
          icon: 'coffee-off',
          bgColor: '#eff6ff',
          borderColor: '#3b82f6'
        };
      case 'check out':
        return {
          color: COLORS.status.error,
          icon: 'logout',
          bgColor: '#fef2f2',
          borderColor: '#ef4444'
        };
      default:
        return {
          color: COLORS.text.secondary,
          icon: 'clock',
          bgColor: '#f8fafc',
          borderColor: '#e2e8f0'
        };
    }
  };

  const renderHeader = () => (
    <LinearGradient
      colors={['#3b82f6', '#1d4ed8', '#1e40af']}
      style={[styles.header, { paddingTop: insets.top }]}
    >
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <View style={styles.headerContent}>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="white" />
        </TouchableOpacity>
        
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Attendance Record</Text>
          <Text style={styles.headerSubtitle}>
            {attendance?.data ? 
              new Date(attendance.data.date).toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              }) : 
              'Select a date'
            }
          </Text>
        </View>

        <TouchableOpacity 
          onPress={() => setDatePickerVisible(true)}
          style={styles.calendarButton}
        >
          <MaterialCommunityIcons name="calendar-month" size={24} color="white" />
        </TouchableOpacity>
      </View>
      
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

  const renderAttendanceCard = (
    type: string,
    time: string,
    address: string,
    image: string | null
  ) => {
    const statusInfo = getStatusInfo(type);
    
    // Get photo label based on type
    const getPhotoLabel = (type: string) => {
      return `${type} Photo`;
    };
    
    return (
      <View style={styles.attendanceCard} key={type}>
        <View style={[styles.cardLeft, { borderLeftColor: statusInfo.borderColor }]}>
          <View style={[styles.iconContainer, { backgroundColor: statusInfo.bgColor }]}>
            <MaterialCommunityIcons 
              name={statusInfo.icon as any} 
              size={20} 
              color={statusInfo.color} 
            />
          </View>
        </View>
        
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>{type}</Text>
            <View style={[styles.timeChip, { backgroundColor: statusInfo.color }]}>
              <Text style={styles.timeText}>{time || '--:--:--'}</Text>
            </View>
          </View>
          
          {address && (
            <View style={styles.locationRow}>
              <MaterialCommunityIcons 
                name="map-marker" 
                size={16} 
                color={COLORS.text.secondary} 
              />
              <Text style={styles.locationText} numberOfLines={2}>
                {address}
              </Text>
            </View>
          )}
          
          {image && (
            <TouchableOpacity style={styles.photoContainer}>
              <Image source={{ uri: image }} style={styles.employeePhoto} />
              <View style={styles.photoOverlay}>
                <Text style={styles.photoLabel}>{getPhotoLabel(type)}</Text>
                <MaterialCommunityIcons name="camera" size={16} color="white" />
              </View>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  // Calculate dynamic summary data
  const calculateSummary = () => {
    if (!attendance?.data) {
      return {
        totalTime: '--:--',
        breakTime: '--:--',
        workingTime: '--:--'
      };
    }

    const { data } = attendance;
    
    // Helper function to parse time string (HH:MM:SS or HH:MM)
    const parseTime = (timeStr: string): Date | null => {
      if (!timeStr || timeStr === '--:--:--') return null;
      
      const today = new Date();
      const [hours, minutes, seconds = '00'] = timeStr.split(':');
      
      if (hours && minutes) {
        const date = new Date(today);
        date.setHours(parseInt(hours, 10));
        date.setMinutes(parseInt(minutes, 10));
        date.setSeconds(parseInt(seconds, 10));
        return date;
      }
      return null;
    };

    // Helper function to format duration in hours and minutes
    const formatDuration = (milliseconds: number): string => {
      if (milliseconds <= 0) return '--:--';
      
      const hours = Math.floor(milliseconds / (1000 * 60 * 60));
      const minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60));
      
      if (hours > 0) {
        return `${hours}h ${minutes}m`;
      } else {
        return `${minutes}m`;
      }
    };

    // Parse times
    const checkIn = parseTime(data.start_time);
    const breakStart = parseTime(data.break_out_time);
    const breakEnd = parseTime(data.break_in_time);
    const checkOut = parseTime(data.end_time);

    // Calculate total working time
    let totalWorkingTime = 0;
    let breakTime = 0;

    if (checkIn && checkOut) {
      const totalTime = checkOut.getTime() - checkIn.getTime();
      
      // Calculate break duration
      if (breakStart && breakEnd) {
        breakTime = breakEnd.getTime() - breakStart.getTime();
      }
      
      // Working time = total time - break time
      totalWorkingTime = totalTime - breakTime;
    }

    return {
      totalTime: checkIn && checkOut ? formatDuration(checkOut.getTime() - checkIn.getTime()) : '--:--',
      breakTime: formatDuration(breakTime),
      workingTime: formatDuration(totalWorkingTime)
    };
  };

  const renderDailySummary = () => {
    const summary = calculateSummary();
    
    return (
      <Card style={styles.summaryCard}>
        <Card.Content style={styles.summaryContent}>
          <View style={styles.summaryHeader}>
            <MaterialCommunityIcons name="chart-timeline" size={24} color={COLORS.primary} />
            <Text style={styles.summaryTitle}>Daily Summary</Text>
          </View>
          
          <View style={styles.summaryGrid}>
            <View style={styles.summaryItem}>
              <View style={styles.summaryIconContainer}>
                <MaterialCommunityIcons name="clock" size={20} color={COLORS.status.success} />
              </View>
              <Text style={styles.summaryValue}>{summary.workingTime}</Text>
              <Text style={styles.summaryLabel}>Working Time</Text>
            </View>
            
            <View style={styles.summaryDivider} />
            
            <View style={styles.summaryItem}>
              <View style={styles.summaryIconContainer}>
                <MaterialCommunityIcons name="coffee" size={20} color={COLORS.status.warning} />
              </View>
              <Text style={styles.summaryValue}>{summary.breakTime}</Text>
              <Text style={styles.summaryLabel}>Break Time</Text>
            </View>
            
            <View style={styles.summaryDivider} />
            
            <View style={styles.summaryItem}>
              <View style={styles.summaryIconContainer}>
                <MaterialCommunityIcons name="clock-outline" size={20} color={COLORS.status.info} />
              </View>
              <Text style={styles.summaryValue}>{summary.totalTime}</Text>
              <Text style={styles.summaryLabel}>Total Time</Text>
            </View>
          </View>
        </Card.Content>
      </Card>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <LinearGradient
        colors={['#f8fafc', '#f1f5f9']}
        style={styles.emptyStateContainer}
      >
        <MaterialCommunityIcons 
          name="calendar-blank-outline" 
          size={80} 
          color={COLORS.text.light} 
        />
        <Text style={styles.emptyStateTitle}>No Records Found</Text>
        <Text style={styles.emptyStateSubtitle}>
          No attendance records found for the selected date.{'\n'}
          Try selecting a different date.
        </Text>
        <Button 
          mode="contained" 
          onPress={() => setDatePickerVisible(true)}
          style={styles.selectDateButton}
          labelStyle={styles.selectDateButtonText}
        >
          Select Date
        </Button>
      </LinearGradient>
    </View>
  );

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
      {renderHeader()}
      
      <ScrollView
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
            progressBackgroundColor={COLORS.background.surface}
          />
        }
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {!attendance?.success || !attendance?.data ? (
          renderEmptyState()
        ) : (
          <>
            <View style={styles.attendanceList}>
              {renderAttendanceCard(
                'Check In',
                attendance.data.start_time,
                attendance.data.start_address,
                attendance.data.start_image
              )}
              {renderAttendanceCard(
                'Break Start',
                attendance.data.break_out_time,
                attendance.data.break_out_address,
                attendance.data.break_out_image
              )}
              {renderAttendanceCard(
                'Break End',
                attendance.data.break_in_time,
                attendance.data.break_in_address,
                attendance.data.break_in_image
              )}
              {renderAttendanceCard(
                'Check Out',
                attendance.data.end_time,
                attendance.data.end_address,
                attendance.data.end_image
              )}
            </View>
            
            {renderDailySummary()}
          </>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    paddingBottom: SPACING.lg,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: SPACING.lg,
    paddingTop: SPACING.md,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTextContainer: {
    flex: 1,
    marginLeft: SPACING.lg,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: 'white',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.8)',
  },
  calendarButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: SPACING.lg,
    paddingBottom: SPACING['3xl'],
  },
  attendanceList: {
    gap: SPACING.lg,
  },
  attendanceCard: {
    backgroundColor: 'white',
    borderRadius: BORDER_RADIUS.xl,
    flexDirection: 'row',
    overflow: 'hidden',
    ...SHADOWS.md,
    minHeight: 140,
  },
  cardLeft: {
    width: 70,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: SPACING.lg,
    borderLeftWidth: 4,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardContent: {
    flex: 1,
    padding: SPACING.lg,
    paddingLeft: SPACING.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  timeChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  timeText: {
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.md,
    gap: 8,
  },
  locationText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.text.secondary,
    lineHeight: 20,
  },
  photoContainer: {
    position: 'relative',
    borderRadius: BORDER_RADIUS.md,
    overflow: 'hidden',
  },
  employeePhoto: {
    width: '100%',
    height: 120,
    backgroundColor: COLORS.background.accent,
  },
  photoOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SPACING.md,
    paddingVertical: SPACING.sm,
  },
  photoLabel: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  summaryCard: {
    marginTop: SPACING.xl,
    backgroundColor: 'white',
    borderRadius: BORDER_RADIUS.xl,
    ...SHADOWS.md,
  },
  summaryContent: {
    padding: SPACING.lg,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SPACING.lg,
    gap: SPACING.sm,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.primary,
  },
  summaryGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryItem: {
    flex: 1,
    alignItems: 'center',
    gap: SPACING.xs,
    paddingHorizontal: SPACING.xs,
  },
  summaryIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f1f5f9',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  summaryValue: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.text.primary,
    textAlign: 'center',
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '500',
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 14,
  },
  summaryDivider: {
    width: 1,
    height: 50,
    backgroundColor: '#e2e8f0',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: SPACING.xl,
  },
  emptyStateContainer: {
    width: '100%',
    padding: SPACING['3xl'],
    borderRadius: BORDER_RADIUS.xl,
    alignItems: 'center',
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: COLORS.text.primary,
    marginTop: SPACING.lg,
    marginBottom: SPACING.sm,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: COLORS.text.secondary,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: SPACING.xl,
  },
  selectDateButton: {
    borderRadius: BORDER_RADIUS.md,
  },
  selectDateButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: SPACING.md,
  },
  loadingText: {
    fontSize: 16,
    color: COLORS.text.secondary,
  },
});

export default AttendanceScreen;