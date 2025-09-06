import { useEffect } from "react";
import { View, StyleSheet, Image } from "react-native";
import { useRouter } from "expo-router";

export default function LandingPage() {
    const router = useRouter();

    useEffect(() => {
        const timer = setTimeout(() => {
            router.push("/role-selection");
        }, 2000);

        return () => clearTimeout(timer);
    }, []);

    return (
        <View style={styles.container}>
            <Image
                source={require("../assets/images/harvesthub_main_logo.png")}
                style={styles.logo}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#3F723C", // splash background color
        justifyContent: "center",
        alignItems: "center",
    },
    logo: {
        width: 250, // increased size
        height: 250,
        resizeMode: "contain",
    },
});
