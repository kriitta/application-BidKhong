import {
  NotoSansThai_300Light,
  NotoSansThai_400Regular,
  NotoSansThai_500Medium,
  NotoSansThai_600SemiBold,
  NotoSansThai_700Bold,
} from "@expo-google-fonts/noto-sans-thai";
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
import { useEffect, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import { AppReadyProvider, useAppReady } from "../contexts/AppReadyContext";
import { AuthProvider, useAuth } from "../contexts/AuthContext";
import { LanguageProvider } from "../contexts/LanguageContext";
import { tokenManager } from "../utils/api/config";
import SplashScreen from "./components/SplashScreen";

// Try to load expo-notifications (not available in Expo Go on Android)
let Notifications: typeof import("expo-notifications") | null = null;
try {
  Notifications = require("expo-notifications");
} catch {
  // Running in Expo Go — notifications unavailable
}

// Reactotron — dev only
if (__DEV__) {
  require("../reactotron.config");
}

function RootLayoutInner() {
  const [ready, setReady] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const { isLoggedIn, isGuest, userRole, isBanned, loginSuccess } = useAuth();
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

    // ถ้าโดนแบน → ไปหน้าแบน
    if (isBanned) {
      if (segments[0] !== "screens" || segments[1] !== "banned") {
        router.replace("/screens/banned");
      }
      return;
    }

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
  }, [ready, isLoggedIn, isGuest, userRole, isBanned, segments]);

  // ── Notification tap handler — navigate to relevant screen ──
  const notificationResponseRef = useRef<any>(null);
  useEffect(() => {
    if (!Notifications) return;

    const handleNotificationTap = (response: any) => {
      const data = response?.notification?.request?.content?.data;
      if (!data) return;

      const type = (data.type as string) ?? "";
      const productId = data.productId as string | undefined;

      // Product-related notifications → go to product detail
      if (
        productId &&
        [
          "outbid",
          "won",
          "auction_lost",
          "buynow_lost",
          "buynow_purchased",
          "new_bid",
          "ending_soon",
          "product_approved",
          "product_rejected",
          "order_buyer_confirmed",
          "order_seller_shipped",
          "order_completed",
          "order_disputed",
          "order_cancelled",
        ].includes(type)
      ) {
        router.push({
          pathname: "/screens/product-detail",
          params: { productId },
        });
        return;
      }

      // Wallet-related notifications → go to wallet tab
      if (["deposit", "withdraw"].includes(type)) {
        router.push("/tabs/wallet");
        return;
      }

      // Report notifications → go to help & support
      if (
        ["report_pending", "report_reviewing", "report_resolved"].includes(type)
      ) {
        router.push("/screens/help-support");
        return;
      }

      // Fallback: if we have a productId even for unknown type
      if (productId) {
        router.push({
          pathname: "/screens/product-detail",
          params: { productId },
        });
      }
    };

    // Handle tap when app is already open
    const sub = Notifications.addNotificationResponseReceivedListener(
      handleNotificationTap,
    );

    // Handle tap that launched the app (cold start)
    Notifications.getLastNotificationResponseAsync().then((response) => {
      if (
        response &&
        response.actionIdentifier ===
          Notifications!.DEFAULT_ACTION_IDENTIFIER &&
        notificationResponseRef.current !== response
      ) {
        notificationResponseRef.current = response;
        handleNotificationTap(response);
      }
    });

    return () => sub.remove();
  }, [ready, router]);

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
    NotoSansThai_300Light,
    NotoSansThai_400Regular,
    NotoSansThai_500Medium,
    NotoSansThai_600SemiBold,
    NotoSansThai_700Bold,
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
    <LanguageProvider>
      <AuthProvider>
        <AppReadyProvider>
          <RootLayoutInner />
        </AppReadyProvider>
      </AuthProvider>
    </LanguageProvider>
  );
}
