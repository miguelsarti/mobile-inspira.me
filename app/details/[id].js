import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
  Platform,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import API_URL from "../../utils/api";
import { useAuth } from "../../contexts/AuthContext";

const { width } = Dimensions.get("window");

export default function PostDetalhes() {
  const { id } = useLocalSearchParams();
  const { user } = useAuth();
  const router = useRouter();

  const [post, setPost] = useState(null);
  const [categoriesData, setCategoriesData] = useState([]);

  useEffect(() => {
    fetch(`${API_URL}/posts/${id}`)
      .then((res) => res.json())
      .then((json) => {
        setPost(json);
      })
      .catch((err) => console.log(err));
  }, []);

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

  if (!post) {
    return (
      <View style={styles.loadingContainer}>
        <Text>Carregando...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <View style={styles.avatarCircle}>
            <Image
              source={{
                uri: user?.photoURL || "https://via.placeholder.com/40",
              }}
              style={styles.avatar}
            />
          </View>
          <View>
            <Text style={styles.goodMorning}>Good Morning,</Text>
            <Text style={styles.userName}>{user?.name || "User"}</Text>
          </View>
        </View>

        <TouchableOpacity onPress={() => router.push("/(tabs)/listing")}>
          <Ionicons name="chevron-back" size={32} color="#000" />
        </TouchableOpacity>
      </View>

      <View style={styles.quoteCard}>
        <Text style={styles.quoteText}>{post.description}</Text>

        <View style={styles.line} />

        <Text style={styles.author}>{post.ownerPost}</Text>
      </View>

      <View style={styles.actionsRow}>
        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="heart-outline" size={26} color="#000" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="bookmark-outline" size={26} color="#000" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton}>
          <Ionicons name="share-outline" size={26} color="#000" />
        </TouchableOpacity>
      </View>

      <View style={styles.postedRow}>
        <View style={styles.dot} />
        <Text style={styles.postedText}>
          Postado por: <Text style={styles.postedName}>{post.ownerPost}</Text>
        </Text>
      </View>

      <View style={styles.carouselContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.scrollViewContent}
          alwaysBounceHorizontal={true}
        >
          {post.categories?.map((catRel, index) => (
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
      </View>

      <View style={{ height: 60 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "android" ? 50 : 60,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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

  avatarCircle: {
    width: 45,
    height: 45,
    borderRadius: 22,
    backgroundColor: "#D8E3F5",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },

  avatar: {
    width: 45,
    height: 45,
    borderRadius: 22,
  },

  goodMorning: {
    fontSize: 14,
    color: "#7A8FA6",
  },

  userName: {
    fontSize: 16,
    fontWeight: "700",
    color: "#5B6E85",
  },

  quoteCard: {
    width: "100%",
    backgroundColor: "#FFF",
    borderRadius: 12,
    padding: 100,
    borderColor: "#C8D3E0",
    borderWidth: 1,
    marginBottom: 15,
    alignItems: "center",
  },

  quoteText: {
    fontSize: 20,
    fontStyle: "italic",
    textAlign: "center",
    color: "#2E3A59",
    marginBottom: 20,
  },

  line: {
    width: "45%",
    height: 2,
    backgroundColor: "#6B8EAE",
    marginBottom: 12,
  },

  author: {
    fontSize: 15,
    fontWeight: "700",
    color: "#2E3A59",
    textAlign: "center",
  },

  actionsRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    paddingRight: 10,
    marginBottom: 20,
  },

  actionButton: {
    marginLeft: 20,
  },

  postedRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },

  dot: {
    width: 16,
    height: 16,
    borderRadius: 10,
    backgroundColor: "#A7C4E2",
    marginRight: 10,
  },

  postedText: {
    fontSize: 14,
    color: "#2E3A59",
  },

  postedName: {
    fontWeight: "700",
  },

  carouselContainer: {
    marginHorizontal: -20,
    marginTop: 20,
  },
  scrollViewContent: {
    paddingHorizontal: 20,
  },
  carouselButton: {
    width: 110,
    height: 110,
    marginRight: 15,
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
