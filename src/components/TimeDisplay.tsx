import React, { useState, useEffect, memo } from 'react';
import { View, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';

interface TimeDisplayProps {
  style?: any;
  textStyle?: any;
}

const TimeDisplay: React.FC<TimeDisplayProps> = memo(({ style, textStyle }) => {
  const [currentTime, setCurrentTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const timeString = now.toLocaleTimeString('id-ID', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
      setCurrentTime(timeString);
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={style}>
      <Ionicons name="time-outline" size={16} color={COLORS.primary} />
      <Text style={textStyle}>{currentTime}</Text>
    </View>
  );
});

TimeDisplay.displayName = 'TimeDisplay';

export default TimeDisplay;