import React, {
    createContext,
    useContext,
    useEffect,
    useState,
    ReactNode,
  } from 'react';
  import AsyncStorage from '@react-native-async-storage/async-storage';
  import { Alert } from 'react-native';
  import { loginUser } from '../services/authService';
  import type { User } from '../types/user';
  
  interface AuthContextProps {
    user: User | null;
    token: string | null;
    login: (username: string, password: string) => Promise<void>;
    logout: () => void;
    isLoading: boolean;
  }
  
  const AuthContext = createContext<AuthContextProps>({} as AuthContextProps);
  
  export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);
  
    // Saat pertama kali aplikasi dibuka: cek token & user tersimpan
    useEffect(() => {
      const loadStoredAuth = async () => {
        try {
          const storedToken = await AsyncStorage.getItem('token');
          const storedUser = await AsyncStorage.getItem('user');
          if (storedToken && storedUser) {
            setToken(storedToken);
            setUser(JSON.parse(storedUser));
          }
        } catch (err) {
          console.error('Gagal memuat auth dari storage', err);
        } finally {
          setIsLoading(false);
        }
      };
      loadStoredAuth();
    }, []);
  
    // Fungsi login
    const login = async (username: string, password: string) => {
      try {
        const res = await loginUser(username, password); // API login
        const { token, user } = res;
  
        setToken(token);
        setUser(user);
  
        await AsyncStorage.setItem('token', token);
        await AsyncStorage.setItem('user', JSON.stringify(user));
      } catch (error) {
        console.error('Login gagal:', error);
        Alert.alert('Login Gagal', 'Username atau password salah.');
      }
    };
  
    // Fungsi logout
    const logout = async () => {
      try {
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('user');
      } catch (err) {
        console.error('Gagal menghapus storage:', err);
      } finally {
        setToken(null);
        setUser(null);
      }
    };
  
    return (
      <AuthContext.Provider
        value={{ user, token, login, logout, isLoading }}
      >
        {children}
      </AuthContext.Provider>
    );
  };
  
  // Hook untuk akses context dari komponen lain
  export const useAuth = () => useContext(AuthContext);
  