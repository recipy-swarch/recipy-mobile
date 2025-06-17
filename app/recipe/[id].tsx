import { FontAwesome } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Dimensions, FlatList, Image, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IRecipe } from '../interfaces/IRecipe';
import recipeService from '../services/RecipeService';
import { buildImageUrl } from '../utils/imageUtils';

const { width } = Dimensions.get('window');

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [recipe, setRecipe] = useState<IRecipe | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      fetchRecipeDetail();
    }
  }, [id]);

  const fetchRecipeDetail = async () => {
    try {
      setLoading(true);
      setError(null);
      // Por ahora usaremos fetchAllRecipes y filtramos por ID
      // En el futuro puedes crear un endpoint específico para obtener una receta por ID
      const recipes = await recipeService.fetchAllRecipes();
      const foundRecipe = recipes.find(r => r.id === id);
      
      if (foundRecipe) {
        setRecipe(foundRecipe);
      } else {
        setError('Receta no encontrada');
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(`Error al cargar la receta: ${errorMessage}`);
      Alert.alert('Error', `No se pudo cargar la receta: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  };

  const renderImage = ({ item }: { item: string }) => (
    <Image
      source={{ uri: buildImageUrl(item) }}
      style={styles.recipeImage}
      resizeMode="cover"
    />
  );

  if (loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ThemedText style={styles.loadingText}>Cargando receta...</ThemedText>
      </ThemedView>
    );
  }

  if (error || !recipe) {
    return (
      <ThemedView style={styles.errorContainer}>
        <ThemedText style={styles.errorText}>{error || 'Receta no encontrada'}</ThemedText>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ThemedText style={styles.backButtonText}>Volver</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <ThemedView style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <FontAwesome name="arrow-left" size={20} color="#007AFF" />
        </TouchableOpacity>
        <ThemedText type="title" style={styles.title}>{recipe.title}</ThemedText>
      </ThemedView>

      {recipe.images && recipe.images.length > 0 && (
        <FlatList
          data={recipe.images}
          renderItem={renderImage}
          keyExtractor={(item, index) => index.toString()}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.imageContainer}
        />
      )}

      <ThemedView style={styles.content}>
        <ThemedView style={styles.details}>
          <ThemedView style={styles.detailItem}>
            <FontAwesome name="clock-o" size={16} color="#666" />
            <ThemedText style={styles.detailText}>{recipe.prep_time}</ThemedText>
          </ThemedView>
          
          <ThemedView style={styles.detailItem}>
            <FontAwesome name="users" size={16} color="#666" />
            <ThemedText style={styles.detailText}>{recipe.portions} porciones</ThemedText>
          </ThemedView>
        </ThemedView>

        <ThemedText type="title" style={styles.sectionTitle}>Pasos</ThemedText>
        {recipe.steps.map((step, index) => (
          <ThemedView key={index} style={styles.stepItem}>
            <ThemedView style={styles.stepNumber}>
              <ThemedText style={styles.stepNumberText}>{index + 1}</ThemedText>
            </ThemedView>
            <ThemedText style={styles.stepText}>{step}</ThemedText>
          </ThemedView>
        ))}
      </ThemedView>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
    marginBottom: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 15,
    flex: 1,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    color: '#007AFF',
    fontSize: 16,
  },
  imageContainer: {
    paddingHorizontal: 15,
  },
  recipeImage: {
    width: width * 0.8,
    height: 200,
    borderRadius: 10,
    marginRight: 10,
  },
  content: {
    padding: 15,
  },
  details: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  detailText: {
    marginLeft: 6,
    color: '#666',
    fontSize: 14,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  stepItem: {
    flexDirection: 'row',
    marginBottom: 15,
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
    marginTop: 2,
  },
  stepNumberText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  stepText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    color: '#333',
  },
}); 