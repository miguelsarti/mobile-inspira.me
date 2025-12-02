import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Dimensions, Platform } from "react-native";
import { useAuth } from "../../contexts/AuthContext";
import { Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get('window');
const ITEM_WIDTH = width * 0.4;

export default function HomeScreen() {
  const { user } = useAuth();

  const [quoteCards, setQuoteCards] = useState([]);
  const [carouselItems, setCarouselItems] = useState([]);

  useEffect(() => {
    fetch('http://localhost:5000/posts')
      .then(response => response.json())
      .then(data => setQuoteCards(data))
      .catch(error => console.error("Erro ao buscar posts:", error));
  }, []);

  useEffect(() => {
    fetch('http://localhost:5000/categories')
      .then(response => response.json())
      .then(data => {
        const formattedItems = data.map((item, index) => ({
          key: item.id ? String(item.id) : String(index),
          text: item.name ? item.name.toUpperCase() : "ITEM",
          isSelected: index === 0
        }));
        setCarouselItems(formattedItems);
      })
      .catch(error => console.error(error));
  }, []);

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
            <Text style={styles.quoteText}>{item.description}</Text>
            <View style={styles.line} />
            <Text style={styles.author}>{item.ownerPost}</Text>
            {/* Verifica se existe imagem antes de renderizar para evitar erro */}
            {item.image ? (
              <Image source={{ uri: item.image }} style={styles.logo} />
            ) : null}
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