import React, { useState, useEffect } from 'react';
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
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
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
import { Ionicons } from '@expo/vector-icons';
import type { DatePickerModalSingleProps } from 'react-native-paper-dates';

type RootStackParamList = {
  Attendance: { selectedDate?: string } | undefined;
};

type AttendanceScreenRouteProp = RouteProp<RootStackParamList, 'Attendance'>;

const AttendanceScreen = () => {
  const navigation = useNavigation();
  const route = useRoute<AttendanceScreenRouteProp>();
  const insets = useSafeAreaInsets();
  const {
    attendance,
    loading,
    error,
    refetch,
    filterAttendance,
    currentFilter,
  } = useAttendance();

  const [refreshing, setRefreshing] = useState(false);
  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const [selectedDateObject, setSelectedDateObject] = useState<Date>(new Date());

  // Get initial date from route parameter or current date
  const getInitialDate = () => {
    if (route.params?.selectedDate) {
      // Parse the date from route parameter (format: YYYY-MM-DD)
      const dateObj = new Date(route.params.selectedDate);
      return dateObj.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    }
    return new Date().toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };
  
  const [selectedDate, setSelectedDate] = useState<string>(getInitialDate());

  // Helper function to get the current selected date in YYYY-MM-DD format
  const getCurrentSelectedDateString = () => {
    const year = selectedDateObject.getFullYear();
    const month = String(selectedDateObject.getMonth() + 1).padStart(2, '0');
    const day = String(selectedDateObject.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Filter attendance based on route parameter when component mounts
  useEffect(() => {
    if (route.params?.selectedDate) {
      const dateObj = new Date(route.params.selectedDate);
      setSelectedDateObject(dateObj);
      filterAttendance({
        date: dateObj.getDate().toString(),
        month: dateObj.getMonth() + 1,
        year: dateObj.getFullYear()
      });
    } else {
      // Only load today's data if no route parameter is provided
      setSelectedDateObject(new Date());
      refetch();
    }
  }, [route.params?.selectedDate, filterAttendance, refetch]);

  const handleRefresh = async () => {
    setRefreshing(true);
    
    // If we have a current filter (from route parameter or date picker), use it
    // Otherwise, use refetch for today's data
    if (currentFilter) {
      await filterAttendance(currentFilter);
    } else if (route.params?.selectedDate) {
      // Re-apply the route parameter filter
      const dateObj = new Date(route.params.selectedDate);
      await filterAttendance({
        date: dateObj.getDate().toString(),
        month: dateObj.getMonth() + 1,
        year: dateObj.getFullYear()
      });
    } else {
      await refetch();
    }
    
    setRefreshing(false);
  };

  const onDateConfirm: DatePickerModalSingleProps['onConfirm'] = ({ date }) => {
    if (date) {
      const newSelectedDate = new Date(date);
      setSelectedDateObject(newSelectedDate);
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
          selectedDateObject={selectedDateObject}
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
        selectedDateObject={selectedDateObject}
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
            <DailySummary summary={summary} />
            
            <View style={styles.attendanceList}>
              <AttendanceCard
                type="Check In"
                time={attendance.data.start_time}
                address={attendance.data.start_address}
                image={attendance.data.start_image}
                date={getCurrentSelectedDateString()}
              />
              <AttendanceCard
                type="Break Start"
                time={attendance.data.break_out_time}
                address={attendance.data.break_out_address}
                image={attendance.data.break_out_image}
                date={getCurrentSelectedDateString()}
              />
              <AttendanceCard
                type="Break End"
                time={attendance.data.break_in_time}
                address={attendance.data.break_in_address}
                image={attendance.data.break_in_image}
                date={getCurrentSelectedDateString()}
              />
              <AttendanceCard
                type="Check Out"
                time={attendance.data.end_time}
                address={attendance.data.end_address}
                image={attendance.data.end_image}
                date={getCurrentSelectedDateString()}
              />
            </View>
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