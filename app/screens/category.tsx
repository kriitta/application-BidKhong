import { image } from "@/assets/images";
import { useLocalSearchParams, useRouter } from "expo-router";
import LottieView from "lottie-react-native";
import React, { useEffect, useMemo, useRef, useState } from "react";
import {
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
import { AppText } from "../components/appText";

const { width: SCREEN_WIDTH } = Dimensions.get("window");
const AUCTION_CARD_WIDTH = SCREEN_WIDTH * 0.44;

const SUBCATEGORIES: Record<
  string,
  Array<{ id: string; name: string; image?: any }>
> = {
  electronics: [
    {
      id: "smartphones",
      name: "Smartphones & Tablets",
      image: image.smartphone,
    },
    { id: "computers", name: "Computers & Laptops", image: image.computer },
    { id: "cameras", name: "Cameras & Photography", image: image.photography },
    { id: "audio", name: "Audio & Headphones", image: image.headphone },
    { id: "gaming", name: "Gaming & Consoles", image: image.game },
    {
      id: "wearables",
      name: "Wearables & Smartwatch",
      image: image.smartwatch,
    },
  ],
  fashion: [
    { id: "mens", name: "Men's Clothing", image: image.men },
    { id: "womens", name: "Women's Clothing", image: image.women },
    { id: "shoes", name: "Shoes & Footwear", image: image.shoes },
    { id: "bags", name: "Bags & Accessories", image: image.bags },
    { id: "watches", name: "Watches & Jewelry", image: image.jew },
  ],
  collectibles: [
    { id: "art", name: "Art & Paintings", image: image.art },
    { id: "toys", name: "Toys & Figures", image: image.toy },
    { id: "coins", name: "Coins & Stamps", image: image.coin },
    { id: "cards", name: "Trading Cards", image: image.card },
    { id: "antiques", name: "Antiques & Vintage", image: image.antique },
  ],
  home: [
    { id: "furniture", name: "Furniture", image: image.furniture },
    { id: "decor", name: "Home Decor", image: image.decor },
    { id: "kitchen", name: "Kitchen & Dining", image: image.kitchen },
    { id: "garden", name: "Garden & Outdoor", image: image.garden },
  ],
  vehicles: [
    { id: "cars", name: "Cars", image: image.cars },
    { id: "motorcycles", name: "Motorcycles", image: image.motorcycle },
    { id: "parts", name: "Parts & Accessories", image: image.part },
    { id: "ev", name: "Electric Vehicles", image: image.elec_car },
  ],
  others: [
    { id: "books", name: "Books & Magazines", image: image.book },
    { id: "sports", name: "Sports & Fitness", image: image.sport },
    { id: "music", name: "Musical Instruments", image: image.music },
    { id: "pets", name: "Pet Supplies", image: image.pet },
  ],
};

// Mock products per subcategory with auction info
const MOCK_PRODUCTS: Record<
  string,
  Array<{
    id: string;
    name: string;
    image: any;
    time: string;
    isHot: boolean;
    isEnding: boolean;
  }>
> = {
  // Electronics
  smartphones: [
    {
      id: "1",
      name: "iPhone 14 Pro",
      image: image.macbook,
      time: "21:17:56",
      isHot: true,
      isEnding: false,
    },
    {
      id: "2",
      name: "Samsung S23",
      image: image.macbook,
      time: "18:45:30",
      isHot: false,
      isEnding: true,
    },
    {
      id: "3",
      name: "iPhone 13",
      image: image.macbook,
      time: "05:20:15",
      isHot: false,
      isEnding: false,
    },
  ],
  computers: [
    {
      id: "4",
      name: "Macbook Pro M3",
      image: image.macbook,
      time: "21:17:56",
      isHot: true,
      isEnding: false,
    },
    {
      id: "5",
      name: "Dell XPS 15",
      image: image.macbook,
      time: "12:30:45",
      isHot: false,
      isEnding: true,
    },
  ],
  cameras: [
    {
      id: "10",
      name: "Sony A7IV",
      image: image.electronic,
      time: "14:20:00",
      isHot: true,
      isEnding: false,
    },
    {
      id: "11",
      name: "Canon EOS R6",
      image: image.electronic,
      time: "08:15:30",
      isHot: false,
      isEnding: true,
    },
  ],
  audio: [
    {
      id: "12",
      name: "AirPods Max",
      image: image.electronic,
      time: "10:45:00",
      isHot: false,
      isEnding: false,
    },
  ],
  gaming: [
    {
      id: "13",
      name: "PS5 Pro",
      image: image.electronic,
      time: "16:30:00",
      isHot: true,
      isEnding: false,
    },
    {
      id: "14",
      name: "Nintendo Switch 2",
      image: image.electronic,
      time: "03:20:15",
      isHot: false,
      isEnding: true,
    },
    {
      id: "15",
      name: "Xbox Series X",
      image: image.electronic,
      time: "19:00:00",
      isHot: false,
      isEnding: false,
    },
  ],
  wearables: [],

  // Fashion
  mens: [
    {
      id: "8",
      name: "Nike Air Jordan",
      image: image.shirt,
      time: "21:17:56",
      isHot: true,
      isEnding: false,
    },
  ],
  womens: [
    {
      id: "9",
      name: "Designer Dress",
      image: image.shirt,
      time: "10:30:00",
      isHot: false,
      isEnding: true,
    },
  ],
  shoes: [
    {
      id: "16",
      name: "Nike Dunk Low",
      image: image.other,
      time: "12:00:00",
      isHot: true,
      isEnding: false,
    },
    {
      id: "17",
      name: "Adidas Yeezy 350",
      image: image.other,
      time: "06:45:30",
      isHot: false,
      isEnding: true,
    },
  ],
  bags: [],
  watches: [
    {
      id: "18",
      name: "Rolex Submariner",
      image: image.other,
      time: "20:00:00",
      isHot: true,
      isEnding: false,
    },
  ],

  // Collectibles
  art: [
    {
      id: "19",
      name: "Abstract Oil Painting",
      image: image.collectible,
      time: "15:30:00",
      isHot: false,
      isEnding: false,
    },
  ],
  toys: [
    {
      id: "6",
      name: "Labubu Figure",
      image: image.labubu,
      time: "21:17:56",
      isHot: false,
      isEnding: false,
    },
    {
      id: "7",
      name: "Funko Pop Rare",
      image: image.labubu,
      time: "15:45:20",
      isHot: true,
      isEnding: false,
    },
  ],
  coins: [],
  cards: [
    {
      id: "20",
      name: "Pokemon Charizard 1st Ed",
      image: image.collectible,
      time: "04:30:00",
      isHot: true,
      isEnding: true,
    },
  ],
  antiques: [],

  // Home
  furniture: [
    {
      id: "21",
      name: "IKEA Desk Set",
      image: image.house,
      time: "11:00:00",
      isHot: false,
      isEnding: false,
    },
  ],
  decor: [],
  kitchen: [],
  garden: [],

  // Vehicles
  cars: [
    {
      id: "22",
      name: "BMW i8 2020",
      image: image.i8,
      time: "23:59:59",
      isHot: true,
      isEnding: false,
    },
    {
      id: "23",
      name: "Mercedes C300",
      image: image.car,
      time: "18:30:00",
      isHot: false,
      isEnding: true,
    },
  ],
  motorcycles: [
    {
      id: "24",
      name: "Ducati Panigale V4",
      image: image.car,
      time: "14:00:00",
      isHot: true,
      isEnding: false,
    },
  ],
  parts: [],
  ev: [
    {
      id: "25",
      name: "Tesla Model 3",
      image: image.car,
      time: "20:15:00",
      isHot: false,
      isEnding: false,
    },
  ],

  // Others
  books: [],
  sports: [
    {
      id: "26",
      name: "Golf Club Set",
      image: image.other,
      time: "09:30:00",
      isHot: false,
      isEnding: true,
    },
  ],
  music: [],
  pets: [],
};

const CategoryPage = () => {
  const { category } = useLocalSearchParams();
  const router = useRouter();
  const [selectedSub, setSelectedSub] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [scaleAnim] = useState(new Animated.Value(0.5));
  const [opacityAnim] = useState(new Animated.Value(0));
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

  // Re-trigger empty state animation when search yields no results
  useEffect(() => {
    if (selectedSub && searchQuery.length > 0) {
      const products = (MOCK_PRODUCTS as any)[selectedSub] || [];
      const filtered = products.filter((p: any) =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase()),
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
  }, [searchQuery, selectedSub]);

  const subcategories = useMemo(() => {
    if (!category || typeof category !== "string") return [];
    return SUBCATEGORIES[category] || [];
  }, [category]);

  const filteredProducts = useMemo(() => {
    if (!selectedSub) return [];
    const products = (MOCK_PRODUCTS as any)[selectedSub] || [];
    if (!searchQuery.trim()) return products;
    return products.filter((p: any) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()),
    );
  }, [selectedSub, searchQuery]);

  const handleSelectSub = (subId: string) => {
    setSelectedSub(subId);
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => {
            if (selectedSub) {
              setSelectedSub(null);
            } else {
              router.back();
            }
          }}
        >
          <Image source={image.back} style={{ width: 32, height: 32 }} />
        </TouchableOpacity>
        <AppText weight="semibold" style={styles.title} numberOfLines={1}>
          {selectedSub
            ? selectedSub.charAt(0).toUpperCase() + selectedSub.slice(1)
            : category
              ? `${String(category).charAt(0).toUpperCase() + String(category).slice(1)}`
              : "Category"}
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
            <View style={styles.grid}>
              {subcategories.map((s) => (
                <TouchableOpacity
                  key={s.id}
                  style={styles.card}
                  onPress={() => handleSelectSub(s.id)}
                >
                  <View style={styles.cardImageContainer}>
                    {s.image && (
                      <Image source={s.image} style={styles.cardImage} />
                    )}
                    <View style={styles.itemCountBadge}>
                      <AppText
                        weight="semibold"
                        style={styles.itemCountText}
                        numberOfLines={1}
                      >
                        {(MOCK_PRODUCTS[s.id] || []).length} items
                      </AppText>
                    </View>
                  </View>
                  <AppText
                    weight="semibold"
                    numberOfLines={1}
                    style={styles.cardText}
                  >
                    {s.name}
                  </AppText>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : (
          <View style={{ flex: 1 }}>
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
                  placeholder={`Search in ${selectedSub}...`}
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

            <View style={styles.productsGrid}>
              {filteredProducts.length > 0 ? (
                filteredProducts.map((p: any) => (
                  <TouchableOpacity
                    key={p.id}
                    style={styles.productCard}
                    onPress={() =>
                      router.push({
                        pathname: "/screens/product-detail",
                        params: {
                          productId: p.id,
                          productName: p.name,
                          productImage: JSON.stringify(p.image),
                          time: p.time,
                          isHot: p.isHot ? "true" : "false",
                          isEnding: p.isEnding ? "true" : "false",
                        },
                      })
                    }
                  >
                    <View style={styles.productImageContainer}>
                      {p.isHot && (
                        <View style={styles.hotBadge}>
                          <Image
                            source={image.hot_badge}
                            style={{ width: 13, height: 14 }}
                          />
                        </View>
                      )}
                      {p.isEnding && (
                        <View style={styles.endingBadge}>
                          <Image
                            source={image.ending_badge}
                            style={{ width: 18, height: 18 }}
                          />
                        </View>
                      )}
                      <View style={styles.timeBadge}>
                        <Image
                          source={image.incoming_time}
                          style={{ width: 12, height: 12, marginRight: 4 }}
                        />
                        <AppText
                          weight="medium"
                          style={styles.timeText}
                          numberOfLines={1}
                        >
                          {p.time}
                        </AppText>
                      </View>
                      <Image source={p.image} style={styles.productImage} />
                    </View>
                    <AppText
                      weight="medium"
                      numberOfLines={1}
                      style={styles.productName}
                    >
                      {p.name}
                    </AppText>
                  </TouchableOpacity>
                ))
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
                      Try adjusting your search
                    </AppText>
                  </Animated.View>
                </View>
              )}
            </View>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
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
  },
  cardImageContainer: {
    position: "relative",
    width: "100%",
    height: 140,
  },
  cardImage: { width: "100%", height: "100%", resizeMode: "cover" },
  itemCountBadge: {
    position: "absolute",
    bottom: 8,
    left: 8,
    backgroundColor: "rgba(0, 0, 0, 0.7)",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  itemCountText: { fontSize: 12, color: "#fff" },
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
  productsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    justifyContent: "space-between",
  },
  productCard: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 12,
    overflow: "hidden",
  },
  productImageContainer: {
    position: "relative",
    width: "100%",
    height: 160,
    backgroundColor: "#f0f0f0",
  },
  productImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  productName: {
    fontSize: 12,
    color: "#111827",
    paddingHorizontal: 8,
    paddingVertical: 8,
    textAlign: "center",
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
  emptyStateImage: {
    width: 120,
    height: 120,
    marginBottom: 16,
    opacity: 0.6,
  },
  emptyStateTitle: {
    fontSize: 18,
    color: "#111827",
    marginBottom: 8,
  },
  emptyStateSubtitle: {
    fontSize: 14,
    color: "#6B7280",
  },
  horizontalScroll: {
    marginBottom: 20,
  },
  auctionCard: {
    width: AUCTION_CARD_WIDTH,
    marginRight: 15,
    backgroundColor: "#fff",
    borderRadius: 15,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#F0F0F0",
    paddingBottom: 8,
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
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#FF8C00",
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
  auctionImage: {
    width: "100%",
    height: 130,
    borderRadius: 12,
    marginTop: 8,
  },
  auctionName: {
    fontSize: 12,
    color: "#111827",
    paddingHorizontal: 8,
    textAlign: "center",
    marginTop: 6,
  },
});

export default CategoryPage;
