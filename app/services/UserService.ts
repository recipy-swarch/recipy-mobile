import Constants from 'expo-constants';

class UserService {
  private apiUrl: string;
  public user: string | null = null;
  public error: string | null = null;

  constructor() {
    this.apiUrl = Constants.expoConfig?.extra?.API_GATEWAY_URL || 'http://recipy-ag:3030';
  }

  loginUser = async (userData: { username: string; password: string }): Promise<boolean> => {
    try {
      const response = await fetch(`${this.apiUrl}/user/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
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
        console.log('Usuario logueado exitosamente:', data.token);
        this.user = data.token;
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error en el login:', error);
      this.error = error instanceof Error ? error.message : 'Error desconocido';
      return false;
    }
  };
}

const userService = new UserService();
export default userService; 