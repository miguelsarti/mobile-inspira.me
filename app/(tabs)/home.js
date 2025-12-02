import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Dimensions, Platform } from "react-native";
import { useAuth } from "../../contexts/AuthContext";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get('window');
const ITEM_WIDTH = width * 0.4;

export default function HomeScreen() {
  const { user } = useAuth();

  const carouselItems = [
    { key: 'futuro', text: 'FUTURO', isSelected: false },
    { key: 'planejamento', text: 'PLANEJAMENTO', isSelected: true },
    { key: 'acao', text: 'AÇÃO', isSelected: false },
    { key: 'proximo', text: 'PRÓXIMO PASSO', isSelected: false },
  ];

  const quoteCards = [
    {
      text: "“The best way to predict the future is to create it”",
      author: "Peter Drucker",
      image: "https://images.tcdn.com.br/img/img_prod/1088883/passaros_ii_guardanapos_para_decupagem_197_4_2958d1ac26eae9034e947c17e5414dd4.jpg"
    },
    {
      text: "“Success is not final, failure is not fatal: it is the courage to continue that counts.”",
      author: "Winston Churchill",
      image: "https://i.pinimg.com/474x/83/8f/89/838f89978d72556b31e8d9c19f7c78e6.jpg"
    },
    {
      text: "“Small steps every day lead to big results.”",
      author: "Unknown",
      image: "https://i.pinimg.com/474x/4a/22/32/4a22321ad6d9a1c75bf8d923bed5a6c2.jpg"
    },
    {
      text: "“Believe you can and you're halfway there.”",
      author: "Theodore Roosevelt",
      image: "https://i.pinimg.com/474x/4e/fd/85/4efd85009e50d81d3a12cc779ddd44a6.jpg"
    },
  ];

  const renderCarouselItem = ({ text, isSelected, key }) => (
    <TouchableOpacity
      key={key}
      style={[styles.carouselButton, isSelected ? styles.buttonSelected : styles.buttonLight]}
    >
      <Text style={styles.buttonText}>{text}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView style={styles.container}>

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

      {/* CARROSSEL DE FRASES */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingVertical: 20 }}
      >
        {quoteCards.map((item, index) => (
          <View style={styles.quoteCard} key={index}>
            <Text style={styles.quoteText}>{item.text}</Text>
            <View style={styles.line} />
            <Text style={styles.author}>{item.author}</Text>
            <Image source={{ uri: item.image }} style={styles.logo} />
          </View>
        ))}
      </ScrollView>

      <View style={{ flex: 1 }} />

      <View style={styles.carouselContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollViewContent}
          alwaysBounceHorizontal={true}
        >
          {carouselItems.map(renderCarouselItem)}
        </ScrollView>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'android' ? 50 : 60,
  },

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

  quoteCard: {
    width: width * 0.75,
    backgroundColor: "#E4EEF8",
    borderRadius: 12,
    paddingVertical: 40,
    paddingHorizontal: 15,
    alignItems: "center",
    marginRight: 20,
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

  carouselContainer: {
    marginHorizontal: -20,
  },
  scrollViewContent: {
    paddingHorizontal: 20,
  },
  carouselButton: {
    width: ITEM_WIDTH,
    paddingVertical: 35,
    marginRight: 15,
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
    minWidth: 100,
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
    textAlign: "center",
  },
});
