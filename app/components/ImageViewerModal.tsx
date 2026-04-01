import Ionicons from "@expo/vector-icons/Ionicons";
import { Image } from "expo-image";
import React, { useRef, useState } from "react";
import {
  Dimensions,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native"
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { AppText } from "./appText";

const { width: SCREEN_W, height: SCREEN_H } = Dimensions.get("window");

interface ImageViewerModalProps {
  visible: boolean;
  images: string[]; // array of image URLs
  initialIndex?: number;
  onClose: () => void;
}

const ImageViewerModal: React.FC<ImageViewerModalProps> = ({
  visible,
  images,
  initialIndex = 0,
  onClose,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const scrollRef = useRef<ScrollView>(null);
  const insets = useSafeAreaInsets();

  // Reset index when modal opens
  React.useEffect(() => {
    if (visible) {
      setCurrentIndex(initialIndex);
      // Scroll to initial index after a short delay
      setTimeout(() => {
        scrollRef.current?.scrollTo({
          x: initialIndex * SCREEN_W,
          animated: false,
        });
      }, 50);
    }
  }, [visible, initialIndex]);

  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const newIndex = Math.round(e.nativeEvent.contentOffset.x / SCREEN_W);
    if (
      newIndex !== currentIndex &&
      newIndex >= 0 &&
      newIndex < images.length
    ) {
      setCurrentIndex(newIndex);
    }
  };

  if (images.length === 0) return null;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      presentationStyle="overFullScreen"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <View style={s.container}>
        {/* Top bar */}
        <View style={[s.topBar, { paddingTop: insets.top + 8 }]}>
          <View style={s.topBarInner}>
            <TouchableOpacity
              onPress={onClose}
              style={s.closeBtn}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Ionicons name="close" size={26} color="#FFF" />
            </TouchableOpacity>
            {images.length > 1 && (
              <View style={s.counterBadge}>
                <AppText weight="semibold" style={s.counterText}>
                  {currentIndex + 1} / {images.length}
                </AppText>
              </View>
            )}
            <View style={{ width: 40 }} />
          </View>
        </View>

        {/* Image gallery */}
        <ScrollView
          ref={scrollRef}
          horizontal
          pagingEnabled
          showsHorizontalScrollIndicator={false}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          contentOffset={{ x: initialIndex * SCREEN_W, y: 0 }}
        >
          {images.map((uri, idx) => (
            <View key={idx} style={s.page}>
              <ScrollView
                maximumZoomScale={4}
                minimumZoomScale={1}
                showsVerticalScrollIndicator={false}
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={s.zoomContainer}
                centerContent
                bouncesZoom
              >
                <Image source={{ uri }} style={s.image} contentFit="contain" />
              </ScrollView>
            </View>
          ))}
        </ScrollView>

        {/* Bottom dots */}
        {images.length > 1 && (
          <View style={[s.dotsBar, { paddingBottom: insets.bottom + 16 }]}>
            <View style={s.dotsRow}>
              {images.map((_, idx) => (
                <View
                  key={idx}
                  style={[
                    s.dot,
                    idx === currentIndex ? s.dotActive : s.dotInactive,
                  ]}
                />
              ))}
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
};

const s = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  topBar: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  topBarInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  closeBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  counterBadge: {
    backgroundColor: "rgba(0,0,0,0.5)",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
  },
  counterText: {
    color: "#FFF",
    fontSize: 14,
  },
  page: {
    width: SCREEN_W,
    height: SCREEN_H,
    justifyContent: "center",
    alignItems: "center",
  },
  zoomContainer: {
    width: SCREEN_W,
    height: SCREEN_H,
    justifyContent: "center",
    alignItems: "center",
  },
  image: {
    width: SCREEN_W,
    height: SCREEN_H * 0.75,
  },
  dotsBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
  },
  dotsRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingBottom: 16,
    gap: 6,
  },
  dot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  dotActive: {
    backgroundColor: "#FFF",
    width: 20,
  },
  dotInactive: {
    backgroundColor: "rgba(255,255,255,0.4)",
  },
});

export default ImageViewerModal;
