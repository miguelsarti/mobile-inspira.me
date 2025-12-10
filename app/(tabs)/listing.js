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
import { useFocusEffect, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Header from "../components/header/header";
import CategoryCarousel from "../components/CategoryCarousel";
import API_URL from "../../utils/api";
import { useAuth } from "../../contexts/AuthContext";

export default function ExploreScreen() {
  const { user } = useAuth();
  const router = useRouter();

  const idUsuario = Number(user?.id) || null;

  const [listaCategorias, setListaCategorias] = useState([]);
  const [frasesUsuario, setFrasesUsuario] = useState([]);
  const [textoPesquisa, setTextoPesquisa] = useState("");

  const [carregandoApi, setCarregandoApi] = useState(true);
  const [carregandoLocal, setCarregandoLocal] = useState(true);

  useEffect(() => {
    if (!idUsuario) return;

    async function carregarDadosApi() {
      try {
        const [resCategorias, resPosts] = await Promise.all([
          fetch(`${API_URL}/categorias`).then((r) => r.json()),
          fetch(`${API_URL}/posts`).then((r) => r.json()),
        ]);

        const mapaCategorias = {};
        resCategorias?.forEach((c) => (mapaCategorias[c.id] = c.description));

        const agrupado = {};

        resPosts?.forEach((post) => {
          post.categories?.forEach((catRel) => {
            const idCat = catRel.categoryId;
            const nomeCat =
              catRel.category?.description || mapaCategorias[idCat];

            if (!nomeCat) return;

            if (!agrupado[nomeCat]) agrupado[nomeCat] = [];

            const listaCurtidas = Array.isArray(post.likes) ? post.likes : [];
            const curtidaUsuario = listaCurtidas.find(
              (l) => Number(l.userId) === idUsuario
            );

            const fundo =
              post.backgroundColor || catRel.background || "#E4EEF8";

            agrupado[nomeCat].push({
              id: post.id,
              texto: post.description,
              fundo,
              totalCurtidas:
                listaCurtidas.length > 0
                  ? listaCurtidas.length
                  : post.numberLikes || 0,
              curtido: Boolean(curtidaUsuario),
              idCurtida: curtidaUsuario?.id || null,
            });
          });
        });

        const dadosFinal = Object.keys(agrupado).map((nome) => ({
          titulo: nome,
          itens: agrupado[nome],
        }));

        setListaCategorias(dadosFinal);
      } catch (err) {
        console.log("Erro API:", err);
      }

      setCarregandoApi(false);
    }

    carregarDadosApi();
  }, [idUsuario]);

  const curtirItem = async (item) => {
    if (!idUsuario) return;

    const estavaCurtido = item.curtido;

    try {
      let novoIdCurtida = item.idCurtida;

      if (estavaCurtido && item.idCurtida) {
        await fetch(`${API_URL}/registros-curtida/${item.idCurtida}`, {
          method: "DELETE",
        });
        novoIdCurtida = null;
      } else {
        const resposta = await fetch(`${API_URL}/registros-curtida`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ postId: item.id, userId: idUsuario }),
        });

        const criado = await resposta.json();
        novoIdCurtida = criado.id;
      }

      setListaCategorias((prev) =>
        prev.map((cat) => ({
          ...cat,
          itens: cat.itens.map((card) => {
            if (card.id !== item.id) return card;

            return {
              ...card,
              curtido: !estavaCurtido,
              totalCurtidas: card.totalCurtidas + (estavaCurtido ? -1 : 1),
              idCurtida: novoIdCurtida,
            };
          }),
        }))
      );
    } catch (err) {
      console.log("Erro curtida:", err);
    }
  };

  async function carregarFrasesLocal() {
    try {
      const jsonValue = await AsyncStorage.getItem("@user_phrases");
      if (jsonValue) setFrasesUsuario(JSON.parse(jsonValue));
    } catch {}
    setCarregandoLocal(false);
  }

  useFocusEffect(
    React.useCallback(() => {
      carregarFrasesLocal();
    }, [])
  );

  const conteudoCompleto = [
    ...(frasesUsuario.length > 0
      ? [
          {
            titulo: "Minhas Criações 🌟",
            itens: frasesUsuario.map((p, index) => ({
              id: p.id || `local-${index}`,
              texto: p.text,
              fundo: p.backgroundColor || "#E4EEF8",
              totalCurtidas: 0,
              curtido: false,
            })),
          },
        ]
      : []),
    ...listaCategorias,
  ];

  const categoriasFiltradas = conteudoCompleto.filter((cat) =>
    cat.titulo.toLowerCase().includes(textoPesquisa.toLowerCase())
  );

  const abrirDetalhes = (item) => {
    router.push(`/details/${item.id}`);
  };

  return (
    <ScrollView style={styles.container}>
      <View style={{ marginTop: 25 }}>
        <Header />
      </View>

      <Text style={styles.title}>Explorar</Text>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={18} color="#6B8EAE" />
        <TextInput
          placeholder="Pesquisar categorias..."
          style={styles.input}
          placeholderTextColor="#6B8EAE"
          value={textoPesquisa}
          onChangeText={setTextoPesquisa}
        />
      </View>

      {carregandoApi || carregandoLocal ? (
        <ActivityIndicator
          size="large"
          color="#6B8EAE"
          style={{ marginTop: 50 }}
        />
      ) : categoriasFiltradas.length > 0 ? (
        categoriasFiltradas.map((cat, index) => (
          <CategoryCarousel
            key={index}
            title={cat.titulo}
            items={cat.itens}
            onLike={curtirItem}
            onPress={abrirDetalhes}
          />
        ))
      ) : (
        <View style={styles.emptyState}>
          <Text style={styles.emptyText}>
            Nada encontrado para "{textoPesquisa}".
          </Text>
        </View>
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
    marginLeft: 6,
  },
  emptyState: {
    padding: 30,
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
    color: "#6B8EAE",
  },
});
