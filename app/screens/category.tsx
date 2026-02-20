import { image } from "@/assets/images";
import { useLocalSearchParams, useRouter } from "expo-router";
import LottieView from "lottie-react-native";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Image,
  Keyboard,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { apiService, getFullImageUrl } from "../../utils/api";
import { Category, Product, Subcategory } from "../../utils/api/types";
import { AppText } from "../components/appText";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// ─── Image mapping สำหรับ subcategory (ใช้ name จาก API map กับรูปใน local) ───
const SUBCATEGORY_IMAGES: Record<string, any> = {
  "Smartphones & Tablets": image.smartphone,
  "Computers & Laptops": image.computer,
  "Cameras & Photography": image.photography,
  "Audio & Headphones": image.headphone,
  "Gaming & Consoles": image.game,
  "Wearables & Smartwatch": image.smartwatch,
  "Men's Clothing": image.men,
  "Women's Clothing": image.women,
  "Shoes & Footwear": image.shoes,
  "Bags & Accessories": image.bags,
  "Watches & Jewelry": image.jew,
  "Art & Paintings": image.art,
  "Toys & Figures": image.toy,
  "Coins & Stamps": image.coin,
  "Trading Cards": image.card,
  "Antiques & Vintage": image.antique,
  Furniture: image.furniture,
  "Home Decor": image.decor,
  "Kitchen & Dining": image.kitchen,
  "Garden & Outdoor": image.garden,
  Cars: image.cars,
  Motorcycles: image.motorcycle,
  "Parts & Accessories": image.part,
  "Electric Vehicles": image.elec_car,
  "Books & Magazines": image.book,
  "Sports & Fitness": image.sport,
  "Musical Instruments": image.music,
  "Pet Supplies": image.pet,
};

const CategoryPage = () => {
  const { categoryId, categoryName } = useLocalSearchParams();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState<Category | null>(null);
  const [subcategories, setSubcategories] = useState<Subcategory[]>([]);
  const [selectedSub, setSelectedSub] = useState<Subcategory | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [scaleAnim] = useState(new Animated.Value(0.5));
  const [opacityAnim] = useState(new Animated.Value(0));
  const lottieRef = useRef<LottieView>(null);
  const searchInputRef = useRef<TextInput>(null);

  // ─── Products state ───
  const [products, setProducts] = useState<Product[]>([]);
  const [productsLoading, setProductsLoading] = useState(false);

  // ─── Fetch products เมื่อเลือก subcategory ───
  useEffect(() => {
    if (!selectedSub) {
      setProducts([]);
      return;
    }
    const fetchProducts = async () => {
      try {
        setProductsLoading(true);
        const res = await apiService.product.getProducts({
          subcategory_id: selectedSub.id,
        });
        setProducts(res.data);
      } catch (error: any) {
        console.error("Failed to fetch products:", error.message);
      } finally {
        setProductsLoading(false);
      }
    };
    fetchProducts();
  }, [selectedSub]);

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

  /** แปลงราคา */
  const formatPrice = (price: string) => {
    const num = parseFloat(price);
    return `฿${num.toLocaleString("en-US", { minimumFractionDigits: 0 })}`;
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

  // ─── Fetch subcategories จาก API /subcategories แล้ว filter ตาม categoryId ───
  useEffect(() => {
    const fetchSubcategories = async () => {
      try {
        setLoading(true);
        const allSubs = await apiService.category.getAllSubcategories();
        // filter เฉพาะ subcategory ที่อยู่ใน category นี้
        const filtered = allSubs.filter(
          (sub) => sub.category_id === Number(categoryId),
        );
        setSubcategories(filtered);
        // เอาชื่อ category จาก parent ของ subcategory ตัวแรก (ถ้ามี)
        if (filtered.length > 0 && filtered[0].category) {
          setCategory(filtered[0].category);
        }
      } catch (error: any) {
        console.error("Failed to fetch subcategories:", error.message);
      } finally {
        setLoading(false);
      }
    };

    if (categoryId) {
      fetchSubcategories();
    }
  }, [categoryId]);

  // ─── Animation for empty state ───
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

  // ─── Filter products by search ───
  const filteredProducts = useMemo(() => {
    if (!searchQuery.trim()) return products;
    return products.filter((item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [searchQuery, products]);

  const displayTitle = selectedSub
    ? selectedSub.name
    : category?.name || String(categoryName || "Category");

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0088FF" />
          <AppText weight="medium" style={styles.loadingText}>
            Loading...
          </AppText>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            if (selectedSub) {
              setSelectedSub(null);
              setSearchQuery("");
            } else {
              router.back();
            }
          }}
        >
          <Image source={image.back} style={{ width: 32, height: 32 }} />
        </TouchableOpacity>
        <AppText weight="semibold" style={styles.title} numberOfLines={1}>
          {displayTitle}
        </AppText>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {!selectedSub ? (
          <View>
            <AppText
              weight="medium"
              style={styles.sectionLabel}
              numberOfLines={1}
            >
              Select a subcategory
            </AppText>

            {/* ─── Subcategory Grid ─── */}
            {subcategories.length > 0 ? (
              <View style={styles.grid}>
                {subcategories.map((sub) => (
                  <TouchableOpacity
                    key={sub.id}
                    style={styles.card}
                    onPress={() => setSelectedSub(sub)}
                  >
                    <View style={styles.cardImageContainer}>
                      {SUBCATEGORY_IMAGES[sub.name] ? (
                        <Image
                          source={SUBCATEGORY_IMAGES[sub.name]}
                          style={styles.cardImage}
                        />
                      ) : (
                        <View
                          style={[
                            styles.cardImage,
                            {
                              backgroundColor: "#E8F0FF",
                              justifyContent: "center",
                              alignItems: "center",
                            },
                          ]}
                        >
                          <AppText style={{ fontSize: 32 }}>📦</AppText>
                        </View>
                      )}
                    </View>
                    <AppText
                      weight="semibold"
                      numberOfLines={1}
                      style={styles.cardText}
                    >
                      {sub.name}
                    </AppText>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View style={styles.emptyStateContainer}>
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
                    style={styles.emptyStateTitle}
                    numberOfLines={1}
                  >
                    No Subcategories Found
                  </AppText>
                  <AppText
                    weight="regular"
                    style={styles.emptyStateSubtitle}
                    numberOfLines={2}
                  >
                    Try adjusting your search
                  </AppText>
                </Animated.View>
              </View>
            )}
          </View>
        ) : (
          /* ─── Selected Subcategory → Products ─── */
          <View style={{ flex: 1 }}>
            {/* ─── Search Bar ─── */}
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
                  placeholder={`Search in ${selectedSub.name}...`}
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

            {productsLoading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color="#0088FF" />
                <AppText weight="medium" style={styles.loadingText}>
                  Loading products...
                </AppText>
              </View>
            ) : filteredProducts.length > 0 ? (
              <View style={styles.productGrid}>
                {filteredProducts.map((prod) => (
                  <TouchableOpacity
                    key={prod.id}
                    style={styles.productCard}
                    onPress={() =>
                      router.push({
                        pathname: "/screens/product-detail",
                        params: { productId: prod.id.toString() },
                      })
                    }
                  >
                    {prod.tag === "hot" && (
                      <View style={styles.hotBadge}>
                        <Image
                          source={image.hot_badge}
                          style={{ width: 13, height: 14 }}
                        />
                      </View>
                    )}
                    {prod.tag === "ending" && (
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
                            prod.tag === "incoming"
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
                        style={styles.productTimeText}
                      >
                        {prod.tag === "incoming"
                          ? formatTimeRemaining(prod.auction_start_time)
                          : formatTimeRemaining(prod.auction_end_time)}
                      </AppText>
                    </View>
                    <Image
                      source={getProductImage(prod)}
                      style={[styles.productImage, { marginBottom: 8 }]}
                    />
                    <AppText
                      weight="medium"
                      numberOfLines={1}
                      style={styles.productName}
                    >
                      {prod.name}
                    </AppText>
                  </TouchableOpacity>
                ))}
              </View>
            ) : (
              <View style={styles.emptyStateContainer}>
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
                    style={styles.emptyStateTitle}
                    numberOfLines={1}
                  >
                    No Products Found
                  </AppText>
                  <AppText
                    weight="regular"
                    style={styles.emptyStateSubtitle}
                    numberOfLines={2}
                  >
                    {searchQuery.trim()
                      ? "Try adjusting your search"
                      : `No products in "${selectedSub.name}" yet`}
                  </AppText>
                </Animated.View>
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: "#6B7280",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  title: { fontSize: 18, color: "#111827" },
  sectionLabel: { fontSize: 14, marginBottom: 12, color: "#374151" },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "space-between",
  },
  card: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    elevation: 2,
  },
  cardImageContainer: {
    position: "relative",
    width: "100%",
    height: 140,
  },
  cardImage: { width: "100%", height: "100%", resizeMode: "cover" },
  cardText: {
    textAlign: "center",
    fontSize: 12,
    color: "#111827",
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 0,
    paddingBottom: 12,
  },
  searchWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
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
  emptyStateContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    minHeight: 400,
  },
  emptyStateContent: {
    alignItems: "center",
  },
  emptyStateTitle: {
    fontSize: 18,
    color: "#111827",
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
  },
  productGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    gap: 12,
  },
  productCard: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 15,
    marginBottom: 16,
    alignItems: "center",
  },
  productImage: {
    width: "100%",
    height: 140,
    borderRadius: 10,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
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
  incomingBadge: {
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
  productTimeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
  },
  productName: {
    fontSize: 13,
    fontWeight: "600",
    color: "#000",
    marginTop: 8,
    textAlign: "center",
    paddingHorizontal: 4,
  },
});

export default CategoryPage;
