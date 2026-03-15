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
import LottieView from "lottie-react-native";
import { useEffect, useState } from "react";
import { StyleSheet, View } from "react-native";
import { AppReadyProvider, useAppReady } from "../contexts/AppReadyContext";
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
  const { isHomeReady, markHomeReady } = useAppReady();
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
      markHomeReady(); // ไม่ต้องรอข้อมูล home
      if (segments[0] !== "welcome" && segments[0] !== "login") {
        router.replace("/welcome");
      }
    }
    // If logged in as admin
    else if (userRole === "admin") {
      markHomeReady(); // admin ไม่ต้องรอข้อมูล home
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

  // Render app + splash overlay
  // Stack renders underneath so home.tsx can start fetching API data
  // Splash จะ fade out เมื่อ auth check + home data โหลดเสร็จ
  return (
    <View style={{ flex: 1 }}>
      {ready ? (
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="screens" />
          <Stack.Screen name="tabs" options={{ headerShown: false }} />
          <Stack.Screen name="components" />
          <Stack.Screen name="navigation" />
          <Stack.Screen name="admin" options={{ headerShown: false }} />
        </Stack>
      ) : (
        <View style={{ flex: 1, backgroundColor: "#001A3D" }} />
      )}
      {showSplash && (
        <View
          style={[StyleSheet.absoluteFill, { zIndex: 999, elevation: 999 }]}
          pointerEvents="none"
        >
          <SplashScreen
            onVideoEnd={() => setShowSplash(false)}
            duration={15000}
            isReady={ready && isHomeReady}
          />
        </View>
      )}
    </View>
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
          alignItems: "center",
          backgroundColor: "#001A3D",
        }}
      >
        <LottieView
          source={require("../assets/animations/loading.json")}
          autoPlay
          loop
          style={{ width: 120, height: 120 }}
        />
      </View>
    );
  }

  return (
    <AuthProvider>
      <AppReadyProvider>
        <RootLayoutInner />
      </AppReadyProvider>
    </AuthProvider>
  );
}
