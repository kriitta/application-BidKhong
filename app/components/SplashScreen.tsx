import { ResizeMode, Video } from "expo-av";
import React, { useEffect, useRef, useState } from "react";
import { Animated, Dimensions, StyleSheet } from "react-native";

const { width, height } = Dimensions.get("window");

interface SplashScreenProps {
  onVideoEnd: () => void;
  duration?: number;
  isReady?: boolean;
}

const SplashScreenComponent: React.FC<SplashScreenProps> = ({
  onVideoEnd,
  duration = 15000,
  isReady = false,
}) => {
  const videoRef = useRef<Video>(null);
  const [hasTransitioned, setHasTransitioned] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // เมื่อข้อมูล + API โหลดเสร็จ (isReady) → transition ออก
  useEffect(() => {
    if (isReady && !hasTransitioned) {
      handleTransition();
    }
  }, [isReady]);

  useEffect(() => {
    // Timeout fallback — กันกรณี API ช้ามาก
    const fallbackTimer = setTimeout(() => {
      if (!hasTransitioned) {
        handleTransition();
      }
    }, duration);

    return () => clearTimeout(fallbackTimer);
  }, [duration, hasTransitioned]);

  useEffect(() => {
    if (videoLoaded && videoRef.current) {
      videoRef.current.playAsync().catch(() => {
        console.warn("Video play failed, using timeout");
      });
    }
  }, [videoLoaded]);

  const handleTransition = () => {
    if (hasTransitioned) return;
    setHasTransitioned(true);

    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 600,
      useNativeDriver: true,
    }).start(() => {
      onVideoEnd();
    });
  };

  const handlePlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded && !videoLoaded) {
      setVideoLoaded(true);
    }
    // ไม่ transition เมื่อวิดีโอจบ — รอ isReady (API โหลดเสร็จ) แทน
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <Video
        ref={videoRef}
        source={require("../../assets/splashscreen_bidkhong.mp4")}
        style={styles.video}
        resizeMode={ResizeMode.COVER}
        isLooping={false}
        shouldPlay={true}
        useNativeControls={false}
        isMuted={true}
        onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
        onError={(error) => {
          console.error("Video error:", error);
          // Fallback เมื่อ video error
          handleTransition();
        }}
      />
    </Animated.View>
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
    fontSize: 24,
    color: "#fff",
    textShadowColor: "rgba(0, 0, 0, 0.8)",
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
});

export default SplashScreenComponent;
