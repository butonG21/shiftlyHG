import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Button } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { COLORS } from '../../constants/colors';
import { SPACING, BORDER_RADIUS } from '../../constants/spacing';

interface EmptyStateProps {
  onSelectDate: () => void;
}

export const EmptyState: React.FC<EmptyStateProps> = ({ onSelectDate }) => {
  return (
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
          onPress={onSelectDate}
          style={styles.selectDateButton}
          labelStyle={styles.selectDateButtonText}
        >
          Select Date
        </Button>
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
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
});