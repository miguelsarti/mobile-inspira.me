import React, { useState, useEffect, useCallback } from "react";
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
import { useFocusEffect } from 'expo-router'; // Para recarregar dados quando a tela é focada
import AsyncStorage from '@react-native-async-storage/async-storage'; // Importar AsyncStorage
import Header from "../components/header/header.js";

// Chave do AsyncStorage (deve ser a mesma usada em CreatePhraseScreen)
const USER_PHRASES_STORAGE_KEY = '@user_phrases';

export default function ExploreScreen() {
  const [categorias, setCategorias] = useState([]);
  const [userPhrases, setUserPhrases] = useState([]); // Novo estado para frases do usuário
  const [searchText, setSearchText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isLocalLoading, setIsLocalLoading] = useState(true); // Estado para carregamento local

  // --- Função para carregar frases da API ---
  useEffect(() => {
    fetch('http://localhost:5000/categories')
      .then(response => response.json())
      .then(data => {
        const dadosAdaptados = data.map(cat => ({
          titulo: cat.description,
           frases: cat.registrosCategorias.map(registro => registro.post.description),
          isUserContent: false,
        }));
        setCategorias(dadosAdaptados);
        setIsLoading(false); 
      })
      .catch(error => {
         console.error("Erro ao buscar categorias da API:", error);
        setIsLoading(false); 
      });
  }, []);
  const loadUserPhrases = useCallback(async () => {
    setIsLocalLoading(true);
    try {
      const phrasesJson = await AsyncStorage.getItem(USER_PHRASES_STORAGE_KEY);
      if (phrasesJson !== null) {
        // Armazena as frases do usuário
        setUserPhrases(JSON.parse(phrasesJson));
      } else {
        setUserPhrases([]);
      }
    } catch (e) {
      console.error("Erro ao carregar frases do usuário:", e);
      setUserPhrases([]);
    } finally {
      setIsLocalLoading(false);
    }
  }, []);

  // Recarrega as frases do usuário sempre que a tela é focada (ex: voltando de CreatePhraseScreen)
  useFocusEffect(
    useCallback(() => {
      loadUserPhrases();
    }, [loadUserPhrases])
  );

  const allContent = [
    ...(userPhrases.length > 0 ? [{
      titulo: "Minhas Criações 🌟",
      frases: userPhrases.map(p => p.text), // Usamos 'text' que é o nome da chave na frase salva
      isUserContent: true,
      userBackgrounds: userPhrases.map(p => p.background), // Cores de fundo salvas
    }] : []),
    ...categorias
  ];

  const categoriasFiltradas = allContent.filter(cat =>
    cat.titulo.toLowerCase().includes(searchText.toLowerCase())
  );


  const renderCard = (frase, i, cat) => (
    <TouchableOpacity 
      key={i} 
      style={[
        styles.cardCarousel,
        cat.isUserContent && { 
          backgroundColor: cat.userBackgrounds[i] || '#f0f0f0',
        }
      ]}
    >
      <Text style={[styles.cardText, cat.isUserContent && styles.userCardText]} numberOfLines={3}>
        {frase}
      </Text>
      {cat.isUserContent && userPhrases[i]?.author && (
          <Text style={styles.authorText}>
              - {userPhrases[i].author}
          </Text>
      )}
    </TouchableOpacity>
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

       {(isLoading || isLocalLoading) ? (
        <ActivityIndicator size="large" color="#6B8EAE" style={{ marginTop: 50 }} />
      ) : (
        <>
          {categoriasFiltradas.length > 0 ? (
            categoriasFiltradas.map((cat, idx) => (
              <View key={idx} style={styles.categoryBlock}>
                <Text style={styles.category}>{cat.titulo}</Text>

                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {cat.frases.map((frase, i) => (
                     renderCard(frase, i, cat)
                  ))}
                </ScrollView>
              </View>
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
    color: '#333', // Talvez mude a cor para contraste em fundos coloridos
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