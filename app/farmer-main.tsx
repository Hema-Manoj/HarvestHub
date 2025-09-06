    import React, { useState, useEffect } from "react";
    import {
        View, Text, TouchableOpacity, StyleSheet, Image, Modal, TextInput, ScrollView, Alert,
    } from "react-native";
    import { useRouter, useLocalSearchParams } from "expo-router";
    import { LinearGradient } from "expo-linear-gradient";
    import { Ionicons } from "@expo/vector-icons";
    import { db } from "../firebaseConfig";
    import { collection, query, where, getDocs, limit, updateDoc, doc } from "firebase/firestore";
    
    export default function FarmerMain() {
        const router = useRouter();
        const params = useLocalSearchParams();
        const phone = String(params.phone || ""); // ✅ phone from login
    
        const [menuVisible, setMenuVisible] = useState(false);
        const [search, setSearch] = useState("");
        const [searchResults, setSearchResults] = useState<any[]>([]);
        const [popularTraders, setPopularTraders] = useState<any[]>([]);
        const [farmerCrops, setFarmerCrops] = useState<{ name: string; qty: number }[]>([]);
        const [farmerDocId, setFarmerDocId] = useState<string | null>(null);
        const [farmerDistrict, setFarmerDistrict] = useState<string>("");
    
        // 🔹 Fetch farmer crops & district
        const fetchFarmerData = async () => {
            try {
                if (!phone) return;
                const farmersRef = collection(db, "farmers");
                const q = query(farmersRef, where("mobile", "==", phone));
                const snap = await getDocs(q);
    
                if (!snap.empty) {
                    const farmerDoc = snap.docs[0];
                    setFarmerDocId(farmerDoc.id);
                    const farmerData: any = farmerDoc.data();
    
                    // ✅ Save district dynamically
                    if (farmerData.district) {
                        setFarmerDistrict(farmerData.district);
                    }
    
                    // ✅ Handle crops (old & new format)
                    let crops: { name: string; qty: number }[] = [];
                    if (Array.isArray(farmerData.crops)) {
                        crops = farmerData.crops.map((c: any) =>
                            typeof c === "string" ? { name: c, qty: 0 } : { name: c.name, qty: c.qty ?? 0 }
                        );
                    }
                    setFarmerCrops(crops);
                }
            } catch (err) {
                console.error("Error fetching farmer data:", err);
                Alert.alert("Error", "Could not load farmer details");
            }
        };
    
        // 🔹 Handle quantity update
        const handleQtyChange = async (index: number, value: string) => {
            const updated = [...farmerCrops];
            updated[index].qty = Number(value) || 0;
            setFarmerCrops(updated);
    
            try {
                if (farmerDocId) {
                    const farmerRef = doc(db, "farmers", farmerDocId);
                    await updateDoc(farmerRef, { crops: updated });
                }
            } catch (err) {
                console.error("Error updating crops:", err);
                Alert.alert("Error", "Failed to update crops");
            }
        };
    
        // 🔹 Search traders by crop
        const handleSearch = async () => {
            if (!search.trim()) return;
            const tradersRef = collection(db, "traders");
            const q = query(tradersRef, where("cropsSold", "array-contains", search.trim()));
            const snap = await getDocs(q);
            const results: any[] = [];
            snap.forEach((doc) => results.push({ id: doc.id, ...doc.data() }));
            setSearchResults(results);
        };
    
        // 🔹 Fetch popular traders in farmer's district
        const fetchPopularTraders = async (district: string) => {
            if (!district) return; // wait until farmerDistrict is available
            const tradersRef = collection(db, "traders");
            const q = query(tradersRef, where("district", "==", district), limit(5));
            const snap = await getDocs(q);
            const results: any[] = [];
            snap.forEach((doc) => results.push({ id: doc.id, ...doc.data() }));
            setPopularTraders(results);
        };
    
        useEffect(() => {
            fetchFarmerData();
        }, [phone]);
    
        useEffect(() => {
            if (farmerDistrict) {
                fetchPopularTraders(farmerDistrict);
            }
        }, [farmerDistrict]);
    
        return (
            <LinearGradient colors={["#ffffff", "#f0fff0"]} style={{ flex: 1 }}>
                {/* Header */}
                <View style={styles.header}>
                    <Image source={require("../assets/images/harvesthub_small_logo.jpg")} style={styles.logo} />
                    <TouchableOpacity onPress={() => setMenuVisible(true)}>
                        <Ionicons name="menu" size={40} color="#D9E8D4" />
                    </TouchableOpacity>
                </View>
    
                {/* Content */}
                <ScrollView style={{ flex: 1, padding: 15 }} contentContainerStyle={{ paddingBottom: 100 }} showsVerticalScrollIndicator={false}>
                    {/* Search Section */}
                    <View style={[styles.searchSection, { marginTop: 30 }]}>
                        <TextInput style={styles.searchInput} placeholder="Search crops..." value={search} onChangeText={setSearch} />
                        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
                            <Text style={styles.searchButtonText}>Search</Text>
                        </TouchableOpacity>
                    </View>
    
                    {/* Search Results */}
                    {searchResults.length > 0 && (
                        <View style={{ marginTop: 20 }}>
                            <Text style={styles.sectionTitle}>Search Results</Text>
                            {searchResults.map((trader) => (
                                <View key={trader.id} style={styles.resultCard}>
                                    <Text style={styles.resultTitle}>{trader.fullName}</Text>
                                    <Text>{trader.shopName}</Text>
                                    <Text>{trader.city}, {trader.district}</Text>
                                    <TouchableOpacity style={styles.requestButton}>
                                        <Text style={styles.requestButtonText}>Request</Text>
                                    </TouchableOpacity>
                                </View>
                            ))}
                        </View>
                    )}
    
                    {/* Popular Traders */}
                    <View style={{ marginTop: 40 }}>
                        <Text style={styles.sectionTitle}>Popular Traders in {farmerDistrict || "..."}</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                            {popularTraders.map((trader) => (
                                <View key={trader.id} style={styles.popularCard}>
                                    <Text style={styles.popularShop}>{trader.shopName}</Text>
                                    <Text style={styles.popularName}>{trader.fullName}</Text>
                                    <Text style={styles.popularCrops}>
                                        Crops: {Array.isArray(trader.cropsSold)
                                        ? trader.cropsSold.map((c: any) => typeof c === "string" ? c : c.name).join(", ")
                                        : "N/A"}
                                    </Text>
                                </View>
                            ))}
                        </ScrollView>
                    </View>
    
                    {/* Farmer Crops Table */}
                    <View style={{ marginTop: 40 }}>
                        <Text style={styles.sectionTitle}>Your Crops & Quantities</Text>
                        <View style={styles.tableHeader}>
                            <Text style={[styles.tableCell, { flex: 2 }]}>Crop</Text>
                            <Text style={[styles.tableCell, { flex: 1 }]}>Quantity (Quintals)</Text>
                        </View>
                        {farmerCrops.map((crop, index) => (
                            <View key={index} style={styles.tableRow}>
                                <Text style={[styles.tableCell, { flex: 2 }]}>{crop.name}</Text>
                                <TextInput
                                    style={[styles.tableInput, { flex: 1 }]}
                                    keyboardType="numeric"
                                    value={crop.qty.toString()}
                                    onChangeText={(v) => handleQtyChange(index, v)}
                                />
                            </View>
                        ))}
                    </View>
                </ScrollView>
    
                {/* Hamburger Menu */}
                <Modal transparent={true} visible={menuVisible} animationType="fade" onRequestClose={() => setMenuVisible(false)}>
                    <TouchableOpacity style={styles.modalOverlay} onPress={() => setMenuVisible(false)} activeOpacity={1}>
                        <View style={styles.menuContainer}>
                            <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuVisible(false); router.replace("/farmer-login"); }}>
                                <Text style={styles.menuText}>Logout</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.menuItem} onPress={() => { setMenuVisible(false); router.push("/farmer-edit"); }}>
                                <Text style={styles.menuText}>Edit Profile</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.menuItem}
                                onPress={() => {
                                    setMenuVisible(false);
                                    router.push({
                                        pathname: "/farmer-edit",
                                        params: { phone },  // Pass the phone as query param
                                    });
                                }}
                            >
                                <Text style={styles.menuText}>Edit Profile</Text>
                            </TouchableOpacity>
                        </View>
                    </TouchableOpacity>
                </Modal>
            </LinearGradient>
        );
    }
    
    const styles = StyleSheet.create({
        header: { height: 140, backgroundColor: "#3F723C", flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 15 },
        logo: { width: 120, height: 120, resizeMode: "contain" },
        searchSection: { flexDirection: "row", alignItems: "center" },
        searchInput: { flex: 1, backgroundColor: "#D9E8D4", borderRadius: 8, padding: 10, fontSize: 14, marginRight: 10 },
        searchButton: { backgroundColor: "#3F723C", borderRadius: 8, paddingVertical: 10, paddingHorizontal: 15 },
        searchButtonText: { color: "#fff", fontWeight: "bold" },
        sectionTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 15, color: "#3F723C" },
        resultCard: { backgroundColor: "#fff", borderRadius: 10, padding: 15, marginBottom: 10, shadowColor: "#000", shadowOpacity: 0.1, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4, elevation: 3 },
        resultTitle: { fontWeight: "bold", fontSize: 16, color: "#3F723C" },
        requestButton: { marginTop: 10, backgroundColor: "#3F723C", borderRadius: 6, paddingVertical: 6, paddingHorizontal: 12, alignSelf: "flex-start" },
        requestButtonText: { color: "#fff", fontWeight: "600" },
        popularCard: { backgroundColor: "#fff", borderRadius: 12, padding: 20, width: 240, marginRight: 15, shadowColor: "#000", shadowOpacity: 0.1, shadowOffset: { width: 0, height: 2 }, shadowRadius: 4, elevation: 3 },
        popularShop: { fontWeight: "bold", fontSize: 18, color: "#3F723C" },
        popularName: { fontSize: 16, marginTop: 6 },
        popularCrops: { fontSize: 14, marginTop: 8, color: "#555" },
        tableHeader: { flexDirection: "row", borderBottomWidth: 1, borderColor: "#ccc", paddingBottom: 6, marginBottom: 6 },
        tableRow: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
        tableCell: { fontSize: 14, color: "#333" },
        tableInput: { backgroundColor: "#fff", borderRadius: 6, borderWidth: 1, borderColor: "#ccc", padding: 6, textAlign: "center" },
        modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.3)", justifyContent: "flex-start", alignItems: "flex-end" },
        menuContainer: { backgroundColor: "#fff", width: 200, paddingVertical: 10, marginTop: 70, marginRight: 10, borderRadius: 8, shadowColor: "#000", shadowOpacity: 0.2, shadowOffset: { width: 0, height: 2 }, shadowRadius: 5, elevation: 5 },
        menuItem: { paddingVertical: 12, paddingHorizontal: 15 },
        menuText: { fontSize: 16, fontWeight: "600", color: "#3F723C" },
    });
