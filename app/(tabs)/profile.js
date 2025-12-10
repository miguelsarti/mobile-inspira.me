import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  ActivityIndicator,
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

      const posts = (await postsRes.json()) || [];
      const likes = (await likesRes.json()) || [];

      const likesMap = {};
      likes.forEach((l) => {
        const id = Number(l.postId ?? l.post?.id);
        if (!isNaN(id)) likesMap[id] = (likesMap[id] || 0) + 1;
      });

      const formatPost = (p) => {
        if (!p) return null;
        const id = Number(p.id);
        return {
          ...p,
          numberLikes: likesMap[id] ?? p.numberLikes ?? (Array.isArray(p.likes) ? p.likes.length : 0),
        };
      };

      const userPosts = posts
        .filter((p) => Number(p.userId) === userId)
        .map(formatPost)
        .filter(Boolean);

      const liked = likes
        .filter((l) => Number(l.userId) === userId)
        .map((l) => formatPost(l.post || posts.find((p) => Number(p.id) === Number(l.postId))))
        .filter(
          (p, i, arr) => p && arr.findIndex((x) => Number(x.id) === Number(p.id)) === i
        );

      setCreatedQuotes(userPosts);
      setLikedQuotes(liked);
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

  const renderCard = (post, index) => (
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
        <Ionicons name="heart" size={18} color="#E74C3C" />
        <Text style={styles.likesCount}>{post.numberLikes ?? 0}</Text>
      </View>
    </View>
  );

  const currentList = selectedTab === "liked" ? likedQuotes : createdQuotes;

  const emptyMessage =
    selectedTab === "liked"
      ? "Você ainda não curtiu nenhum post."
      : "Você ainda não criou posts.";

  const tabs = [
    { key: "posts", icon: "document-text-outline", label: "Criadas" },
    { key: "liked", icon: "heart", label: "Curtidas" },
  ];

  return (
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
        ) : currentList.length === 0 ? (
          <Text style={styles.emptyText}>{emptyMessage}</Text>
        ) : (
          currentList.map(renderCard)
        )}
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={signOut}>
        <Ionicons name="log-out-outline" size={20} color="#fff" />
        <Text style={styles.logoutText}>Sair</Text>
      </TouchableOpacity>
    </ScrollView>
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
    borderRadius: 25,
    padding: 4,
    marginBottom: 30,
  },
  tabButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
    borderRadius: 20,
    minHeight: 40,
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
    justifyContent: "center",
    marginTop: 10,
  },
  likesCount: {
    fontSize: 14,
    fontWeight: "600",
    color: "#2E3A59",
    marginLeft: 6,
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
});