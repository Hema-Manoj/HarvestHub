import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Image,
    StyleSheet,
    ScrollView,
    Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { db } from "../firebaseConfig";
import { collection, query, where, getDocs } from "firebase/firestore";
import {
    getAuth,
    signInWithPhoneNumber,
    RecaptchaVerifier,
} from "firebase/auth";

export default function FarmerLogin(): JSX.Element {
    const router = useRouter();
    const [phone, setPhone] = useState("");
    const auth = getAuth();

    const handleGenerateOTP = async () => {
        const trimmed = phone.replace(/\D/g, "");
        if (trimmed.length !== 10) {
            Alert.alert("Invalid", "Please enter a valid 10-digit phone number");
            return;
        }

        try {
            // ✅ Check if farmer exists in Firestore
            const farmersRef = collection(db, "farmers");
            const q = query(farmersRef, where("mobile", "==", trimmed));
            const snapshot = await getDocs(q);

            if (snapshot.empty) {
                Alert.alert(
                    "Not Registered",
                    "This number is not registered as Farmer.",
                    [
                        { text: "Cancel", style: "cancel" },
                        {
                            text: "Register",
                            onPress: () => router.push("/farmer-registration"),
                        },
                    ]
                );
                return;
            }

            // ✅ Create invisible reCAPTCHA verifier (web only)
            if (!(window as any).recaptchaVerifier) {
                (window as any).recaptchaVerifier = new RecaptchaVerifier(
                    "recaptcha-container",
                    { size: "invisible" },
                    auth
                );
            }

            // ✅ Send OTP via Firebase
            const confirmationResult = await signInWithPhoneNumber(
                auth,
                "+91" + trimmed, // include country code
                (window as any).recaptchaVerifier
            );

            // ✅ Navigate to OTP screen with confirmationResult
            router.push({
                pathname: "/otp-verification",
                params: {
                    phone: trimmed,
                    role: "farmer",
                    confirmationResult: JSON.stringify(confirmationResult),
                },
            });
        } catch (err: any) {
            console.error("OTP error:", err);
            Alert.alert("Error", "Failed to send OTP. Please try again.");
        }
    };

    return (
        <LinearGradient colors={["#BAC5B6", "#BCEBBC"]} style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={styles.container} style={{ flex: 1 }}>
                <View style={{ marginTop: 40, alignItems: "center", width: "100%" }}>
                    <Image
                        source={require("../assets/images/harvesthub_main_logo.png")}
                        style={styles.logo}
                    />
                    <Text style={styles.dashboardTitle}>Farmer's Dashboard</Text>
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

                    <TouchableOpacity
                        style={styles.primaryButton}
                        onPress={handleGenerateOTP}
                    >
                        <Text style={styles.primaryButtonText}>Generate OTP</Text>
                    </TouchableOpacity>
                </View>

                <View style={{ flexGrow: 1 }} />

                <Text style={styles.registerText}>New to HarvestHub? Register Now</Text>
                <TouchableOpacity
                    style={styles.primaryButton}
                    onPress={() => router.push("/farmer-registration")}
                >
                    <Text style={styles.primaryButtonText}>Register</Text>
                </TouchableOpacity>

                {/* 🔑 reCAPTCHA container required for Firebase OTP */}
                <View id="recaptcha-container" />
            </ScrollView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flexGrow: 1, alignItems: "center", paddingVertical: 30 },
    logo: { width: 200, height: 200, resizeMode: "contain", marginBottom: 10 },
    dashboardTitle: {
        fontSize: 20,
        fontWeight: "bold",
        color: "#C67C35",
        marginBottom: 5,
    },
    loginTitle: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#C67C35",
        marginBottom: 15,
        alignSelf: "flex-start",
        marginLeft: "7%",
        marginTop: 20,
    },
    inputContainer: { width: "85%", marginBottom: 15 },
    inputLabel: { fontSize: 14, color: "#C67C35", marginBottom: 5 },
    inputBox: {
        backgroundColor: "#D9E8D4",
        borderRadius: 8,
        padding: 10,
        fontSize: 14,
    },
    primaryButton: {
        backgroundColor: "#3F723C",
        borderRadius: 8,
        paddingVertical: 8,
        paddingHorizontal: 20,
        marginVertical: 8,
    },
    primaryButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
    registerText: { color: "#C67C35", fontSize: 14, marginBottom: 5 },
});