import Constants from 'expo-constants';
import AuthService from './AuthService';
import { IUserRegister } from '../interfaces/IUser';

class UserService {
  private apiUrl: string;
  public error: string | null = null;
  public user: string | null = null;

  constructor() {
    this.apiUrl = Constants.expoConfig?.extra?.API_GATEWAY_URL || '';
    if (!this.apiUrl) {
      throw new Error('API_GATEWAY_URL no está definido');
    }
  }

  registerUser = async (userData: IUserRegister): Promise<boolean> => {
    try {
      const payload = {
        "name": userData.name,
        "email": userData.email,
        "username": userData.username,
        "password": userData.password,
      };

      const response = await fetch(`${this.apiUrl}/user/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const text = await response.text();
        console.error("Error al registrar usuario:", text);
        throw new Error(`Error ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        console.error('Error al registrar usuario:', data.error);
        this.error = data.error;
        return false;
      }

      if (data.message) {
        console.log('Usuario registrado exitosamente:', data.message);
        return true;
      }

      this.error = "Error desconocido";
      return false;
    } catch (error) {
      console.error('Error en registerUser:', error);
      this.error = error instanceof Error ? error.message : 'Error desconocido';
      return false;
    }
  };

  loginUser = async (userData: { username: string; password: string }): Promise<boolean> => {
    try {
      const payload = {
        "username": userData.username,
        "password": userData.password,
      };

      const response = await fetch(`${this.apiUrl}/user/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const text = await response.text();
        console.error("Error en el login:", text);
        throw new Error(`Error ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        console.error('Error en el login:', data.error);
        this.error = data.error;
        return false;
      }

      if (data.token) {
        console.log('Usuario logueado exitosamente');
        await AuthService.setToken(data.token);
        this.user = data.token;
        return true;
      }

      return false;
    } catch (error) {
      console.error('Error en loginUser:', error);
      this.error = error instanceof Error ? error.message : 'Error desconocido';
      return false;
    }
  };

  logoutUser = async (): Promise<void> => {
    try {
      await AuthService.removeToken();
      this.user = null;
    } catch (error) {
      console.error('Error en logoutUser:', error);
      throw error;
    }
  };

  isAuthenticated = async (): Promise<boolean> => {
    return await AuthService.isAuthenticated();
  };
}

const userService = new UserService();
export default userService; 