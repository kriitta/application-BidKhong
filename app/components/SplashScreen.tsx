import { ResizeMode, Video } from "expo-av";
import React, { useEffect, useRef, useState } from "react";
import { Dimensions, StyleSheet, View } from "react-native";
import { AppText } from "./appText";

const { width, height } = Dimensions.get("window");

interface SplashScreenProps {
  onVideoEnd: () => void;
  duration?: number;
}

const SplashScreenComponent: React.FC<SplashScreenProps> = ({
  onVideoEnd,
  duration = 5000,
}) => {
  const videoRef = useRef<Video>(null);
  const [videoEnded, setVideoEnded] = useState(false);

  useEffect(() => {
    // Set a timeout to transition after video duration or 5 seconds
    const timer = setTimeout(() => {
      if (!videoEnded) {
        handleTransition();
      }
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, videoEnded]);

  const handleTransition = () => {
    setVideoEnded(true);
    onVideoEnd();
  };

  const handleVideoEnd = () => {
    handleTransition();
  };

  return (
    <View style={styles.container}>
      <Video
        ref={videoRef}
        source={require("../../assets/splashscreen_bidkhong.mp4")}
        style={styles.video}
        resizeMode={ResizeMode.COVER}
        isLooping={false}
        shouldPlay
        onPlaybackStatusUpdate={(status) => {
          if (status.isLoaded && status.didJustFinish) {
            handleVideoEnd();
          }
        }}
      />
      
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
    justifyContent: "center",
    alignItems: "center",
  },
  video: {
    width: "100%",
    height: "100%",
    position: "absolute",
    top: 0,
    left: 0,
  },
  overlay: {
    position: "absolute",
    bottom: 60,
    alignItems: "center",
    justifyContent: "center",
  },
  brandText: {
    fontSize: 28,
    color: "#fff",
    textShadowColor: "rgba(0, 0, 0, 0.8)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
});

export default SplashScreenComponent;
