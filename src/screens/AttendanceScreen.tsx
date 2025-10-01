import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import {
  Text,
  ActivityIndicator,
} from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAttendance } from '../hooks';
import { COLORS } from '../constants/colors';
import { SPACING } from '../constants/spacing';
import { 
  AttendanceHeader, 
  AttendanceCard, 
  DailySummary, 
  EmptyState 
} from '../components/attendance';
import { calculateAttendanceSummary } from '../utils/timeUtils';
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
  const [selectedDate, setSelectedDate] = useState<string>(
    new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  );

  const handleRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const onDateConfirm: DatePickerModalSingleProps['onConfirm'] = ({ date }) => {
    if (date) {
      const newSelectedDate = new Date(date);
      setSelectedDate(newSelectedDate.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }));
      filterAttendance({
        date: newSelectedDate.getDate().toString(),
        month: newSelectedDate.getMonth() + 1,
        year: newSelectedDate.getFullYear()
      });
    }
    setDatePickerVisible(false);
  };

  const handleSelectDate = () => {
    setDatePickerVisible(true);
  };

  // Get attendance summary using utility function
  const summary = attendance?.data ? 
    calculateAttendanceSummary(attendance.data) : 
    { totalTime: '--:--', breakTime: '--:--', workingTime: '--:--' };

  if (loading && !refreshing) {
    return (
      <View style={styles.container}>
        <AttendanceHeader
          insets={insets}
          onBackPress={() => navigation.goBack()}
          selectedDate={selectedDate}
          datePickerVisible={datePickerVisible}
          onDatePickerToggle={handleSelectDate}
          onDateConfirm={onDateConfirm}
        />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Loading attendance records...</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <AttendanceHeader
        insets={insets}
        onBackPress={() => navigation.goBack()}
        selectedDate={selectedDate}
        datePickerVisible={datePickerVisible}
        onDatePickerToggle={handleSelectDate}
        onDateConfirm={onDateConfirm}
      />
      
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
          <EmptyState onSelectDate={handleSelectDate} />
        ) : (
          <>
            <View style={styles.attendanceList}>
              <AttendanceCard
                type="Check In"
                time={attendance.data.start_time}
                address={attendance.data.start_address}
                image={attendance.data.start_image}
              />
              <AttendanceCard
                type="Break Start"
                time={attendance.data.break_out_time}
                address={attendance.data.break_out_address}
                image={attendance.data.break_out_image}
              />
              <AttendanceCard
                type="Break End"
                time={attendance.data.break_in_time}
                address={attendance.data.break_in_address}
                image={attendance.data.break_in_image}
              />
              <AttendanceCard
                type="Check Out"
                time={attendance.data.end_time}
                address={attendance.data.end_address}
                image={attendance.data.end_image}
              />
            </View>
            
            <DailySummary summary={summary} />
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