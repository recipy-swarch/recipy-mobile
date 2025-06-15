import Constants from 'expo-constants';
import { IRecipe } from '../interfaces/IRecipe';

class RecipeService {
    private apiUrl: string;

    constructor() {
        this.apiUrl = Constants.expoConfig?.extra?.API_GATEWAY_URL || '';
        if (this.apiUrl === '') {
            throw new Error('API URL is not defined');
        }
        console.log('RecipeService inicializado con URL:', this.apiUrl);
    }

    fetchAllRecipes = async (): Promise<IRecipe[]> => {
        const url = `${this.apiUrl}/recipe/graphql/get_recipes`;
        console.log("Fetching all recipes from:", url);

        try {
            const response = await fetch(url, {
                method: "GET",
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                }
            });

            if (!response.ok) {
                const text = await response.text();
                console.error("Error fetching recipes:", text);
                throw new Error(`Error ${response.status}: ${text}`);
            }

            const data = await response.json();
            console.log('Recetas recibidas:', data);

            if (data.error) {
                console.error('Error fetching recipes:', data.error);
                throw new Error(`Error: ${data.error}`);
            }

            return data as IRecipe[];
        } catch (error) {
            console.error('Error en fetchAllRecipes:', error);
            throw error;
        }
    };

    fetchUserRecipes = async (token: string): Promise<IRecipe[]> => {
        const url = `${this.apiUrl}/recipe/graphql/get_recipebyuser`;
        console.log("Fetching user recipes from:", url);

        try {
            const response = await fetch(url, {
                method: "GET",
                headers: {
                    "Authorization": `Bearer ${token}`,
                    "Content-Type": "application/json",
                }
            });

            if (!response.ok) {
                const text = await response.text();
                console.error("Error fetching user recipes:", text);
                throw new Error(`Error ${response.status}: ${text}`);
            }

            const data = await response.json();
            console.log('Recetas del usuario recibidas:', data);

            if (data.error) {
                console.error('Error fetching user recipes:', data.error);
                throw new Error(`Error: ${data.error}`);
            }

            return data as IRecipe[];
        } catch (error) {
            console.error('Error en fetchUserRecipes:', error);
            throw error;
        }
    };

    createRecipe = async (recipeData: Partial<IRecipe>, token: string): Promise<IRecipe> => {
        const url = `${this.apiUrl}/recipe/graphql/create_recipe`;
        console.log("Creating recipe at:", url);

        try {
            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(recipeData),
            });

            if (!response.ok) {
                const text = await response.text();
                console.error('Error creating recipe:', text);
                throw new Error(`Error ${response.status}: ${text}`);
            }

            const data = await response.json();
            console.log('Receta creada:', data);

            if (data.error) {
                console.error('Error creating recipe:', data.error);
                throw new Error(`Error: ${data.error}`);
            }

            return data as IRecipe;
        } catch (error) {
            console.error('Error en createRecipe:', error);
            throw error;
        }
    };
}

const recipeService = new RecipeService();
export default recipeService; 