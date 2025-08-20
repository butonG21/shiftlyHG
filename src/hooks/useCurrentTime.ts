import { useState, useEffect } from 'react';
import moment from 'moment';
import 'moment/locale/id';

/**
 * Custom hook for managing current time
 */
const useCurrentTime = (updateInterval: number = 30000) => {
  const [currentTime, setCurrentTime] = useState(moment());

  useEffect(() => {
    moment.locale('id');
    const timer = setInterval(() => {
      setCurrentTime(moment());
    }, updateInterval);

    return () => clearInterval(timer);
  }, [updateInterval]);

  return currentTime;
};

export default useCurrentTime;