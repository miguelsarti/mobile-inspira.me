import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Header from "../components/header/header.js";
import CategoryCarousel from "../components/CategoryCarousel";
import API_URL from "../../utils/api";
import { useAuth } from "../../contexts/AuthContext";

export default function ExploreScreen() {
  const { user } = useAuth();
  const normalizedUserId = useMemo(() => {
    if (typeof user?.id === "number") {
      return user.id;
    }
    const parsed = Number(user?.id);
    return Number.isNaN(parsed) ? null : parsed;
  }, [user?.id]);
  const router = useRouter();
  const [categorias, setCategorias] = useState([]);
  const [userPhrases, setUserPhrases] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isLocalLoading, setIsLocalLoading] = useState(true);

  useEffect(() => {
    if (!normalizedUserId) return;

    Promise.all([
      fetch(`${API_URL}/categorias`).then(res => res.json()),
      fetch(`${API_URL}/posts`).then(res => res.json())
    ])
      .then(([categoriesData, postsData]) => {
        const catIdToName = {};
        if (Array.isArray(categoriesData)) {
          categoriesData.forEach(cat => {
            catIdToName[cat.id] = cat.description;
          });
        }

        const grouped = {};

        if (Array.isArray(postsData)) {
          postsData.forEach(post => {
            if (post.categories && Array.isArray(post.categories)) {
              post.categories.forEach(catRel => {
                const catId = catRel.categoryId;
                const catName = catRel.category?.description || catIdToName[catId];

                if (catName) {
                  if (!grouped[catName]) {
                    grouped[catName] = [];
                  }

                  const likesArray = Array.isArray(post.likes) ? post.likes : [];
                  const userLike = likesArray.find(l => Number(l.userId) === normalizedUserId);
                  const isLiked = Boolean(userLike);
                  const backgroundColor = post.backgroundColor || catRel.background || '#E4EEF8';
                  const likeCount = likesArray.length > 0 ? likesArray.length : (post.numberLikes ?? 0);

                  grouped[catName].push({
                    id: post.id,
                    text: post.description,
                    backgroundColor,
                    likesCount: likeCount,
                    isLiked,
                    likeId: userLike?.id ?? null,
                  });
                }
              });
            }
          });
        }

        const dadosAdaptados = Object.keys(grouped).map(key => ({
          titulo: key,
          items: grouped[key]
        }));
        setCategorias(dadosAdaptados);
        setIsLoading(false);
      })
      .catch(error => {
        console.error("Erro ao buscar categorias da API:", error);
        setIsLoading(false);
      });
  }, [normalizedUserId]);

  const handleLike = async (item) => {
    if (!normalizedUserId) return;
    const wasLiked = item.isLiked;
    try {
      let newLikeId = item.likeId || null;
      if (wasLiked && item.likeId) {
        await fetch(`${API_URL}/registros-curtida/${item.likeId}`, {
          method: 'DELETE',
        });
        newLikeId = null;
      } else if (!wasLiked) {
        const response = await fetch(`${API_URL}/registros-curtida`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ postId: item.id, userId: normalizedUserId }),
        });

        if (!response.ok) {
          throw new Error('Não foi possível registrar a curtida.');
        }

        const createdLike = await response.json();
        newLikeId = createdLike.id;
      }

      setCategorias(prevCats => prevCats.map(cat => ({
        ...cat,
        items: cat.items.map(card => {
          if (card.id !== item.id) return card;
          const delta = wasLiked ? -1 : 1;
          return {
            ...card,
            isLiked: !wasLiked,
            likesCount: Math.max(0, (card.likesCount || 0) + delta),
            likeId: wasLiked ? null : newLikeId,
          };
        })
      })));
    } catch (error) {
      console.error("Erro ao curtir:", error);
    }
  };

  const loadUserPhrases = async () => {
    try {
      const jsonValue = await AsyncStorage.getItem('@user_phrases');
      if (jsonValue != null) {
        setUserPhrases(JSON.parse(jsonValue));
      }
    } catch (e) {
      console.error("Erro ao carregar frases locais", e);
    } finally {
      setIsLocalLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadUserPhrases();
    }, [])
  );

  const allContent = [
    ...(userPhrases.length > 0 ? [{
      titulo: "Minhas Criações 🌟",
      items: userPhrases.map((p, index) => ({
        id: p.id || `local-${index}`,
        text: p.text,
        backgroundColor: p.backgroundColor || p.background,
        likesCount: 0,
        isLiked: false
      }))
    }] : []),
    ...categorias
  ];

  const categoriasFiltradas = allContent.filter(cat =>
    cat.titulo.toLowerCase().includes(searchText.toLowerCase())
  );

  const handlePostPress = (item) => {
    router.push(`/details/${item.id}`);
  };

  return (
    <ScrollView style={styles.container}>

      <View style={{ marginTop: 25 }}>
        <Header />
      </View>

      <Text style={styles.title}>Explorar</Text>

      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={18}
          color="#6B8EAE"
          style={{ marginRight: 6 }}
        />
        <TextInput
          placeholder="Pesquisar categorias..."
          style={styles.input}
          placeholderTextColor="#6B8EAE"
          value={searchText}
          onChangeText={setSearchText}
        />
      </View>

      {(isLoading || isLocalLoading) ? (
        <ActivityIndicator size="large" color="#6B8EAE" style={{ marginTop: 50 }} />
      ) : (
        <>
          {categoriasFiltradas.length > 0 ? (
            categoriasFiltradas.map((cat, idx) => (
              <CategoryCarousel
                key={idx}
                title={cat.titulo}
                items={cat.items}
                onLike={handleLike}
                onPress={handlePostPress}
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>Nenhuma categoria ou criação encontrada para "{searchText}". </Text>
            </View>
          )}
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
  },

  title: {
    fontSize: 18,
    textAlign: "center",
    marginTop: 20,
    marginBottom: 25,
    fontWeight: "600",
    color: "#2E3A59",
  },

  category: {
    fontSize: 18,
    fontWeight: "700",
    marginBottom: 15,
    color: "#2E3A59",
  },

  categoryBlock: {
    marginTop: 25,
    marginBottom: 30,
  },

  searchContainer: {
    flexDirection: "row",
    backgroundColor: "#E4EEF8",
    alignItems: "center",
    paddingHorizontal: 10,
    borderRadius: 10,
    height: 45,
    marginBottom: 10,
  },

  input: {
    flex: 1,
    fontSize: 14,
    color: "#2E3A59",
  },


  cardCarousel: {
    width: 180,
    paddingHorizontal: 10,
    paddingVertical: 35,
    backgroundColor: "#E4EEF8",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 3,
    elevation: 2,
  },

  cardText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#2E3A59",
    textAlign: "center",
  },

  userCardText: {
    color: '#333',
    marginBottom: 5,
  },
  authorText: {
    fontSize: 12,
    color: '#333',
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 5,
  },
  emptyText: {
    fontSize: 16,
    color: '#6B8EAE',
    textAlign: 'center',
    fontWeight: '500',
  }
});