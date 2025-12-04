import React from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";

export default function CategoryCarousel({ title, items }) {
    return (
        <View style={styles.categoryBlock}>
            <Text style={styles.category}>{title}</Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {items.map((item, index) => (
                    <TouchableOpacity
                        key={index}
                        style={[
                            styles.cardCarousel,
                            { backgroundColor: item.background || "#DCE6F2" } // Usa a cor do item ou fallback
                        ]}
                    >
                        <Text style={styles.cardText} numberOfLines={3}>
                            {item.text}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    category: {
        fontSize: 24,
        fontFamily: "serif", // Tentando aproximar da fonte da imagem (serifada/italic)
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
        height: 150, // Quadrado conforme imagem
        padding: 15,
        backgroundColor: "#DCE6F2", // Azul claro conforme imagem (Alegria/Motivacional)
        borderRadius: 12,
        justifyContent: "center",
        alignItems: "center",
        marginRight: 15,
    },
    cardText: {
        fontSize: 14,
        fontStyle: "italic",
        color: "#2E3A59",
        textAlign: "center",
    },
});
