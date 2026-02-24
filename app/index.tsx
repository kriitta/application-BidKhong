import AsyncStorage from "@react-native-async-storage/async-storage";
import { Redirect } from "expo-router";
import LottieView from "lottie-react-native";
import { useEffect, useState } from "react";
import { View } from "react-native";

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
        <LottieView
          source={require("../assets/animations/loading.json")}
          autoPlay
          loop
          style={{ width: 120, height: 120 }}
        />
      </View>
    );
  }

  return <Redirect href="/welcome" />;
}
