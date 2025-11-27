import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../contexts/AuthContext";
import { useRouter } from "expo-router";

export default function ProfileScreen() {
  const { user } = useAuth();
  const router = useRouter();

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
     
      <TouchableOpacity style={styles.editProfile}>
        <Text style={styles.editProfileText}>Editar Perfil</Text>
      </TouchableOpacity>

     
      <View style={styles.avatarWrapper}>
        <Image
          source={{ uri: "https://www.casadoartista.com.br/arquivos/PRODUTOS/365174051690547445/2076_G_Guardanapo-Estampado-Passaro-Azul-para-decou_49.webp" }}
          style={styles.avatar}
        />
      </View>

     
      <Text style={styles.greeting}>Olá, {user?.name || "Sarah"}</Text>

    
      <View style={styles.actions}>
        <TouchableOpacity style={[styles.actionButton, styles.active]}>
          <Ionicons name="document-text-outline" size={20} color="#000" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => router.push("/favoritos")}
        >
          <Ionicons name="heart-outline" size={20} color="#000" />
        </TouchableOpacity>
      </View>

      
      <Text style={styles.sectionTitle}>Frases criadas:</Text>

      {[1, 2, 3].map((item) => (
        <View key={item} style={styles.quoteCard}>
          <Text style={styles.quoteText}>
            “Aquele que tem uma razão para viver pode quase tudo"
          </Text>
          <View style={styles.divider} />
          <Text style={styles.author}>Friedrich Nietzsche</Text>
          <TouchableOpacity style={styles.editQuote}>
            <Ionicons name="pencil" size={16} color="#555" />
          </TouchableOpacity>
        </View>
      ))}

     
      <TouchableOpacity style={styles.seeMore}>
        <Text style={styles.seeMoreText}>Ver mais</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  content: {
    alignItems: "center",
    padding: 20,
  },
  editProfile: {
    alignSelf: "flex-end",
  },
  editProfileText: {
    color: "#2979FF",
    fontSize: 14,
  },
  avatarWrapper: {
    width: 110,
    height: 110,
    borderRadius: 55,
    overflow: "hidden",
    marginTop: 10,
  },
  avatar: {
    width: "100%",
    height: "100%",
  },
  greeting: {
    marginTop: 10,
    fontSize: 18,
    color: "#2979FF",
    fontWeight: "500",
  },
  actions: {
    flexDirection: "row",
    backgroundColor: "#E0E0E0",
    borderRadius: 30,
    marginTop: 15,
  },
  actionButton: {
    paddingVertical: 10,
    paddingHorizontal: 25,
    borderRadius: 30,
  },
  active: {
    backgroundColor: "#8BB8E8",
  },
  sectionTitle: {
    marginTop: 25,
    fontWeight: "bold",
    fontSize: 14,
  },
  quoteCard: {
    width: "100%",
    backgroundColor: "#F5F5F5",
    borderRadius: 15,
    padding: 15,
    marginTop: 15,
    position: "relative",
  },
  quoteText: {
    fontSize: 13,
    textAlign: "center",
    color: "#333",
  },
  divider: {
    height: 1,
    backgroundColor: "#ccc",
    marginVertical: 10,
  },
  author: {
    fontStyle: "italic",
    fontWeight: "600",
    textAlign: "center",
  },
  editQuote: {
    position: "absolute",
    right: 15,
    bottom: 15,
  },
  seeMore: {
    marginTop: 20,
    backgroundColor: "#DCE8F7",
    paddingHorizontal: 25,
    paddingVertical: 8,
    borderRadius: 8,
  },
  seeMoreText: {
    color: "#333",
    fontWeight: "500",
  },
});
