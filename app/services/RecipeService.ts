import Constants from 'expo-constants';
import type { IComments } from "../interfaces/IComments";
import type { ILike } from '../interfaces/ILike';
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
    fetchComments = async (recipe_id: string): Promise<IComments[]> => {
        const url = `${this.apiUrl}/recipe/graphql/recipes/${recipe_id}/comments`;
        console.log("Fetching comments from:", url);
        const response = await fetch(url, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        });
        if (!response.ok) {
          const text = await response.text();
          console.error("Error fetching comments:", text);
          throw new Error(`Error ${response.status}`);
        }
        const data = await response.json();
        // Esperamos un array con shape IComments[]
        return data as IComments[];
      }
      createComment = async(
        recipeId: string,
        content: string,
        parentId?: string,
        token?: string
      ): Promise<IComments> => {
        const url = `${this.apiUrl}/recipe/graphql/comments_recipes`;
        const payload: any = { recipe_id: recipeId, content };
        if (parentId) payload.parent_id = parentId;
    
        const headers: Record<string, string> = {
          "Content-Type": "application/json",
        };
        if (token) {
          headers["Authorization"] = `Bearer ${token}`;
        }
    
        console.log("CommentService.createComment -> URL:", url, "headers:", headers, "payload:", payload);
    
        const resp = await fetch(url, {
          method: "POST",
          headers,
          body: JSON.stringify(payload),
        });
        if (!resp.ok) {
          const text = await resp.text();
          console.error("Error createComment:", text);
          throw new Error(`Error ${resp.status}: ${text}`);
        }
        const data = await resp.json();
        return data as IComments;
      }
      getLikesCount = async (recipeId: string): Promise<number> =>{
        const url = `${this.apiUrl}/recipe/graphql/likes_count?recipe_id=${recipeId}`;
        const resp = await fetch(url, {
          method: "GET",
        });
        if (!resp.ok) {
          const text = await resp.text();
          console.error("Error getLikesCount:", text);
          throw new Error(`Error ${resp.status}: ${text}`);
        }
        // El response_model es int, así que JSON.parse resp.json() devolaría un número
        const data = await resp.json();
        // data es un número: 
        return data as number;
      }
      likeRecipe = async(recipeId: string, token?: string): Promise<ILike> => {
        const url = `${this.apiUrl}/recipe/graphql/like_recipe?recipe_id=${recipeId}`;
        const headers: Record<string,string> = { "Content-Type": "application/json" };
        if (token) headers["Authorization"] = `Bearer ${token}`;
        const resp = await fetch(url, {
          method: "POST",
          headers,
        });
        if (!resp.ok) {
          const text = await resp.text();
          console.error("Error likeRecipe:", text);
          throw new Error(`Error ${resp.status}: ${text}`);
        }
        const data = await resp.json();
        // data debe cumplir shape de ILike
        return data as ILike;
      }
}

const recipeService = new RecipeService();
export default recipeService; 