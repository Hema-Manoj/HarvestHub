import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, Image, StyleSheet, Alert } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, useLocalSearchParams } from "expo-router";
import { ConfirmationResult } from "firebase/auth";

export default function OTPVerification(): JSX.Element {
    const [otpInput, setOtpInput] = useState("");
    const router = useRouter();
    const params = useLocalSearchParams();

    const phone = String(params.phone || "");
    const role = String(params.role || "farmer");

    // ✅ ConfirmationResult is passed from login
    const confirmationResult: ConfirmationResult | null =
        params.confirmationResult as unknown as ConfirmationResult;

    const handleSubmit = async () => {
        if (!confirmationResult) {
            Alert.alert("Error", "No OTP session found, please request again.");
            return;
        }

        try {
            await confirmationResult.confirm(otpInput);
            const nextPage = role === "trader" ? "/trader-main" : "/farmer-main";

            Alert.alert("Success", "OTP Verified!", [
                {
                    text: "OK",
                    onPress: () =>
                        router.replace({
                            pathname: nextPage,
                            params: { phone, role },
                        }),
                },
            ]);
        } catch (err: any) {
            Alert.alert("Error", "Invalid OTP. Please try again.");
            console.error("OTP verification error:", err);
        }
    };

    return (
        <LinearGradient colors={["#BAC5B6", "#BCEBBC"]} style={{ flex: 1 }}>
            <View style={styles.container}>
                <Image
                    source={require("../assets/images/harvesthub_main_logo.png")}
                    style={styles.logo}
                />

                <View style={styles.otpBox}>
                    <Text style={styles.title}>Enter OTP sent to {phone}</Text>

                    <TextInput
                        style={styles.otpInput}
                        placeholder="------"
                        keyboardType="number-pad"
                        maxLength={6}
                        value={otpInput}
                        onChangeText={setOtpInput}
                    />

                    <View style={styles.buttonRow}>
                        <TouchableOpacity
                            style={styles.cancelButton}
                            onPress={() => router.back()}
                        >
                            <Text style={styles.buttonText}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                            style={styles.submitButton}
                            onPress={handleSubmit}
                        >
                            <Text style={styles.buttonText}>Submit</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, alignItems: "center", paddingTop: 120 },
    logo: { width: 200, height: 200, resizeMode: "contain" },
    otpBox: {
        width: "85%",
        padding: 20,
        backgroundColor: "rgba(255, 255, 255, 0.85)",
        borderRadius: 16,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.2,
        shadowRadius: 5,
        elevation: 5,
        alignItems: "center",
        marginTop: 80,
    },
    title: {
        fontSize: 18,
        fontWeight: "bold",
        color: "#C67C35",
        marginBottom: 15,
    },
    otpInput: {
        backgroundColor: "#fff",
        borderRadius: 8,
        padding: 12,
        fontSize: 18,
        textAlign: "center",
        letterSpacing: 6,
        width: "70%",
        marginBottom: 25,
    },
    buttonRow: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "70%",
    },
    cancelButton: {
        flex: 1,
        backgroundColor: "#C67C35",
        borderRadius: 8,
        paddingVertical: 10,
        marginRight: 10,
        alignItems: "center",
    },
    submitButton: {
        flex: 1,
        backgroundColor: "#3F723C",
        borderRadius: 8,
        paddingVertical: 10,
        marginLeft: 10,
        alignItems: "center",
    },
    buttonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
});