import { View, Text, StyleSheet, Image, TouchableOpacity } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";

export default function RoleSelection() {
    const router = useRouter();

    return (
        <LinearGradient
            colors={["#BAC5B6", "#BCEBBC"]}
            style={styles.container}
        >
            {/* Logo */}
            <Image
                source={require("../assets/images/harvesthub_main_logo.png")}
                style={styles.logo}
            />

            {/* Buttons */}
            <View style={styles.buttonContainer}>
                <TouchableOpacity
                    style={styles.button}
                    onPress={() => router.push("/farmer-login")}
                >
                    <Text style={styles.buttonText}>Farmer</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.button}
                    onPress={() => router.push("/trader-login")}
                >
                    <Text style={styles.buttonText}>Trader</Text>
                </TouchableOpacity>
            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent: "center",
        paddingHorizontal: 20,
    },
    logo: {
        width: 200,
        height: 200,
        resizeMode: "contain",
        marginBottom: 50,
    },
    buttonContainer: {
        flexDirection: "column",
        alignItems: "center",
        width: "100%",
    },
    button: {
        backgroundColor: "#3F723C",
        justifyContent: "center",
        alignItems: "center",
        width: 180,
        height: 45,
        borderRadius: 8,
        marginVertical: 10,
    },
    buttonText: {
        color: "#fff",
        fontSize: 18,
        fontWeight: "bold",
        fontFamily: "Nunito", // ✅ Nunito applied
    },
});
