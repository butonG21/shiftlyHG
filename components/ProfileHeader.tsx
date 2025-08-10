// components/ProfileHeader.tsx
import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Image, TouchableOpacity, Dimensions } from 'react-native';
import { Text } from 'react-native-paper';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../contexts/AuthContext';
import moment from 'moment';
import 'moment/locale/id';

const { width } = Dimensions.get('window');

const ProfileHeader: React.FC = () => {
  const { user } = useAuth();
  const [currentTime, setCurrentTime] = useState(moment());

  useEffect(() => {
    moment.locale('id');
    const timer = setInterval(() => {
      setCurrentTime(moment());
    }, 30000); // Update setiap 30 detik untuk efisiensi
    return () => clearInterval(timer);
  }, []);

  const greeting = () => {
    const hour = currentTime.hour();
    if (hour < 10) return "Selamat Pagi";
    if (hour < 15) return "Selamat Siang";
    if (hour < 18) return "Selamat Sore";
    return "Selamat Malam";
  };

  const formatDate = currentTime.format('dddd, DD MMMM YYYY');
  const formatTime = currentTime.format('HH:mm');

  return (
    <LinearGradient
      colors={['#00425A', '#005C7A', '#007B9A']}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
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
            <MaterialCommunityIcons name="calendar-outline" size={18} color="#F9B233" />
            <Text style={styles.dateText}>{formatDate}</Text>
          </View>
          
          <BlurView intensity={20} tint="light" style={styles.timeContainer}>
            <MaterialCommunityIcons name="clock-outline" size={16} color="#FFFFFF" />
            <Text style={styles.timeText}>{formatTime}</Text>
          </BlurView>
        </View>

        {/* Main Welcome Section */}
        <View style={styles.welcomeSection}>
          <View style={styles.textSection}>
            <View style={styles.greetingContainer}>
              <MaterialCommunityIcons name="hand-wave" size={20} color="#F9B233" />
              <Text style={styles.greetingText}>{greeting()}</Text>
            </View>
            
            <Text style={styles.nameText} numberOfLines={1}>
              {user?.name || 'User'}
            </Text>
            
            <View style={styles.positionContainer}>
              <MaterialCommunityIcons name="briefcase-outline" size={16} color="#B8E6FF" />
              <Text style={styles.positionText} numberOfLines={1}>
                {user?.position || 'Position'}
              </Text>
            </View>
          </View>

          <TouchableOpacity style={styles.avatarContainer} activeOpacity={0.8}>
            <LinearGradient
              colors={['#F9B233', '#FFD700']}
              style={styles.avatarGradient}
            >
              <Image
                source={{ 
                  uri: user?.photoURL || 'https://www.looper.com/img/gallery/how-to-start-watching-one-piece/intro-1669408304.jpg'
                }}
                style={styles.avatar}
                defaultSource={require('../assets/default_avatar.png')} // Tambahkan default avatar
              />
              <View style={styles.avatarBadge}>
                <MaterialCommunityIcons name="check" size={12} color="#FFFFFF" />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Status Indicator */}
        <View style={styles.statusRow}>
          <BlurView intensity={15} tint="light" style={styles.statusIndicator}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>Online</Text>
          </BlurView>

          <View style={styles.locationContainer}>
            <MaterialCommunityIcons name="map-marker-outline" size={14} color="#B8E6FF" />
            <Text style={styles.locationText}>{user?.location || 'Jakarta, Indonesia'}</Text>
          </View>
        </View>
      </View>

      {/* Bottom Wave */}
      <View style={styles.waveContainer}>
        <View style={styles.wave} />
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingTop: 50, // Status bar height
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
    backgroundColor: 'rgba(249, 178, 51, 0.08)',
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
    backgroundColor: 'rgba(249, 178, 51, 0.12)',
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
    color: '#B8E6FF',
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
    color: '#FFFFFF',
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
    color: '#B8E6FF',
    marginLeft: 8,
    fontWeight: '500',
  },
  nameText: {
    fontSize: 24,
    color: '#FFFFFF',
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
    color: '#F9B233',
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
    shadowColor: '#F9B233',
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
    backgroundColor: '#4CAF50',
    width: 20,
    height: 20,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
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
    backgroundColor: '#4CAF50',
    marginRight: 8,
  },
  statusText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  locationContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 12,
    color: '#B8E6FF',
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
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
  },
});

export default ProfileHeader;