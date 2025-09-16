// src/screens/ScheduleScreen.tsx
import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  RefreshControl,
  StatusBar,
  Alert,
} from 'react-native';
import {
  Appbar,
  Text,
  ActivityIndicator,
  Button,
  Menu,
  Divider,
} from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { CalendarView } from '../components/ui';
import { useEmployeeSchedule } from '../hooks';
import { COLORS } from '../constants/colors';
import { TYPOGRAPHY } from '../constants/typography';
import { SPACING, BORDER_RADIUS } from '../constants/spacing';

const ScheduleScreen: React.FC = () => {
  const navigation = useNavigation();
  const insets = useSafeAreaInsets();
  const {
    schedule,
    scheduleItems,
    loading,
    error,
    availableMonths,
    currentFilter,
    refetch,
    filterByMonth,
  } = useEmployeeSchedule();

  const [refreshing, setRefreshing] = useState(false);
  const [monthMenuVisible, setMonthMenuVisible] = useState(false);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await refetch();
    } catch (err) {
      console.error('Refresh error:', err);
    } finally {
      setRefreshing(false);
    }
  };

  const handleMonthChange = async (month: number, year: number) => {
    try {
      await filterByMonth(month, year);
    } catch (err) {
      Alert.alert(
        'Error',
        'Gagal memuat jadwal untuk bulan yang dipilih. Silakan coba lagi.',
        [{ text: 'OK' }]
      );
    }
  };

  const handleMonthSelect = (month: number, year: number, monthName: string) => {
    setMonthMenuVisible(false);
    handleMonthChange(month, year);
  };

  const renderHeader = () => (
    <LinearGradient
      colors={COLORS.gradient.primary}
      style={[styles.header, { paddingTop: insets.top }]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <Appbar.Header style={styles.appbar}>
        <Appbar.BackAction
          onPress={() => navigation.goBack()}
          iconColor={COLORS.text.white}
        />
        <Appbar.Content
          title="Jadwal Kerja"
          titleStyle={styles.headerTitle}
        />
        <Menu
          visible={monthMenuVisible}
          onDismiss={() => setMonthMenuVisible(false)}
          anchor={
            <Appbar.Action
              icon="calendar-month"
              iconColor={COLORS.text.white}
              onPress={() => setMonthMenuVisible(true)}
            />
          }
          contentStyle={styles.menuContent}
        >
          <Text style={styles.menuTitle}>Pilih Bulan</Text>
          <Divider />
          {Array.isArray(availableMonths) && availableMonths.map((month) => (
            <Menu.Item
              key={`${month.year}-${month.month}`}
              onPress={() => handleMonthSelect(month.month, month.year, month.month_name)}
              title={`${month.month_name} ${month.year}`}
              titleStyle={[
                styles.menuItemText,
                currentFilter?.month === month.month &&
                currentFilter?.year === month.year &&
                styles.menuItemActive
              ]}
            />
          ))}
        </Menu>
      </Appbar.Header>
    </LinearGradient>
  );

  const renderScheduleStats = () => {
    if (!schedule?.statistics) return null;

    const { statistics } = schedule;
    
    // Calculate days in current month
    const currentDate = new Date(currentFilter?.year || new Date().getFullYear(), currentFilter?.month || new Date().getMonth(), 1);
    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    
    // Count actual working days from schedule items
    let workingDays = 0;
    let offDays = 0;
    
    if (schedule.schedule && schedule.schedule.length > 0) {
      schedule.schedule.forEach(item => {
        if (item.shift === 'OFF' || item.shift === 'Libur' || item.shift === 'CT') {
          offDays++;
        } else {
          workingDays++;
        }
      });
    } else {
      // Fallback to API statistics if no items
      workingDays = statistics.working_days_in_month || 0;
      // Use working days calculation if off_days_in_month doesn't exist
      offDays = daysInMonth - workingDays;
    }

    return (
      <View style={styles.statsContainer}>
        <Text style={styles.statsTitle}>Statistik Bulan Ini</Text>
        {(workingDays + offDays) === 0 ? (
          <View style={styles.noDataContainer}>
            <MaterialCommunityIcons
              name="calendar-blank"
              size={48}
              color={COLORS.text.secondary}
            />
            <Text style={styles.noDataText}>Belum ada data jadwal untuk bulan ini</Text>
          </View>
        ) : (
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <MaterialCommunityIcons
                name="calendar-check"
                size={24}
                color={COLORS.primary}
              />
              <Text style={styles.statNumber}>{workingDays}</Text>
              <Text style={styles.statLabel}>Hari Kerja</Text>
            </View>
            
            <View style={styles.statCard}>
              <MaterialCommunityIcons
                name="calendar-remove"
                size={24}
                color={COLORS.status.success}
              />
              <Text style={styles.statNumber}>{offDays}</Text>
              <Text style={styles.statLabel}>Hari Libur</Text>
            </View>
            
            <View style={styles.statCard}>
              <MaterialCommunityIcons
                name="calendar"
                size={24}
                color={COLORS.secondary}
              />
              <Text style={styles.statNumber}>{workingDays + offDays}</Text>
              <Text style={styles.statLabel}>Total Hari</Text>
            </View>
          </View>
        )}
      </View>
    );
  };

  const renderShiftDistribution = () => {
    if (!schedule?.statistics?.shift_distribution) return null;

    const { shift_distribution } = schedule.statistics;
    const shifts = Object.entries(shift_distribution).filter(([_, count]) => count > 0);

    if (shifts.length === 0) return null;

    return (
      <View style={styles.distributionContainer}>
        <Text style={styles.distributionTitle}>Distribusi Shift</Text>
        <View style={styles.distributionList}>
          {shifts.map(([shiftName, count]) => (
            <View key={shiftName} style={styles.distributionItem}>
              <View style={styles.distributionInfo}>
                <Text style={styles.distributionShift}>{shiftName}</Text>
                <Text style={styles.distributionCount}>{count} hari</Text>
              </View>
              <View style={styles.distributionBar}>
                <View
                  style={[
                    styles.distributionProgress,
                    {
                      width: `${(count / (schedule.statistics?.total_scheduled_days || 1)) * 100}%`,
                      backgroundColor: COLORS.primary,
                    },
                  ]}
                />
              </View>
            </View>
          ))}
        </View>
      </View>
    );
  };

  if (loading && !refreshing) {
    return (
      <View style={styles.container}>
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Memuat jadwal...</Text>
        </View>
      </View>
    );
  }

  if (error && !schedule) {
    return (
      <View style={styles.container}>
        {renderHeader()}
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons
            name="alert-circle"
            size={64}
            color={COLORS.status.error}
          />
          <Text style={styles.errorTitle}>Gagal Memuat Jadwal</Text>
          <Text style={styles.errorMessage}>{error}</Text>
          <Button
            mode="contained"
            onPress={handleRefresh}
            style={styles.retryButton}
            buttonColor={COLORS.primary}
          >
            Coba Lagi
          </Button>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={COLORS.primary}
        translucent
      />
      {renderHeader()}
      
      <ScrollView
        style={styles.content}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
            tintColor={COLORS.primary}
          />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Statistics */}
        {renderScheduleStats()}
        
        {/* Calendar */}
        {currentFilter && (
          <CalendarView
            scheduleItems={scheduleItems}
            currentMonth={currentFilter.month}
            currentYear={currentFilter.year}
            onMonthChange={handleMonthChange}
            loading={loading}
          />
        )}
        
        {/* Shift Distribution */}
        {renderShiftDistribution()}
        
        <View style={styles.bottomSpacing} />
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
  headerTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text.white,
  },
  menuContent: {
    backgroundColor: COLORS.background.card,
    borderRadius: BORDER_RADIUS.md,
  },
  menuTitle: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.text.primary,
    padding: SPACING.md,
  },
  menuItemText: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.primary,
  },
  menuItemActive: {
    color: COLORS.primary,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
  },
  content: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  loadingText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.text.secondary,
    marginTop: SPACING.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: SPACING.xl,
  },
  errorTitle: {
    fontSize: TYPOGRAPHY.fontSize.xl,
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.text.primary,
    marginTop: SPACING.md,
    marginBottom: SPACING.sm,
  },
  errorMessage: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginBottom: SPACING.xl,
  },
  retryButton: {
    borderRadius: BORDER_RADIUS.md,
  },
  statsContainer: {
    backgroundColor: COLORS.background.card,
    margin: SPACING.md,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.background.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.glass.border,
  },
  statNumber: {
    fontSize: TYPOGRAPHY.fontSize['2xl'],
    fontWeight: TYPOGRAPHY.fontWeight.bold,
    color: COLORS.primary,
    marginTop: SPACING.xs,
  },
  statLabel: {
    fontSize: TYPOGRAPHY.fontSize.xs,
    color: COLORS.text.secondary,
    marginTop: SPACING.xs / 2,
    textAlign: 'center',
  },
  noDataContainer: {
    alignItems: 'center',
    padding: SPACING.xl,
  },
  noDataText: {
    fontSize: TYPOGRAPHY.fontSize.base,
    color: COLORS.text.secondary,
    textAlign: 'center',
    marginTop: SPACING.md,
  },
  distributionContainer: {
    backgroundColor: COLORS.background.card,
    margin: SPACING.md,
    marginTop: 0,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.lg,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  distributionTitle: {
    fontSize: TYPOGRAPHY.fontSize.lg,
    fontWeight: TYPOGRAPHY.fontWeight.semibold,
    color: COLORS.text.primary,
    marginBottom: SPACING.md,
  },
  distributionList: {
    gap: SPACING.sm,
  },
  distributionItem: {
    backgroundColor: COLORS.background.surface,
    padding: SPACING.md,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    borderColor: COLORS.glass.border,
  },
  distributionInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SPACING.xs,
  },
  distributionShift: {
    fontSize: TYPOGRAPHY.fontSize.base,
    fontWeight: TYPOGRAPHY.fontWeight.medium,
    color: COLORS.text.primary,
  },
  distributionCount: {
    fontSize: TYPOGRAPHY.fontSize.sm,
    color: COLORS.text.secondary,
  },
  distributionBar: {
    height: 4,
    backgroundColor: COLORS.glass.border,
    borderRadius: 2,
    overflow: 'hidden',
  },
  distributionProgress: {
    height: '100%',
    borderRadius: 2,
  },
  bottomSpacing: {
    height: SPACING.xl,
  },
});

export default ScheduleScreen;