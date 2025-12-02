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
    { titulo: "Alegria", frases: ["Sorrir ilumina a alma", "A vida é leve", "Felicidade mora no agora"] },
    { titulo: "Amor", frases: ["Amar transforma", "O amor acalma", "Você é importante"] },
    { titulo: "Motivacional", frases: ["Acredite em você", "Cada dia é uma chance", "Foco e coragem"] },
    { titulo: "Motivacional", frases: ["Você consegue", "O esforço vale a pena", "O impossível é treino"] },
    { titulo: "Motivacional", frases: ["Vá além", "Um passo por vez", "Seja melhor hoje"] },
    { titulo: "Motivacional", frases: ["Persistência vence", "Energia atrai", "Nada muda se você não mudar"] },
    { titulo: "Motivacional", frases: ["Sonhe alto", "Trabalhe em silêncio", "Resultados falam"] },
    { titulo: "Motivacional", frases: ["Nunca desista", "Você é forte", "A jornada é sua"] },
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

          {/* CARROSSEL HORIZONTAL AQUI */}
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {cat.frases.map((frase, i) => (
              <TouchableOpacity key={i} style={styles.cardCarousel}>
                <Text style={styles.cardText}>{frase}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

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

  /* NOVO CARD PARA CARROSSEL */
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
});
