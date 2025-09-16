// src/components/ui/CalendarView.tsx
import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  ScrollView,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ScheduleItem } from '../../types/schedule';
import { parseAndFormatShift } from '../../utils/dateTime';
import { classifyShift } from '../../utils/shifts';
import { COLORS } from '../../constants/colors';
import { TYPOGRAPHY } from '../../constants/typography';
import { SPACING, BORDER_RADIUS } from '../../constants/spacing';
import { SHIFT_THEMES } from '../../constants/shifts';

const { width } = Dimensions.get('window');
const CALENDAR_WIDTH = width - (SPACING.md * 3.6);
const DAY_SIZE = (CALENDAR_WIDTH / 7) - 1;

interface CalendarViewProps {
  scheduleItems: ScheduleItem[];
  currentMonth: number;
  currentYear: number;
  onMonthChange: (month: number, year: number) => void;
  loading?: boolean;
}

interface CalendarDay {
  date: number;
  isCurrentMonth: boolean;
  isToday: boolean;
  shift?: string;
  fullDate: string;
}

const CalendarView: React.FC<CalendarViewProps> = ({
  scheduleItems,
  currentMonth,
  currentYear,
  onMonthChange,
  loading = false,
}) => {
  const monthNames = [
    'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
  ];

  const dayNames = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

  // Generate calendar days
  const calendarDays = useMemo(() => {
    const firstDay = new Date(currentYear, currentMonth - 1, 1);
    const lastDay = new Date(currentYear, currentMonth, 0);
    
    // Calculate the start date for calendar grid
    // firstDay.getDay() returns 0 for Sunday, 1 for Monday, etc.
    // We want Monday (1) to align with our first column (Sen)
    const startDate = new Date(firstDay);
    let dayOfWeek = firstDay.getDay(); // 0 = Sunday, 1 = Monday, etc.
    // Convert Sunday (0) to 7 for our Monday-first calendar
    if (dayOfWeek === 0) dayOfWeek = 7;
    // Adjust to make Monday the first day (subtract dayOfWeek - 1)
    // If firstDay is Sunday (0), dayOfWeek becomes 7, so subtract 6 days.
    // If firstDay is Monday (1), dayOfWeek is 1, so subtract 0 days.
    startDate.setDate(firstDay.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));

    const days: CalendarDay[] = [];
    const today = new Date();

    // Helper function to format date to YYYY-MM-DD (local time)
    const formatDateToYYYYMMDD = (date: Date) => {
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const day = date.getDate().toString().padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const todayStr = formatDateToYYYYMMDD(today);

    // Create schedule map for quick lookup
    const scheduleMap = new Map<string, string>();
    scheduleItems.forEach(item => {
      // Ensure the date from item is also formatted consistently
      const itemDate = new Date(item.date);
      const dateKey = formatDateToYYYYMMDD(itemDate);
      scheduleMap.set(dateKey, item.shift);
    });

    // Generate 42 days (6 weeks * 7 days) for calendar grid
    for (let i = 0; i < 42; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      
      const dateStr = formatDateToYYYYMMDD(currentDate);
      const isCurrentMonth = currentDate.getMonth() === currentMonth - 1;
      const isToday = dateStr === todayStr;
      const shift = scheduleMap.get(dateStr);

      days.push({
        date: currentDate.getDate(),
        isCurrentMonth,
        isToday,
        shift,
        fullDate: dateStr,
      });
    }

    return days;
  }, [currentMonth, currentYear, scheduleItems]);

  const navigateMonth = (direction: 'prev' | 'next') => {
    let newMonth = currentMonth;
    let newYear = currentYear;

    if (direction === 'prev') {
      newMonth -= 1;
      if (newMonth < 1) {
        newMonth = 12;
        newYear -= 1;
      }
    } else {
      newMonth += 1;
      if (newMonth > 12) {
        newMonth = 1;
        newYear += 1;
      }
    }

    onMonthChange(newMonth, newYear);
  };

  const renderCalendarDay = (day: CalendarDay, index: number) => {
    const shiftCategory = day.shift ? classifyShift(day.shift) : null;
    const shiftTheme = shiftCategory ? SHIFT_THEMES[shiftCategory] : null;
    const formattedShift = day.shift ? parseAndFormatShift(day.shift) : null;

    const dayStyle = [
      styles.dayContainer,
      !day.isCurrentMonth && styles.dayInactive,
      day.isToday && styles.dayToday,
    ];

    const textStyle = [
      styles.dayText,
      !day.isCurrentMonth && styles.dayTextInactive,
      day.isToday && styles.dayTextToday,
    ];

    return (
      <View key={`${day.fullDate}-${index}`} style={dayStyle}>
        <Text style={textStyle}>{day.date}</Text>
        
        {day.shift && day.isCurrentMonth && (
          <View style={styles.shiftContainer}>
            {shiftCategory === 'off' ? (
              <View style={[styles.shiftBadge, { backgroundColor: COLORS.status.success }]}>
                <Text style={styles.shiftText}>Libur</Text>
              </View>
            ) : (
              <LinearGradient
                colors={[shiftTheme?.primary || COLORS.primary, shiftTheme?.secondary || COLORS.secondary]}
                style={styles.shiftBadge}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={styles.shiftText}>{formattedShift}</Text>
              </LinearGradient>
            )}
          </View>
        )}
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {/* Calendar Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigateMonth('prev')}
          disabled={loading}
        >
          <MaterialCommunityIcons
            name="chevron-left"
            size={24}
            color={loading ? COLORS.text.light : COLORS.primary}
          />
        </TouchableOpacity>

        <View style={styles.monthYearContainer}>
          <Text style={styles.monthText}>
            {monthNames[currentMonth - 1]} {currentYear}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.navButton}
          onPress={() => navigateMonth('next')}
          disabled={loading}
        >
          <MaterialCommunityIcons
            name="chevron-right"
            size={24}
            color={loading ? COLORS.text.light : COLORS.primary}
          />
        </TouchableOpacity>
      </View>

      {/* Day Names Header */}
      <View style={styles.dayNamesContainer}>
        {dayNames.map((dayName, index) => (
          <View key={dayName} style={styles.dayNameContainer}>
            <Text style={styles.dayNameText}>{dayName}</Text>
          </View>
        ))}
      </View>

      {/* Calendar Grid */}
      <ScrollView style={styles.calendarScroll} showsVerticalScrollIndicator={false}>
        <View style={styles.calendarGrid}>
          {calendarDays.map((day, index) => renderCalendarDay(day, index))}
        </View>
      </ScrollView>

      {/* Legend */}
      <View style={styles.legend}>
        <Text style={styles.legendTitle}>Keterangan:</Text>
        <View style={styles.legendItems}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: COLORS.status.success }]} />
            <Text style={styles.legendText}>Libur</Text>
          </View>
          <View style={styles.legendItem}>
            <LinearGradient
              colors={[COLORS.primary, COLORS.secondary]}
              style={styles.legendColor}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
            />
            <Text style={styles.legendText}>Kerja</Text>
          </View>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.background.card,
    borderRadius: BORDER_RADIUS.lg,
    padding: SPACING.md,
    margin: SPACING.md,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.md,
    paddingHorizontal: SPACING.sm,
  },
  navButton: {
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.background.surface,
  },
  monthYearContainer: {
    flex: 1,
    alignItems: 'center',
  },
  monthText: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.text.primary,
  },
  dayNamesContainer: {
    flexDirection: 'row',
    marginBottom: SPACING.md,
    width: CALENDAR_WIDTH,
  },
  dayNameContainer: {
    width: (CALENDAR_WIDTH / 7) - 1,
    alignItems: 'center',
    paddingVertical: SPACING.xs,
  },
  dayNameText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.text.secondary,
  },
  calendarScroll: {
    maxHeight: DAY_SIZE * 6 + SPACING.xs * 5,
  },
  calendarGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    width: CALENDAR_WIDTH,
    justifyContent: 'flex-start',
  },
  dayContainer: {
    width: (CALENDAR_WIDTH / 7) - 1,
    height: DAY_SIZE,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
    backgroundColor: COLORS.background.surface,
  },
  dayInactive: {
    opacity: 0.3,
  },
  dayToday: {
    backgroundColor: COLORS.primary,
  },
  dayText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs / 2,
  },
  dayTextInactive: {
    color: COLORS.text.light,
  },
  dayTextToday: {
    color: COLORS.text.white,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
  },
  shiftContainer: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  shiftBadge: {
    paddingHorizontal: SPACING.xs / 2,
    paddingVertical: 2,
    borderRadius: BORDER_RADIUS.xs,
    minWidth: (CALENDAR_WIDTH / 7) - SPACING.xs,
    alignItems: 'center',
  },
  shiftText: {
    fontSize: 10,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.text.white,
    textAlign: 'center',
  },
  legend: {
    marginTop: SPACING.md,
    paddingTop: SPACING.md,
    borderTopWidth: 1,
    borderTopColor: COLORS.glass.border,
  },
  legendTitle: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.text.primary,
    marginBottom: SPACING.xs,
  },
  legendItems: {
    flexDirection: 'row',
    gap: SPACING.md,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SPACING.xs,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: BORDER_RADIUS.xs,
  },
  legendText: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.text.secondary,
  },
});

export default CalendarView;