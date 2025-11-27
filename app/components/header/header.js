import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image } from "react-native";
import { useAuth } from "../../../contexts/AuthContext.js";
import { Ionicons } from "@expo/vector-icons"; // menu hamburguer

export default function HomeScreen() {
  const { user } = useAuth();

  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <View style={styles.userAvatar}>
          <Image
            source={{ uri: user?.photoURL || "https://via.placeholder.com/40" }}
            style={styles.avatarImage}
          />
        </View>
        <Text style={styles.greeting}>
          Good Morning, {user?.name || "User"}
        </Text>
      </View>

      <TouchableOpacity style={styles.menuButton}>
        <Ionicons name="menu" size={28} color="#6B8EAE" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
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
});
