import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Appbar, Text, Button } from 'react-native-paper';
import { useAuth } from '../contexts/AuthContext';
import ProfileHeader from '../components/ProfileHeader';
import TodayScheduleCard from '../components/TodayScheduleCard';
import CurrentTime from '../components/currentTime';

const HomeScreen = () => {
  const { logout } = useAuth();

  return (
    <>
      {/* Appbar dengan Logout Button */}
      <Appbar.Header style={{ backgroundColor: '#00425A' }}>
        <Appbar.Content title="Home" titleStyle={{ color: '#fff' }} />
        <Appbar.Action icon="logout" color="#fff" onPress={logout} />
      </Appbar.Header>

      {/* Scrollable Content */}
      <ScrollView style={styles.container}>
        {/* Profile Section */}
        <ProfileHeader />

        {/* Tempatkan konten utama setelah ini */}
        <View style={styles.content}>
        <CurrentTime />
        <TodayScheduleCard />
          <Text>Konten utama di sini...</Text>
        </View>
      </ScrollView>
    </>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    paddingVertical: 20,
    paddingHorizontal: 10,},
});
