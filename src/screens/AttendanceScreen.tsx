import React, { useState } from 'react';
import { View, ScrollView, Text, RefreshControl } from 'react-native';
import { ActivityIndicator, Button } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { 
  useAttendance, 
  useAttendanceCalculations,
  useErrorHandler
} from '../hooks';
import {
  AttendanceCard,
  AttendanceHeader,
  AttendanceSummary,
  AttendanceEmptyState,
  AttendanceErrorBoundary
} from '../components/attendance';
import { attendanceStyles } from '../styles/attendanceStyles';
import { ATTENDANCE_MESSAGES } from '../constants/attendance';
import { formatAttendanceDate } from '../utils/attendanceUtils';
import { COLORS } from '../constants/colors';

const AttendanceScreen = () => {
  const navigation = useNavigation();
  const {
    attendance,
    loading,
    error,
    refetch,
    filterAttendance,
    currentFilter
  } = useAttendance();

  const [datePickerVisible, setDatePickerVisible] = useState(false);
  const { errorState, handleError, clearError, retryAction } = useErrorHandler();
  
  // Calculate summary data using custom hook
  const summaryData = useAttendanceCalculations(attendance && attendance.length > 0 ? attendance[0] : null);

  const handleDateConfirm = ({ date }: { date: Date | undefined }) => {
    try {
      if (date) {
        clearError(); // Clear any previous errors
        const selectedDate = new Date(date);
        filterAttendance({
          date: selectedDate.getDate().toString(),
          month: selectedDate.getMonth() + 1,
          year: selectedDate.getFullYear()
        });
      }
      setDatePickerVisible(false);
    } catch (error) {
      handleError(error as Error);
      setDatePickerVisible(false);
    }
  };

  const handleRetry = () => {
    retryAction(async () => {
      await refetch();
    });
  };

  const getAttendanceDate = () => {
    if (currentFilter?.date && currentFilter?.month && currentFilter?.year) {
      const dateStr = `${currentFilter.year}-${currentFilter.month.toString().padStart(2, '0')}-${currentFilter.date.toString().padStart(2, '0')}`;
      return formatAttendanceDate(dateStr);
    }
    // Fallback to today's date
    const today = new Date();
    const fallbackStr = `${today.getFullYear()}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getDate().toString().padStart(2, '0')}`;
    return formatAttendanceDate(fallbackStr);
  };



  // Show error state if there's an error
  if (errorState.hasError || error) {
    return (
      <View style={attendanceStyles.container}>
        <AttendanceHeader
          onBackPress={() => navigation.goBack()}
          onCalendarPress={() => setDatePickerVisible(true)}
          attendanceDate={getAttendanceDate()}
          datePickerVisible={datePickerVisible}
          onDateConfirm={handleDateConfirm}
          onDateCancel={() => setDatePickerVisible(false)}
        />
        
        <View style={attendanceStyles.errorContainer}>
          <Text style={attendanceStyles.errorText}>
            {errorState.errorMessage || error || ATTENDANCE_MESSAGES.ERROR}
          </Text>
          <Button 
            mode="contained" 
            onPress={handleRetry}
            style={attendanceStyles.retryButton}
          >
            Coba Lagi
          </Button>
        </View>
      </View>
    );
  }

  return (
    <AttendanceErrorBoundary>
      <View style={attendanceStyles.container}>
        <AttendanceHeader
          onBackPress={() => navigation.goBack()}
          onCalendarPress={() => setDatePickerVisible(true)}
          attendanceDate={getAttendanceDate()}
          datePickerVisible={datePickerVisible}
          onDateConfirm={handleDateConfirm}
          onDateCancel={() => setDatePickerVisible(false)}
        />

        <ScrollView 
          style={attendanceStyles.scrollContainer}
          contentContainerStyle={attendanceStyles.contentContainer}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={loading}
              onRefresh={refetch}
              colors={[COLORS.primary]}
              tintColor={COLORS.primary}
            />
          }
        >
          {loading && attendance.length === 0 ? (
            <View style={attendanceStyles.loadingContainer}>
              <ActivityIndicator size="large" color={COLORS.primary} />
              <Text style={attendanceStyles.loadingText}>
                {ATTENDANCE_MESSAGES.LOADING}
              </Text>
            </View>
          ) : attendance.length > 0 ? (
            <>
              <AttendanceSummary summaryData={summaryData} />
              
              <View style={attendanceStyles.cardContainer}>
                {attendance.map((item, index) => {
                  const cards = [];
                  
                  // Check In card
                  if (item.start_time && item.start_time !== '--:--:--') {
                    cards.push(
                      <AttendanceCard
                        key={`${item._id}-checkin-${index}`}
                        attendance={{
                          ...item,
                          // Only show check in data
                          end_time: '--:--:--',
                          break_out_time: '--:--:--',
                          break_in_time: '--:--:--',
                        }}
                      />
                    );
                  }
                  
                  // Break Start card
                  if (item.break_out_time && item.break_out_time !== '--:--:--') {
                    cards.push(
                      <AttendanceCard
                        key={`${item._id}-breakstart-${index}`}
                        attendance={{
                          ...item,
                          // Only show break start data
                          start_time: '--:--:--',
                          end_time: '--:--:--',
                          break_in_time: '--:--:--',
                        }}
                      />
                    );
                  }
                  
                  // Break End card
                  if (item.break_in_time && item.break_in_time !== '--:--:--') {
                    cards.push(
                      <AttendanceCard
                        key={`${item._id}-breakend-${index}`}
                        attendance={{
                          ...item,
                          // Only show break end data
                          start_time: '--:--:--',
                          end_time: '--:--:--',
                          break_out_time: '--:--:--',
                        }}
                      />
                    );
                  }
                  
                  // Check Out card
                  if (item.end_time && item.end_time !== '--:--:--') {
                    cards.push(
                      <AttendanceCard
                        key={`${item._id}-checkout-${index}`}
                        attendance={{
                          ...item,
                          // Only show check out data
                          start_time: '--:--:--',
                          break_out_time: '--:--:--',
                          break_in_time: '--:--:--',
                        }}
                      />
                    );
                  }
                  
                  return cards;
                })}
              </View>
            </>
          ) : (
            <AttendanceEmptyState 
              onSelectDate={() => setDatePickerVisible(true)}
            />
          )}
        </ScrollView>
      </View>
    </AttendanceErrorBoundary>
  );
};

export default AttendanceScreen;