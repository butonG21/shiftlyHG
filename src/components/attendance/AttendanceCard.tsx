import React from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { COLORS } from '../../constants/colors';
import { SPACING } from '../../constants/spacing';
import { AttendanceRecord } from '../../types/attendance';
import { useAttendanceStatus } from '../../hooks';

type RootStackParamList = {
  AttendanceDetail: {
    attendance: AttendanceRecord;
  };
};

type NavigationProp = StackNavigationProp<RootStackParamList>;

interface AttendanceCardProps {
  attendance: AttendanceRecord;
}

const AttendanceCard: React.FC<AttendanceCardProps> = ({
  attendance,
}) => {
  const navigation = useNavigation<NavigationProp>();
  // Determine the primary attendance type based on available data
  const getAttendanceType = () => {
    if (attendance.start_time && attendance.start_time !== '--:--:--') {
      return 'check in';
    } else if (attendance.end_time && attendance.end_time !== '--:--:--') {
      return 'check out';
    } else if (attendance.break_out_time && attendance.break_out_time !== '--:--:--') {
      return 'break start';
    } else if (attendance.break_in_time && attendance.break_in_time !== '--:--:--') {
      return 'break end';
    }
    return 'check in'; // default
  };

  const attendanceType = getAttendanceType();
  const statusInfo = useAttendanceStatus(attendanceType);

  // Helper functions to get display data based on attendance type
  const getDisplayTime = (type: string) => {
    switch (type) {
      case 'check in':
        return attendance.start_time;
      case 'check out':
        return attendance.end_time;
      case 'break start':
        return attendance.break_out_time;
      case 'break end':
        return attendance.break_in_time;
      default:
        return '--:--:--';
    }
  };

  const getDisplayAddress = (type: string) => {
    switch (type) {
      case 'check in':
        return attendance.start_address;
      case 'check out':
        return attendance.end_address;
      case 'break start':
        return attendance.break_out_address;
      case 'break end':
        return attendance.break_in_address;
      default:
        return null;
    }
  };

  const getDisplayImage = (type: string) => {
    switch (type) {
      case 'check in':
        return attendance.start_image;
      case 'check out':
        return attendance.end_image;
      case 'break start':
        return attendance.break_out_image;
      case 'break end':
        return attendance.break_in_image;
      default:
        return null;
    }
  };

  const getPhotoLabel = (type: string) => {
    return `${type} Photo`;
  };

  const handleCardPress = () => {
    navigation.navigate('AttendanceDetail', {
      attendance: attendance,
    });
  };

  return (
    <TouchableOpacity 
      style={[
        styles.attendanceCard,
        { borderLeftColor: statusInfo.borderColor }
      ]}
      onPress={handleCardPress}
      activeOpacity={0.7}
    >
      <View style={[styles.cardLeft, { borderLeftColor: statusInfo.borderColor }]}>
        <View style={[styles.iconContainer, { backgroundColor: statusInfo.bgColor }]}>
          <MaterialCommunityIcons
            name={statusInfo.icon as any}
            size={24}
            color={statusInfo.color}
          />
        </View>
      </View>

      <View style={styles.cardContent}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>{attendanceType}</Text>
          <View style={[styles.timeChip, { backgroundColor: statusInfo.color }]}>
            <Text style={styles.timeText}>{getDisplayTime(attendanceType)}</Text>
          </View>
        </View>

        {getDisplayAddress(attendanceType) && (
          <View style={styles.locationRow}>
            <MaterialCommunityIcons
              name="map-marker"
              size={16}
              color={COLORS.text.secondary}
            />
            <Text style={styles.locationText}>{getDisplayAddress(attendanceType)}</Text>
          </View>
        )}

        {getDisplayImage(attendanceType) && (
           <View style={styles.photoContainer}>
             <Image
               source={{ uri: getDisplayImage(attendanceType) || '' }}
               style={styles.employeePhoto}
               resizeMode="cover"
             />
            <View style={styles.photoOverlay}>
              <Text style={styles.photoLabel}>
                {getPhotoLabel(attendanceType)}
              </Text>
              <MaterialCommunityIcons
                name="camera"
                size={16}
                color="white"
              />
            </View>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  attendanceCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    flexDirection: 'row',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    minHeight: 140,
    marginBottom: SPACING.md,
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
    borderRadius: 8,
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

export default AttendanceCard;