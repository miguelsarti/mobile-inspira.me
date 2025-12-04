import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Dimensions,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import Header from "../components/header/header.js";

const { width } = Dimensions.get("window");
const CARD_SIZE = width * 0.20;

export default function CreatePhraseScreen() {
  const router = useRouter();

  const [phrase, setPhrase] = React.useState('');
  const [author, setAuthor] = React.useState('');
  const [category, setCategory] = React.useState('');
  const [background, setBackground] = React.useState('#f0f0f0');

  const STORAGE_KEY = '@user_phrases';

  const handlePostPhrase = async () => {
    if (!phrase.trim() || !category.trim()) {
      Alert.alert("Atenção", "Preencha a frase e selecione uma categoria para postar.");
      return;
    }

    const newPhrase = {
      id: Date.now(),
      text: phrase.trim(),
      author: author.trim() || 'Anônimo',
      category: category,
      background: background,
      createdAt: new Date().toISOString(),
    };

    try {
      const existingPhrasesJson = await AsyncStorage.getItem(STORAGE_KEY);
      const existingPhrases = existingPhrasesJson ? JSON.parse(existingPhrasesJson) : [];

      const updatedPhrases = [newPhrase, ...existingPhrases];

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPhrases));

      Alert.alert("Sucesso 🎉", "Sua frase foi salva localmente e pode ser acessada em outras abas.");
      
      setPhrase('');
      setAuthor('');
      setCategory('');
      setBackground('#f0f0f0');

    } catch (error) {
      console.error("Erro ao salvar a frase no AsyncStorage:", error);
      Alert.alert("Erro", "Não foi possível salvar a frase no dispositivo.");
    }
  };
  return (
    <ScrollView contentContainerStyle={styles.container}>

<View style={{ marginTop: 25 }}>
        <Header />
      </View>

            <Text style={styles.title}>Criar Nova Frase</Text>

      <TextInput
        style={styles.inputPhrase}
        placeholder="Digite sua frase inspiradora aqui..."
        value={phrase}
        onChangeText={setPhrase}
        multiline={true}
      />

      <TextInput
        style={styles.inputAuthor}
        placeholder="Autor(a)"
        value={author}
        onChangeText={setAuthor}
      />

      <Text style={styles.label}>Fundo do card</Text>

<ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.carousel}>
        {["#f0f0f0", "#A6C8E0", "#8BB9D4", "#5D8AA8"].map((cor, i) => (
          <TouchableOpacity
            key={i}
            style={[
              styles.colorOption,
              { backgroundColor: cor },
              background === cor && styles.selectedColor
            ]}
            onPress={() => setBackground(cor)}
          />
        ))}
      </ScrollView>

      <Text style={styles.label}>Categorias</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.carousel}>
        {["AMOR", "FAMÍLIA", "AMIZADE", "MOTIVAÇÃO"].map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.categoryButton,
              category === cat && styles.selectedCategory
            ]}
            onPress={() => setCategory(cat)}
          >
            <Text style={styles.categoryText}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

<View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.postButton, { backgroundColor: '#3498db' }]}
          onPress={handlePostPhrase}
        >
          <Text style={styles.buttonText}>Postar Frase</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.postButton, { backgroundColor: '#ccc' }]}
          onPress={() => router.back()}
        >
          <Text style={styles.buttonText}>Cancelar</Text>
        </TouchableOpacity>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#fff',
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

    title: {
    fontSize: 24,
    textAlign: "center",
    marginTop: 20,
    marginBottom: 25,
    fontWeight: "600",
    color: "#2E3A59",
  },
  userAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#DCE6F2",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  avatarImage: {
    width: 60,
    height: 60,
    borderRadius: 30,
  },
  greeting: {
    fontSize: width * 0.05,
    fontWeight: "600",
    color: "#6B8EAE",
  },
  menuButton: {
    padding: 8,
  },

inputPhrase: {
    height: 90,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 20,
    paddingLeft: 12,
    paddingTop: 12,
    fontSize: 16,
    textAlignVertical: 'top',
  },

    inputAuthor: {
    height: 60,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 20,
    paddingLeft: 12,
    fontSize: 16,
  },

  label: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
  },

  carousel: {
    marginBottom: 50,
  },

colorOption: {
    width: CARD_SIZE,
    height: CARD_SIZE,
    borderRadius: 12,
    marginRight: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },

  selectedColor: {
    borderWidth: 1,
    borderColor: '#000000',
  },

  categoryButton: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 15,
    paddingHorizontal: 15,
    borderRadius: 30,
    marginRight: 11,

  },
  selectedCategory: {
    backgroundColor: '#A6C8E0',
  },
  categoryText: {
    fontSize: 14,
    color: '#333',
    fontWeight: "600",
  },

  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 106,
  },
  postButton: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginRight: 12,
  },
  buttonText: {
    fontSize: 15,
    color: '#fff',
    fontWeight: '700',
  },
});
