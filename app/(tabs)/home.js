import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Dimensions, Platform } from "react-native";
import { useAuth } from "../../contexts/AuthContext";
import { Ionicons } from "@expo/vector-icons";
import API_URL from "../../utils/api";

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.85;
const SPACING = 20;
const SIDE_INSET = (width - CARD_WIDTH) / 2;
const SNAP_INTERVAL = CARD_WIDTH + SPACING;

export default function HomeScreen() {
  const { user } = useAuth();

  const [quoteCards, setQuoteCards] = useState([]);
  const [currentPostIndex, setCurrentPostIndex] = useState(0);
  const [categoriesData, setCategoriesData] = useState([]);

  useEffect(() => {
    if (!user) return;

    fetch(`${API_URL}/posts`)
      .then(response => response.json())
      .then(data => {
        const processedData = data.map(post => ({
          ...post,
          isLiked: post.likes ? post.likes.some(l => l.userId === user.id) : false
        }));
        setQuoteCards(processedData);
      })
      .catch(error => console.error("Erro ao buscar posts:", error));
  }, [user]);

  const handleLike = async (postId) => {
    setQuoteCards(prevCards => prevCards.map(card => {
      if (card.id === postId) {
        const wasLiked = card.isLiked;
        return {
          ...card,
          isLiked: !wasLiked,
          numberLikes: wasLiked ? (card.numberLikes - 1) : (card.numberLikes + 1)
        };
      }
      return card;
    }));

    try {
      await fetch(`${API_URL}/likes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, userId: user.id })
      });
    } catch (error) {
      console.error("Erro ao curtir:", error);
    }
  };

  useEffect(() => {
    fetch(`${API_URL}/categorias`)
      .then(response => response.json())
      .then(data => {
        const items = Array.isArray(data) ? data : [];
        setCategoriesData(items);
      })
      .catch(error => console.error("Erro ao buscar categorias:", error));
  }, []);

  const getCategoryDescription = (catRel) => {
    if (catRel.category && catRel.category.description) {
      return catRel.category.description;
    }
    if (categoriesData.length > 0 && catRel.categoryId) {
      const cat = categoriesData.find(c => c.id === catRel.categoryId);
      if (cat && cat.description) return cat.description;
    }
    return "Categoria";
  };

  const handleScroll = (event) => {
    const x = event.nativeEvent.contentOffset.x;
    const index = Math.round(x / SNAP_INTERVAL);
    if (index >= 0 && index < quoteCards.length) {
      setCurrentPostIndex(index);
    }
  };

  const currentPost = quoteCards[currentPostIndex];
  const currentCategories = currentPost?.categories || [];

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

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingVertical: 20, paddingHorizontal: SIDE_INSET }}
        snapToInterval={SNAP_INTERVAL}
        snapToAlignment="center"
        decelerationRate="fast"
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {quoteCards.map((item, index) => (
          <View
            style={[
              styles.quoteCard,
              { backgroundColor: item.backgroundColor || "#E4EEF8" }
            ]}
            key={index}
          >
            <View style={styles.cardContent}>
              <Text style={styles.quoteText}>{item.description}</Text>
              <View style={styles.line} />
              <Text style={styles.author}>{item.ownerPost}</Text>
              {item.image ? (
                <Image source={{ uri: item.image }} style={styles.logo} />
              ) : null}
            </View>

            <TouchableOpacity onPress={() => handleLike(item.id)} style={styles.likeButton}>
              <Image
                source={require('../../assets/heart.png')}
                style={[styles.heartIcon, { tintColor: item.isLiked ? 'red' : 'black' }]}
              />
              <Text style={styles.likeCount}>{item.numberLikes || 0}</Text>
            </TouchableOpacity>
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
          {currentCategories.map((catRel, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.carouselButton,
                { backgroundColor: catRel.background || '#E4EEF8' }
              ]}
            >
              <Text style={[styles.buttonText, { color: '#FFF' }]}>
                {getCategoryDescription(catRel).toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>      <View style={{ height: 40 }} />
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
    width: width * 0.85,
    height: 380,
    backgroundColor: "#E4EEF8",
    borderRadius: 20,
    padding: 20,
    justifyContent: "space-between",
    marginRight: 20,
    borderWidth: 1,
    borderColor: "#000",
  },
  cardContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    marginBottom: 20,
  },
  postCategoriesContainer: {
    height: 30,
    width: '100%',
  },
  categoryBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4, // Diminuído conforme solicitado
    borderRadius: 12, // Border radius ajustado
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
    minWidth: 60,
  },
  categoryText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold',
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
  likeButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 5,
  },
  heartIcon: {
    width: 24,
    height: 24,
    marginRight: 5,
    resizeMode: 'contain'
  },
  likeCount: {
    fontSize: 16,
    color: "#2E3A59",
    fontWeight: "500",
  },

  carouselContainer: {
    marginHorizontal: -20,
  },
  scrollViewContent: {
    paddingHorizontal: 20,
  },
  carouselButton: {
    width: 110,
    height: 110,
    marginRight: 15,
    marginTop: 30,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
  },
  buttonText: {
    fontSize: 12,
    fontWeight: "bold",
    textAlign: 'center',
  },
});