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
  duration = 5000,
  isReady = false,
}) => {
  const videoRef = useRef<Video>(null);
  const [videoEnded, setVideoEnded] = useState(false);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;

  // เมื่อข้อมูลโหลดเสร็จ (isReady) ให้ transition ออกทันที
  useEffect(() => {
    if (isReady && !videoEnded) {
      handleTransition();
    }
  }, [isReady]);

  useEffect(() => {
    // Timeout fallback - ให้แน่ใจว่ามันจะทำงาน
    const fallbackTimer = setTimeout(() => {
      if (!videoEnded) {
        handleTransition();
      }
    }, duration + 500);

    return () => clearTimeout(fallbackTimer);
  }, [duration, videoEnded]);

  useEffect(() => {
    // ถ้า video loaded และพอ 2 seconds ให้เริ่ม play ด้วย
    if (videoLoaded && videoRef.current) {
      videoRef.current.playAsync().catch(() => {
        // Fallback ถ้า play fail
        console.warn("Video play failed, using timeout");
      });
    }
  }, [videoLoaded]);

  const handleTransition = () => {
    if (videoEnded) return;
    setVideoEnded(true);

    // Fade out animation ก่อน
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 600,
      useNativeDriver: true,
    }).start(() => {
      onVideoEnd();
    });
  };

  const handleVideoEnd = () => {
    handleTransition();
  };

  const handlePlaybackStatusUpdate = (status: any) => {
    if (status.isLoaded && !videoLoaded) {
      setVideoLoaded(true);
    }
    if (status.isLoaded && status.didJustFinish) {
      handleVideoEnd();
    }
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
