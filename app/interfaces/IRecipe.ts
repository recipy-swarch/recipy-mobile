export interface IRecipe {
    id: string;
    title: string;
    prep_time: string;
    images: string[];
    video: string | null;
    portions: number;
    steps: string[];
    user_id: string;
} 