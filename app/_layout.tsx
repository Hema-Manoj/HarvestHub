import { Stack } from "expo-router";
import { useFonts } from "expo-font";
import { View, ActivityIndicator, LogBox } from "react-native";
import Constants from "expo-constants";

// 🚨 Ignore expo-notifications warnings in Expo Go
LogBox.ignoreLogs([
    "expo-notifications",
    "`expo-notifications` functionality is not fully supported in Expo Go",
]);

// 👇 Only require notifications outside Expo Go
let Notifications: any = null;
if (Constants.appOwnership !== "expo") {
    Notifications = require("expo-notifications");

    // Ensure notifications show while app is foreground
    Notifications.setNotificationHandler({
        handleNotification: async () => ({
            shouldShowAlert: true,
            shouldPlaySound: true,
            shouldSetBadge: false,
        }),
    });
}

export default function RootLayout() {
    const [fontsLoaded] = useFonts({
        Nunito: require("../assets/fonts/Nunito-Regular.ttf"),
    });

    if (!fontsLoaded) {
        return (
            <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
                <ActivityIndicator size="large" />
            </View>
        );
    }
    return <Stack screenOptions={{ headerShown: false }} />;
}
