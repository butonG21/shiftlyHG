import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { SPACING, BORDER_RADIUS, SHADOWS } from '../../constants/spacing';

interface SummaryData {
  totalTime: string;
  breakTime: string;
  workingTime: string;
}

interface AttendanceSummaryProps {
  summaryData: SummaryData;
}

const AttendanceSummary: React.FC<AttendanceSummaryProps> = ({ summaryData }) => {
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
            <Text style={styles.summaryValue}>{summaryData.workingTime}</Text>
            <Text style={styles.summaryLabel}>Working Time</Text>
          </View>
          
          <View style={styles.summaryDivider} />
          
          <View style={styles.summaryItem}>
            <View style={styles.summaryIconContainer}>
              <MaterialCommunityIcons name="coffee" size={20} color={COLORS.status.warning} />
            </View>
            <Text style={styles.summaryValue}>{summaryData.breakTime}</Text>
            <Text style={styles.summaryLabel}>Break Time</Text>
          </View>
          
          <View style={styles.summaryDivider} />
          
          <View style={styles.summaryItem}>
            <View style={styles.summaryIconContainer}>
              <MaterialCommunityIcons name="clock-outline" size={20} color={COLORS.status.info} />
            </View>
            <Text style={styles.summaryValue}>{summaryData.totalTime}</Text>
            <Text style={styles.summaryLabel}>Total Time</Text>
          </View>
        </View>
      </Card.Content>
    </Card>
  );
};

const styles = StyleSheet.create({
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
});

export default AttendanceSummary;