import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'http://192.168.231.80:3000/api'; // Ganti jika backend sudah di-deploy

export const loginUser = async (username: string, password: string) => {
  const response = await axios.post(`${BASE_URL}/auth/login`, {
    username,
    password,
  });

  return response.data; // → { token, user }
};

// Fungsi untuk ambil profil user yang sedang login
export const getProfile = async () => {
    const token = await AsyncStorage.getItem('token');
    const res = await axios.get(`${BASE_URL}/users/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return res.data;
  };