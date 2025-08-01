// context/AuthContext.tsx
import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as authService from '../services/authService';
import axios from 'axios';

type User = {
  uid: string;
  name: string;
  position: string;
  email?: string | null;
  location?: string;
  schedule?: any[];
};

type AuthContextType = {
  user: User | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const login = async (username: string, password: string) => {
    try {
      console.log(authService)
      const data = await authService.loginUser(username, password);
      console.log('Login success, token:', data.token);
      await AsyncStorage.setItem('token', data.token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${data.token}`;
  
      const profile = await authService.getProfile();
      console.log('Profile:', profile);
      setUser(profile);
    } catch (error: any) {
      console.log('Login error:', error);
  
      if (error.response) {
        if (error.response.status === 401) {
          throw new Error('Username atau password salah');
        } else {
          throw new Error(`Login gagal: ${error.response.statusText}`);
        }
      } else if (error.request) {
        throw new Error('Tidak dapat terhubung ke server. Periksa koneksi Anda.');
      } else {
        throw new Error('Terjadi kesalahan saat login.');
      }
    }
  };
  const logout = async () => {
    await AsyncStorage.removeItem('token');
    setUser(null);
  };

  const getUserProfile = async () => {
    try {
      const profile = await authService.getProfile();
      setUser(profile);
    } catch (error) {
      console.error('Gagal memuat profil user:', error);
      logout();
    }
  };

  useEffect(() => {
    const checkLoginStatus = async () => {
      const token = await AsyncStorage.getItem('token');
      console.log('Token on startup:', token); // 👈

      if (token) {
        axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        await getUserProfile();
      }

      setLoading(false);
    };

    checkLoginStatus();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
