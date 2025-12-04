import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function ProfileScreen() {
  const [selectedTab, setSelectedTab] = useState("liked");

  const likedQuotes = [
    {
      id: 1,
      text: "Aquele que tem uma razão para viver pode quase tudo",
      author: "Friedrich Nietzsche",
    },
    {
      id: 2,
      text: "Aquele que tem uma razão para viver pode quase tudo",
      author: "Friedrich Nietzsche",
    },
    {
      id: 3,
      text: "Aquele que tem uma razão para viver pode quase tudo",
      author: "Friedrich Nietzsche",
    },
  ];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: 40 }}
      showsVerticalScrollIndicator={false}
    >
      {/* Botão Editar Perfil */}
      <TouchableOpacity style={styles.editProfile}>
        <Text style={styles.editProfileText}>Editar Perfil</Text>
      </TouchableOpacity>

      <View style={styles.content}>
        {/* Avatar */}
        <View style={styles.avatarContainer}>
          <Image
            source={{
              uri: "https://i.imgur.com/7yUvePI.png",
            }}
            style={styles.avatar}
          />
        </View>

        <Text style={styles.name}>Olá, Sarah</Text>

        {/* Tabs */}
        <View style={styles.tabContainer}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              selectedTab === "posts" && styles.tabSelected,
            ]}
            onPress={() => setSelectedTab("posts")}
          >
            <Ionicons
              name="document-text-outline"
              size={22}
              color={selectedTab === "posts" ? "#fff" : "#000"}
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.tabButton,
              selectedTab === "liked" && styles.tabSelected,
            ]}
            onPress={() => setSelectedTab("liked")}
          >
            <Ionicons
              name={selectedTab === "liked" ? "heart" : "heart-outline"}
              size={22}
              color={selectedTab === "liked" ? "#fff" : "#000"}
            />
          </TouchableOpacity>
        </View>

        {/* Título */}
        <Text style={styles.sectionTitle}>
          {selectedTab === "liked" ? "Frases curtidas:" : "Frases criadas:"}
        </Text>

        {/* Lista de cards */}
        {likedQuotes.map((item) => (
          <View key={item.id} style={styles.quoteCard}>
            <Text style={styles.quoteText}>"{item.text}"</Text>

            <Text style={styles.author}>— {item.author}</Text>

            {/* Ícone muda de acordo com a aba selecionada */}
            <TouchableOpacity style={styles.editButton}>
              <Ionicons
                name={
                  selectedTab === "liked"
                    ? "heart"
                    : "document-text-outline" // <-- AQUI O ÍCONE QUE VOCÊ PEDIU
                }
                size={22}
                color="#000"
              />
            </TouchableOpacity>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  editProfile: {
    alignSelf: "flex-end",
    margin: 20,
  },
  editProfileText: {
    color: "#007AFF",
    fontSize: 14,
    fontWeight: "600",
  },

  content: {
    width: "100%",
    alignItems: "center",
  },

  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: "hidden",
    marginBottom: 10,
  },
  avatar: {
    width: "100%",
    height: "100%",
  },

  name: {
    fontSize: 22,
    fontWeight: "600",
    marginBottom: 20,
  },

  tabContainer: {
    flexDirection: "row",
    backgroundColor: "#E0E0E0",
    borderRadius: 25,
    padding: 4,
    marginBottom: 30,
  },

  tabButton: {
    width: 55,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },

  tabSelected: {
    backgroundColor: "#76A7E1",
  },

  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 15,
    textAlign: "center",
    width: "100%",
  },

  quoteCard: {
    width: "85%",
    backgroundColor: "#F7F7F7",
    padding: 18,
    borderRadius: 12,
    marginBottom: 15,
    position: "relative",
  },

  quoteText: {
    fontSize: 14,
    color: "#333",
    marginBottom: 10,
  },

  author: {
    fontSize: 14,
    fontWeight: "600",
    textAlign: "center",
    marginTop: 10,
  },

  editButton: {
    position: "absolute",
    bottom: 15,
    right: 15,
  },
});