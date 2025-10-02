import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { SPACING, BORDER_RADIUS, SHADOWS } from '../../constants/spacing';
import { AttendanceSummary } from '../../utils/timeUtils';

interface DailySummaryProps {
  summary: AttendanceSummary;
}

export const DailySummary: React.FC<DailySummaryProps> = ({ summary }) => {
  const summaryItems = [
    {
      icon: 'clock',
      color: COLORS.status.success,
      value: summary.workingTime,
      label: 'Working Time',
    },
    {
      icon: 'coffee',
      color: COLORS.status.warning,
      value: summary.breakTime,
      label: 'Break Time',
    },
    {
      icon: 'clock-outline',
      color: COLORS.status.info,
      value: summary.totalTime,
      label: 'Total Time',
    },
  ];

  return (
    <Card style={styles.summaryCard}>
      <Card.Content style={styles.summaryContent}>
        <View style={styles.summaryHeader}>
          <MaterialCommunityIcons name="chart-timeline" size={24} color={COLORS.primary} />
          <Text style={styles.summaryTitle}>Daily Summary</Text>
        </View>
        
        <View style={styles.summaryGrid}>
          {summaryItems.map((item, index) => (
            <React.Fragment key={item.label}>
              <View style={styles.summaryItem}>
                <View style={styles.summaryIconContainer}>
                  <MaterialCommunityIcons 
                    name={item.icon as any} 
                    size={20} 
                    color={item.color} 
                  />
                </View>
                <Text style={styles.summaryValue}>{item.value}</Text>
                <Text style={styles.summaryLabel}>{item.label}</Text>
              </View>
              
              {index < summaryItems.length - 1 && (
                <View style={styles.summaryDivider} />
              )}
            </React.Fragment>
          ))}
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
  summaryCard: {
    marginTop: SPACING.md,
    backgroundColor: 'white',
    borderRadius: BORDER_RADIUS.xl,
    ...SHADOWS.md,
    marginBottom: SPACING.xl,
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
});