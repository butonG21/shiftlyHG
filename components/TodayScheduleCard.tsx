import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { getProfile as getUserProfile } from '../services/authService';
import moment from 'moment';
import 'moment/locale/id'; // Tambahkan ini untuk dukungan bahasa Indonesia
import LottieView from 'lottie-react-native';

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

const shiftMessages = {
  pagi: 'masuk pukul pagi',
  middle: 'masuk pukul tengah hari',
  siang: 'masuk pukul siang',
  off: 'libur atau cuti',
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
  siang: require('../assets/animations/siang-midle.json'),
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

    moment.locale('id'); // Gunakan lokal Indonesia
    loadSchedule();
  }, []);

  if (loading) {
    return <ActivityIndicator size="small" color="#000" />;
  }

  const rawShift = scheduleToday?.shift || 'off';
  const shiftCategory = classifyShift(rawShift);
  const animationSource = shiftAnimations[shiftCategory];

  const messageToday =
    shiftCategory === 'off'
      ? 'Hari ini kamu libur atau cuti ✨'
      : `Kamu masuk pukul ${rawShift} (${shiftMessages[shiftCategory]})`;

  const shiftBesok = scheduleTomorrow?.shift || 'off';
  const labelBesok =
    shiftBesok.toLowerCase() === 'off' || shiftBesok.toLowerCase() === 'ct'
      ? 'Libur atau cuti'
      : `pukul ${shiftBesok}`;

  const hariBesok = moment(scheduleTomorrow?.date).format('dddd');

  return (
    <View style={styles.cardWrapper}>
      {/* Gambar animasi */}
      <View style={styles.animationContainer}>
        <LottieView
          source={animationSource}
          autoPlay
          loop={true} // hanya sekali
          resizeMode="cover"
          style={styles.animation}
        />
      </View>

      {/* Teks jadwal */}
      <View style={styles.textContainer}>
        <Text style={styles.title}>Jadwal Kamu Hari Ini</Text>
        <Text style={styles.shift}>{messageToday}</Text>
        <View style={styles.divider} />
        <Text style={styles.tomorrow}>Besok: {hariBesok}, {labelBesok}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  cardWrapper: {
    width: '100%',
    borderRadius: 12,
    marginTop: 12,
    marginBottom: 12,
    backgroundColor: '#91C8E4',
    overflow: 'hidden',
    elevation: 4,
  },
  animationContainer: {
    height: 180,
    width: '100%',
  },
  animation: {
    flex: 1,
    width: '100%',
  },
  textContainer: {
    padding: 16,
    backgroundColor: '#00425A',
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#fff',
  },
  shift: {
    fontSize: 14,
    color: '#fff',
  },
  tomorrow: {
    fontSize: 14,
    marginTop: 6,
    color: '#FFDC73',
  },
  divider: {
    height: 1,
    marginTop: 10,
    marginBottom: 10,
    backgroundColor: '#ffffff33',
  },
});

export default TodayScheduleCard;
