"use client"

import { FontAwesome } from "@expo/vector-icons"
import { router, useLocalSearchParams } from "expo-router"
import { useEffect, useState, useRef } from "react"
import {
  Alert,
  Dimensions,
  FlatList,
  Image,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  View,
  RefreshControl,
  Animated,
} from "react-native"

import { ThemedText } from "@/components/ThemedText"
import { ThemedView } from "@/components/ThemedView"
import type { IRecipe } from "../interfaces/IRecipe"
import type { IComments } from "../interfaces/IComments"
import recipeService from "../services/RecipeService"
import { buildImageUrl } from "../utils/imageUtils"

const { width, height } = Dimensions.get("window")

interface CommentItemProps {
  comment: IComments
  onReply: (parentId: string) => void
}

const CommentItem = ({ comment, onReply }: CommentItemProps) => (
  <ThemedView style={styles.commentItem}>
    <ThemedView style={styles.commentHeader}>
      <ThemedView style={styles.commentAvatar}>
        <ThemedText style={styles.commentAvatarText}>{comment.user_name?.charAt(0).toUpperCase() || "U"}</ThemedText>
      </ThemedView>
      <ThemedView style={styles.commentInfo}>
        <ThemedText style={styles.commentAuthor}>{comment.user_name || "Usuario"}</ThemedText>
        <ThemedText style={styles.commentDate}>{new Date(comment.created_at).toLocaleDateString()}</ThemedText>
      </ThemedView>
    </ThemedView>
    <ThemedText style={styles.commentContent}>{comment.content}</ThemedText>
    <TouchableOpacity style={styles.replyButton} onPress={() => onReply(comment.id)}>
      <ThemedText style={styles.replyButtonText}>Responder</ThemedText>
    </TouchableOpacity>
  </ThemedView>
)

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>()
  const [recipe, setRecipe] = useState<IRecipe | null>(null)
  const [comments, setComments] = useState<IComments[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [newComment, setNewComment] = useState("")
  const [replyingTo, setReplyingTo] = useState<string | null>(null)
  const [likesCount, setLikesCount] = useState(0)
  const [hasLiked, setHasLiked] = useState(false)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)

  const scrollY = useRef(new Animated.Value(0)).current
  const flatListRef = useRef<FlatList>(null)

  useEffect(() => {
    if (id) {
      fetchRecipeDetail()
      fetchComments()
      fetchLikesData()
    }
  }, [id])

  const fetchRecipeDetail = async () => {
    try {
      setLoading(true)
      setError(null)
      const recipes = await recipeService.fetchAllRecipes()
      const foundRecipe = recipes.find((r) => r.id === id)

      if (foundRecipe) {
        setRecipe(foundRecipe)
      } else {
        setError("Receta no encontrada")
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Error desconocido"
      setError(`Error al cargar la receta: ${errorMessage}`)
    } finally {
      setLoading(false)
    }
  }

  const fetchComments = async () => {
    if (!id) return
    try {
      const fetchedComments = await recipeService.fetchComments(id)
      setComments(fetchedComments)
    } catch (err) {
      console.error("Error fetching comments:", err)
    }
  }

  const fetchLikesData = async () => {
    if (!id) return
    try {
      const count = await recipeService.getLikesCount(id)
      setLikesCount(count)

      // Aquí necesitarías el token del usuario autenticado
      // const liked = await recipeService.hasLiked(id, userToken);
      // setHasLiked(liked);
    } catch (err) {
      console.error("Error fetching likes data:", err)
    }
  }

  const handleLike = async () => {
    if (!id) return
    try {
      if (hasLiked) {
        // await recipeService.unlikeRecipe(id, userToken);
        setHasLiked(false)
        setLikesCount((prev) => prev - 1)
      } else {
        // await recipeService.likeRecipe(id, userToken);
        setHasLiked(true)
        setLikesCount((prev) => prev + 1)
      }
    } catch (err) {
      console.error("Error handling like:", err)
      Alert.alert("Error", "No se pudo procesar el like")
    }
  }

  const handleAddComment = async () => {
    if (!newComment.trim() || !id) return

    try {
      // await recipeService.createComment(id, newComment.trim(), replyingTo, userToken);
      setNewComment("")
      setReplyingTo(null)
      fetchComments() // Refresh comments
      Alert.alert("Éxito", "Comentario agregado correctamente")
    } catch (err) {
      console.error("Error adding comment:", err)
      Alert.alert("Error", "No se pudo agregar el comentario")
    }
  }

  const handleReply = (parentId: string) => {
    setReplyingTo(parentId)
  }

  const onRefresh = async () => {
    setRefreshing(true)
    await Promise.all([fetchRecipeDetail(), fetchComments(), fetchLikesData()])
    setRefreshing(false)
  }

  const renderImage = ({ item, index }: { item: string; index: number }) => (
    <View style={styles.imageSlide}>
      <Image source={{ uri: buildImageUrl(item) }} style={styles.recipeImage} resizeMode="cover" />
      <View style={styles.imageIndicator}>
        <ThemedText style={styles.imageIndicatorText}>
          {index + 1} / {recipe?.images?.length || 0}
        </ThemedText>
      </View>
    </View>
  )

  const headerOpacity = scrollY.interpolate({
    inputRange: [0, 200],
    outputRange: [0, 1],
    extrapolate: "clamp",
  })

  if (loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <ThemedText style={styles.loadingText}>Cargando receta...</ThemedText>
      </ThemedView>
    )
  }

  if (error || !recipe) {
    return (
      <ThemedView style={styles.errorContainer}>
        <ThemedText style={styles.errorText}>{error || "Receta no encontrada"}</ThemedText>
        <TouchableOpacity style={styles.backButton} onPress={() => router.back()}>
          <ThemedText style={styles.backButtonText}>Volver</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    )
  }

  return (
    <ThemedView style={styles.container}>
      {/* Header fijo con efecto de transparencia */}
      <Animated.View style={[styles.fixedHeader, { opacity: headerOpacity }]}>
        <TouchableOpacity style={styles.headerBackButton} onPress={() => router.back()}>
          <FontAwesome name="arrow-left" size={20} color="#fff" />
        </TouchableOpacity>
        <ThemedText style={styles.fixedHeaderTitle} numberOfLines={1}>
          {recipe.title}
        </ThemedText>
      </Animated.View>

      <Animated.ScrollView
        style={styles.scrollView}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { y: scrollY } } }], { useNativeDriver: false })}
        scrollEventThrottle={16}
      >
        {/* Carrusel de imágenes mejorado */}
        {recipe.images && recipe.images.length > 0 && (
          <View style={styles.imageCarouselContainer}>
            <FlatList
              ref={flatListRef}
              data={recipe.images}
              renderItem={renderImage}
              keyExtractor={(item, index) => index.toString()}
              horizontal
              pagingEnabled
              showsHorizontalScrollIndicator={false}
              onMomentumScrollEnd={(event) => {
                const index = Math.round(event.nativeEvent.contentOffset.x / width)
                setCurrentImageIndex(index)
              }}
            />

            {/* Indicadores de página */}
            <View style={styles.pageIndicators}>
              {recipe.images.map((_, index) => (
                <View
                  key={index}
                  style={[styles.pageIndicator, index === currentImageIndex && styles.activePageIndicator]}
                />
              ))}
            </View>
          </View>
        )}

        {/* Botón de regreso flotante */}
        <TouchableOpacity style={styles.floatingBackButton} onPress={() => router.back()}>
          <FontAwesome name="arrow-left" size={20} color="#fff" />
        </TouchableOpacity>

        {/* Contenido principal */}
        <ThemedView style={styles.content}>
          {/* Título y detalles */}
          <ThemedView style={styles.titleSection}>
            <ThemedText type="title" style={styles.title}>
              {recipe.title}
            </ThemedText>

            <ThemedView style={styles.details}>
              <ThemedView style={styles.detailItem}>
                <FontAwesome name="clock-o" size={18} color="#FF6B6B" />
                <ThemedText style={styles.detailText}>{recipe.prep_time}</ThemedText>
              </ThemedView>

              <ThemedView style={styles.detailItem}>
                <FontAwesome name="users" size={18} color="#4ECDC4" />
                <ThemedText style={styles.detailText}>{recipe.portions} porciones</ThemedText>
              </ThemedView>
            </ThemedView>

            {/* Botones de acción */}
            <ThemedView style={styles.actionButtons}>
              <TouchableOpacity style={[styles.actionButton, hasLiked && styles.likedButton]} onPress={handleLike}>
                <FontAwesome name={hasLiked ? "heart" : "heart-o"} size={20} color={hasLiked ? "#fff" : "#FF6B6B"} />
                <ThemedText style={[styles.actionButtonText, hasLiked && styles.likedButtonText]}>
                  {likesCount} Me gusta
                </ThemedText>
              </TouchableOpacity>

              <TouchableOpacity style={styles.actionButton}>
                <FontAwesome name="share" size={20} color="#4ECDC4" />
                <ThemedText style={styles.actionButtonText}>Compartir</ThemedText>
              </TouchableOpacity>
            </ThemedView>
          </ThemedView>

          {/* Pasos de la receta */}
          <ThemedView style={styles.stepsSection}>
            <ThemedText type="title" style={styles.sectionTitle}>
              <FontAwesome name="list-ol" size={20} color="#333" /> Pasos
            </ThemedText>
            {recipe.steps.map((step, index) => (
              <ThemedView key={index} style={styles.stepItem}>
                <ThemedView style={styles.stepNumber}>
                  <ThemedText style={styles.stepNumberText}>{index + 1}</ThemedText>
                </ThemedView>
                <ThemedText style={styles.stepText}>{step}</ThemedText>
              </ThemedView>
            ))}
          </ThemedView>

          {/* Sección de comentarios */}
          <ThemedView style={styles.commentsSection}>
            <ThemedText type="title" style={styles.sectionTitle}>
              <FontAwesome name="comments" size={20} color="#333" /> Comentarios ({comments.length})
            </ThemedText>

            {/* Formulario para agregar comentario */}
            <ThemedView style={styles.commentForm}>
              {replyingTo && (
                <ThemedView style={styles.replyingIndicator}>
                  <ThemedText style={styles.replyingText}>Respondiendo a comentario</ThemedText>
                  <TouchableOpacity onPress={() => setReplyingTo(null)}>
                    <FontAwesome name="times" size={16} color="#666" />
                  </TouchableOpacity>
                </ThemedView>
              )}

              <ThemedView style={styles.commentInputContainer}>
                <TextInput
                  style={styles.commentInput}
                  placeholder="Escribe un comentario..."
                  value={newComment}
                  onChangeText={setNewComment}
                  multiline
                  maxLength={500}
                />
                <TouchableOpacity
                  style={[styles.sendButton, !newComment.trim() && styles.sendButtonDisabled]}
                  onPress={handleAddComment}
                  disabled={!newComment.trim()}
                >
                  <FontAwesome name="send" size={16} color="#fff" />
                </TouchableOpacity>
              </ThemedView>
            </ThemedView>

            {/* Lista de comentarios */}
            {comments.length > 0 ? (
              comments.map((comment) => <CommentItem key={comment.id} comment={comment} onReply={handleReply} />)
            ) : (
              <ThemedView style={styles.noCommentsContainer}>
                <FontAwesome name="comment-o" size={40} color="#ccc" />
                <ThemedText style={styles.noCommentsText}>Sé el primero en comentar esta receta</ThemedText>
              </ThemedView>
            )}
          </ThemedView>
        </ThemedView>
      </Animated.ScrollView>
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
  loadingText: {
    fontSize: 16,
    color: "#666",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f8f9fa",
  },
  errorText: {
    fontSize: 16,
    color: "#e74c3c",
    textAlign: "center",
    marginBottom: 20,
  },
  fixedHeader: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 90,
    backgroundColor: "#333",
    flexDirection: "row",
    alignItems: "flex-end",
    paddingBottom: 10,
    paddingHorizontal: 15,
    zIndex: 1000,
  },
  headerBackButton: {
    padding: 8,
    marginRight: 10,
  },
  fixedHeaderTitle: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  imageCarouselContainer: {
    height: height * 0.4,
    position: "relative",
  },
  imageSlide: {
    width: width,
    height: "100%",
    position: "relative",
  },
  recipeImage: {
    width: "100%",
    height: "100%",
  },
  imageIndicator: {
    position: "absolute",
    bottom: 15,
    right: 15,
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  imageIndicatorText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  pageIndicators: {
    position: "absolute",
    bottom: 30,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  pageIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "rgba(255,255,255,0.5)",
    marginHorizontal: 4,
  },
  activePageIndicator: {
    backgroundColor: "#fff",
    width: 20,
  },
  floatingBackButton: {
    position: "absolute",
    top: 50,
    left: 15,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 100,
  },
  content: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    marginTop: -25,
    paddingTop: 25,
    minHeight: height * 0.7,
  },
  titleSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
    lineHeight: 34,
  },
  details: {
    flexDirection: "row",
    marginBottom: 20,
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 25,
    backgroundColor: "#f8f9fa",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  detailText: {
    marginLeft: 8,
    color: "#333",
    fontSize: 14,
    fontWeight: "600",
  },
  actionButtons: {
    flexDirection: "row",
    gap: 15,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    borderWidth: 2,
    borderColor: "#FF6B6B",
    backgroundColor: "#fff",
  },
  likedButton: {
    backgroundColor: "#FF6B6B",
    borderColor: "#FF6B6B",
  },
  actionButtonText: {
    marginLeft: 8,
    color: "#FF6B6B",
    fontSize: 14,
    fontWeight: "600",
  },
  likedButtonText: {
    color: "#fff",
  },
  stepsSection: {
    paddingHorizontal: 20,
    paddingVertical: 25,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    color: "#333",
  },
  stepItem: {
    flexDirection: "row",
    marginBottom: 20,
    alignItems: "flex-start",
  },
  stepNumber: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: "#4ECDC4",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
    marginTop: 2,
  },
  stepNumberText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  stepText: {
    flex: 1,
    fontSize: 16,
    lineHeight: 24,
    color: "#333",
  },
  commentsSection: {
    paddingHorizontal: 20,
    paddingVertical: 25,
  },
  commentForm: {
    marginBottom: 25,
  },
  replyingIndicator: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#e3f2fd",
    paddingHorizontal: 15,
    paddingVertical: 10,
    borderRadius: 10,
    marginBottom: 10,
  },
  replyingText: {
    color: "#1976d2",
    fontSize: 14,
    fontWeight: "600",
  },
  commentInputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: "#f8f9fa",
    borderRadius: 25,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  commentInput: {
    flex: 1,
    maxHeight: 100,
    fontSize: 16,
    color: "#333",
    paddingRight: 10,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#4ECDC4",
    justifyContent: "center",
    alignItems: "center",
  },
  sendButtonDisabled: {
    backgroundColor: "#ccc",
  },
  commentItem: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 15,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: "#f0f0f0",
  },
  commentHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  commentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#4ECDC4",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  commentAvatarText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  commentInfo: {
    flex: 1,
  },
  commentAuthor: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  commentDate: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  commentContent: {
    fontSize: 15,
    lineHeight: 22,
    color: "#333",
    marginBottom: 10,
  },
  replyButton: {
    alignSelf: "flex-start",
  },
  replyButtonText: {
    color: "#4ECDC4",
    fontSize: 14,
    fontWeight: "600",
  },
  noCommentsContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  noCommentsText: {
    fontSize: 16,
    color: "#666",
    marginTop: 15,
    textAlign: "center",
  },
  backButton: {
    backgroundColor: "#4ECDC4",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  backButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
})
