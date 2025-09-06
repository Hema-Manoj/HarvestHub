import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    Image,
    Modal,
    TextInput,
    ScrollView,
    Alert,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { db } from "../firebaseConfig";
import {
    collection,
    query,
    where,
    getDocs,
    limit,
    updateDoc,
    doc,
} from "firebase/firestore";

export default function TraderMain() {
    const router = useRouter();
    const params = useLocalSearchParams();
    const phone = String(params.phone || ""); // phone from login

    const [menuVisible, setMenuVisible] = useState(false);

    // search
    const [search, setSearch] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);

    // popular farmers (in trader's district)
    const [popularFarmers, setPopularFarmers] = useState<any[]>([]);
    const [traderDistrict, setTraderDistrict] = useState<string>("");

    // trader state: stock array { name, qty }
    const [stock, setStock] = useState<{ name: string; qty: number }[]>([]);
    const [traderDocId, setTraderDocId] = useState<string | null>(null);

    // fetch trader doc (to get district + stock)
    const fetchTraderData = async () => {
        try {
            if (!phone) return;
            const tradersRef = collection(db, "traders");
            const q = query(tradersRef, where("mobile", "==", phone));
            const snap = await getDocs(q);

            if (!snap.empty) {
                const traderDoc = snap.docs[0];
                setTraderDocId(traderDoc.id);
                const traderData: any = traderDoc.data();

                if (traderData.district) setTraderDistrict(traderData.district);

                // normalize stock: accept older formats (maybe stock stored as array of strings) or new objects
                let s: { name: string; qty: number }[] = [];
                if (Array.isArray(traderData.stock)) {
                    s = traderData.stock.map((it: any) =>
                        typeof it === "string" ? { name: it, qty: 0 } : { name: it.name, qty: it.qty ?? 0 }
                    );
                }
                setStock(s);
            }
        } catch (err) {
            console.error("Error fetching trader data:", err);
            Alert.alert("Error", "Could not load trader details");
        }
    };

    // update stock quantity locally + in Firestore
    const handleStockChange = async (index: number, value: string) => {
        const updated = [...stock];
        updated[index].qty = Number(value) || 0;
        setStock(updated);

        try {
            if (traderDocId) {
                const traderRef = doc(db, "traders", traderDocId);
                await updateDoc(traderRef, { stock: updated });
            }
        } catch (err) {
            console.error("Error updating stock:", err);
            Alert.alert("Error", "Failed to update stock");
        }
    };

    // search farmers by crop: look into farmers.crops (array)
    const handleSearch = async () => {
        if (!search.trim()) return;
        try {
            const farmersRef = collection(db, "farmers");
            const q = query(farmersRef, where("crops", "array-contains", search.trim()));
            const snap = await getDocs(q);
            const results: any[] = [];
            snap.forEach((d) => results.push({ id: d.id, ...d.data() }));
            setSearchResults(results);
        } catch (err) {
            console.error("Error searching farmers:", err);
            Alert.alert("Error", "Search failed");
        }
    };

    // fetch popular farmers in same district (limit 5)
    const fetchPopularFarmers = async (district: string) => {
        if (!district) return;
        try {
            const farmersRef = collection(db, "farmers");
            const q = query(farmersRef, where("district", "==", district), limit(5));
            const snap = await getDocs(q);
            const results: any[] = [];
            snap.forEach((d) => results.push({ id: d.id, ...d.data() }));
            setPopularFarmers(results);
        } catch (err) {
            console.error("Error fetching popular farmers:", err);
        }
    };

    useEffect(() => {
        fetchTraderData();
    }, [phone]);

    useEffect(() => {
        if (traderDistrict) fetchPopularFarmers(traderDistrict);
    }, [traderDistrict]);

    return (
        <LinearGradient colors={["#ffffff", "#f0fff0"]} style={{ flex: 1 }}>
            {/* Header */}
            <View style={styles.header}>
                <Image source={require("../assets/images/harvesthub_small_logo.jpg")} style={styles.logo} />
                <TouchableOpacity onPress={() => setMenuVisible(true)}>
                    <Ionicons name="menu" size={40} color="#D9E8D4" />
                </TouchableOpacity>
            </View>

            <ScrollView style={{ flex: 1, padding: 15 }} contentContainerStyle={{ paddingBottom: 100 }}>
                {/* Search Section */}
                <View style={[styles.searchSection, { marginTop: 30 }]}>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search crops (to find farmers)..."
                        value={search}
                        onChangeText={setSearch}
                    />
                    <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
                        <Text style={styles.searchButtonText}>Search</Text>
                    </TouchableOpacity>
                </View>

                {/* Search Results (farmers) */}
                {searchResults.length > 0 && (
                    <View style={{ marginTop: 20 }}>
                        <Text style={styles.sectionTitle}>Farmers selling "{search}"</Text>
                        {searchResults.map((farmer) => (
                            <View key={farmer.id} style={styles.resultCard}>
                                <Text style={styles.resultTitle}>{farmer.name || farmer.fullName}</Text>
                                <Text>{farmer.village || `${farmer.city || ""}${farmer.city ? ", " : ""}${farmer.district || ""}`}</Text>
                                <Text>Crops: {Array.isArray(farmer.crops) ? farmer.crops.map((c:any) => (typeof c === "string" ? c : c.name)).join(", ") : "N/A"}</Text>
                                <TouchableOpacity style={styles.requestButton}>
                                    <Text style={styles.requestButtonText}>Request</Text>
                                </TouchableOpacity>
                            </View>
                        ))}
                    </View>
                )}

                {/* Popular Farmers */}
                <View style={{ marginTop: 40 }}>
                    <Text style={styles.sectionTitle}>Popular Farmers in {traderDistrict || "..."}</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        {popularFarmers.map((farmer) => (
                            <View key={farmer.id} style={styles.popularCard}>
                                <Text style={styles.popularShop}>{farmer.village || farmer.name || farmer.fullName}</Text>
                                <Text style={styles.popularName}>{farmer.name || farmer.fullName}</Text>
                                <Text style={styles.popularCrops}>
                                    Crops: {Array.isArray(farmer.crops) ? farmer.crops.map((c:any) => (typeof c === "string" ? c : c.name)).join(", ") : "N/A"}
                                </Text>
                            </View>
                        ))}
                    </ScrollView>
                </View>

                {/* Trader Stock Table */}
                <View style={{ marginTop: 40 }}>
                    <Text style={styles.sectionTitle}>Your Stock (Quintals)</Text>
                    <View style={styles.tableHeader}>
                        <Text style={[styles.tableCell, { flex: 2 }]}>Item</Text>
                        <Text style={[styles.tableCell, { flex: 1 }]}>Qty</Text>
                    </View>

                    {stock.map((s, idx) => (
                        <View key={idx} style={styles.tableRow}>
                            <Text style={[styles.tableCell, { flex: 2 }]}>{s.name}</Text>
                            <TextInput
                                style={[styles.tableInput, { flex: 1 }]}
                                keyboardType="numeric"
                                value={s.qty.toString()}
                                onChangeText={(v) => handleStockChange(idx, v)}
                            />
                        </View>
                    ))}

                    {/* If no stock yet show a friendly hint */}
                    {stock.length === 0 && (
                        <Text style={{ color: "#666", marginTop: 8 }}>
                            No stock items yet. Add `stock` array to your trader document in Firestore like:
                            [{`{ name: "Wheat", qty: 0 }`}].
                        </Text>
                    )}
                </View>
            </ScrollView>

            {/* Hamburger Menu */}
            <Modal transparent visible={menuVisible} animationType="fade" onRequestClose={() => setMenuVisible(false)}>
                <TouchableOpacity style={styles.modalOverlay} onPress={() => setMenuVisible(false)} activeOpacity={1}>
                    <View style={styles.menuContainer}>
                        <TouchableOpacity
                            style={styles.menuItem}
                            onPress={() => {
                                setMenuVisible(false);
                                router.replace("/trader-login");
                            }}
                        >
                            <Text style={styles.menuText}>Logout</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.menuItem}
                            onPress={() => {
                                setMenuVisible(false);
                                router.push("/trader-edit");
                            }}
                        >
                            <Text style={styles.menuText}>Edit Profile</Text>
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={styles.menuItem}
                            onPress={() => {
                                setMenuVisible(false);
                                router.push("/trader-requests");
                            }}
                        >
                            <Text style={styles.menuText}>Requests</Text>
                        </TouchableOpacity>
                    </View>
                </TouchableOpacity>
            </Modal>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    header: {
        height: 140,
        backgroundColor: "#3F723C",
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        paddingHorizontal: 15,
    },
    logo: { width: 120, height: 120, resizeMode: "contain" },
    searchSection: { flexDirection: "row", alignItems: "center" },
    searchInput: {
        flex: 1,
        backgroundColor: "#D9E8D4",
        borderRadius: 8,
        padding: 10,
        fontSize: 14,
        marginRight: 10,
    },
    searchButton: { backgroundColor: "#3F723C", borderRadius: 8, paddingVertical: 10, paddingHorizontal: 15 },
    searchButtonText: { color: "#fff", fontWeight: "bold" },
    sectionTitle: { fontSize: 20, fontWeight: "bold", marginBottom: 15, color: "#3F723C" },
    resultCard: {
        backgroundColor: "#fff",
        borderRadius: 10,
        padding: 15,
        marginBottom: 10,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 3,
    },
    resultTitle: { fontWeight: "bold", fontSize: 16, color: "#3F723C" },
    requestButton: { marginTop: 10, backgroundColor: "#3F723C", borderRadius: 6, paddingVertical: 6, paddingHorizontal: 12, alignSelf: "flex-start" },
    requestButtonText: { color: "#fff", fontWeight: "600" },
    popularCard: {
        backgroundColor: "#fff",
        borderRadius: 12,
        padding: 20,
        width: 240,
        marginRight: 15,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowOffset: { width: 0, height: 2 },
        shadowRadius: 4,
        elevation: 3,
    },
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
