import React from "react";
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter } from "expo-router";

export default function CategoryCarousel({ title, items }) {
    const router = useRouter();

    return (
        <View style={styles.categoryBlock}>
            <Text style={styles.category}>{title}</Text>

            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {items.map((item, index) => (
                    <TouchableOpacity
                        key={index}
                        style={[
                            styles.cardCarousel,
                            { backgroundColor: item.background || "#DCE6F2" }
                        ]}

                        onPress={() => router.push(`/details/${item.id}`)}
                    >
                        <Text style={styles.cardText} numberOfLines={3}>
                            {item.description}
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
        marginRight: 15,
    },
    cardText: {
        fontSize: 14,
        fontStyle: "italic",
        color: "#2E3A59",
        textAlign: "center",
    },
});
