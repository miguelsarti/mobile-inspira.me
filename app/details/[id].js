import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  Platform,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import API_URL from "../../utils/api";
import { useAuth } from "../../contexts/AuthContext";

const { width } = Dimensions.get("window");
const CARD_WIDTH = width * 0.85;
const CARD_HEIGHT = 380;

export default function PostDetalhes() {
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const router = useRouter();

  const [post, setPost] = useState(null);
  const [categoriesData, setCategoriesData] = useState([]);

  useEffect(() => {
    if (!id) return;

    fetch(`${API_URL}/posts/${id}`)
      .then((res) => res.json())
      .then((json) => {
        const normalizedPost = {
          ...json,
          isLiked: json?.likes ? json.likes.some((like) => like.userId === user?.id) : false,
        };
        setPost(normalizedPost);
      })
      .catch((err) => console.log(err));
  }, [id, user?.id]);

  useEffect(() => {
    fetch(`${API_URL}/categorias`)
      .then((response) => response.json())
      .then((data) => {
        const items = Array.isArray(data) ? data : [];
        setCategoriesData(items);
      })
      .catch((error) => console.error("Erro ao buscar categorias:", error));
  }, []);

  const handleLike = async () => {
    if (!post || !user) return;

    setPost((prev) => {
      if (!prev) return prev;
      const wasLiked = prev.isLiked;
      const currentLikes = prev.numberLikes || 0;
      return {
        ...prev,
        isLiked: !wasLiked,
        numberLikes: wasLiked ? Math.max(0, currentLikes - 1) : currentLikes + 1,
      };
    });

    try {
      await fetch(`${API_URL}/likes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ postId: post.id, userId: user.id }),
      });
    } catch (error) {
      console.error("Erro ao curtir:", error);
    }
  };

  const getCategoryDescription = (catRel) => {
    if (catRel?.category?.description) {
      return catRel.category.description;
    }

    if (categoriesData.length > 0 && catRel?.categoryId) {
      const found = categoriesData.find((category) => category.id === catRel.categoryId);
      if (found?.description) {
        return found.description;
      }
    }

    return "Categoria";
  };

  if (!post) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Carregando...</Text>
      </View>
    );
  }

  const TAB_DESTINATIONS = [
    { label: "Home", route: "/(tabs)/home", icon: "🏠" },
    { label: "Explorar", route: "/(tabs)/listing", icon: "✨" },
    { label: "Criar", route: "/(tabs)/create", icon: "+" },
    { label: "Perfil", route: "/(tabs)/profile", icon: "👤" },
  ];
  const DEFAULT_ACTIVE_TAB = "Explorar";

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatarCircle}>
            <Image
              source={{
                uri: user?.photoURL || "https://via.placeholder.com/40",
              }}
              style={styles.avatar}
            />
          </View>
          <View>
            <Text style={styles.goodMorning}>Good Morning,</Text>
            <Text style={styles.userName}>{user?.name || "User"}</Text>
          </View>
        </View>

        <TouchableOpacity onPress={() => router.push("/(tabs)/listing")}>
          <Ionicons name="chevron-back" size={32} color="#000" />
        </TouchableOpacity>
      </View>

      <View style={[styles.quoteCard, { backgroundColor: post.backgroundColor || "#E4EEF8" }]}>
        <View style={styles.cardContent}>
          <Text style={styles.quoteText}>{post.description}</Text>
          <View style={styles.line} />
          <Text style={styles.author}>{post.ownerPost}</Text>
        </View>

        <TouchableOpacity onPress={handleLike} style={styles.likeButton}>
          <Image
            source={require("../../assets/heart.png")}
            style={[styles.heartIcon, { tintColor: post.isLiked ? "red" : "black" }]}
          />
          <Text style={styles.likeCount}>{post.numberLikes || 0}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.postedRow}>
        <View style={styles.dot} />
        <Text style={styles.postedText}>
          Postado por: <Text style={styles.postedName}>{post.ownerPost}</Text>
        </Text>
      </View>

      {post.categories?.length ? (
        <View style={styles.carouselContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.scrollViewContent}
            alwaysBounceHorizontal
          >
            {post.categories.map((catRel, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.carouselButton,
                  { backgroundColor: catRel.background || "#E4EEF8" },
                ]}
              >
                <Text style={styles.buttonText}>
                  {getCategoryDescription(catRel).toUpperCase()}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      ) : null}

      <View style={styles.tabsContainer}>
        {TAB_DESTINATIONS.map((tab) => {
          const isActive = tab.label === DEFAULT_ACTIVE_TAB;
          return (
            <TouchableOpacity
              key={tab.route}
              style={styles.tabButton}
              onPress={() => router.push(tab.route)}
            >
              <Text style={[styles.tabIcon, { color: isActive ? "#007AFF" : "#888" }]}>
                {tab.icon}
              </Text>
              <Text style={[styles.tabButtonText, { color: isActive ? "#007AFF" : "#888" }]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <View style={{ height: 60 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "android" ? 50 : 60,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 30,
  },

  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },

  avatarCircle: {
    width: 45,
    height: 45,
    borderRadius: 22,
    backgroundColor: "#D8E3F5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },

  avatar: {
    width: 45,
    height: 45,
    borderRadius: 22,
  },

  goodMorning: {
    fontSize: 14,
    color: "#7A8FA6",
  },

  userName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#5B6E85",
  },

  quoteCard: {
    width: CARD_WIDTH,
    height: CARD_HEIGHT,
    borderRadius: 20,
    padding: 20,
    borderColor: "#000000",
    borderWidth: 1,
    marginBottom: 25,
    alignSelf: "center",
    justifyContent: "space-between",
  },

  cardContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    marginBottom: 20,
  },

  quoteText: {
    fontSize: 18,
    fontStyle: "italic",
    textAlign: "center",
    color: "#2E3A59",
    marginBottom: 15,
  },

  line: {
    width: "60%",
    height: 1,
    backgroundColor: "#6B8EAE",
    marginBottom: 10,
  },

  author: {
    fontSize: 16,
    color: "#2E3A59",
    fontWeight: "600",
    marginBottom: 15,
    textAlign: "center",
  },

  likeButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
    padding: 5,
  },

  heartIcon: {
    width: 24,
    height: 24,
    marginRight: 5,
    resizeMode: "contain",
  },

  likeCount: {
    fontSize: 16,
    color: "#2E3A59",
    fontWeight: "500",
  },

  postedRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },

  dot: {
    width: 16,
    height: 16,
    borderRadius: 10,
    backgroundColor: "#A7C4E2",
    marginRight: 10,
  },

  postedText: {
    fontSize: 14,
    color: "#2E3A59",
  },

  postedName: {
    fontWeight: "700",
  },

  carouselContainer: {
    marginHorizontal: -20,
    marginTop: 10,
  },
  scrollViewContent: {
    paddingHorizontal: 20,
  },
  carouselButton: {
    width: 110,
    height: 110,
    marginRight: 15,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
    borderWidth: 1,
    borderColor: "#000000",
  },
  buttonText: {
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
    color: "#000000",
  },

  tabsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    paddingVertical: 10,
    marginTop: 30,
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  tabIcon: {
    fontSize: 24,
  },
  tabButtonText: {
    fontSize: 12,
    fontWeight: "600",
    marginTop: 2,
  },

});
