import { FontAwesome } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import { Alert, Dimensions, FlatList, Image, RefreshControl, StyleSheet, TouchableOpacity } from 'react-native';

import { ThemedText } from '@/components/ThemedText';
import { ThemedView } from '@/components/ThemedView';
import { IRecipe } from '../interfaces/IRecipe';
import recipeService from '../services/RecipeService';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.85;

export default function HomeScreen() {
  const [recipes, setRecipes] = useState<IRecipe[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string>('');

  const fetchRecipes = async () => {
    try {
      setError(null);
      setDebugInfo('Iniciando petición...');
      const data = await recipeService.fetchAllRecipes();
      setDebugInfo('Datos recibidos correctamente');
      setRecipes(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      console.error('Error detallado:', err);
      setError(`Error al cargar las recetas: ${errorMessage}`);
      setDebugInfo(`Error: ${errorMessage}`);
      Alert.alert('Error', `No se pudieron cargar las recetas: ${errorMessage}`);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchRecipes();
  }, []);

  useEffect(() => {
    fetchRecipes();
  }, []);

  const handleLogin = () => {
    router.push('/login');
  };

  const renderRecipeCard = ({ item }: { item: IRecipe }) => {
    const imageUrl = item.images && item.images.length > 0 
      ? item.images[0] 
      : 'https://via.placeholder.com/300x200?text=Sin+imagen';

    return (
      <TouchableOpacity 
        style={styles.card}
        onPress={() => router.push({
          pathname: '/recipe/[id]',
          params: { id: item.id }
        })}
      >
        <Image
          source={{ uri: imageUrl }}
          style={styles.image}
          resizeMode="cover"
        />
        <ThemedView style={styles.cardContent}>
          <ThemedText type="title" style={styles.title}>{item.title}</ThemedText>
          
          <ThemedView style={styles.details}>
            <ThemedView style={styles.detailItem}>
              <FontAwesome name="clock-o" size={16} color="#666" />
              <ThemedText style={styles.detailText}>{item.prep_time}</ThemedText>
            </ThemedView>
            
            <ThemedView style={styles.detailItem}>
              <FontAwesome name="users" size={16} color="#666" />
              <ThemedText style={styles.detailText}>{item.portions} porciones</ThemedText>
            </ThemedView>
          </ThemedView>

          <ThemedText style={styles.steps} numberOfLines={2}>
            {item.steps.join(' • ')}
          </ThemedText>
        </ThemedView>
      </TouchableOpacity>
    );
  };

  if (loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ThemedText style={styles.loadingText}>Cargando recetas...</ThemedText>
        <ThemedText style={styles.debugText}>{debugInfo}</ThemedText>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <ThemedView style={styles.header}>
        <ThemedText type="title" style={styles.title}>Recetas</ThemedText>
        <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
          <ThemedText style={styles.loginButtonText}>Iniciar Sesión</ThemedText>
        </TouchableOpacity>
      </ThemedView>

      {error && (
        <ThemedView style={styles.errorContainer}>
          <ThemedText style={styles.error}>{error}</ThemedText>
          <TouchableOpacity style={styles.retryButton} onPress={fetchRecipes}>
            <ThemedText style={styles.retryButtonText}>Reintentar</ThemedText>
          </TouchableOpacity>
        </ThemedView>
      )}

      <ThemedText style={styles.debugText}>{debugInfo}</ThemedText>

      <FlatList
        data={recipes}
        keyExtractor={(item) => item.id}
        renderItem={renderRecipeCard}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={['#007AFF']}
          />
        }
        ListEmptyComponent={
          !error && (
            <ThemedView style={styles.emptyContainer}>
              <ThemedText style={styles.emptyText}>No hay recetas disponibles</ThemedText>
            </ThemedView>
          )
        }
      />
    </ThemedView>
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
    color: '#333',
  },
  loginButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 8,
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  errorContainer: {
    padding: 10,
    marginBottom: 10,
    alignItems: 'center',
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 10,
  },
  retryButton: {
    backgroundColor: '#007AFF',
    padding: 10,
    borderRadius: 5,
  },
  retryButtonText: {
    color: '#fff',
  },
  list: {
    padding: 15,
    alignItems: 'center',
  },
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 15,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  image: {
    width: '100%',
    height: 200,
    borderTopLeftRadius: 15,
    borderTopRightRadius: 15,
  },
  cardContent: {
    padding: 15,
  },
  details: {
    flexDirection: 'row',
    marginBottom: 12,
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
  steps: {
    color: '#666',
    fontSize: 14,
    lineHeight: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  debugText: {
    fontSize: 12,
    color: '#666',
    marginTop: 5,
    textAlign: 'center',
  },
});
