import React from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image } from "react-native";

export default function CategoryCarousel({ title, items, onLike, onPress }) {
    return (
        <View style={styles.categoryBlock}>
            <Text style={styles.category}>{title}</Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {items.map((item, index) => (
                    <TouchableOpacity
                        key={index}
                        style={[
                            styles.cardCarousel,
                            { backgroundColor: item.backgroundColor || item.background || "#DCE6F2" }
                        ]}
                        onPress={() => onPress && onPress(item)}
                        activeOpacity={0.9}
                    >
                        <Text style={styles.cardText} numberOfLines={3}>
                            {item.text}
                        </Text>

                        {/* Área de Curtidas */}
                        <TouchableOpacity
                            style={styles.likeContainer}
                            onPress={() => onLike && onLike(item)}
                        >
                            <Image
                                source={require('../../assets/heart.png')}
                                style={[
                                    styles.heartIcon,
                                    { tintColor: item.isLiked ? "red" : "black" }
                                ]}
                            />
                            <Text style={styles.likeCount}>{item.likesCount || 0}</Text>
                        </TouchableOpacity>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    category: {
        fontSize: 24,
        fontFamily: "serif",
        fontStyle: "italic",
        fontWeight: "400",
        marginBottom: 15,
        color: "#000000",
    },
    categoryBlock: {
        marginTop: 25,
        marginBottom: 10,
    },
    cardCarousel: {
        width: 150,
        height: 150,
        padding: 15,
        backgroundColor: "#DCE6F2",
        borderRadius: 12,
        justifyContent: "space-between",
        alignItems: "center",
        marginRight: 15,
        borderWidth: 1,
        borderColor: "#000000",
    },
    cardText: {
        fontSize: 14,
        fontStyle: "italic",
        color: "#000000",
        textAlign: "center",
        marginBottom: 10,
    },
    likeContainer: {
        flexDirection: "row",
        alignItems: "center",
        alignSelf: "flex-end",
    },
    heartIcon: {
        width: 20,
        height: 20,
        marginRight: 4,
        resizeMode: 'contain'
    },
    likeCount: {
        fontSize: 12,
        color: "#000000",
        fontWeight: "bold"
    }
});
