import { useLocalSearchParams, useRouter } from "expo-router";
import LottieView from "lottie-react-native";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Image,
  Keyboard,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { image } from "../../assets/images";
import { AppText } from "../components/appText";

interface Auction {
  id: number;
  name: string;
  time: string;
  image: any;
  isHot?: boolean;
  isEnding?: boolean;
  isIncoming?: boolean;
}

const ViewAllPage = () => {
  const { type } = useLocalSearchParams();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const lottieRef = useRef<LottieView>(null);
  const searchInputRef = useRef<TextInput>(null);

  useEffect(() => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  }, [scaleAnim, opacityAnim]);

  // Mock data for different auction types
  const allAuctions: { [key: string]: Auction[] } = {
    hot: [
      {
        id: 1,
        name: "Macbook Pro M3",
        time: "21:17:56",
        image: image.macbook,
        isHot: true,
      },
      {
        id: 2,
        name: "BMW i8",
        time: "21:17:56",
        image: image.i8,
        isHot: true,
      },
      {
        id: 3,
        name: "Labubu New Collection",
        time: "21:17:56",
        image: image.labubu,
        isHot: true,
      },
      {
        id: 4,
        name: "iPhone 14 Pro",
        time: "18:45:30",
        image: image.macbook,
        isHot: true,
      },
      {
        id: 5,
        name: "Samsung S23",
        time: "14:20:15",
        image: image.i8,
        isHot: true,
      },
      {
        id: 6,
        name: "iPad Pro",
        time: "10:30:45",
        image: image.labubu,
        isHot: true,
      },
      {
        id: 7,
        name: "Apple Watch Series 8",
        time: "09:15:20",
        image: image.macbook,
        isHot: true,
      },
      {
        id: 8,
        name: "Sony WH-1000XM5",
        time: "08:45:00",
        image: image.i8,
        isHot: true,
      },
    ],
    ending: [
      {
        id: 1,
        name: "Macbook Pro M3",
        time: "21:17:56",
        image: image.macbook,
        isEnding: true,
      },
      {
        id: 2,
        name: "BMW i8",
        time: "21:17:56",
        image: image.i8,
        isEnding: true,
      },
      {
        id: 3,
        name: "Labubu New Collection",
        time: "21:17:56",
        image: image.labubu,
        isEnding: true,
      },
      {
        id: 4,
        name: "Gaming Laptop ASUS ROG",
        time: "19:30:22",
        image: image.macbook,
        isEnding: true,
      },
      {
        id: 5,
        name: "Nintendo Switch Pro",
        time: "16:45:10",
        image: image.i8,
        isEnding: true,
      },
      {
        id: 6,
        name: "Vintage Camera",
        time: "12:20:55",
        image: image.labubu,
        isEnding: true,
      },
    ],
    incoming: [
      {
        id: 1,
        name: "Macbook Pro M3",
        time: "15 mins",
        image: image.macbook,
        isIncoming: true,
      },
      {
        id: 2,
        name: "BMW i8",
        time: "2 hours",
        image: image.i8,
        isIncoming: true,
      },
      {
        id: 3,
        name: "Labubu New Collection",
        time: "2 days",
        image: image.labubu,
        isIncoming: true,
      },
      {
        id: 4,
        name: "Playstation 5",
        time: "3 hours",
        image: image.macbook,
        isIncoming: true,
      },
      {
        id: 5,
        name: "Mac Mini M2",
        time: "1 day",
        image: image.i8,
        isIncoming: true,
      },
      {
        id: 6,
        name: "Studio Display",
        time: "5 days",
        image: image.labubu,
        isIncoming: true,
      },
      {
        id: 7,
        name: "AirPods Pro 2",
        time: "8 hours",
        image: image.macbook,
        isIncoming: true,
      },
    ],
  };

  const typeStr = (type as string) || "hot";
  const typeTitle =
    {
      hot: "Hot Auctions",
      ending: "Ending Soon",
      incoming: "Incoming",
    }[typeStr] || "All Auctions";

  // Re-trigger empty state animation when search yields no results
  useEffect(() => {
    if (searchQuery.length > 0) {
      const items = allAuctions[typeStr] || [];
      const filtered = items.filter((item) =>
        item.name.toLowerCase().includes(searchQuery.toLowerCase()),
      );
      if (filtered.length === 0) {
        scaleAnim.setValue(0.5);
        opacityAnim.setValue(0);
        Animated.parallel([
          Animated.spring(scaleAnim, { toValue: 1, useNativeDriver: true }),
          Animated.timing(opacityAnim, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
        ]).start();
      }
    }
  }, [searchQuery, typeStr]);

  const filteredAuctions = useMemo(() => {
    const items = allAuctions[typeStr] || [];
    if (!searchQuery.trim()) return items;
    return items.filter((item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [searchQuery, typeStr]);

  const handleProductPress = (item: Auction) => {
    router.push({
      pathname: "/screens/product-detail",
      params: {
        productId: item.id.toString(),
        productName: item.name,
        productImage: JSON.stringify(item.image),
        time: item.time,
        isHot: item.isHot ? "true" : "false",
        isEnding: item.isEnding ? "true" : "false",
        isIncoming: item.isIncoming ? "true" : "false",
      },
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Image source={image.back} style={{ width: 28, height: 28 }} />
          </TouchableOpacity>
          <AppText weight="semibold" style={styles.title}>
            {typeTitle}
          </AppText>
          <View style={{ width: 40 }} />
        </View>

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View
            style={[
              styles.searchWrapper,
              isSearchFocused && styles.searchWrapperActive,
            ]}
          >
            <Image source={image.search_gray} style={styles.searchIcon} />
            <TextInput
              ref={searchInputRef}
              style={styles.searchInput}
              placeholder={`Search in ${typeTitle}...`}
              placeholderTextColor="#B0B0B0"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              returnKeyType="search"
              autoCorrect={false}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => setSearchQuery("")}
                style={styles.clearBtn}
              >
                <AppText style={styles.clearBtnText}>✕</AppText>
              </TouchableOpacity>
            )}
          </View>
          {isSearchFocused && (
            <TouchableOpacity
              onPress={() => {
                Keyboard.dismiss();
                setIsSearchFocused(false);
                setSearchQuery("");
              }}
              style={styles.cancelBtn}
            >
              <AppText weight="medium" style={styles.cancelText}>
                Cancel
              </AppText>
            </TouchableOpacity>
          )}
        </View>

        {/* Auctions Grid */}
        <View style={styles.gridContainer}>
          {filteredAuctions.length > 0 ? (
            <View style={styles.grid}>
              {filteredAuctions.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.auctionCard}
                  onPress={() => handleProductPress(item)}
                >
                  <View style={styles.auctionImageContainer}>
                    {item.isHot && (
                      <View style={styles.hotBadge}>
                        <Image
                          source={image.hot_badge}
                          style={{ width: 13, height: 14 }}
                        />
                      </View>
                    )}
                    {item.isEnding && (
                      <View style={styles.endingBadge}>
                        <Image
                          source={image.ending_badge}
                          style={{ width: 18, height: 18 }}
                        />
                      </View>
                    )}
                    {item.isIncoming && (
                      <View style={styles.incomingBadgeCard}>
                        <Image
                          source={image.incoming}
                          style={{ width: 16, height: 16 }}
                        />
                      </View>
                    )}
                    <View style={styles.timeBadge}>
                      <Image
                        source={image.incoming_time}
                        style={{ width: 12, height: 12, marginRight: 4 }}
                      />
                      <AppText weight="medium" style={styles.timeText}>
                        {item.time}
                      </AppText>
                    </View>
                    <Image source={item.image} style={styles.auctionImage} />
                  </View>
                  <AppText weight="medium" style={styles.auctionName}>
                    {item.name}
                  </AppText>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View style={styles.emptyContainer}>
              <Animated.View
                style={[
                  styles.emptyStateContent,
                  {
                    transform: [{ scale: scaleAnim }],
                    opacity: opacityAnim,
                  },
                ]}
              >
                <LottieView
                  ref={lottieRef}
                  source={require("../../assets/animations/search.json")}
                  autoPlay
                  loop
                  style={{ width: 180, height: 180, opacity: 0.8 }}
                />
                <AppText weight="semibold" style={styles.emptyTitle}>
                  No Products Found
                </AppText>
                <AppText weight="regular" style={styles.emptySubtitle}>
                  Try adjusting your search
                </AppText>
              </Animated.View>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContent: {
    paddingBottom: 30,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  title: {
    fontSize: 18,
    color: "#111827",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  searchWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 8,
  },
  searchWrapperActive: {
    borderColor: "#4285F4",
    borderWidth: 1.5,
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  searchIcon: {
    width: 16,
    height: 16,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    paddingRight: 12,
    fontSize: 14,
    color: "#111827",
  },
  clearBtn: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 6,
  },
  clearBtnText: {
    fontSize: 13,
    color: "#999",
  },
  cancelBtn: {
    paddingVertical: 8,
    paddingLeft: 12,
  },
  cancelText: {
    fontSize: 15,
    color: "#4285F4",
  },
  gridContainer: {
    paddingHorizontal: 16,
    paddingTop: 12,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  auctionCard: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 12,
    overflow: "hidden",
  },
  auctionImageContainer: {
    position: "relative",
    width: "100%",
    height: 160,
    backgroundColor: "#f0f0f0",
  },
  auctionImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  hotBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#FF0000",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
  },
  endingBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: "#FF8C00",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
  },
  incomingBadgeCard: {
    position: "absolute",
    top: 8,
    left: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#9b27b0b4",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
  },
  timeBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 4,
    zIndex: 1,
  },
  timeText: {
    fontSize: 10,
    color: "#fff",
  },
  auctionName: {
    fontSize: 13,
    color: "#111827",
    paddingHorizontal: 8,
    paddingVertical: 8,
    textAlign: "center",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 300,
  },
  emptyStateContent: {
    alignItems: "center",
  },
  emptyTitle: {
    fontSize: 18,
    color: "#111827",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#6B7280",
  },
});

export default ViewAllPage;
