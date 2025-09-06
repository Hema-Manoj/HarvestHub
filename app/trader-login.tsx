import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, ScrollView, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { db } from "../firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";

export default function TraderLogin() {
    const router = useRouter();
    const [phone, setPhone] = useState("");

    const handleGenerateOTP = async () => {
        const trimmed = phone.replace(/\D/g, "");
        if (trimmed.length !== 10) {
            Alert.alert("Invalid", "Please enter a valid 10-digit phone number");
            return;
        }

        try {
            const tradersRef = collection(db, "traders");
            const q = query(tradersRef, where("mobile", "==", trimmed));
            const snapshot = await getDocs(q);

            if (snapshot.empty) {
                Alert.alert(
                    "Not Registered",
                    "This number is not registered as Trader.",
                    [
                        { text: "Cancel", style: "cancel" },
                        { text: "Register", onPress: () => router.push("/trader-registration") } // ✅ spelling fixed
                    ]
                );
                return;
            }

            // ✅ Trader exists → proceed
            router.push({
                pathname: "/otp-verification",
                params: { phone: trimmed, role: "trader" },
            });

        } catch (err) {
            console.error("Error checking trader phone:", err);
            Alert.alert("Error", "Something went wrong. Try again!");
        }
    };

    return (
        <LinearGradient colors={["#BAC5B6", "#BCEBBC"]} style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={styles.container} style={{ flex: 1 }}>
                <View style={{ marginTop: 40, alignItems: "center", width: "100%" }}>
                    <Image source={require("../assets/images/harvesthub_main_logo.png")} style={styles.logo} />
                    <Text style={styles.dashboardTitle}>Trader's Dashboard</Text>
                    <Text style={styles.loginTitle}>Log in</Text>

                    <View style={styles.inputContainer}>
                        <Text style={styles.inputLabel}>Phone Number</Text>
                        <TextInput
                            style={styles.inputBox}
                            placeholder="Enter 10 digit phone number"
                            keyboardType="phone-pad"
                            value={phone}
                            onChangeText={setPhone}
                            maxLength={14}
                        />
                    </View>

                    <TouchableOpacity style={styles.primaryButton} onPress={handleGenerateOTP}>
                        <Text style={styles.primaryButtonText}>Generate OTP</Text>
                    </TouchableOpacity>
                </View>

                <View style={{ flexGrow: 2 }} />
                <Text style={styles.registerText}>New to HarvestHub? Register Now</Text>
                <TouchableOpacity style={styles.primaryButton} onPress={() => router.push("/trader-registration")}>
                    <Text style={styles.primaryButtonText}>Register</Text>
                </TouchableOpacity>
            </ScrollView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flexGrow: 1, alignItems: "center", paddingVertical: 30 },
    logo: { width: 200, height: 200, resizeMode: "contain", marginBottom: 10 },
    dashboardTitle: { fontSize: 20, fontWeight: "bold", color: "#C67C35", marginBottom: 5 },
    loginTitle: {
        fontSize: 18, fontWeight: "bold", color: "#C67C35", marginBottom: 20,
        alignSelf: "flex-start", marginLeft: "7%", marginTop: 20,
    },
    inputContainer: { width: "85%", marginBottom: 15 },
    inputLabel: { fontSize: 14, color: "#C67C35", marginBottom: 5 },
    inputBox: { backgroundColor: "#D9E8D4", borderRadius: 8, padding: 10, fontSize: 14 },
    primaryButton: { backgroundColor: "#3F723C", borderRadius: 8, paddingVertical: 8, paddingHorizontal: 20, marginVertical: 8 },
    primaryButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
    registerText: { color: "#C67C35", fontSize: 14, marginBottom: 5 },
});
