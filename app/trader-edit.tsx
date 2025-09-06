import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function TraderEdit() {
    return (
        <View style={styles.container}>
            <Text style={styles.text}>Trader Edit Profile Page (Placeholder)</Text>
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, alignItems: "center", justifyContent: "center" },
    text: { fontSize: 18, fontWeight: "bold", color: "#3F723C" },
});
