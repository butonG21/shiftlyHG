import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
} from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { DatePickerModal } from 'react-native-paper-dates';
import type { DatePickerModalSingleProps } from 'react-native-paper-dates';
import Constants from 'expo-constants';
import { SPACING } from '../../constants/spacing';
import { AttendanceRecord } from '../../types/attendance';

interface AttendanceHeaderProps {
  onBackPress: () => void;
  onCalendarPress: () => void;
  attendanceDate: string;
  datePickerVisible: boolean;
  onDateCancel: () => void;
  onDateConfirm: DatePickerModalSingleProps['onConfirm'];
}

const AttendanceHeader: React.FC<AttendanceHeaderProps> = ({
  onBackPress,
  onCalendarPress,
  attendanceDate,
  datePickerVisible,
  onDateCancel,
  onDateConfirm,
}) => {
  return (
    <LinearGradient 
      colors={['#3b82f6', '#1d4ed8', '#1e40af']}
      style={styles.header}
    >
      <StatusBar barStyle="light-content" backgroundColor="transparent" translucent />
      
      <View style={styles.headerContent}>
        <TouchableOpacity 
          onPress={onBackPress}
          style={styles.backButton}
        >
          <MaterialCommunityIcons name="arrow-left" size={24} color="white" />
        </TouchableOpacity>
        
        <View style={styles.headerTextContainer}>
          <Text style={styles.headerTitle}>Attendance Record</Text>
          <Text style={styles.headerSubtitle}>
            {attendanceDate || 'Select a date'}
          </Text>
        </View>

        <TouchableOpacity 
          onPress={onCalendarPress}
          style={styles.calendarButton}
        >
          <MaterialCommunityIcons name="calendar-month" size={24} color="white" />
        </TouchableOpacity>
      </View>
      
      <DatePickerModal
        visible={datePickerVisible}
        onDismiss={onDateCancel}
        date={new Date()}
        onConfirm={onDateConfirm}
        locale="en"
        mode="single"
        presentationStyle="pageSheet"
      />
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
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
    paddingTop: Constants.statusBarHeight + SPACING.md,
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
});

export default AttendanceHeader;