import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import { useAuth } from "../../contexts/AuthContext";
import API_URL from "../../utils/api";

export default function ProfileScreen() {
  const { user, signOut } = useAuth();
  const router = useRouter();
  const [selectedTab, setSelectedTab] = useState("posts");
  const [createdQuotes, setCreatedQuotes] = useState([]);
  const [likedQuotes, setLikedQuotes] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState(null);
  const [isDeleteModalVisible, setIsDeleteModalVisible] = useState(false);
  const [postPendingDelete, setPostPendingDelete] = useState(null);

  const userId = Number(user?.id) || null;

  const loadProfileData = useCallback(async () => {
    setIsLoading(true);
    setErrorMessage(null);

    try {
      if (!userId) {
        setCreatedQuotes([]);
        setLikedQuotes([]);
        setIsLoading(false);
        return;
      }

      const [postsRes, likesRes] = await Promise.all([
        fetch(`${API_URL}/posts`),
        fetch(`${API_URL}/registros-curtida`),
      ]);

      if (!postsRes.ok || !likesRes.ok) {
        throw new Error("Falha ao carregar dados do perfil.");
      }

      const postsJson = await postsRes.json();
      const likesJson = await likesRes.json();

      const posts = Array.isArray(postsJson) ? postsJson : [];
      const likes = Array.isArray(likesJson) ? likesJson : [];

      const likesByPost = new Map();
      const userLikeByPost = new Map();

      likes.forEach((like) => {
        const postId = Number(like.postId ?? like.post?.id);
        if (Number.isNaN(postId)) {
          return;
        }
        likesByPost.set(postId, (likesByPost.get(postId) || 0) + 1);
        if (Number(like.userId) === userId && like.id != null) {
          userLikeByPost.set(postId, like.id);
        }
      });

      const formatPost = (post) => {
        if (!post) return null;
        const id = Number(post.id);
        if (Number.isNaN(id)) return null;
        const fallbackTotal = Array.isArray(post.likes)
          ? post.likes.length
          : post.numberLikes || 0;
        const userLikeId = userLikeByPost.get(id) ?? null;
        return {
          ...post,
          id,
          numberLikes: likesByPost.get(id) ?? fallbackTotal,
          isLiked: Boolean(userLikeId),
          userLikeId,
        };
      };

      const userPosts = posts
        .filter((p) => Number(p.userId) === userId)
        .map(formatPost)
        .filter(Boolean);

      const likedPostsMap = new Map();
      likes.forEach((like) => {
        if (Number(like.userId) !== userId) {
          return;
        }
        const postId = Number(like.postId ?? like.post?.id);
        if (Number.isNaN(postId) || likedPostsMap.has(postId)) {
          return;
        }
        const sourcePost = like.post || posts.find((p) => Number(p.id) === postId);
        const formatted = formatPost(sourcePost);
        if (formatted) {
          likedPostsMap.set(postId, formatted);
        }
      });

      setCreatedQuotes(userPosts);
      setLikedQuotes(Array.from(likedPostsMap.values()));
    } catch (e) {
      setErrorMessage(e.message || "Não foi possível carregar os dados.");
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useFocusEffect(
    useCallback(() => {
      loadProfileData();
    }, [loadProfileData])
  );

  const syncPostCollections = (updatedPost) => {
    if (!updatedPost?.id) {
      return;
    }
    setCreatedQuotes((prev) =>
      prev.map((item) => (Number(item.id) === Number(updatedPost.id) ? updatedPost : item))
    );
    setLikedQuotes((prev) => {
      const index = prev.findIndex((item) => Number(item.id) === Number(updatedPost.id));
      if (updatedPost.isLiked) {
        if (index >= 0) {
          const clone = [...prev];
          clone[index] = updatedPost;
          return clone;
        }
        return [...prev, updatedPost];
      }
      if (index >= 0) {
        const clone = [...prev];
        clone.splice(index, 1);
        return clone;
      }
      return prev;
    });
  };

  const handleToggleLike = async (post) => {
    if (!userId || !post?.id) {
      Alert.alert("Ops", "Não foi possível atualizar esta curtida.");
      return;
    }

    const postId = Number(post.id);
    const currentCount = Number(post.numberLikes) || 0;

    try {
      if (post.isLiked && post.userLikeId) {
        const response = await fetch(`${API_URL}/registros-curtida/${post.userLikeId}`, {
          method: "DELETE",
        });
        if (!response.ok) {
          throw new Error("Não foi possível remover a curtida.");
        }
        const updatedPost = {
          ...post,
          isLiked: false,
          userLikeId: null,
          numberLikes: Math.max(0, currentCount - 1),
        };
        syncPostCollections(updatedPost);
      } else {
        const response = await fetch(`${API_URL}/registros-curtida`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ postId, userId }),
        });
        if (!response.ok) {
          throw new Error("Não foi possível registrar a curtida.");
        }
        const createdLike = await response.json();
        const updatedPost = {
          ...post,
          isLiked: true,
          userLikeId: createdLike?.id ?? null,
          numberLikes: currentCount + 1,
        };
        syncPostCollections(updatedPost);
      }
    } catch (error) {
      Alert.alert("Erro", error.message || "Falha ao atualizar curtida.");
    }
  };

  const handleDeletePost = async (postId) => {
    if (!postId) return;
    try {
      const response = await fetch(`${API_URL}/posts/${postId}`, {
        method: "DELETE",
      });
      if (!response.ok) {
        throw new Error("Não foi possível deletar o post.");
      }
      setCreatedQuotes((prev) => prev.filter((post) => Number(post.id) !== Number(postId)));
      setLikedQuotes((prev) => prev.filter((post) => Number(post.id) !== Number(postId)));
      Alert.alert("Pronto", "Post deletado com sucesso.");
    } catch (error) {
      Alert.alert("Erro", error.message || "Falha ao deletar o post.");
    }
  };

  const closeDeleteModal = () => {
    setIsDeleteModalVisible(false);
    setPostPendingDelete(null);
  };

  const confirmDeletePost = (post) => {
    if (!post?.id) return;
    setPostPendingDelete(post);
    setIsDeleteModalVisible(true);
  };

  const handleConfirmDelete = async () => {
    if (!postPendingDelete?.id) {
      closeDeleteModal();
      return;
    }
    await handleDeletePost(Number(postPendingDelete.id));
    closeDeleteModal();
  };

  const handleEditPostNavigation = (post) => {
    if (!post?.id) {
      return;
    }
    if (Number(post.userId) !== userId) {
      Alert.alert("Ops", "Você só pode editar as postagens que criou.");
      return;
    }
    router.push({ pathname: "/editPost", params: { id: String(post.id) } });
  };

  const renderCard = (post, index, allowDelete = false) => (
    <View
      key={post.id ?? `card-${index}`}
      style={[
        styles.quoteCard,
        { backgroundColor: post.backgroundColor || "#F7F7F7" },
      ]}
    >
      <Text style={styles.quoteText}>
        {post.description ? `${post.description}` : "Sem descrição"}
      </Text>
      <View style={styles.line} />
      <Text style={styles.author}>{post.ownerPost || user?.name || "Autor"}</Text>
      <View style={styles.cardMeta}>
        <View style={styles.likeGroup}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => handleToggleLike(post)}
            disabled={!userId}
          >
            <Ionicons
              name={post.isLiked ? "heart" : "heart-outline"}
              size={20}
              color={post.isLiked ? "#E74C3C" : "#2E3A59"}
            />
          </TouchableOpacity>
          <Text style={styles.likesCount}>{post.numberLikes ?? 0}</Text>
        </View>
        {allowDelete ? (
          <View style={styles.actionsGroup}>
            <TouchableOpacity
              style={styles.editButton}
              onPress={() => handleEditPostNavigation(post)}
            >
              <Ionicons name="create-outline" size={18} color="#024C91" />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => confirmDeletePost(post)}
            >
              <Ionicons name="trash-outline" size={18} color="#E53935" />
            </TouchableOpacity>
          </View>
        ) : (
          <View style={{ width: 48 }} />
        )}
      </View>
    </View>
  );

  const currentList = selectedTab === "liked" ? likedQuotes : createdQuotes;
  const displayedList = currentList.filter(Boolean);
  const isCreatedTab = selectedTab === "posts";

  const emptyMessage =
    selectedTab === "liked"
      ? "Você ainda não curtiu nenhum post."
      : "Você ainda não criou posts.";

  const tabs = [
    { key: "posts", icon: "document-text-outline", label: "Criadas" },
    { key: "liked", icon: "heart", label: "Curtidas" },
  ];

  return (
    <>
      <ScrollView
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 60 }}
        showsVerticalScrollIndicator={false}
      >
      <TouchableOpacity
        style={styles.editProfile}
        onPress={() => router.push("/editProfile")}
      >
        <Text style={styles.editProfileText}>Editar Perfil</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        <View style={styles.avatarContainer}>
          <Image
            source={{
              uri: user?.avatarUrl || "https://i.imgur.com/7yUvePI.png",
            }}
            style={styles.avatar}
          />
        </View>

        <Text style={styles.name}>Olá, {user?.name || "Inspira.me"}</Text>

        <View style={styles.tabContainer}>
          {tabs.map((t) => {
            const active = selectedTab === t.key;
            return (
              <TouchableOpacity
                key={t.key}
                style={[styles.tabButton, active && styles.tabSelected]}
                onPress={() => setSelectedTab(t.key)}
              >
                <Ionicons
                  name={t.key === "liked" && !active ? "heart-outline" : t.icon}
                  size={20}
                  color={active ? "#fff" : "#000"}
                />
                <Text style={[styles.tabLabel, active && styles.tabLabelActive]}>
                  {t.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.sectionTitle}>
          {selectedTab === "liked" ? "Frases curtidas" : "Frases criadas"}
        </Text>

        {isLoading ? (
          <ActivityIndicator size="large" color="#76A7E1" style={{ marginTop: 30 }} />
        ) : errorMessage ? (
          <Text style={styles.errorText}>{errorMessage}</Text>
        ) : displayedList.length === 0 ? (
          <Text style={styles.emptyText}>{emptyMessage}</Text>
        ) : (
          displayedList.map((post, index) => renderCard(post, index, isCreatedTab))
        )}
      </View>

        <TouchableOpacity style={styles.logoutButton} onPress={signOut}>
          <Ionicons name="log-out-outline" size={20} color="#fff" />
          <Text style={styles.logoutText}>Sair</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal
        transparent
        animationType="fade"
        visible={isDeleteModalVisible}
        onRequestClose={closeDeleteModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Excluir postagem</Text>
            <Text style={styles.modalMessage}>
              Deseja realmente excluir esta frase?
            </Text>
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalButton} onPress={closeDeleteModal}>
                <Text style={styles.modalCancelText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalButton, styles.modalDeleteButton]}
                onPress={handleConfirmDelete}
              >
                <Text style={styles.modalDeleteText}>Excluir</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  editProfile: { alignSelf: "flex-end", margin: 20 },
  editProfileText: { color: "#007AFF", fontSize: 14, fontWeight: "600" },
  content: { width: "100%", alignItems: "center" },
  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: "hidden",
    marginBottom: 10,
  },
  avatar: { width: "100%", height: "100%" },
  name: { fontSize: 22, fontWeight: "600", marginBottom: 20 },
  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#E0E0E0",
    borderRadius: 30,
    padding: 6,
    marginBottom: 40,
    width: "90%",
    maxWidth: 380,
    alignSelf: "center",
  },
  tabButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 12,
    borderRadius: 24,
    minHeight: 48,
    marginHorizontal: 6,
  },
  tabSelected: { backgroundColor: "#76A7E1" },
  tabLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: "#000",
  },
  tabLabelActive: {
    color: "#fff",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 15,
    textAlign: "center",
    width: "100%",
  },
  quoteCard: {
    width: "85%",
    padding: 18,
    borderRadius: 12,
    marginBottom: 15,
  },
  quoteText: { fontSize: 14, color: "#333", marginBottom: 12, textAlign: "center" },
  line: {
    height: 1,
    width: "60%",
    backgroundColor: "#000",
    alignSelf: "center",
  },
  author: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 12,
    color: "#2E3A59",
  },
  cardMeta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 10,
  },
  likeGroup: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconButton: {
    padding: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    backgroundColor: "#fff",
    marginRight: 8,
  },
  actionsGroup: {
    flexDirection: "row",
    alignItems: "center",
  },
  editButton: {
    padding: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#024C91",
    backgroundColor: "#fff",
    marginRight: 8,
  },
  deleteButton: {
    padding: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#E53935",
    backgroundColor: "#fff",
  },
  likesCount: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2E3A59",
    marginLeft: 10,
  },
  errorText: {
    color: "#E53935",
    fontSize: 14,
    textAlign: "center",
    marginTop: 20,
    paddingHorizontal: 30,
  },
  emptyText: {
    color: "#6B6B6B",
    fontSize: 14,
    textAlign: "center",
    marginTop: 20,
    paddingHorizontal: 30,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 20,
    marginTop: 20,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: "#769FCD",
    paddingHorizontal: 16,
  },
  logoutText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  modalCard: {
    width: "100%",
    maxWidth: 360,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#2E3A59",
    marginBottom: 8,
    textAlign: "center",
  },
  modalMessage: {
    fontSize: 14,
    color: "#5B6E85",
    textAlign: "center",
    marginBottom: 20,
  },
  modalActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    columnGap: 12,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    alignItems: "center",
  },
  modalDeleteButton: {
    backgroundColor: "#E53935",
    borderColor: "#E53935",
  },
  modalCancelText: {
    fontSize: 15,
    fontWeight: "600",
    color: "#2E3A59",
  },
  modalDeleteText: {
    fontSize: 15,
    fontWeight: "700",
    color: "#fff",
  },
});