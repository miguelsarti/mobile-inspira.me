import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { useAuth } from "../../contexts/AuthContext";
import { Ionicons } from "@expo/vector-icons"; // menu hamburguer

export default function HomeScreen() {
  const { user } = useAuth();

  return (
    <View style={styles.container}>
      {/* HEADER */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.userAvatar}>
            <Image
              source={{ uri: user?.photoURL || "https://via.placeholder.com/40" }}
              style={styles.avatarImage}
            />
          </View>
          <Text style={styles.greeting}>Good Morning, {user?.name || "User"}</Text>
        </View>

        <TouchableOpacity style={styles.menuButton}>
          <Ionicons name="menu" size={28} color="#6B8EAE" />
        </TouchableOpacity>
      </View>

      {/* QUOTE CARD */}
      <View style={styles.quoteCard}>
        <Text style={styles.quoteText}>
          “The best way to predict the future is to create it”
        </Text>
        <View style={styles.line} />
        <Text style={styles.author}>Peter Drucker</Text>
        <Image
          source={{ uri: "https://images.tcdn.com.br/img/img_prod/1088883/passaros_ii_guardanapos_para_decupagem_197_4_2958d1ac26eae9034e947c17e5414dd4.jpg" }} // logo do site
          style={styles.logo}
        />
      </View>

      {/* PUSH CONTENT TO END */}
      <View style={{ flex: 1 }} />

      {/* BUTTONS (mais para o final da tela) */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={[styles.button, styles.buttonLight]}>
          <Text style={styles.buttonText}>FUTURO</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.buttonSelected]}>
          <Text style={styles.buttonText}>PLANEJAMENTO</Text>
        </TouchableOpacity>

        <TouchableOpacity style={[styles.button, styles.buttonLight]}>
          <Text style={styles.buttonText}>AÇÃO</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingTop: 50,
  },

  // HEADER
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
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#DCE6F2",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  avatarImage: {
    width: 40,
    height: 40,
    borderRadius: 20,
  },
  greeting: {
    fontSize: 16,
    fontWeight: "500",
    color: "#6B8EAE",
  },
  menuButton: {
    padding: 6,
  },

  // QUOTE CARD
  quoteCard: {
    backgroundColor: "#E4EEF8",
    borderRadius: 12,
    paddingVertical: 60,
    paddingHorizontal: 15,
    alignItems: "center",
    marginBottom: 20,
  },
  quoteText: {
    fontSize: 18,
    fontStyle: "italic",
    textAlign: "center",
    color: "#2E3A59",
    marginBottom: 15,
  },
  line: {
    width: "60%",
    height: 1,
    backgroundColor: "#6B8EAE",
    marginBottom: 10,
  },
  author: {
    fontSize: 16,
    color: "#2E3A59",
    fontWeight: "600",
    marginBottom: 15,
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginTop: 5,
  },

  // BUTTONS
  buttonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 150, // distância da borda inferior
  },
  button: {
    width: "30%",
    paddingVertical: 40,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  buttonLight: {
    backgroundColor: "#E4EEF8",
  },
  buttonSelected: {
    backgroundColor: "#B6CCE5",
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "500",
    color: "#2E3A59",
  },
});
