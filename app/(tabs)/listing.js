import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Header from "../components/header/header.js";
import CategoryCarousel from "../components/CategoryCarousel";
import API_URL from "../../utils/api";
import { useAuth } from "../../contexts/AuthContext";

export default function ExploreScreen() {
  const { user } = useAuth();
  const [categorias, setCategorias] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    // Buscamos tanto as categorias quanto os posts para garantir que temos todos os dados
    Promise.all([
      fetch(`${API_URL}/categorias`).then(res => res.json()),
      fetch(`${API_URL}/posts`).then(res => res.json())
    ])
      .then(([categoriesData, postsData]) => {
        // 1. Criar mapa de ID -> Nome da Categoria
        const catIdToName = {};
        if (Array.isArray(categoriesData)) {
          categoriesData.forEach(cat => {
            catIdToName[cat.id] = cat.description;
          });
        }

        // 2. Agrupar posts por categoria
        const grouped = {};

        if (Array.isArray(postsData)) {
          postsData.forEach(post => {
            if (post.categories && Array.isArray(post.categories)) {
              post.categories.forEach(catRel => {
                // Tenta pegar o nome do relacionamento ou do mapa
                const catId = catRel.categoryId;
                const catName = catRel.category?.description || catIdToName[catId];

                if (catName) {
                  if (!grouped[catName]) {
                    grouped[catName] = [];
                  }

                  const isLiked = post.likes ? post.likes.some(l => l.userId === user.id) : false;

                  grouped[catName].push({
                    id: post.id,
                    text: post.description,
                    background: post.backgroundColor || catRel.background,
                    likesCount: post.numberLikes,
                    isLiked: isLiked
                  });
                }
              });
            }
          });
        }

        // 3. Converter para o formato da lista
        const dadosAdaptados = Object.keys(grouped).map(key => ({
          titulo: key,
          items: grouped[key]
        }));

        setCategorias(dadosAdaptados);
        setIsLoading(false);
      })
      .catch(error => {
        console.error("Erro ao buscar dados:", error);
        setIsLoading(false);
      });
  }, [user]);

  const handleLike = async (postId) => {
    try {
      // Atualização Otimista
      setCategorias(prevCats => prevCats.map(cat => ({
        ...cat,
        items: cat.items.map(item => {
          if (item.id === postId) {
            const wasLiked = item.isLiked;
            return {
              ...item,
              isLiked: !wasLiked,
              likesCount: wasLiked ? item.likesCount - 1 : item.likesCount + 1
            };
          }
          return item;
        })
      })));

      // Chamada API (assumindo endpoint de toggle ou create/delete)
      // Como não temos o endpoint exato, vamos tentar um POST para /likes/toggle ou similar
      // Se não existir, o usuário terá que implementar.
      // Mas baseando no seed, existe RegistroCurtida.
      // Vamos tentar POST /likes com { postId, userId }

      const response = await fetch(`${API_URL}/likes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          postId: postId,
          userId: user.id
        }),
      });

      if (!response.ok) {
        // Reverter se falhar
        console.error("Falha ao curtir");
        // TODO: Reverter estado
      }
    } catch (error) {
      console.error("Erro ao curtir:", error);
    }
  };

  const categoriasFiltradas = categorias.filter(cat =>
    cat.titulo.toLowerCase().includes(searchText.toLowerCase())
  );

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

      {isLoading ? (
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
              />
            ))
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>
                Nenhuma categoria encontrada para "{searchText}".
              </Text>
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

  emptyState: {
    marginTop: 50,
    alignItems: 'center',
  },

  emptyText: {
    fontSize: 16,
    color: '#6B8EAE',
    textAlign: 'center',
    fontWeight: '500',
  }
});