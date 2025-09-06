import React, { useState, useEffect } from "react";
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
import { useRouter, useLocalSearchParams } from "expo-router";
import { db } from "../firebaseConfig";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import * as Location from "expo-location";
import { Picker } from "@react-native-picker/picker";

export default function FarmerEdit(): JSX.Element {
    const router = useRouter();
    const params = useLocalSearchParams();
    const phone = String(params.phone || "");

    const [form, setForm] = useState({
        name: "",
        gender: "Male",
        age: "",
        mobile: phone,
        village: "",
        district: "",
        state: "",
        pincode: "",
        location: "",
        landSize: "1-5 acres",
        crops: [] as { name: string; qty: number }[],
        bankAccount: "",
        ifsc: "",
        bankName: "",
    });

    const [cropInput, setCropInput] = useState("");
    const [farmerDocId, setFarmerDocId] = useState<string | null>(null);

    useEffect(() => {
        const fetchFarmerData = async () => {
            try {
                const farmersRef = collection(db, "farmers");
                const q = query(farmersRef, where("mobile", "==", phone));
                const snap = await getDocs(q);

                if (!snap.empty) {
                    const farmerDoc = snap.docs[0];
                    setFarmerDocId(farmerDoc.id);
                    const farmerData: any = farmerDoc.data();
                    setForm({
                        name: farmerData.name || "",
                        gender: farmerData.gender || "Male",
                        age: farmerData.age?.toString() || "",
                        mobile: farmerData.mobile || "",
                        village: farmerData.village || "",
                        district: farmerData.district || "",
                        state: farmerData.state || "",
                        pincode: farmerData.pincode?.toString() || "",
                        location: farmerData.location || "",
                        landSize: farmerData.landSize || "1-5 acres",
                        crops: Array.isArray(farmerData.crops)
                            ? farmerData.crops.map((c: any) =>
                                typeof c === "string" ? { name: c, qty: 0 } : { name: c.name, qty: c.qty ?? 0 }
                            )
                            : [],
                        bankAccount: farmerData.bankAccount || "",
                        ifsc: farmerData.ifsc || "",
                        bankName: farmerData.bankName || "",
                    });
                }
            } catch (e) {
                console.error("Error fetching farmer data:", e);
                Alert.alert("Error", "Failed to load farmer data");
            }
        };
        fetchFarmerData();
    }, []);

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
            setForm({ ...form, crops: [...form.crops, { name: cropInput.trim(), qty: 0 }] });
            setCropInput("");
        }
    };

    const landSizeOptions = Array.from({ length: 20 }, (_, i) => {
        const start = i * 5 + 1;
        const end = (i + 1) * 5;
        return `${start}-${end} acres`;
    });

    const handleSubmit = async () => {
        try {
            if (!form.name || !form.mobile || !form.bankAccount) {
                Alert.alert("Error", "Please fill all required fields");
                return;
            }

            if (farmerDocId) {
                await updateDoc(doc(db, "farmers", farmerDocId), {
                    ...form,
                    age: form.age ? Number(form.age) : null,
                    pincode: form.pincode ? Number(form.pincode) : null,
                });

                Alert.alert("Success", "Profile updated successfully!", [
                    { text: "OK", onPress: () => router.replace("/farmer-main") },
                ]);
            }
        } catch (e: any) {
            console.error("Error updating farmer data:", e);
            Alert.alert("Error", e?.message || "Update failed, try again!");
        }
    };

    return (
        <LinearGradient colors={["#BAC5B6", "#BCEBBC"]} style={{ flex: 1 }}>
            <ScrollView contentContainerStyle={styles.container} style={{ flex: 1 }}>
                <Image
                    source={require("../assets/images/harvesthub_main_logo.png")}
                    style={styles.logo}
                />
                <Text style={styles.pageTitle}>Edit Farmer Profile</Text>

                <InputField label="Name" value={form.name} onChangeText={(v: string) => setForm({ ...form, name: v })} />

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

                <InputField label="Age" keyboardType="numeric" value={form.age} onChangeText={(v: string) => setForm({ ...form, age: v })} />
                <InputField label="Mobile Number" keyboardType="phone-pad" value={form.mobile} onChangeText={(v: string) => setForm({ ...form, mobile: v })} />
                <InputField label="Village/Town Name" value={form.village} onChangeText={(v: string) => setForm({ ...form, village: v })} />
                <InputField label="District" value={form.district} onChangeText={(v: string) => setForm({ ...form, district: v })} />
                <InputField label="State" value={form.state} onChangeText={(v: string) => setForm({ ...form, state: v })} />
                <InputField label="Pincode" keyboardType="numeric" value={form.pincode} onChangeText={(v: string) => setForm({ ...form, pincode: v })} />

                <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Land Location</Text>
                    <TouchableOpacity style={styles.secondaryButton} onPress={getLocation}>
                        <Text style={styles.secondaryButtonText}>Use GPS Location</Text>
                    </TouchableOpacity>
                    {form.location ? <Text style={styles.locationText}>{form.location}</Text> : null}
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Land Size</Text>
                    <View style={styles.pickerContainer}>
                        <Picker
                            selectedValue={form.landSize}
                            onValueChange={(v: string) => setForm({ ...form, landSize: v })}
                            style={styles.picker}
                        >
                            {landSizeOptions.map((option, idx) => (
                                <Picker.Item label={option} value={option} key={idx} />
                            ))}
                        </Picker>
                    </View>
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.inputLabel}>Crops Cultivated</Text>
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
                    {form.crops.map((crop, index) => (
                        <Text key={index} style={styles.cropItem}>• {crop.name} (Qty: {crop.qty})</Text>
                    ))}
                </View>

                <InputField label="Bank Account" value={form.bankAccount} onChangeText={(v: string) => setForm({ ...form, bankAccount: v })} />
                <InputField label="IFSC Code" value={form.ifsc} onChangeText={(v: string) => setForm({ ...form, ifsc: v })} />
                <InputField label="Bank Name" value={form.bankName} onChangeText={(v: string) => setForm({ ...form, bankName: v })} />

                <TouchableOpacity style={styles.primaryButton} onPress={handleSubmit}>
                    <Text style={styles.primaryButtonText}>Update Profile</Text>
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
