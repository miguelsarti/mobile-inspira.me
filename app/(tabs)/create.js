import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import Header from "../components/header/header.js";

const { width } = Dimensions.get("window");
const CARD_SIZE = width * 0.22;  // tamanho responsivo
const CATEGORY_PADDING = width * 0.06;

export default function CreatePhraseScreen() {
  const router = useRouter();

  const [phrase, setPhrase] = React.useState('');
  const [author, setAuthor] = React.useState('');
  const [category, setCategory] = React.useState('');
  const [background, setBackground] = React.useState('#f0f0f0');

  const user = {
    name: 'Anna',
    photoURL: 'https://via.placeholder.com/40',
  };

  const handlePostPhrase = () => {
    console.log('Postando frase:', phrase);
    console.log('Autor:', author);
    console.log('Categoria:', category);
    console.log('Fundo:', background);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>

<View style={{ marginTop: 25 }}>
        <Header />
      </View>

      {/* INPUTS */}
      <TextInput
        style={styles.input}
        placeholder="Digite sua frase inspiradora aqui..."
        value={phrase}
        onChangeText={setPhrase}
      />

      <TextInput
        style={styles.input}
        placeholder="Autor(a)"
        value={author}
        onChangeText={setAuthor}
      />

      {/* FUNDO DO CARD */}
      <Text style={styles.label}>Fundo do card</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.carousel}>
        {["#f0f0f0", "#A6C8E0", "#8BB9D4", "#5D8AA8"].map((cor, i) => (
          <TouchableOpacity
            key={i}
            style={[styles.colorOption, { backgroundColor: cor }]}
            onPress={() => setBackground(cor)}
          />
        ))}
      </ScrollView>

      {/* CATEGORIAS */}
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

      {/* BOTÕES */}
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

  /* === HEADER === */
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

  /* === INPUTS === */
  input: {
    height: 60,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 20,
    paddingLeft: 20,
    fontSize: 18,
  },

  /* === LABELS === */
  label: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },

  /* === CARROSSEL === */
  carousel: {
    marginBottom: 30,
  },

  /* === OPÇÕES DE COR (RESPONSIVO) === */
  colorOption: {
    width: CARD_SIZE,
    height: CARD_SIZE,
    borderRadius: 16,
    marginRight: 18,
  },

  /* === CATEGORIAS === */
  categoryButton: {
    backgroundColor: '#f0f0f0',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 30,
    marginRight: 20,

    
  },
  selectedCategory: {
    backgroundColor: '#A6C8E0',
  },
  categoryText: {
    fontSize: 14,
    color: '#333',
    fontWeight: "600",
  },

  /* === BOTÕES === */
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
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
