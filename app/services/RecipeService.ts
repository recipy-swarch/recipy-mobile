import Constants from 'expo-constants';

export interface IRecipe {
  title: string;
  prepTime: string;
  portions: number;
  steps: string[];
  images: string[];
}

class RecipeService {
  private apiUrl: string;

  constructor() {
    this.apiUrl = Constants.expoConfig?.extra?.API_GATEWAY_URL || 'http://recipy-ag:3030';
  }

  fetchAllRecipes = async (): Promise<IRecipe[]> => {
    const url = `${this.apiUrl}/recipe/graphql/get_recipes`;
    console.log("Fetching all recipes from:", url);

    const response = await fetch(url, {
      method: "GET",
    });

    if (!response.ok) {
      const text = await response.text();
      console.error("Error fetching recipes:", text);
      throw new Error(`Error ${response.status}`);
    }

    const data = await response.json();

    if (data.error) {
      console.error('Error fetching recipes:', data.error);
      throw new Error(`Error ${data.error}`);
    }

    return data as IRecipe[];
  };

  fetchUserRecipes = async (token: string): Promise<IRecipe[]> => {
    const response = await fetch(`${this.apiUrl}/recipe/graphql/get_recipebyuser`, {
      method: "GET",
      headers: {
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`Error ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.error) {
      console.error('Error fetching user recipes:', data.error);
      throw new Error(`Error ${data.error}`);
    }

    return data as IRecipe[];
  };
}

const recipeService = new RecipeService();
export default recipeService; 