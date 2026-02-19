import {
  Poppins_300Light,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
  useFonts,
} from "@expo-google-fonts/poppins";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { AuthProvider, useAuth } from "../contexts/AuthContext";
import { tokenManager } from "../utils/api/config";
import SplashScreen from "./components/SplashScreen";

// Reactotron — dev only
if (__DEV__) {
  require("../reactotron.config");
}

function RootLayoutInner() {
  const [ready, setReady] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const { isLoggedIn, isGuest, userRole, loginSuccess } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    const init = async () => {
      // Check if user is logged in
      const token = await tokenManager.getToken();
      const userData = await AsyncStorage.getItem("userData");
      if (token && userData) {
        loginSuccess(JSON.parse(userData));
      }
      setReady(true);
    };
    init();
  }, []);

  useEffect(() => {
    if (!ready) return;

    const inAdminGroup = segments[0] === "admin";

    // ถ้าเป็น guest → อนุญาตเข้า tabs ได้
    if (isGuest) {
      if (segments[0] !== "tabs" && segments[0] !== "screens") {
        router.replace("/tabs/home");
      }
      return;
    }

    // ถ้ายังไม่ login และไม่ใช่ guest → ไปหน้า welcome
    if (!isLoggedIn) {
      if (segments[0] !== "welcome" && segments[0] !== "login") {
        router.replace("/welcome");
      }
    }
    // If logged in as admin
    else if (userRole === "admin") {
      if (segments[0] !== "admin") {
        router.replace("/admin");
      }
    }
    // If logged in as user
    else if (userRole === "user") {
      if (inAdminGroup) {
        router.replace("/tabs/home");
      } else if (segments[0] === "login" || segments[0] === "welcome") {
        router.replace("/tabs/home");
      }
    }
  }, [ready, isLoggedIn, isGuest, userRole, segments]);

  // Show video splash screen on first load
  // จะ transition ออกทันทีเมื่อ ready (ไม่ต้องรอวิดีโอจบ)
  if (showSplash) {
    return (
      <SplashScreen
        onVideoEnd={() => setShowSplash(false)}
        duration={5000}
        isReady={ready}
      />
    );
  }

  if (!ready) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          backgroundColor: "#001A3D",
        }}
      >
        <ActivityIndicator size="large" color="#0088FF" />
      </View>
    );
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="screens" />
      <Stack.Screen name="tabs" options={{ headerShown: false }} />
      <Stack.Screen name="components" />
      <Stack.Screen name="navigation" />
      <Stack.Screen name="admin" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded] = useFonts({
    Poppins_300Light,
    Poppins_400Regular,
    Poppins_500Medium,
    Poppins_600SemiBold,
    Poppins_700Bold,
  });

  if (!fontsLoaded) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          backgroundColor: "#001A3D",
        }}
      >
        <ActivityIndicator size="large" color="#0088FF" />
      </View>
    );
  }

  return (
    <AuthProvider>
      <RootLayoutInner />
    </AuthProvider>
  );
}
