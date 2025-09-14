// src/components/ui/ProfileHeader.tsx
import React from 'react';
import { View, StyleSheet, Image, Dimensions } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useCurrentTime, useAuth } from '../../hooks';
import { getGreeting, formatDate, formatTime } from '../../utils/dateTime';
import { COLORS } from '../../constants/colors';

const { width } = Dimensions.get('window');

const ProfileHeader: React.FC = () => {
  const { user } = useAuth();
  const currentTime = useCurrentTime();

  const greeting = getGreeting();
  const formattedDate = formatDate(currentTime);
  const formattedTime = formatTime(currentTime);

  return (
    <LinearGradient
      colors={COLORS.gradient.accent}
      style={styles.container}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      {/* Background Pattern */}
      <View style={styles.backgroundPattern}>
        <View style={[styles.patternCircle, styles.circle1]} />
        <View style={[styles.patternCircle, styles.circle2]} />
        <View style={[styles.patternCircle, styles.circle3]} />
      </View>

      {/* Header Content */}
      <View style={styles.header}>
        {/* Date and Time Row */}
        <View style={styles.dateTimeRow}>
          <View style={styles.dateContainer}>
            <MaterialCommunityIcons name="calendar" size={18} color={COLORS.text.white} />
            <Text style={styles.dateText}>{formattedDate}</Text>
          </View>
          <View style={styles.timeContainer}>
            <MaterialCommunityIcons name="clock" size={16} color={COLORS.text.white} />
            <Text style={styles.timeText}>{formattedTime}</Text>
          </View>
        </View>

        {/* Welcome Section */}
        <View style={styles.welcomeSection}>
          <View style={styles.textSection}>
            <View style={styles.greetingContainer}>
              <MaterialCommunityIcons name="weather-sunny" size={20} color={COLORS.text.warning} />
              <Text style={styles.greetingText}>{greeting}</Text>
            </View>
            <Text style={styles.nameText}>{user?.name || 'User'}</Text>
            <View style={styles.positionContainer}>
              <MaterialCommunityIcons name="briefcase" size={16} color={COLORS.text.primary} />
              <Text style={styles.positionText}>{user?.position || 'Employee'}</Text>
            </View>
          </View>

          {/* Avatar */}
          <View style={styles.avatarContainer}>
            <LinearGradient
              colors={COLORS.gradient.secondary}
              style={styles.avatarGradient}
            >
              {(user?.profileImage?.original || user?.profileImage?.medium || user?.profileImage?.small || user?.photoURL) ? (
                <Image
                  source={{
                    uri: user?.profileImage?.original || user?.profileImage?.medium || user?.profileImage?.small || user?.photoURL
                  }}
                  style={styles.avatar}
                  defaultSource={require('../../../assets/default_avatar.png')}
                  onError={(error) => {
                    console.log('Image load error:', error.nativeEvent.error);
                  }}
                />
              ) : (
                <Image
                  source={require('../../../assets/default_avatar.png')}
                  style={styles.avatar}
                />
              )}
            </LinearGradient>
            <View style={styles.avatarBadge}>
              <MaterialCommunityIcons name="check" size={12} color={COLORS.text.white} />
            </View>
          </View>
        </View>

        {/* Status Row */}
        <View style={styles.statusRow}>
          <View style={styles.statusIndicator}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Online</Text>
          </View>
          <View style={styles.locationContainer}>
            <MaterialCommunityIcons name="map-marker" size={14} color={COLORS.text.white} />
            <Text style={styles.locationText}>Jakarta, Indonesia</Text>
          </View>
        </View>
      </View>

      {/* Wave Bottom */}
      <View style={styles.waveContainer}>
        <View style={styles.wave} />
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 50,
    paddingBottom: 30,
    paddingHorizontal: 20,
    position: 'relative',
    overflow: 'hidden',
  },
  backgroundPattern: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  patternCircle: {
    position: 'absolute',
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
  },
  circle1: {
    width: 120,
    height: 120,
    top: -30,
    right: -20,
  },
  circle2: {
    width: 80,
    height: 80,
    bottom: 20,
    left: -20,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  circle3: {
    width: 60,
    height: 60,
    top: '50%',
    right: '30%',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
  },
  header: {
    zIndex: 10,
  },
  dateTimeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dateText: {
    fontSize: 14,
    color: COLORS.text.white,
    marginLeft: 8,
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  timeText: {
    fontSize: 14,
    color: COLORS.text.white,
    marginLeft: 6,
    fontWeight: '700',
    letterSpacing: 1,
  },
  welcomeSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  textSection: {
    flex: 1,
    marginRight: 16,
  },
  greetingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  greetingText: {
    fontSize: 16,
    color: COLORS.text.white,
    marginLeft: 8,
    fontWeight: '500',
  },
  nameText: {
    fontSize: 24,
    color: COLORS.text.white,
    fontWeight: '800',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  positionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  positionText: {
    fontSize: 14,
    color: COLORS.text.white,
    marginLeft: 6,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  avatarContainer: {
    position: 'relative',
  },
  avatarGradient: {
    width: 72,
    height: 72,
    borderRadius: 36,
    padding: 3,
    shadowColor: COLORS.text.accent,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 33,
  },
  avatarBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: COLORS.status.success,
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.text.white,
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.15)',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: COLORS.status.success,
    marginRight: 8,
  },
  statusText: {
    fontSize: 12,
    color: COLORS.text.white,
    fontWeight: '600',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 12,
    color: COLORS.text.white,
    marginLeft: 4,
    fontWeight: '500',
  },
  waveContainer: {
    position: 'absolute',
    bottom: -2,
    left: 0,
    right: 0,
    height: 20,
  },
  wave: {
    flex: 1,
    backgroundColor: COLORS.background.surface,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
});

export default ProfileHeader;