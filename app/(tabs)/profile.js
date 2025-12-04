import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
  Modal,
  TextInput,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function ProfileScreen() {
  const [selectedTab, setSelectedTab] = useState("liked");

  // 🔹 FRASES CRIADAS
  const [createdQuotes, setCreatedQuotes] = useState([
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
  ]);

  // 🔹 FRASES CURTIDAS
  const [likedQuotes, setLikedQuotes] = useState([
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
  ]);

  // 🔹 CONTROLA MODAL DE EDIÇÃO
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [phraseBeingEdited, setPhraseBeingEdited] = useState(null);
  const [editedText, setEditedText] = useState("");

  // Abrir menu de edição
  const openEditOptions = (item) => {
    setPhraseBeingEdited(item);
    setEditedText(item.text);
    setEditModalVisible(true);
  };

  // Salvar frase editada
  const saveEditedPhrase = () => {
    setCreatedQuotes((prev) =>
      prev.map((q) =>
        q.id === phraseBeingEdited.id ? { ...q, text: editedText } : q
      )
    );

    setEditModalVisible(false);
  };

  // Apagar frase criada
  const deletePhrase = () => {
    setCreatedQuotes((prev) => prev.filter((q) => q.id !== phraseBeingEdited.id));
    setEditModalVisible(false);
  };

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

        {/* LISTA DE FRASES */}
        {selectedTab === "liked"
          ? likedQuotes.map((item) => (
              <View key={item.id} style={styles.quoteCard}>
                <Text style={styles.quoteText}>"{item.text}"</Text>
                <View style={styles.line}></View>

                <Text style={styles.author}>{item.author}</Text>

                <TouchableOpacity style={styles.editButton}>
                  <Ionicons name="heart" size={22} color="#000" />
                </TouchableOpacity>
              </View>
            ))
          : createdQuotes.map((item) => (
              <View key={item.id} style={styles.quoteCard}>
                <Text style={styles.quoteText}>"{item.text}"</Text>
                <View style={styles.line}></View>

                <Text style={styles.author}>{item.author}</Text>

                {/* ÍCONE CLICÁVEL PARA EDITAR/APAGAR */}
                <TouchableOpacity
                  style={styles.editButton}
                  onPress={() => openEditOptions(item)}
                >
                  <Ionicons name="document-text-outline" size={22} color="#000" />
                </TouchableOpacity>
              </View>
            ))}
      </View>

      {/* MODAL DE EDIÇÃO */}
      <Modal visible={editModalVisible} transparent animationType="slide">
        <View style={styles.modalBackground}>
          <View style={styles.modalBox}>

            <Text style={styles.modalTitle}>Editar frase</Text>

            <TextInput
              style={styles.input}
              value={editedText}
              onChangeText={setEditedText}
              multiline
            />

            <View style={styles.modalButtons}>
              <TouchableOpacity style={styles.saveButton} onPress={saveEditedPhrase}>
                <Text style={styles.saveText}>Salvar</Text>
              </TouchableOpacity>

              <TouchableOpacity style={styles.deleteButton} onPress={deletePhrase}>
                <Ionicons name="trash" size={22} color="#fff" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={() => setEditModalVisible(false)}
              style={{ marginTop: 10 }}
            >
              <Text style={{ color: "#333" }}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  editProfile: { alignSelf: "flex-end", margin: 20 },
  editProfileText: {
    color: "#007AFF",
    fontSize: 14,
    fontWeight: "600",
  },

  content: { width: "100%", alignItems: "center" },

  avatarContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: "hidden",
    marginBottom: 10,
  },
  avatar: { width: "100%", height: "100%" },

  name: { fontSize: 22, fontWeight: "600", marginBottom: 20 },

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

  tabSelected: { backgroundColor: "#76A7E1" },

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

  quoteText: { fontSize: 14, color: "#333", marginBottom: 10 },

  line: {
    height: 1,
    width: 250,
    backgroundColor: "black",
    alignSelf: "center",
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

  // Modal
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalBox: {
    width: "85%",
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
  },

  modalTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },

  input: {
    backgroundColor: "#EEE",
    borderRadius: 8,
    padding: 10,
    height: 100,
    marginBottom: 20,
    textAlignVertical: "top",
  },

  modalButtons: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  saveButton: {
    backgroundColor: "#4CAF50",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  saveText: { color: "#fff", fontSize: 16 },

  deleteButton: {
    backgroundColor: "#E53935",
    padding: 10,
    borderRadius: 8,
  },
});