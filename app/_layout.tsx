import { Stack } from "expo-router";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ActivityIndicator, View } from "react-native";
import { useRouter, useSegments } from "expo-router";
import {
  Poppins_300Light,
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from "@expo-google-fonts/poppins";

export default function RootLayout() {
  const [ready, setReady] = useState(false);
  const [firstLaunch, setFirstLaunch] = useState(false);
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
