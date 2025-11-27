import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

// Dados mockados para exemplo inicial
const mockPhrases = [
  {
    id: '1',
    text: 'A jornada de mil milhas começa com um único passo.',
    author: 'Lao Tzu',
    likes: 156
  },
  {
    id: '2',
    text: 'Seja a mudança que você quer ver no mundo.',
    author: 'Mahatma Gandhi',
    likes: 243
  },
  {
    id: '3',
    text: 'Acredite que você pode e você está no meio do caminho.',
    author: 'Theodore Roosevelt',
    likes: 189
  },
  {
    id: '4',
    text: 'O sucesso é a soma de pequenos esforços repetidos dia após dia.',
    author: 'Robert Collier',
    likes: 127
  },
  {
    id: '5',
    text: 'Sua única limitação é você mesmo.',
    author: 'Anonymous',
    likes: 198
  }
];

export default function ListingScreen() {
  const router = useRouter();

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.phraseCard}
      onPress={() => {
        router.push(`/tabs/${item.id}`);
      }}
    >
      <View style={styles.userInfo}>
        <Text style={styles.avatar}>{item.avatar}</Text>
        <Text style={styles.userName}>{item.name}</Text>
      </View>
      <Text style={styles.phraseText}>"{item.text}"</Text>
      <View style={styles.authorContainer}>
        <Text style={styles.authorText}>- {item.author}</Text>
        <Text style={styles.likesText}>❤️ {item.likes}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.header}>inspira.me</Text>
      <FlatList
        data={mockPhrases}
        renderItem={renderItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    paddingTop: 20
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 20,
    color: '#333'
  },
  listContainer: {
    padding: 16
  },
  phraseCard: {
    backgroundColor: '#f8f9fa',
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatar: {
    fontSize: 24,
    marginRight: 8,
  },
  userName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
  },
  phraseText: {
    fontSize: 18,
    color: '#2c3e50',
    marginBottom: 8,
    lineHeight: 24
  },
  authorContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#eee'
  },
  authorText: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic'
  },
  likesText: {
    fontSize: 14,
    color: '#e74c3c'
  }
});