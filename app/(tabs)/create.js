import React from 'react'; 
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons'; // Importando o Ionicons para o ícone de menu
import Header from '../components/header/header.js'

export default function CreatePhraseScreen() {
  const router = useRouter();
  const [phrase, setPhrase] = React.useState('');
  const [author, setAuthor] = React.useState('');
  const [category, setCategory] = React.useState('');
  const [background, setBackground] = React.useState('#f0f0f0'); // Alterado para um cinza claro
  const user = {
    name: 'Anna', // Substitua com dados reais de usuário
    photoURL: 'https://via.placeholder.com/40', // Substitua com dados reais de foto
  };

  const handlePostPhrase = () => {
    console.log('Postando frase:', phrase);
    console.log('Autor:', author);
    console.log('Categoria:', category);
    console.log('Fundo:', background);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* HEADER */}
      <Header/>

      {/* Input de Frase e Autor */}
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
      
      <Text style={styles.label}>Fundo do card</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.carousel}>
        <TouchableOpacity
          style={[styles.colorOption, { backgroundColor: background }]}
          onPress={() => setBackground('#f0f0f0')}  // Alterado para cinza claro
        />
        <TouchableOpacity
          style={[styles.colorOption, { backgroundColor: '#A6C8E0' }]}
          onPress={() => setBackground('#A6C8E0')}
        />
        <TouchableOpacity
          style={[styles.colorOption, { backgroundColor: '#8BB9D4' }]}
          onPress={() => setBackground('#8BB9D4')}
        />
        <TouchableOpacity
          style={[styles.colorOption, { backgroundColor: '#5D8AA8' }]}
          onPress={() => setBackground('#5D8AA8')}
        />
      </ScrollView>

      <Text style={styles.label}>Categorias</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.carousel}>
        <TouchableOpacity
          style={[
            styles.categoryButton,
            category === 'AMOR' && styles.selectedCategory
          ]}
          onPress={() => setCategory('AMOR')}
        >
          <Text style={styles.categoryText}>AMOR</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.categoryButton,
            category === 'FAMÍLIA' && styles.selectedCategory
          ]}
          onPress={() => setCategory('FAMÍLIA')}
        >
          <Text style={styles.categoryText}>FAMÍLIA</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.categoryButton,
            category === 'AMIZADE' && styles.selectedCategory
          ]}
          onPress={() => setCategory('AMIZADE')}
        >
          <Text style={styles.categoryText}>AMIZADE</Text>
        </TouchableOpacity>
      </ScrollView>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={[styles.postButton, { backgroundColor: '#3498db' }]} onPress={handlePostPhrase}>
          <Text style={styles.buttonText}>Postar Frase</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.postButton, { backgroundColor: '#ccc' }] }
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
    flex: 1,
    padding: 20, // Aumentado o padding para maior espaçamento
    backgroundColor: '#fff',
  },
  // Estilos para o HEADER
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 40, // Aumentado o espaçamento inferior
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  userAvatar: {
    width: 60, // Aumentado o tamanho do avatar
    height: 60, // Aumentado o tamanho do avatar
    borderRadius: 30, // Aumentando a borda para manter o arredondado
    backgroundColor: "#DCE6F2",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  avatarImage: {
    width: 60, // Aumentando o tamanho da imagem do avatar
    height: 60, // Aumentando o tamanho da imagem do avatar
    borderRadius: 30,
  },
  greeting: {
    fontSize: 22, // Aumentando o tamanho da saudação
    fontWeight: "600", // Deixando o texto mais grosso
    color: "#6B8EAE",
  },
  menuButton: {
    padding: 8, // Aumentando o padding do botão de menu
  },
  // Estilos para os inputs
  input: {
    height: 60, // Aumentando a altura do campo de entrada
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 12, // Tornando o campo de entrada mais arredondado
    marginBottom: 20, // Aumentando o espaçamento
    paddingLeft: 20, // Aumentando o espaçamento interno
    fontSize: 18, // Aumentando o tamanho da fonte
  },
  label: {
    fontSize: 18, // Aumentando o tamanho da fonte do rótulo
    fontWeight: '600', // Deixando mais forte
    color: '#333',
    marginBottom: 12, // Aumentando o espaçamento
  },
  carousel: {
    marginBottom: 40, // Aumentando o espaçamento entre os elementos
  },
  colorOption: {
    width: 80, // Aumentando o tamanho dos botões de cor
    height: 80, // Aumentando o tamanho dos botões de cor
    borderRadius: 16,
    marginRight: 20, // Aumentando o espaçamento entre as opções
  },
  // Estilos para os botões de categoria
  categoryButton: {
    backgroundColor: '#f0f0f0',
    height: 50, // Aumentando a altura dos botões de categoria
    paddingVertical: 10,  // Deixando o botão mais "gordinho"
    paddingHorizontal: 28,  // Aumentando o tamanho do botão
    borderRadius: 30,  // Tornando o botão mais arredondado
    marginRight: 25, // Ajustando o espaçamento
    elevation: 5,  // Sombra para dar o efeito de profundidade
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
  },
  selectedCategory: {
    backgroundColor: '#A6C8E0',
  },
  categoryText: {
    fontSize: 18, // Aumentando o tamanho da fonte das categorias
    fontWeight: '400', // Tornando o texto mais grosso
    color: '#333',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 40, // Aumentando o espaçamento entre os botões
  },
  postButton: {
    paddingVertical: 14, // Aumentando o tamanho do botão
    paddingHorizontal: 40, // Aumentando o tamanho do botão
    borderRadius: 10, // Tornando o botão mais arredondado
    flex: 1,
    alignItems: 'center',
    marginRight: 20, // Adicionado espaçamento entre os botões
  },
  buttonText: {
    fontSize: 13, // Aumentando o tamanho da fonte do botão
    color: '#fff',
    fontWeight: '600',
  },
});
