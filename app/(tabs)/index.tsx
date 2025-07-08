"use client"

import { FontAwesome } from "@expo/vector-icons"
import { router } from "expo-router"
import { useCallback, useEffect, useRef, useState } from "react"
import {
  Alert,
  Animated,
  Dimensions,
  FlatList,
  Image,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View
} from "react-native"

import { ThemedText } from "@/components/ThemedText"
import { ThemedView } from "@/components/ThemedView"
import type { IRecipe } from "../interfaces/IRecipe"
import recipeService from "../services/RecipeService"
import { buildImageUrl } from "../utils/imageUtils"

const { width, height } = Dimensions.get("window")
const CARD_WIDTH = width - 30

interface RecipeCardProps {
  item: IRecipe
  index: number
}

const RecipeCard = ({ item, index }: RecipeCardProps) => {
  const scaleAnim = useRef(new Animated.Value(1)).current

  const imageUrl =
    item.images && item.images.length > 0 ? buildImageUrl(item.images[0]) : "/placeholder.svg?height=200&width=300"

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start(() => {
      router.push({
        pathname: "/recipe/[id]",
        params: { id: item.id },
      })
    })
  }

  return (
    <Animated.View style={[styles.card, { transform: [{ scale: scaleAnim }] }]}>
      <TouchableOpacity onPress={handlePress} activeOpacity={0.9}>
        {/* Imagen con overlay de gradiente */}
        <View style={styles.imageContainer}>
          <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
          <View style={styles.imageOverlay} />

          {/* Badge de tiempo */}
          <View style={styles.timeBadge}>
            <FontAwesome name="clock-o" size={12} color="#fff" />
            <ThemedText style={styles.timeBadgeText}>{item.prep_time}</ThemedText>
          </View>
        </View>

        {/* Contenido de la tarjeta */}
        <View style={styles.cardContent}>
          <ThemedText style={styles.cardTitle} numberOfLines={2}>
            {item.title}
          </ThemedText>

          <View style={styles.cardDetails}>
            <View style={styles.detailItem}>
              <FontAwesome name="users" size={14} color="#4ECDC4" />
              <ThemedText style={styles.detailText}>{item.portions} porciones</ThemedText>
            </View>

            <View style={styles.detailItem}>
              <FontAwesome name="list" size={14} color="#FF6B6B" />
              <ThemedText style={styles.detailText}>{item.steps.length} pasos</ThemedText>
            </View>
          </View>

          {/* Descripción truncada */}
          <ThemedText style={styles.cardDescription} numberOfLines={2}>
            {item.steps[0] || "Deliciosa receta para compartir en familia"}
          </ThemedText>

          {/* Footer con likes y comentarios */}
          <View style={styles.cardFooter}>
            <TouchableOpacity style={styles.viewButton}>
              <ThemedText style={styles.viewButtonText}>Ver receta</ThemedText>
              <FontAwesome name="arrow-right" size={12} color="#4ECDC4" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  )
}

export default function HomeScreen() {
  const [recipes, setRecipes] = useState<IRecipe[]>([])
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const headerAnim = useRef(new Animated.Value(0)).current

  const fetchRecipes = async () => {
    try {
      setError(null)
      const data = await recipeService.fetchAllRecipes()
      setRecipes(data)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error desconocido"
      console.error("Error detallado:", err)
      setError(`Error al cargar las recetas: ${errorMessage}`)
      Alert.alert("Error", `No se pudieron cargar las recetas: ${errorMessage}`)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  const onRefresh = useCallback(() => {
    setRefreshing(true)
    fetchRecipes()
  }, [])

  useEffect(() => {
    fetchRecipes()
    // Animación de entrada del header
    Animated.timing(headerAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start()
  }, [])

  const handleLogin = () => {
    router.push({ pathname: '/login' as const })
  }

  const renderRecipeCard = ({ item, index }: { item: IRecipe; index: number }) => (
    <RecipeCard item={item} index={index} />
  )

  const renderHeader = () => (
    <Animated.View
      style={[
        styles.headerContainer,
        {
          opacity: headerAnim,
          transform: [{ translateY: headerAnim.interpolate({ inputRange: [0, 1], outputRange: [-50, 0] }) }],
        },
      ]}
    >
      {/* Header principal */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <ThemedText style={styles.welcomeText}>¡Hola!</ThemedText>
          <ThemedText style={styles.headerTitle}>Descubre recetas increíbles</ThemedText>
        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
            <FontAwesome name="user" size={16} color="#fff" />
            <ThemedText style={styles.loginButtonText}>Entrar</ThemedText>
          </TouchableOpacity>
        </View>
      </View>

      {/* Estadísticas rápidas */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <ThemedText style={styles.statNumber}>{recipes.length}</ThemedText>
          <ThemedText style={styles.statLabel}>Recetas</ThemedText>
        </View>
        <View style={styles.statCard}>
          <ThemedText style={styles.statNumber}>{recipes.length}</ThemedText>
          <ThemedText style={styles.statLabel}>Disponibles</ThemedText>
        </View>
        <View style={styles.statCard}>
          <ThemedText style={styles.statNumber}>★ 4.8</ThemedText>
          <ThemedText style={styles.statLabel}>Promedio</ThemedText>
        </View>
      </View>
    </Animated.View>
  )

  if (loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <View style={styles.loadingContent}>
          <FontAwesome name="cutlery" size={40} color="#4ECDC4" />
          <ThemedText style={styles.loadingText}>Cargando recetas deliciosas...</ThemedText>
          <View style={styles.loadingDots}>
            <View style={[styles.dot, styles.dot1]} />
            <View style={[styles.dot, styles.dot2]} />
            <View style={[styles.dot, styles.dot3]} />
          </View>
        </View>
      </ThemedView>
    )
  }

  return (
    <ThemedView style={styles.container}>
      {error && (
        <View style={styles.errorContainer}>
          <FontAwesome name="exclamation-triangle" size={24} color="#FF6B6B" />
          <ThemedText style={styles.errorText}>{error}</ThemedText>
          <TouchableOpacity style={styles.retryButton} onPress={fetchRecipes}>
            <ThemedText style={styles.retryButtonText}>Reintentar</ThemedText>
          </TouchableOpacity>
        </View>
      )}

      <FlatList
        data={recipes}
        keyExtractor={(item) => item.id}
        renderItem={renderRecipeCard}
        ListHeaderComponent={renderHeader}
        contentContainerStyle={styles.list}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={["#4ECDC4"]} />}
        ListEmptyComponent={
          !error ? (
            <View style={styles.emptyContainer}>
              <FontAwesome name="search" size={60} color="#ccc" />
              <ThemedText style={styles.emptyTitle}>No hay recetas disponibles</ThemedText>
              <ThemedText style={styles.emptySubtitle}>¡Pronto tendremos deliciosas recetas para ti!</ThemedText>
            </View>
          ) : null
        }
      />
    </ThemedView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  loadingContent: {
    alignItems: "center",
  },
  loadingText: {
    fontSize: 18,
    color: "#333",
    marginTop: 20,
    fontWeight: "600",
  },
  loadingDots: {
    flexDirection: "row",
    marginTop: 20,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#4ECDC4",
    marginHorizontal: 4,
  },
  dot1: {
    animationDelay: "0s",
  },
  dot2: {
    animationDelay: "0.2s",
  },
  dot3: {
    animationDelay: "0.4s",
  },
  headerContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 20,
  },
  headerLeft: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 16,
    color: "#666",
    marginBottom: 5,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#333",
    lineHeight: 30,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  loginButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#4ECDC4",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 22,
    gap: 6,
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 15,
    alignItems: "center",
    marginHorizontal: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#4ECDC4",
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    fontWeight: "600",
  },
  errorContainer: {
    backgroundColor: "#fff",
    margin: 20,
    padding: 20,
    borderRadius: 15,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  errorText: {
    color: "#FF6B6B",
    textAlign: "center",
    marginVertical: 15,
    fontSize: 16,
  },
  retryButton: {
    backgroundColor: "#FF6B6B",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
  list: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
    overflow: "hidden",
  },
  imageContainer: {
    position: "relative",
    height: 200,
  },
  image: {
    width: "100%",
    height: "100%",
  },
  imageOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.1)",
  },
  timeBadge: {
    position: "absolute",
    bottom: 15,
    left: 15,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    gap: 5,
  },
  timeBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  cardContent: {
    padding: 20,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
    lineHeight: 26,
  },
  cardDetails: {
    flexDirection: "row",
    marginBottom: 12,
    gap: 20,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  detailText: {
    color: "#666",
    fontSize: 14,
    fontWeight: "500",
  },
  cardDescription: {
    color: "#666",
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 15,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  viewButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  viewButtonText: {
    color: "#4ECDC4",
    fontSize: 14,
    fontWeight: "600",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginTop: 20,
    marginBottom: 10,
    textAlign: "center",
  },
  emptySubtitle: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
  },
})
