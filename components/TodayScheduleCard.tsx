import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Dimensions } from 'react-native';
import { getProfile as getUserProfile } from '../services/authService';
import moment from 'moment';
import 'moment/locale/id';
import LottieView from 'lottie-react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

interface ScheduleItem {
  date: string;
  shift: string;
}

const shiftColors = {
  pagi: '#D0F0FD',
  middle: '#FFF3CD',
  siang: '#F8D7DA',
  off: '#E2E3E5',
};

const shiftThemes = {
  pagi: {
    primary: '#FF9500',
    secondary: '#FFB84D',
    background: '#FFF5E6',
    text: '#8B4000',
  },
  middle: {
    primary: '#007AFF',
    secondary: '#4DA6FF',
    background: '#E6F3FF',
    text: '#003D80',
  },
  siang: {
    primary: '#FF3B30',
    secondary: '#FF6B61',
    background: '#FFE6E6',
    text: '#800020',
  },
  off: {
    primary: '#8E44AD',
    secondary: '#A569BD',
    background: '#F4EDF7',
    text: '#5B2C87',
  },
};

const shiftMessages = {
  pagi: 'masuk pukul pagi',
  middle: 'masuk pukul tengah hari',
  siang: 'masuk pukul siang',
  off: 'libur atau cuti',
};

const shiftIcons = {
  pagi: 'white-balance-sunny' as const,
  middle: 'weather-cloudy' as const,
  siang: 'weather-sunset-down' as const,
  off: 'coffee' as const,
};

const classifyShift = (shiftRaw: string): keyof typeof shiftColors => {
  if (!shiftRaw) return 'off';
  const normalized = shiftRaw.toLowerCase();
  if (normalized === 'off' || normalized === 'ct') return 'off';

  const hourMatch = normalized.match(/^(\d{1,2})(?::\d{2})?$/);
  if (hourMatch) {
    const hour = parseInt(hourMatch[1], 10);
    if (hour >= 7 && hour <= 9) return 'pagi';
    if (hour >= 10 && hour <= 11) return 'middle';
    if (hour >= 12 && hour <= 13) return 'siang';
  }
  return 'off';
};

const shiftAnimations = {
  pagi: require('../assets/animations/pagi.json'),
  middle: require('../assets/animations/siang-midle.json'),
  siang: require('../assets/animations/pagi2.json'),
  off: require('../assets/animations/off3.json'),
};

const TodayScheduleCard = () => {
  const [scheduleToday, setScheduleToday] = useState<ScheduleItem | null>(null);
  const [scheduleTomorrow, setScheduleTomorrow] = useState<ScheduleItem | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSchedule = async () => {
      try {
        const user = await getUserProfile();
        const today = moment().format('YYYY-MM-DD');
        const tomorrow = moment().add(1, 'day').format('YYYY-MM-DD');

        const todaySchedule = user.schedule.find((item: ScheduleItem) => item.date === today);
        const tomorrowSchedule = user.schedule.find((item: ScheduleItem) => item.date === tomorrow);

        setScheduleToday(todaySchedule || { date: today, shift: 'off' });
        setScheduleTomorrow(tomorrowSchedule || { date: tomorrow, shift: 'off' });
      } catch (err) {
        console.error('Gagal mengambil jadwal:', err);
        const today = moment().format('YYYY-MM-DD');
        const tomorrow = moment().add(1, 'day').format('YYYY-MM-DD');
        setScheduleToday({ date: today, shift: 'off' });
        setScheduleTomorrow({ date: tomorrow, shift: 'off' });
      } finally {
        setLoading(false);
      }
    };

    moment.locale('id');
    loadSchedule();
  }, []);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <View style={styles.loadingCard}>
          <ActivityIndicator size="large" color="#F9B233" />
          <Text style={styles.loadingText}>Memuat jadwal...</Text>
        </View>
      </View>
    );
  }

  const rawShift = scheduleToday?.shift || 'off';
  const shiftCategory = classifyShift(rawShift);
  const animationSource = shiftAnimations[shiftCategory];
  const theme = shiftThemes[shiftCategory];
  const shiftIcon = shiftIcons[shiftCategory];

  const messageToday =
    shiftCategory === 'off'
      ? 'Hari ini kamu libur atau cuti ✨'
      : `Kamu masuk pukul ${rawShift}`;

  const shiftBesok = scheduleTomorrow?.shift || 'off';
  const labelBesok =
    shiftBesok.toLowerCase() === 'off' || shiftBesok.toLowerCase() === 'ct'
      ? 'Libur atau cuti'
      : `pukul ${shiftBesok}`;

  const hariBesok = moment(scheduleTomorrow?.date).format('dddd');

  const cardStyle = [
    styles.cardWrapper,
    { backgroundColor: theme.background }
  ];

  return (
    <View style={cardStyle}>
      {/* Header dengan waktu saat ini */}
      <View style={[styles.header, { backgroundColor: theme.primary }]}>
        <View style={styles.headerContent}>
          <View style={styles.dateContainer}>
            <MaterialCommunityIcons name="calendar" size={20} color="rgba(255,255,255,0.9)" />
            <Text style={styles.currentDate}>{moment().format('dddd, DD MMM')}</Text>
          </View>
          <View style={styles.timeContainer}>
            <Text style={styles.currentTime}>{moment().format('HH:mm')}</Text>
          </View>
        </View>
      </View>

      {/* Animation Container dengan Overlay */}
      <View style={styles.animationWrapper}>
        <View style={styles.animationContainer}>
          <LottieView
            source={animationSource}
            autoPlay
            loop={true}
            resizeMode="contain"
            style={styles.animation}
          />
        </View>
        
        {/* Status Badge */}
        <View style={[styles.statusBadge, { backgroundColor: 'rgba(255,255,255,0.9)' }]}>
          <MaterialCommunityIcons 
            name={shiftIcon as any} 
            size={16} 
            color={theme.primary} 
          />
          <Text style={[styles.badgeText, { color: theme.primary }]}>
            {shiftCategory === 'off' ? 'LIBUR' : 'KERJA'}
          </Text>
        </View>
      </View>

      {/* Main Content */}
      <View style={[styles.contentContainer, { backgroundColor: theme.primary }]}>
        {/* Today's Schedule */}
        <View style={styles.todaySection}>
          <View style={styles.sectionHeader}>
            <MaterialCommunityIcons name="clock" size={20} color="#FFFFFF" />
            <Text style={styles.sectionTitle}>Jadwal Hari Ini</Text>
          </View>
          
          <Text style={styles.mainMessage}>{messageToday}</Text>
          
          {shiftCategory !== 'off' && (
            <View style={[styles.shiftDetail, { backgroundColor: 'rgba(255,255,255,0.2)' }]}>
              <Text style={styles.shiftCategory}>{shiftMessages[shiftCategory]}</Text>
            </View>
          )}
        </View>

        {/* Elegant Divider */}
        <View style={styles.elegantDivider}>
          <View style={styles.dividerLine} />
          <MaterialCommunityIcons name="circle" size={8} color="rgba(255,255,255,0.7)" />
          <View style={styles.dividerLine} />
        </View>

        {/* Tomorrow's Schedule */}
        <View style={styles.tomorrowSection}>
          <View style={styles.tomorrowHeader}>
            <MaterialCommunityIcons name="arrow-right" size={18} color="#FFDC73" />
            <Text style={styles.tomorrowLabel}>Besok • {hariBesok}</Text>
          </View>
          <Text style={styles.tomorrowSchedule}>{labelBesok}</Text>
        </View>
      </View>

      {/* Decorative Corner Elements */}
      <View style={[styles.cornerDecoration, styles.topLeftCorner, { backgroundColor: theme.secondary }]} />
      <View style={[styles.cornerDecoration, styles.bottomRightCorner, { backgroundColor: theme.secondary }]} />
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
    shadowColor: '#000',
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
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  currentDate: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.9)',
    marginLeft: 8,
    textTransform: 'capitalize',
  },
  timeContainer: {
    backgroundColor: 'rgba(255,255,255,0.25)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  currentTime: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 1,
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
    shadowColor: '#000',
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
    color: '#FFFFFF',
    marginLeft: 8,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  mainMessage: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
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
    color: '#FFFFFF',
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
    color: '#FFDC73',
    marginLeft: 8,
    textTransform: 'capitalize',
  },
  tomorrowSchedule: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
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
    backgroundColor: '#F8F9FA',
    padding: 40,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    fontWeight: '500',
    color: '#00425A',
  },
});

export default TodayScheduleCard;