import React, { useCallback, useEffect, useMemo, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Dimensions, Platform } from "react-native";
import { useAuth } from "../../contexts/AuthContext";
import API_URL from "../../utils/api";

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.85;
const SPACING = 20;
const SIDE_INSET = (width - CARD_WIDTH) / 2;
const SNAP_INTERVAL = CARD_WIDTH + SPACING;

export default function HomeScreen() {
  const { user } = useAuth();
  const normalizedUserId = useMemo(() => {
    if (typeof user?.id === "number") {
      return user.id;
    }
    const parsed = Number(user?.id);
    return Number.isNaN(parsed) ? null : parsed;
  }, [user?.id]);

  const [quoteCards, setQuoteCards] = useState([]);
  const [currentPostIndex, setCurrentPostIndex] = useState(0);
  const [categoriesData, setCategoriesData] = useState([]);

  const fetchPosts = useCallback(() => {
    if (!normalizedUserId) return;
    fetch(`${API_URL}/posts`)
      .then(response => response.json())
      .then(data => {
        const processedData = data.map(post => {
          const likesArray = Array.isArray(post.likes) ? post.likes : [];
          const userLike = likesArray.find(l => Number(l.userId) === normalizedUserId);
          const likeCount = likesArray.length > 0 ? likesArray.length : (post.numberLikes ?? 0);
          return {
            ...post,
            likes: likesArray,
            numberLikes: likeCount,
            isLiked: Boolean(userLike),
            userLikeId: userLike?.id ?? null,
          };
        });
        setQuoteCards(processedData);
      })
      .catch(error => console.error("Erro ao buscar posts:", error));
  }, [normalizedUserId]);

  useEffect(() => {
    fetchPosts();
  }, [fetchPosts]);

  const handleLike = async (postId) => {
    if (!normalizedUserId) return;
    const targetCard = quoteCards.find(card => card.id === postId);
    if (!targetCard) return;
    const existingLikeId = targetCard.userLikeId
      || targetCard.likes?.find(like => Number(like.userId) === normalizedUserId)?.id;

    const updateCardState = (isLiked, newLikeId, delta) => {
      setQuoteCards(prevCards => prevCards.map(card => {
        if (card.id !== postId) return card;
        const likesArray = Array.isArray(card.likes) ? card.likes : [];
        const filteredLikes = likesArray.filter(like => Number(like.userId) !== normalizedUserId);
        const updatedLikes = isLiked
          ? [...filteredLikes, { id: newLikeId, userId: normalizedUserId }]
          : filteredLikes;
        const currentCount = typeof card.numberLikes === "number"
          ? card.numberLikes
          : likesArray.length;
        return {
          ...card,
          isLiked,
          userLikeId: newLikeId,
          likes: updatedLikes,
          numberLikes: Math.max(0, currentCount + delta),
        };
      }));
    };

    try {
      if (existingLikeId) {
        await fetch(`${API_URL}/registros-curtida/${existingLikeId}`, {
          method: 'DELETE',
        });
        updateCardState(false, null, -1);
      } else {
        const response = await fetch(`${API_URL}/registros-curtida`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ postId, userId: normalizedUserId }),
        });
        if (!response.ok) {
          throw new Error('Não foi possível registrar a curtida.');
        }
        const createdLike = await response.json();
        updateCardState(true, createdLike?.id ?? null, 1);
      }
      fetchPosts();
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
              source={user?.avatarUrl ? { uri: user.avatarUrl } : require("../../assets/profile.png")}
              style={styles.avatarImage}
            />
          </View>
          <Text style={styles.greeting}>Good Morning, {user?.name || "User"}</Text>
        </View>

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
              <Text style={styles.buttonText}>
                {getCategoryDescription(catRel).toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
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
    paddingVertical: 4,
    borderRadius: 12,
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
    borderWidth: 1,
    borderColor: "#000000",
  },
  buttonText: {
    fontSize: 12,
    fontWeight: "bold",
    textAlign: 'center',
    color: "#000000",
  },
});
