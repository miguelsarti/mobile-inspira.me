import React from "react";
import { View, Text, StyleSheet, Image } from "react-native";
import { useAuth } from "../../../contexts/AuthContext.js";

export default function HomeScreen() {
  const { user } = useAuth();

  return (
    <View style={styles.header}>
      <View style={styles.headerLeft}>
        <View style={styles.userAvatar}>
          <Image
            source={user?.avatarUrl ? { uri: user.avatarUrl } : require("../../../assets/profile.png")}
            style={styles.avatarImage}
          />
        </View>
        <Text style={styles.greeting}>
          Good Morning, {user?.name || "User"}
        </Text>
      </View>

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
});
