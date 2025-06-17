import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';

import { router } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import userService from './services/userService';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const auth = await userService.isAuthenticated();
    setIsAuthenticated(auth);
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Por favor completa todos los campos');
      return;
    }

    try {
      const success = await userService.loginUser({ username: email, password });
      if (success) {
        setIsAuthenticated(true);
        router.replace('/(tabs)');
      } else {
        Alert.alert('Error', userService.error || 'Error al iniciar sesión');
      }
    } catch (error) {
      Alert.alert('Error', 'Error al iniciar sesión');
    }
  };

  const handleLogout = async () => {
    try {
      await userService.logoutUser();
      setIsAuthenticated(false);
      router.replace('/');
    } catch (error) {
      Alert.alert('Error', 'Error al cerrar sesión');
    }
  };

  const handleRegister = () => {
    router.push('/register');
  };

  if (isAuthenticated) {
    return (
      <ThemedView style={styles.container}>
        <ThemedText type="title" style={styles.title}>Sesión Iniciada</ThemedText>
        <TouchableOpacity style={styles.button} onPress={handleLogout}>
          <ThemedText style={styles.buttonText}>Cerrar Sesión</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={styles.title}>Iniciar Sesión</ThemedText>
      
      <TextInput
        style={styles.input}
        placeholder="Correo electrónico"
        value={email}
        onChangeText={setEmail}
        placeholderTextColor="#666"
        keyboardType="email-address"
        autoCapitalize="none"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Contraseña"
        value={password}
        onChangeText={setPassword}
        placeholderTextColor="#666"
        secureTextEntry
      />
      
      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <ThemedText style={styles.buttonText}>Iniciar Sesión</ThemedText>
      </TouchableOpacity>

      <TouchableOpacity style={styles.registerButton} onPress={handleRegister}>
        <ThemedText style={styles.registerButtonText}>¿No tienes cuenta? Regístrate</ThemedText>
      </TouchableOpacity>

      <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
        <ThemedText style={styles.backButtonText}>Volver</ThemedText>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    marginBottom: 30,
    textAlign: 'center',
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 15,
    paddingHorizontal: 15,
    backgroundColor: '#fff',
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  registerButton: {
    padding: 10,
    alignItems: 'center',
    marginBottom: 10,
  },
  registerButtonText: {
    color: '#007AFF',
    fontSize: 16,
  },
  backButton: {
    padding: 10,
    alignItems: 'center',
  },
  backButtonText: {
    color: '#007AFF',
    fontSize: 16,
  },
}); 