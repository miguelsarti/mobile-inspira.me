import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import Header from '../components/header/header';
import { useAuth } from '../../contexts/AuthContext';
import API_URL from '../../utils/api';

const palette = ['#f0f0f0', '#A6C8E0', '#8BB9D4', '#5D8AA8'];

export default function CreatePhraseScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [phrase, setPhrase] = useState('');
  const [author, setAuthor] = useState('');
  const [background, setBackground] = useState(palette[0]);
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [isFetchingCategories, setIsFetchingCategories] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    const categories = true;
    const loadCategories = async () => {
      setIsFetchingCategories(true);
      try {
        const response = await fetch(`${API_URL}/categorias`);
        if (!response.ok) {
          throw new Error();
        }
        const data = await response.json();
        if (!categories) {
          return;
        }
        const list = Array.isArray(data) ? data : [];
        setCategories(list);
        setSelectedCategories((find) => {
          const validfind = find.filter((id) => list.some((category) => category.id === id));
          if (validfind.length) {
            return validfind;
          }
          return list[0]?.id ? [list[0].id] : [];
        });
      } catch (error) {
        if (categories) {
          Alert.alert('Erro', 'Não foi possível carregar as categorias.');
        }
      } finally {
        if (categories) {
          setIsFetchingCategories(false);
        }
      }
    };
    loadCategories();
    return () => {
      categories = false;
    };
  }, []);

    const handleValidation = () => {
    const nextErrors = {};
    if (!phrase.trim()) {
      nextErrors.phrase = true;
    }
    if (!selectedCategories.length) {
      nextErrors.category = true;
    }
    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };


  const errorMessage = async (response) => {
    try {
      return (await response.json()).message || 'Erro inesperado.';
    } catch {
      return 'Erro inesperado.';
    }
  };

   const postPhrase = async () => {
    const resolvedUserId = user?.id === 'number' ? user.id : Number(user?.id);
    if (!Number.isInteger(resolvedUserId)) {
      Alert.alert('Erro', 'Não foi possível identificar o usuário autenticado.');
      return;
    }
    if (!handleValidation()) {
      return;
    }
    setIsSubmitting(true);
    try {
      const payload = {
        description: phrase.trim(),
        ownerPost: (author.trim() || user.name),
        userId: resolvedUserId,
        backgroundColor: background,
        numberLikes: 1,
        numberShares: 1,
      };
      const response = await fetch(`${API_URL}/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) {
        const message = await errorMessage(response);
        throw new Error(message);
      }
      const createdPost = await response.json();
      const normalizeResponse = await fetch(`${API_URL}/posts/${createdPost.id}`, {
        method: 'PUT',
        headers: {
        'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          numberLikes: 0,
          numberShares: 0,
        }),
      });
      if (!normalizeResponse.ok) {
        const message = await errorMessage(normalizeResponse);
        throw new Error(message);
      }
      for (const categoryId of selectedCategories) {
        const relationResponse = await fetch(`${API_URL}/registros-categoria`, {
          method: 'POST',
          headers: {
          'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            postId: createdPost.id,
            categoryId,
            background,
          }),
        });
        if (!relationResponse.ok) {
          const message = await errorMessage(relationResponse);
          throw new Error(message);
        }
      }
      Alert.alert('Sucesso', 'Seu post foi criado com sucesso.');
      setPhrase('');
      setAuthor('');
      setBackground(palette[0]);
      setSelectedCategories((categories[0]?.id ? [categories[0].id] : []));
      setErrors({});
      router.replace('/(tabs)/home');
    } catch (error) {
      Alert.alert('Erro', error.message || 'Não foi possível criar o post.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
        <Header />

      <Text style={styles.title}>Criar Nova Frase</Text>
      <TextInput
        style={[styles.inputPhrase, errors.phrase && styles.inputError]}
        placeholder="Digite sua frase inspiradora aqui..."
        value={phrase}
        onChangeText={setPhrase}
      />
      <TextInput
        style={styles.inputAuthor}
        placeholder="Autor(a) (Opcional)"
        value={author}
        onChangeText={setAuthor}
      />
      <Text style={styles.label}>Fundo do card</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.carousel}>
        {palette.map((color) => (
          <TouchableOpacity
            key={color}
            style={[
              styles.colorOption,
              { backgroundColor: color },
              background === color && styles.selectedColor,
            ]}
            onPress={() => setBackground(color)}
            disabled={isSubmitting}
          />
        ))}
      </ScrollView>
      <Text style={styles.label}>Categorias</Text>
      {isFetchingCategories ? (
        <View style={styles.loadingCategories}>
          <ActivityIndicator size="small" color="#3498db" />
          <Text style={styles.loadingText}>Carregando categorias...</Text>
        </View>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.carousel}>
          {categories.map((category) => {
            const isSelected = selectedCategories.includes(category.id);
            return (
              <TouchableOpacity
                key={category.id}
                style={[
                  styles.categoryButton,
                  isSelected && styles.selectedCategory,
                  errors.category && styles.inputErrorBorder,
                ]}
                onPress={() => {
                  setErrors((find) => ({ ...find, category: false }));
                  setSelectedCategories((find) =>
                    find.includes(category.id)
                      ? find.filter((id) => id !== category.id)
                      : [...find, category.id]
                  );
                }}
                disabled={isSubmitting}
              >
                <Text style={isSelected ? styles.selectedCategoryText : styles.categoryText}>
                  {category.description.toUpperCase()}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.postButton, { backgroundColor: '#3498db' }]}
          onPress={postPhrase}
          disabled={isSubmitting || isFetchingCategories}
        >
          {isSubmitting ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Postar Frase</Text>
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.postButton, { backgroundColor: '#ccc' }]}
          onPress={() => router.back()}
          disabled={isSubmitting}
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
  title: {
    fontSize: 24,
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 25,
    fontWeight: '600',
    color: '#2E3A59',
  },
  inputPhrase: {
    height: 120,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 20,
    paddingLeft: 12,
    paddingTop: 12,
    fontSize: 16,
    textAlignVertical: 'top',
    textAlign: 'center',
  },
  inputAuthor: {
    height: 60,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 12,
    marginBottom: 20,
    paddingLeft: 12,
    fontSize: 16,
    textAlign: 'center',
  },
  label: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  carousel: {
    marginBottom: 40,
  },
  colorOption: {
    width: 100,
    height: 100,
    borderRadius: 12,
    marginRight: 15,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  selectedColor: {
    borderWidth: 3,
    borderColor: '#000000',
  },
  categoryButton: {
    backgroundColor: '#FCF8EC',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: 30,
    marginRight: 11,
    alignItems: 'center',
    justifyContent: 'center',
    minWidth: 120,
  },
  selectedCategory: {
    backgroundColor: '#3498db',
    borderWidth: 1,
    borderColor: '#3498db',
  },
  categoryText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
    textAlign: 'center',
  },
  selectedCategoryText: {
    fontSize: 14,
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 60,
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
  inputError: {
    borderColor: '#e74c3c',
    borderWidth: 2,
  },
  inputErrorBorder: {
    borderColor: '#e74c3c',
    borderWidth: 2,
  },
  loadingCategories: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 40,
  },
  loadingText: {
    marginLeft: 10,
    color: '#2E3A59',
  },
});