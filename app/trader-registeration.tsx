import React, { useState } from "react";
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    ScrollView,
    StyleSheet,
    Image,
    Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import * as Location from "expo-location";
import { Picker } from "@react-native-picker/picker";

// ✅ Firestore
import { db } from "../firebaseConfig";
import { collection, query, where, getDocs, addDoc } from "firebase/firestore";

export default function TraderRegistration() {
    const router = useRouter();

    const [form, setForm] = useState({
        fullName: "",
        age: "",
        gender: "Male",
        shopName: "",
        traderType: "Wholesaler",
        mobile: "",
        address: "",
        location: "",
        city: "",
        district: "",
        state: "",
        pincode: "",
        bankAccount: "",
        ifsc: "",
        bankName: "",
        experience: "",
        website: "",
        cropsSold: [] as { name: string; quantity: number }[],
    });

    const [cropInput, setCropInput] = useState("");

    // ✅ GPS Location
    const getLocation = async () => {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== "granted") {
            setForm({ ...form, location: "Permission denied" });
            return;
        }
        const loc = await Location.getCurrentPositionAsync({});
        setForm({
            ...form,
            location: `Lat: ${loc.coords.latitude}, Lng: ${loc.coords.longitude}`,
        });
    };

    const addCrop = () => {
        if (cropInput.trim()) {
            setForm({
                ...form,
                cropsSold: [...form.cropsSold, { name: cropInput.trim(), quantity: 0 }],
            });
            setCropInput("");
        }
    };

    const handleSubmit = async () => {
        if (!form.fullName || !form.mobile || !form.shopName) {
            Alert.alert("Error", "Please fill all required fields");
            return;
        }

        try {
            const tradersRef = collection(db, "traders");
            const q = query(tradersRef, where("mobile", "==", form.mobile));
            const snap = await getDocs(q);

            if (!snap.empty) {
                Alert.alert(
                    "Already Registered",
                    "This mobile number is already registered.",
                    [
                        { text: "Cancel", style: "cancel" },
                        { text: "Go to Login", onPress: () => router.replace("/trader-login") },
                    ]
                );
                return;
            }

            await addDoc(tradersRef, {
                ...form,
                age: form.age ? Number(form.age) : null,
                pincode: form.pincode ? Number(form.pincode) : null,
                createdAt: new Date(),
            });

            Alert.alert("Success", "Registration Completed!", [
                { text: "OK", onPress: () => router.replace("/trader-login") },
            ]);
        } catch (error: any) {
            console.error("Error saving trader:", error);
            Alert.alert("Error", error.message || "Something went wrong, try again!");
        }
    };

    return (
        <LinearGradient colors={["#BAC5B6", "#BCEBBC"]} style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={styles.container}>
                {/* Logo */}
                <Image
                    source={require("../assets/images/harvesthub_main_logo.png")}
                    style={styles.logo}
                />

                {/* Title */}
                <Text style={styles.pageTitle}>Trader Registration</Text>

                {/* Full Name */}
                <InputField label="Full Name" value={form.fullName} onChangeText={(v: string) => setForm({ ...form, fullName: v })} />

                {/* Age */}
                <InputField label="Age" keyboardType="numeric" value={form.age} onChangeText={(v: string) => setForm({ ...form, age: v })} />

                {/* Gender Dropdown */}
                <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Gender</Text>
                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={form.gender}
                            onValueChange={(v: string) => setForm({ ...form, gender: v })}
                            style={styles.picker}
                        >
                            <Picker.Item label="Male" value="Male" />
                            <Picker.Item label="Female" value="Female" />
                            <Picker.Item label="Other" value="Other" />
                        </Picker>
                    </View>
                </View>

                {/* Shop Name */}
                <InputField label="Name of the Shop" value={form.shopName} onChangeText={(v: string) => setForm({ ...form, shopName: v })} />

                {/* Trader Type Dropdown */}
                <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Type of Trader</Text>
                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={form.traderType}
                            onValueChange={(v: string) => setForm({ ...form, traderType: v })}
                            style={styles.picker}
                        >
                            <Picker.Item label="Wholesaler" value="Wholesaler" />
                            <Picker.Item label="Retailer" value="Retailer" />
                            <Picker.Item label="Other" value="Other" />
                        </Picker>
                    </View>
                </View>

                {/* Mobile */}
                <InputField label="Mobile Number" keyboardType="phone-pad" value={form.mobile} onChangeText={(v: string) => setForm({ ...form, mobile: v })} />

                {/* Address */}
                <InputField label="Shop Address" value={form.address} onChangeText={(v: string) => setForm({ ...form, address: v })} />

                {/* GPS Location */}
                <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Shop Location</Text>
                    <TouchableOpacity style={styles.secondaryButton} onPress={getLocation}>
                        <Text style={styles.secondaryButtonText}>Use GPS Location</Text>
                    </TouchableOpacity>
                    {form.location ? <Text style={styles.locationText}>{form.location}</Text> : null}
                </View>

                {/* City, District, State, Pincode */}
                <InputField label="City/Town" value={form.city} onChangeText={(v: string) => setForm({ ...form, city: v })} />
                <InputField label="District" value={form.district} onChangeText={(v: string) => setForm({ ...form, district: v })} />
                <InputField label="State" value={form.state} onChangeText={(v: string) => setForm({ ...form, state: v })} />
                <InputField label="Pincode" keyboardType="numeric" value={form.pincode} onChangeText={(v: string) => setForm({ ...form, pincode: v })} />

                {/* Crops Sold */}
                <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Crops Sold</Text>
                    <View style={styles.row}>
                        <TextInput
                            style={[styles.inputBox, { flex: 1 }]}
                            placeholder="Enter crop name"
                            value={cropInput}
                            onChangeText={setCropInput}
                        />
                        <TouchableOpacity style={styles.addButton} onPress={addCrop}>
                            <Text style={styles.addButtonText}>Add +</Text>
                        </TouchableOpacity>
                    </View>
                    {form.cropsSold.map((crop, idx) => (
                        <Text key={idx} style={styles.cropItem}>
                            • {crop.name} (Qty: {crop.quantity})
                        </Text>
                    ))}
                </View>

                {/* Bank */}
                <InputField label="Bank Account" value={form.bankAccount} onChangeText={(v: string) => setForm({ ...form, bankAccount: v })} />
                <InputField label="IFSC Code" value={form.ifsc} onChangeText={(v: string) => setForm({ ...form, ifsc: v })} />
                <InputField label="Bank Name" value={form.bankName} onChangeText={(v: string) => setForm({ ...form, bankName: v })} />

                {/* Experience + Website */}
                <InputField label="Trading Experience" value={form.experience} onChangeText={(v: string) => setForm({ ...form, experience: v })} />
                <InputField label="Company Website" value={form.website} onChangeText={(v: string) => setForm({ ...form, website: v })} />

                {/* Submit */}
                <TouchableOpacity style={styles.primaryButton} onPress={handleSubmit}>
                    <Text style={styles.primaryButtonText}>Submit</Text>
                </TouchableOpacity>
            </ScrollView>
        </LinearGradient>
    );
}

function InputField({
                        label,
                        ...props
                    }: {
    label: string;
    value: string;
    onChangeText: (text: string) => void;
    keyboardType?: "default" | "numeric" | "email-address" | "phone-pad";
}) {
    return (
        <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>{label}</Text>
            <TextInput style={styles.inputBox} placeholder={`Enter ${label}`} {...props} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flexGrow: 1, alignItems: "center", paddingVertical: 30 },
    logo: { width: 180, height: 180, resizeMode: "contain", marginBottom: 10 },
    pageTitle: { fontSize: 22, fontWeight: "bold", color: "#3F723C", marginBottom: 20 },
    inputContainer: { width: "85%", marginBottom: 15 },
    inputLabel: { fontSize: 14, color: "#C67C35", marginBottom: 5 },
    inputBox: { backgroundColor: "#D9E8D4", borderRadius: 8, padding: 10, fontSize: 14 },
    pickerContainer: { backgroundColor: "#D9E8D4", borderRadius: 8 },
    picker: { height: 50, width: "100%" },
    row: { flexDirection: "row", alignItems: "center" },
    addButton: { marginLeft: 8, backgroundColor: "#3F723C", paddingVertical: 10, paddingHorizontal: 14, borderRadius: 8 },
    addButtonText: { color: "#fff", fontWeight: "bold" },
    cropItem: { fontSize: 14, color: "#3F723C", marginTop: 5 },
    primaryButton: { backgroundColor: "#3F723C", borderRadius: 8, paddingVertical: 10, paddingHorizontal: 20, marginVertical: 20 },
    primaryButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
    secondaryButton: { backgroundColor: "#A1C99A", borderRadius: 8, paddingVertical: 8, paddingHorizontal: 12, marginBottom: 5 },
    secondaryButtonText: { color: "#3F723C", fontWeight: "bold" },
    locationText: { fontSize: 12, color: "#3F723C", marginTop: 5 },
});

