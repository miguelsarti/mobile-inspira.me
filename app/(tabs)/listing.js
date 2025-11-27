import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Header from "../components/header/header.js";

export default function ExploreScreen() {
  const categorias = [
    { titulo: "Alegria", frases: ["frase 1", "frase 2", "frase 3"] },
    { titulo: "Amor", frases: ["frase 1", "frase 2", "frase 3"] },
    { titulo: "Motivacional", frases: ["frase 1", "frase 2", "frase 3"] },
    { titulo: "Motivacional", frases: ["frase 1", "frase 2", "frase 3"] },
    { titulo: "Motivacional", frases: ["frase 1", "frase 2", "frase 3"] },
    { titulo: "Motivacional", frases: ["frase 1", "frase 2", "frase 3"] },
    { titulo: "Motivacional", frases: ["frase 1", "frase 2", "frase 3"] },
    { titulo: "Motivacional", frases: ["frase 1", "frase 2", "frase 3"] },
  ];

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
          placeholder="Pesquisar"
          style={styles.input}
          placeholderTextColor="#6B8EAE"
        />
      </View>

      {categorias.map((cat, idx) => (
        <View key={idx} style={styles.categoryBlock}>
          <Text style={styles.category}>{cat.titulo}</Text>

          <View style={styles.cardRow}>
            {cat.frases.map((frase, i) => (
              <TouchableOpacity key={i} style={styles.card}>
                <Text style={styles.cardText}>{frase}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      ))}
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

  cardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  card: {
    width: "30%",
    paddingVertical: 35,
    backgroundColor: "#E4EEF8",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",

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
  },
});
