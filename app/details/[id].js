import React, { useEffect, useMemo, useState } from "react";
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

  const idUsuario = useMemo(() => {
    const parsed = Number(user?.id);
    return Number.isNaN(parsed) ? null : parsed;
  }, [user?.id]);

  const [dadosPost, setDadosPost] = useState(null);
  const [listaCategorias, setListaCategorias] = useState([]);

  useEffect(() => {
    if (!id) return;

    fetch(`${API_URL}/posts/${id}`)
      .then((res) => res.json())
      .then((json) => {
        const listaCurtidas = Array.isArray(json?.likes) ? json.likes : [];
        const curtidaUsuario =
          idUsuario != null
            ? listaCurtidas.find((like) => Number(like.userId) === idUsuario)
            : null;

        setDadosPost({
          ...json,
          likes: listaCurtidas,
          totalCurtidas:
            listaCurtidas.length > 0
              ? listaCurtidas.length
              : json?.numberLikes || 0,
          curtido: Boolean(curtidaUsuario),
          idCurtida: curtidaUsuario?.id || null,
        });
      })
      .catch((err) => console.log(err));
  }, [id, idUsuario]);

  useEffect(() => {
    fetch(`${API_URL}/categorias`)
      .then((res) => res.json())
      .then((json) => {
        setListaCategorias(Array.isArray(json) ? json : []);
      })
      .catch(() => {});
  }, []);

  const curtirPost = async () => {
    if (!dadosPost || idUsuario == null) return;

    try {
      if (dadosPost.curtido && dadosPost.idCurtida) {
        await fetch(`${API_URL}/registros-curtida/${dadosPost.idCurtida}`, {
          method: "DELETE",
        });

        setDadosPost((prev) => ({
          ...prev,
          curtido: false,
          idCurtida: null,
          totalCurtidas: Math.max(0, prev.totalCurtidas - 1),
        }));
      } else {
        const res = await fetch(`${API_URL}/registros-curtida`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ postId: dadosPost.id, userId: idUsuario }),
        });

        const criado = await res.json();

        setDadosPost((prev) => ({
          ...prev,
          curtido: true,
          idCurtida: criado.id,
          totalCurtidas: prev.totalCurtidas + 1,
        }));
      }
    } catch (err) {
      console.log(err);
    }
  };

  const pegarNomeCategoria = (catRel) => {
    if (catRel?.category?.description) return catRel.category.description;

    const achada = listaCategorias.find((c) => c.id === catRel.categoryId);
    return achada?.description || "Categoria";
  };

  if (!dadosPost) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Carregando...</Text>
      </View>
    );
  }

  const TABS = [
    { label: "Home", route: "/(tabs)/home", icon: "🏠" },
    { label: "Explorar", route: "/(tabs)/listing", icon: "✨" },
    { label: "Criar", route: "/(tabs)/create", icon: "+" },
    { label: "Perfil", route: "/(tabs)/profile", icon: "👤" },
  ];

  const ABA_ATIVA = "Explorar";

  return (
    <View style={styles.screen}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerLeft}>
            <View style={styles.avatarCircle}>
              <Image
                source={
                  user?.avatarUrl
                    ? { uri: user.avatarUrl }
                    : require("../../assets/profile.png")
                }
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

        <View
          style={[
            styles.quoteCard,
            { backgroundColor: dadosPost.backgroundColor || "#E4EEF8" },
          ]}
        >
          <View style={styles.cardContent}>
            <Text style={styles.quoteText}>{dadosPost.description}</Text>
            <View style={styles.line} />
            <Text style={styles.author}>{dadosPost.ownerPost}</Text>
          </View>

          <TouchableOpacity onPress={curtirPost} style={styles.likeButton}>
            <Image
              source={require("../../assets/heart.png")}
              style={[
                styles.heartIcon,
                { tintColor: dadosPost.curtido ? "red" : "black" },
              ]}
            />
            <Text style={styles.likeCount}>{dadosPost.totalCurtidas}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.postedRow}>
          <View style={styles.dot} />
          <Text style={styles.postedText}>
            Postado por:{" "}
            <Text style={styles.postedName}>{dadosPost.ownerPost}</Text>
          </Text>
        </View>

        {dadosPost.categories?.length ? (
          <View style={styles.carouselContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={styles.scrollViewContent}
            >
              {dadosPost.categories.map((cat, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.carouselButton,
                    { backgroundColor: cat.background || "#E4EEF8" },
                  ]}
                >
                  <Text style={styles.buttonText}>
                    {pegarNomeCategoria(cat).toUpperCase()}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        ) : null}
      </ScrollView>

      <View style={styles.tabsContainer}>
        {TABS.map((tab) => {
          const ativo = tab.label === ABA_ATIVA;
          return (
            <TouchableOpacity
              key={tab.route}
              style={styles.tabButton}
              onPress={() => router.push(tab.route)}
            >
              <Text style={[styles.tabIcon, { color: ativo ? "#007AFF" : "#888" }]}>
                {tab.icon}
              </Text>
              <Text
                style={[
                  styles.tabButtonText,
                  { color: ativo ? "#007AFF" : "#888" },
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "android" ? 50 : 60,
  },
  scrollContent: {
    paddingBottom: 140,
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
    borderColor: "#000",
    borderWidth: 1,
    marginBottom: 25,
    alignSelf: "center",
    justifyContent: "space-between",
  },
  cardContent: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
    textAlign: "center",
  },
  likeButton: {
    position: "absolute",
    bottom: 20,
    right: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  heartIcon: {
    width: 24,
    height: 24,
    marginRight: 5,
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
    borderWidth: 1,
    borderColor: "#000",
    padding: 10,
  },
  buttonText: {
    fontSize: 12,
    fontWeight: "bold",
    textAlign: "center",
  },
  tabsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#FFFFFF",
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
    paddingVertical: 12,
    paddingBottom: Platform.OS === "ios" ? 24 : 16,
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
  },
  tabIcon: {
    fontSize: 24,
  },
  tabButtonText: {
    fontSize: 12,
    fontWeight: "600",
  },
});
