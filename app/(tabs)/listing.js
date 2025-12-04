import React, { useState, useEffect } from "react";
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
import Header from "../components/header/header.js";

export default function ExploreScreen() {
  const [categorias, setCategorias] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('http://localhost:5000/categories')
      .then(response => response.json())
      .then(data => {
        const dadosAdaptados = data.map(cat => ({
          titulo: cat.description,
          frases: cat.registrosCategorias.map(registro => registro.post.description)
        }));
        setCategorias(dadosAdaptados);
        setIsLoading(false); 
      })
      .catch(error => {
        console.error("Erro ao buscar categorias:", error);
        setIsLoading(false); 
      });
  }, []);

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
              <View key={idx} style={styles.categoryBlock}>
                <Text style={styles.category}>{cat.titulo}</Text>

                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {cat.frases.map((frase, i) => (
                    <TouchableOpacity key={i} style={styles.cardCarousel}>
                      <Text style={styles.cardText} numberOfLines={3}>{frase}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
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
  },

  input: {
    flex: 1,
    fontSize: 14,
    color: "#2E3A59",
  },


  cardCarousel: {
    width: 180,
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
    emptyText: {
    fontSize: 16,
    color: '#6B8EAE',
    textAlign: 'center',
    fontWeight: '500',
  }
});