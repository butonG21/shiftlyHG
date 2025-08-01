// components/ProfileHeader.tsx
import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Text } from 'react-native-paper';
import { useAuth } from '../contexts/AuthContext';
import moment from 'moment';

const ProfileHeader = () => {
  const { user } = useAuth();
  const today = moment().format('ddd, DD MMM YYYY');

  return (
    <View style={styles.header}>
      {/* <Text style={styles.date}>{today}</Text> */}
      <View style={styles.welcomeSection}>
        <View>
          <Text style={styles.welcome}>Hi, Welcome Back</Text>
          <Text style={styles.name}>{user?.name ?? '-'}</Text>
          <Text style={styles.position}>{user?.position ?? '-'}</Text>

        </View>
        <Image
          source={{ uri: 'https://www.looper.com/img/gallery/how-to-start-watching-one-piece/intro-1669408304.jpg' }} // ganti dengan user?.photoURL jika tersedia
          style={styles.avatar}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#00425A',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  date: {
    color: '#F9B233',
    fontSize: 16,
    marginBottom: 10,
  },
  welcomeSection: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcome: {
    color: '#ffffff',
    fontSize: 16,
  },
  name: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 20,
  },

  position: {
    color: '#F9B233',
    fontSize: 14,
    marginTop: 2,
},
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderColor: '#ffffff',
    borderWidth: 2,
  },
});

export default ProfileHeader;
