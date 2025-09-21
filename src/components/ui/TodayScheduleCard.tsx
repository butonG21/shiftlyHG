// src/components/ui/TodayScheduleCard.tsx
import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Dimensions } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';
import { useSchedule } from '../../hooks';
import { classifyShift } from '../../utils/shifts';
import { formatDate, formatTime, parseAndFormatShift } from '../../utils/dateTime';
import { SHIFT_THEMES, SHIFT_MESSAGES, SHIFT_ICONS } from '../../constants/shifts';
import { SHIFT_ANIMATIONS } from '../../constants/animations';
import { COLORS } from '../../constants/colors';

const { width } = Dimensions.get('window');

const TodayScheduleCard: React.FC = () => {
  const { todaySchedule, tomorrowSchedule, loading, error } = useSchedule();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingCard}>
          <ActivityIndicator size="large" color={COLORS.primary} />
          <Text style={styles.loadingText}>Memuat jadwal...</Text>
        </View>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingCard}>
          <MaterialCommunityIcons name="alert-circle" size={48} color={COLORS.status.error} />
          <Text style={styles.loadingText}>Gagal memuat jadwal</Text>
        </View>
      </View>
    );
  }

  const todayShift = todaySchedule?.shift || 'off';
  const tomorrowShift = tomorrowSchedule?.shift || 'off';
  
  const shiftCategory = classifyShift(todayShift);
  const theme = SHIFT_THEMES[shiftCategory];
  const shiftMessage = SHIFT_MESSAGES[shiftCategory];
  const shiftIcon = SHIFT_ICONS[shiftCategory];
  const animationSource = SHIFT_ANIMATIONS[shiftCategory];

  const cardStyle = [
    styles.cardWrapper,
    { backgroundColor: 'transparent' }
  ];

  return (
    <View style={cardStyle}>
      {/* Header Jadwal Hari Ini */}
      <LinearGradient
        colors={COLORS.gradient.accent}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="clock" size={20} color={COLORS.text.white} />
            <Text style={styles.sectionTitle}>Jadwal Hari Ini</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Animation Container dengan Overlay */}
      <View style={styles.animationWrapper}>
        <View style={styles.animationContainer}>
          <LottieView
            key={`${shiftCategory}-${Date.now()}`}
            source={animationSource}
            autoPlay
            loop={true}
            resizeMode="contain"
            style={styles.animation}
            onAnimationFinish={() => {
              console.log('Animation finished for:', shiftCategory);
            }}
          />
        </View>
        
        {/* Status Badge */}
        <View style={[styles.statusBadge, { backgroundColor: 'rgba(255,255,255,0.95)' }]}>
          <MaterialCommunityIcons 
            name={shiftIcon as any} 
            size={16} 
            color={shiftCategory === 'off' ? COLORS.status.success : COLORS.status.info} 
          />
          <Text style={[styles.badgeText, { color: shiftCategory === 'off' ? COLORS.status.success : COLORS.status.info }]}>
            {shiftCategory === 'off' ? 'LIBUR' : 'KERJA'}
          </Text>
        </View>
      </View>

      {/* Main Content */}
      <LinearGradient
          colors={COLORS.gradient.accent}
          style={styles.contentContainer}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
        {/* Today's Schedule */}
        <View style={styles.todaySection}>
          <Text style={styles.mainMessage}>
            {shiftCategory === 'off' 
              ? `Hari ini Anda ${shiftMessage}` 
              : `Hari ini Anda ${shiftMessage} ${parseAndFormatShift(todayShift)}`
            }
          </Text>
          <View style={[styles.shiftDetail, { backgroundColor: 'rgba(255,255,255,0.25)' }]}>
            <Text style={styles.shiftCategory}>{shiftCategory}</Text>
          </View>
        </View>

        {/* Elegant Divider */}
        <View style={styles.elegantDivider}>
          <View style={styles.dividerLine} />
          <MaterialCommunityIcons name="chevron-down" size={20} color={COLORS.text.white} />
          <View style={styles.dividerLine} />
        </View>

        {/* Tomorrow's Schedule */}
        <View style={styles.tomorrowSection}>
          <View style={styles.tomorrowHeader}>
            <MaterialCommunityIcons name="calendar-plus" size={18} color={COLORS.text.accent} />
            <Text style={styles.tomorrowLabel}>Besok</Text>
          </View>
          <Text style={styles.tomorrowSchedule}>
            {tomorrowSchedule 
              ? `Jadwal: ${parseAndFormatShift(tomorrowShift)}`
              : 'Belum ada jadwal'
            }
          </Text>
        </View>

        {/* Corner Decorations */}
        <View style={[styles.cornerDecoration, styles.topLeftCorner, { backgroundColor: 'rgba(255, 255, 255, 0.15)' }]} />
        <View style={[styles.cornerDecoration, styles.bottomRightCorner, { backgroundColor: 'rgba(255, 255, 255, 0.15)' }]} />
      </LinearGradient>
    </View>
  );
};

const styles = StyleSheet.create({
  cardWrapper: {
    width: '100%',
    borderRadius: 24,
    marginTop: 16,
    marginBottom: 16,
    overflow: 'hidden',
    shadowColor: COLORS.text.primary,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 16,
    elevation: 8,
    position: 'relative',
  },
  header: {
    paddingTop: 20,
    paddingBottom: 0,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
  },

  animationWrapper: {
    position: 'relative',
    height: 160,
    marginHorizontal: 20,
    marginTop: 10,
  },
  animationContainer: {
    height: '100%',
    width: '100%',
    borderRadius: 18,
    overflow: 'hidden',
    backgroundColor: 'rgba(255,255,255,0.9)',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
  },
  animation: {
    flex: 1,
    width: '100%',
  },
  statusBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    shadowColor: COLORS.text.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 4,
    letterSpacing: 0.5,
  },
  contentContainer: {
    marginTop: 20,
    padding: 20,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  todaySection: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.text.white,
    marginLeft: 8,
    textTransform: 'uppercase',
  },
  mainMessage: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.text.white,
    lineHeight: 26,
    marginBottom: 8,
  },
  shiftDetail: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginTop: 8,
  },
  shiftCategory: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.text.white,
    textTransform: 'capitalize',
  },
  elegantDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
  },
  dividerLine: {
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.3)',
    flex: 1,
    marginHorizontal: 8,
  },
  tomorrowSection: {
    backgroundColor: 'rgba(255,255,255,0.15)',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.2)',
  },
  tomorrowHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  tomorrowLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.text.accent,
    marginLeft: 8,
    textTransform: 'capitalize',
  },
  tomorrowSchedule: {
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text.white,
  },
  cornerDecoration: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    opacity: 0.1,
  },
  topLeftCorner: {
    top: -20,
    left: -20,
  },
  bottomRightCorner: {
    bottom: -20,
    right: -20,
  },
  loadingContainer: {
    width: '100%',
    marginTop: 16,
    marginBottom: 16,
    marginHorizontal: 16,
  },
  loadingCard: {
    backgroundColor: COLORS.background.primary,
    padding: 40,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.text.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '500',
    color: COLORS.text.secondary,
  },
});

export default TodayScheduleCard;