import { useLocalSearchParams, useRouter } from "expo-router";
import LottieView from "lottie-react-native";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
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
import { apiService, getFullImageUrl } from "../../utils/api";
import { Product } from "../../utils/api/types";
import { AppText } from "../components/appText";

const ViewAllPage = () => {
  const { type } = useLocalSearchParams();
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const scaleAnim = useRef(new Animated.Value(0.5)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const lottieRef = useRef<LottieView>(null);
  const searchInputRef = useRef<TextInput>(null);

  // ─── Products from API ───
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const typeStr = (type as string) || "hot";
  const typeTitle =
    {
      hot: "Hot Auctions",
      ending: "Ending Soon",
      default: "All Product",
      incoming: "Incoming",
    }[typeStr] || "All Auctions";

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await apiService.product.getProducts({ per_page: 100 });
        const all = res.data ?? [];
        // filter ด้วย tag ฝั่ง frontend
        setProducts(all.filter((p) => p.tag === typeStr));
      } catch (error: any) {
        console.error("Failed to fetch products:", error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, [typeStr]);

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

  /** ดึงรูปของ product */
  const getProductImage = (product: Product) => {
    if (product.images && product.images.length > 0) {
      const url = getFullImageUrl(product.images[0].image_url);
      if (url) return { uri: url };
    }
    if (product.image_url) {
      const url = getFullImageUrl(product.image_url);
      if (url) return { uri: url };
    }
    if (product.picture) {
      const url = getFullImageUrl(product.picture);
      if (url) return { uri: url };
    }
    return image.macbook;
  };

  /** แปลง auction_end_time เป็นข้อความเวลาที่เหลือ */
  const formatTimeRemaining = (endTime: string) => {
    const now = new Date();
    const end = new Date(endTime);
    const diff = end.getTime() - now.getTime();
    if (diff <= 0) return "Ended";
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  // Re-trigger empty state animation when search yields no results
  useEffect(() => {
    if (searchQuery.length > 0) {
      const filtered = products.filter((item) =>
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
  }, [searchQuery]);

  const filteredAuctions = useMemo(() => {
    if (!searchQuery.trim()) return products;
    return products.filter((item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [searchQuery, products]);

  const handleProductPress = (item: Product) => {
    router.push({
      pathname: "/screens/product-detail",
      params: {
        productId: item.id.toString(),
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
            <Image source={image.back} style={{ width: 32, height: 32 }} />
          </TouchableOpacity>
          <AppText weight="semibold" style={styles.title} numberOfLines={1}>
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
                <AppText style={styles.clearBtnText} numberOfLines={1}>
                  ✕
                </AppText>
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
              <AppText
                weight="medium"
                style={styles.cancelText}
                numberOfLines={1}
              >
                Cancel
              </AppText>
            </TouchableOpacity>
          )}
        </View>

        {/* Auctions Grid */}
        <View style={styles.gridContainer}>
          {loading ? (
            <View style={styles.emptyContainer}>
              <ActivityIndicator size="large" color="#0088FF" />
              <AppText
                weight="medium"
                style={{ color: "#6B7280", fontSize: 14, marginTop: 12 }}
              >
                Loading...
              </AppText>
            </View>
          ) : filteredAuctions.length > 0 ? (
            <View style={styles.grid}>
              {filteredAuctions.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.auctionCard}
                  onPress={() => handleProductPress(item)}
                >
                  {item.tag === "hot" && (
                    <View style={styles.hotBadge}>
                      <Image
                        source={image.hot_badge}
                        style={{ width: 13, height: 14 }}
                      />
                    </View>
                  )}
                  {item.tag === "ending" && (
                    <View style={styles.endingBadge}>
                      <Image
                        source={image.ending_badge}
                        style={{ width: 18, height: 18 }}
                      />
                    </View>
                  )}

                  <View
                    style={[
                      styles.timeBadge,
                      {
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 6,
                        backgroundColor:
                          item.tag === "incoming"
                            ? "#9b27b0b4"
                            : "rgba(0,0,0,0.7)",
                      },
                    ]}
                  >
                    <Image
                      source={image.incoming_time}
                      style={{ width: 12, height: 12 }}
                    />
                    <AppText
                      weight="medium"
                      numberOfLines={1}
                      style={styles.timeText}
                    >
                      {item.tag === "incoming"
                        ? formatTimeRemaining(item.auction_start_time)
                        : formatTimeRemaining(item.auction_end_time)}
                    </AppText>
                  </View>
                  <Image
                    source={getProductImage(item)}
                    style={[styles.auctionImage, { marginBottom: 8 }]}
                  />
                  <AppText
                    weight="medium"
                    numberOfLines={1}
                    style={styles.auctionName}
                  >
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
                <AppText
                  weight="semibold"
                  style={styles.emptyTitle}
                  numberOfLines={1}
                >
                  No Products Found
                </AppText>
                <AppText
                  weight="regular"
                  style={styles.emptySubtitle}
                  numberOfLines={2}
                >
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
    borderRadius: 15,
    marginBottom: 16,
    alignItems: "center",
  },
  auctionImage: {
    width: "100%",
    height: 140,
    borderRadius: 10,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  hotBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    width: 24,
    height: 24,
    borderRadius: 18,
    backgroundColor: "#FF0000",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
  },
  endingBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    width: 24,
    height: 24,
    borderRadius: 18,
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
    borderRadius: 18,
    backgroundColor: "#9b27b0b4",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
  },
  defaultBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    width: 24,
    height: 24,
    borderRadius: 18,
    backgroundColor: "#4285F4",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
  },
  timeBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 2,
  },
  timeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
  },
  auctionName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#000",
    marginTop: 8,
    textAlign: "center",
    paddingHorizontal: 4,
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
