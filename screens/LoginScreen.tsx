import React, { useState } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Text, useTheme, Card } from 'react-native-paper';
import { useAuth } from '../contexts/AuthContext';

const LoginScreen = () => {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');


  const handleLogin = async () => {
    if (!username || !password) return;

    setLoading(true);
    setError('');
    try {
      await login(username, password);
    } catch (err: any) {
      setError(err.message || 'Gagal login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.select({ ios: 'padding', android: undefined })}
    >
      <Card style={styles.card}>
        <Card.Title title="Login" />
        <Card.Content>
          <TextInput
            label="Username (Employee ID)"
            value={username}
            onChangeText={setUsername}
            autoCapitalize="none"
            style={styles.input}
            mode="outlined"
          />
          <TextInput
            label="Password"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            style={styles.input}
            mode="outlined"
          />
            {error ? (
            <Text style={{ color: 'red', marginBottom: 12 }}>{error}</Text>
            ) : null}
          <Button
            mode="contained"
            onPress={handleLogin}
            loading={loading}
            disabled={!username || !password || loading}
            style={styles.button}
          >
            Login
          </Button>
        </Card.Content>
      </Card>
    </KeyboardAvoidingView>
  );
};

export default LoginScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#f0f2f5',
  },
  card: {
    padding: 12,
    borderRadius: 12,
  },
  input: {
    marginBottom: 16,
  },
  button: {
    marginTop: 8,
  },
});
