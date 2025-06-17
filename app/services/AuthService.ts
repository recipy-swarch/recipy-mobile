import AsyncStorage from '@react-native-async-storage/async-storage';

class AuthService {
  private static TOKEN_KEY = '@auth_token';
  private static TOKEN_EXPIRY_KEY = '@auth_token_expiry';

  static async setToken(token: string) {
    try {
      // Establecer la fecha de expiración a 24 horas desde ahora
      const expiryDate = new Date();
      expiryDate.setHours(expiryDate.getHours() + 24);
      
      await AsyncStorage.setItem(this.TOKEN_KEY, token);
      await AsyncStorage.setItem(this.TOKEN_EXPIRY_KEY, expiryDate.toISOString());
    } catch (error) {
      console.error('Error al guardar el token:', error);
    }
  }

  static async getToken(): Promise<string | null> {
    try {
      const token = await AsyncStorage.getItem(this.TOKEN_KEY);
      const expiryDate = await AsyncStorage.getItem(this.TOKEN_EXPIRY_KEY);

      if (!token || !expiryDate) {
        return null;
      }

      // Verificar si el token ha expirado
      if (new Date(expiryDate) < new Date()) {
        await this.removeToken();
        return null;
      }

      return token;
    } catch (error) {
      console.error('Error al obtener el token:', error);
      return null;
    }
  }

  static async removeToken() {
    try {
      await AsyncStorage.removeItem(this.TOKEN_KEY);
      await AsyncStorage.removeItem(this.TOKEN_EXPIRY_KEY);
    } catch (error) {
      console.error('Error al eliminar el token:', error);
    }
  }

  static async isAuthenticated(): Promise<boolean> {
    const token = await this.getToken();
    return token !== null;
  }
}

export default AuthService; 