import AsyncStorage from "@react-native-async-storage/async-storage";
import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import SplashScreen from "./components/SplashScreen";

export default function RootLayout() {
  const [ready, setReady] = useState(false);
  const [firstLaunch, setFirstLaunch] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const router = useRouter();
  const segments = useSegments();

  useEffect(() => {
    const init = async () => {
      const seen = await AsyncStorage.getItem("hasSeenWelcome");
      setFirstLaunch(seen === null);
      setReady(true);
    };
    init();
  }, []);

  useEffect(() => {
    if (!ready) return;

    const inAuthGroup = segments[0] === "tabs";

    if (firstLaunch && !inAuthGroup) {
      // ถ้ายังไม่เคยเห็น welcome ให้ไปหน้า welcome
      router.replace("/welcome");
    }
  }, [ready, firstLaunch, segments]);

  // Show video splash screen on first load
  if (showSplash) {
    return (
      <SplashScreen onVideoEnd={() => setShowSplash(false)} duration={5000} />
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
    </Stack>
  );
}
