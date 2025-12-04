import React from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image } from "react-native";

export default function CategoryCarousel({ title, items, onLike }) {
    return (
        <View style={styles.categoryBlock}>
            <Text style={styles.category}>{title}</Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {items.map((item, index) => (
                    <View key={index} style={{ marginRight: 15 }}>
                        <TouchableOpacity
                            style={[
                                styles.cardCarousel,
                                { backgroundColor: item.background || "#DCE6F2" }
                            ]}
                        >
                            <Text style={styles.cardText} numberOfLines={3}>
                                {item.text}
                            </Text>
                        </TouchableOpacity>

                        {/* Área de Curtidas */}
                        <View style={styles.likeContainer}>
                            <TouchableOpacity onPress={() => onLike && onLike(item.id)}>
                                <Image
                                    source={require('../../assets/heart.png')}
                                    style={[
                                        styles.heartIcon,
                                        { tintColor: item.isLiked ? "red" : "black" }
                                    ]}
                                />
                            </TouchableOpacity>
                            <Text style={styles.likeCount}>{item.likesCount || 0}</Text>
                        </View>
                    </View>
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
        justifyContent: "center",
        alignItems: "center",
    },
    cardText: {
        fontSize: 14,
        fontStyle: "italic",
        color: "#2E3A59",
        textAlign: "center",
    },
    likeContainer: {
        flexDirection: "row",
        alignItems: "center",
        marginTop: 5,
        justifyContent: "flex-start",
        paddingLeft: 5
    },
    heartIcon: {
        width: 20,
        height: 20,
        marginRight: 5,
        resizeMode: 'contain'
    },
    likeCount: {
        fontSize: 14,
        color: "#000",
    }
});
