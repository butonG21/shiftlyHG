// components/CurrentTime.tsx
import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import moment from 'moment';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';

const CurrentTime = () => {
  const [currentTime, setCurrentTime] = useState(moment());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(moment());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <View style={styles.container}>
      <BlurView intensity={80} tint="light" style={styles.blurCard}>
        <LinearGradient
          colors={['rgba(249, 178, 51, 0.08)', 'rgba(0, 66, 90, 0.12)', 'rgba(43, 14, 146, 0.06)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradientOverlay}
        >
          {/* Header dengan ikon waktu */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <MaterialCommunityIcons name="clock" size={24} color="#FFFFFF" />
            </View>
            <Text style={styles.headerText}>Waktu Saat Ini</Text>
          </View>

          {/* Main time display */}
          <View style={styles.timeContainer}>
            <Text style={styles.timeText}>{currentTime.format('HH:mm')}</Text>
            <Text style={styles.secondsText}>{currentTime.format('ss')}</Text>
          </View>

          {/* Date display */}
          <View style={styles.dateContainer}>
            <View style={styles.dateIconContainer}>
              <MaterialCommunityIcons name="calendar-today" size={18} color="#00425A" />
            </View>
            <View style={styles.dateTextContainer}>
              <Text style={styles.dayText}>{currentTime.format('dddd')}</Text>
              <Text style={styles.fullDateText}>{currentTime.format('DD MMMM YYYY')}</Text>
            </View>
          </View>

          {/* Decorative elements */}
          <View style={styles.decorativeElements}>
            <View style={styles.dot} />
            <View style={styles.line} />
            <View style={styles.dot} />
          </View>
        </LinearGradient>
      </BlurView>
    </View>
  );
};

export default CurrentTime;

const styles = StyleSheet.create({
  container: {
    marginTop: 16,
    marginHorizontal: 16,
  },
  blurCard: {
    borderRadius: 24,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  gradientOverlay: {
    padding: 24,
    minHeight: 160,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  iconContainer: {
    backgroundColor: 'rgba(249, 178, 51, 0.9)',
    borderRadius: 12,
    padding: 8,
    marginRight: 12,
    shadowColor: '#F9B233',
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 4,
  },
  headerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#00425A',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginBottom: 20,
  },
  timeText: {
    fontSize: 48,
    fontWeight: '800',
    color: '#00425A',
    letterSpacing: -1,
    textShadowColor: 'rgba(249, 178, 51, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  secondsText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#F9B233',
    marginLeft: 8,
    marginBottom: 8,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  dateIconContainer: {
    backgroundColor: 'rgba(0, 66, 90, 0.1)',
    borderRadius: 10,
    padding: 8,
    marginRight: 12,
  },
  dateTextContainer: {
    flex: 1,
  },
  dayText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#00425A',
    marginBottom: 2,
  },
  fullDateText: {
    fontSize: 14,
    fontWeight: '500',
    color: '#00425A',
    opacity: 0.8,
  },
  decorativeElements: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#F9B233',
    opacity: 0.6,
  },
  line: {
    width: 40,
    height: 1,
    backgroundColor: '#F9B233',
    opacity: 0.4,
    marginHorizontal: 8,
  },
});