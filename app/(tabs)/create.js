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
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import Header from "../components/header/header.js";
import { useAuth } from '../../contexts/AuthContext';

const { width } = Dimensions.get("window");
const CARD_SIZE = width * 0.20;
const API_URL = "http://localhost:5000";


export default function CreatePhraseScreen() {
  const router = useRouter();
  // Assume que useAuth fornece o objeto 'user' com 'id' e 'name'
  const { user } = useAuth(); 

  const [phrase, setPhrase] = React.useState('');
  const [author, setAuthor] = React.useState('');
  const [category, setCategory] = React.useState('');
  const [background, setBackground] = React.useState('#f0f0f0');
  const [isLoading, setIsLoading] = React.useState(false);
  const [validationError, setValidationError] = React.useState(false); // Novo estado

  // Mapeamento de Cores e Categorias para o ScrollView
  const colors = ["#f0f0f0", "#A6C8E0", "#8BB9D4", "#5D8AA8"];
  const categories = ["AMOR", "FAMÍLIA", "AMIZADE", "MOTIVAÇÃO"];

  const createPostOnBackend = async (postData) => {
    try {
      const response = await fetch(`${API_URL}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let errorMessage = 'Erro ao criar post no servidor';
        try {
          const errorData = JSON.parse(errorText);
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          errorMessage = errorText;
        }
        throw new Error(errorMessage);
      }

      const createdPost = await response.json();
      return createdPost;
    } catch (error) {
      console.error('Erro ao criar post:', error);
      throw error;
    }
  };
  const handlePostPhrase = async () => {
    // 1. Validação de campos
    if (!phrase.trim() || !category.trim()) {
      Alert.alert("Atenção", "Preencha a frase e selecione uma categoria para postar.");
      setValidationError(true); // Ativa o feedback visual
      return;
    }
    setValidationError(false); // Desativa se a validação passar

    // 2. Validação de Autenticação
    if (!user || !user.id) {
      Alert.alert("Erro", "Você precisa estar autenticado para postar.");
      return;
    }

    setIsLoading(true);

    // 3. Montar o objeto Postagem para envio
    const newPost = {
      // O nome do campo `description` é do seu modelo Postagem
      description: phrase.trim(),
      // `ownerPost` é o nome do autor (o nome do usuário ou o nome que ele digitar)
      ownerPost: author.trim() || user.name || 'Anônimo', 
      // `userId` é obrigatório para o relacionamento
      userId: user.id, 
      backgroundColor: background,
      // O back-end precisará saber qual categoria buscar/criar
      categories: [category], 
      numberLikes: 0,
      numberShares: 0,
    };
    
    try {
      // 4. Enviar para o Back-end
      const createdPost = await createPostOnBackend(newPost);
      
      // 5. Sucesso e Limpeza
      Alert.alert("Sucesso 🎉", "Seu post foi criado com sucesso!");
      
      setPhrase('');
      setAuthor('');
      setCategory('');
      setBackground('#f0f0f0');

      // Redirecionar para a home após sucesso
      router.replace('/(tabs)/home');
    } catch (error) {
      // 6. Tratamento de Erro
      console.error("Erro ao postar:", error);
      Alert.alert("Erro", error.message || "Não foi possível criar o post. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <ScrollView contentContainerStyle={styles.container}>

      <View style={{ marginTop: 25 }}>
        <Header />
      </View>

      <Text style={styles.title}>Criar Nova Frase</Text>

      <TextInput
        style={[
            styles.inputPhrase,
            validationError && !phrase.trim() && { borderColor: 'red', borderWidth: 2 } // Feedback de erro
        ]}
        placeholder="Digite sua frase inspiradora aqui..."
        value={phrase}
        onChangeText={setPhrase}
        multiline={true}
        autoCorrect={true}
      />

      <TextInput
        style={styles.inputAuthor}
        placeholder="Autor(a) (Opcional)"
        value={author}
        onChangeText={setAuthor}
      />

      <Text style={styles.label}>Fundo do card</Text>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.carousel}>
        {colors.map((cor, i) => (
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
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat}
            style={[
              styles.categoryButton,
              category === cat ? styles.selectedCategory : 
              validationError && !category.trim() && { borderColor: 'red', borderWidth: 2 } // Feedback de erro
            ]}
            onPress={() => setCategory(cat)}
          >
            <Text style={category === cat ? styles.selectedCategoryText : styles.categoryText}>{cat}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.postButton, { backgroundColor: '#3498db' }]}
          onPress={handlePostPhrase}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Postar Frase</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.postButton, { backgroundColor: '#ccc' }]}
          onPress={() => router.back()}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>Cancelar</Text>
        </TouchableOpacity>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  // ... (Seus estilos existentes)
  container: {
    padding: 20,
    backgroundColor: '#fff',
    minHeight: Dimensions.get('window').height, // Garante que a tela preenche o mínimo
  },
  title: {
    fontSize: 24,
    textAlign: "center",
    marginTop: 20,
    marginBottom: 25,
    fontWeight: "600",
    color: "#2E3A59",
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
    borderWidth: 3, // Aumentei para melhor visualização
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
    backgroundColor: '#3498db', // Cor mais contrastante para seleção
    borderWidth: 1,
    borderColor: '#3498db',
  },
  categoryText: {
    fontSize: 14,
    color: '#333',
    fontWeight: "600",
  },
  selectedCategoryText: { // Novo estilo para o texto da categoria selecionada
    fontSize: 14,
    color: '#fff',
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