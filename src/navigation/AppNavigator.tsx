import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import AttendanceScreen from '../screens/AttendanceScreen';

export type RootStackParamList = {
  Home: undefined;
  Attendance: undefined;
  Schedule: undefined;
  // ...add other screens as needed
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator = () => {
  return (
    <Stack.Navigator
      // ...existing navigator options...
    >
      {/* ...existing screen components... */}
      <Stack.Screen 
        name="Attendance" 
        component={AttendanceScreen}
        options={{ headerShown: false }}
      />
      {/* ...other screen components... */}
    </Stack.Navigator>
  );
};

export default AppNavigator;
