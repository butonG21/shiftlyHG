// components/CurrentTime.tsx
import React, { useEffect, useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from 'react-native-paper';
import moment from 'moment';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';

const CurrentTime = () => {
  const [currentTime, setCurrentTime] = useState(moment());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(moment());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  return (
    <BlurView intensity={40} tint="light" style={styles.card}>
      <View style={styles.row}>
        <MaterialCommunityIcons name="clock-outline" size={28} color="#F9B233" />
        <Text style={styles.time}>{currentTime.format('HH:mm:ss')}</Text>
      </View>

      <View style={styles.row}>
        <MaterialCommunityIcons name="calendar-blank-outline" size={24} color="#00425A" />
        <Text style={styles.date}>{currentTime.format('dddd, DD MMMM YYYY')}</Text>
      </View>
    </BlurView>
  );
};

export default CurrentTime;

const styles = StyleSheet.create({
  card: {
    marginTop: 16,
    marginHorizontal: 16,
    padding: 16,
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: 'rgba(0, 66, 90, 0.05)', // efek glass tipis biru tua
    borderWidth: 1,
    borderColor: 'rgba(43, 14, 146, 0.15)',
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  time: {
    fontSize: 30,
    fontWeight: '700',
    color: '#F9B233',
    marginLeft: 10,
  },
  date: {
    fontSize: 16,
    fontWeight: '500',
    color: '#00425A',
    marginLeft: 10,
  },
});
