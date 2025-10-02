import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { COLORS } from '../../constants/colors';
import { SPACING, BORDER_RADIUS, SHADOWS } from '../../constants/spacing';
import AttendanceDetailModal from './AttendanceDetailModal';

interface AttendanceCardProps {
  type: string;
  time: string;
  address: string;
  image: string | null;
  date?: string;
}

interface StatusInfo {
  color: string;
  icon: string;
  bgColor: string;
  borderColor: string;
}

export const AttendanceCard: React.FC<AttendanceCardProps> = ({
  type,
  time,
  address,
  image,
  date,
}) => {
  const [modalVisible, setModalVisible] = useState(false);

  const handleCardPress = () => {
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
  };
  const getStatusInfo = (type: string): StatusInfo => {
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

  const getPhotoLabel = (type: string): string => {
    return `${type} Photo`;
  };

  const statusInfo = getStatusInfo(type);

  return (
    <>
      <TouchableOpacity style={styles.attendanceCard} onPress={handleCardPress} activeOpacity={0.7}>
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
      </TouchableOpacity>

      <AttendanceDetailModal
        visible={modalVisible}
        onClose={handleCloseModal}
        type={type}
        time={time}
        address={address}
        image={image || ''}
        date={date}
      />
    </>
  );
};

const styles = StyleSheet.create({
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
});