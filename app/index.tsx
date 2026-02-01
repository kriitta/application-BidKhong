import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ActivityIndicator, View } from "react-native";

export default function Index() {
  const [ready, setReady] = useState(false);
  const [firstLaunch, setFirstLaunch] = useState(false);

  useEffect(() => {
    const init = async () => {
      const seen = await AsyncStorage.getItem("hasSeenWelcome");
      setFirstLaunch(seen === null);
      setReady(true);
    };
    init();
  }, []);

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

  return <Redirect href="/welcome" />;
}
