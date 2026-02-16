import { useRouter } from "expo-router";
import LottieView from "lottie-react-native";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Animated,
  Dimensions,
  Image,
  ImageBackground,
  Keyboard,
  Modal,
  ScrollView,
  StatusBar,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { image } from "../../assets/images";
import { useAuth } from "../../contexts/AuthContext";
import { AppText } from "../components/appText";
import { AuthModal } from "../components/AuthModal";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const RECENT_SEARCHES = ["Macbook", "BMW", "Labubu", "iPhone 16", "Nike Dunk"];
const TRENDING_TAGS = [
  { label: "🔥 Macbook Pro", color: "#FF3B30" },
  { label: "🚗 BMW i8", color: "#007AFF" },
  { label: "🧸 Labubu", color: "#AF52DE" },
  { label: "👟 Nike Dunk", color: "#34C759" },
  { label: "📱 iPhone 16", color: "#FF9500" },
  { label: "🎮 PS5 Pro", color: "#5856D6" },
];

const HomePage = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isGuest, isLoggedIn } = useAuth();
  const [authModalVisible, setAuthModalVisible] = useState(false);

  // Search state
  const [searchVisible, setSearchVisible] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<TextInput>(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(SCREEN_HEIGHT)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const emptyScaleAnim = useRef(new Animated.Value(0.5)).current;
  const emptyOpacityAnim = useRef(new Animated.Value(0)).current;
  const lottieRef = useRef<LottieView>(null);

  // Use string ids to map across routes
  const categories = [
    { id: "electronics", name: "Electronics", image: image.electronic },
    { id: "fashion", name: "Fashion", image: image.shirt },
    { id: "collectibles", name: "Collectibles", image: image.collectible },
    { id: "home", name: "Home", image: image.house },
    { id: "vehicles", name: "Vehicles", image: image.car },
    { id: "others", name: "Others", image: image.other },
  ];

  const hotAuctions = [
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
  ];

  const endingSoon = [
    {
      id: 1,
      name: "Macbook Pro M3",
      time: "21:17:56",
      image: image.macbook,
    },
    {
      id: 2,
      name: "BMW i8",
      time: "21:17:56",
      image: image.i8,
    },
    {
      id: 3,
      name: "Labubu New Collection",
      time: "21:17:56",
      image: image.labubu,
    },
  ];

  const incoming = [
    {
      id: 1,
      name: "Macbook Pro M3",
      time: "15 mins",
      image: image.macbook,
    },
    {
      id: 2,
      name: "BMW i8",
      time: "2 hours",
      image: image.i8,
    },
    {
      id: 3,
      name: "Labubu New Collection",
      time: "2 days",
      image: image.labubu,
    },
  ];

  // Aggregate all products for search
  const allProducts = useMemo(
    () => [
      ...hotAuctions.map((item) => ({ ...item, type: "hot" as const })),
      ...endingSoon.map((item) => ({ ...item, type: "ending" as const })),
      ...incoming.map((item) => ({ ...item, type: "incoming" as const })),
    ],
    [],
  );

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) return [];
    const q = searchQuery.toLowerCase();
    return allProducts.filter((item) => item.name.toLowerCase().includes(q));
  }, [searchQuery, allProducts]);

  useEffect(() => {
    if (searchQuery.length > 0 && searchResults.length === 0) {
      emptyScaleAnim.setValue(0.5);
      emptyOpacityAnim.setValue(0);
      Animated.parallel([
        Animated.spring(emptyScaleAnim, { toValue: 1, useNativeDriver: true }),
        Animated.timing(emptyOpacityAnim, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [searchQuery, searchResults.length]);

  const openSearch = useCallback(() => {
    setSearchVisible(true);
    fadeAnim.setValue(0);
    slideAnim.setValue(30);
    scaleAnim.setValue(0.97);
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        tension: 65,
        friction: 11,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 65,
        friction: 11,
        useNativeDriver: true,
      }),
    ]).start(() => {
      searchInputRef.current?.focus();
    });
  }, []);

  const closeSearch = useCallback(() => {
    Keyboard.dismiss();
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 30,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.97,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setSearchVisible(false);
      setSearchQuery("");
    });
  }, []);

  const cancelSearch = useCallback(() => {
    Keyboard.dismiss();
    setIsSearching(false);
    setSearchQuery("");
  }, []);

  const handleSearchItemPress = useCallback((item: (typeof allProducts)[0]) => {
    cancelSearch();
    router.push({
      pathname: "/screens/product-detail",
      params: {
        productId: item.id.toString(),
        productName: item.name,
        productImage: JSON.stringify(item.image),
        time: item.time,
        isHot: item.type === "hot" ? "true" : "false",
        isEnding: item.type === "ending" ? "true" : "false",
        isIncoming: item.type === "incoming" ? "true" : "false",
      },
    });
  }, []);

  const getBadgeForType = (type: string) => {
    switch (type) {
      case "hot":
        return { label: "🔥 Hot", bg: "#FF3B30" };
      case "ending":
        return { label: "⏰ Ending", bg: "#FF8C00" };
      case "incoming":
        return { label: "🔜 Incoming", bg: "#9B27B0" };
      default:
        return { label: "", bg: "#999" };
    }
  };

  return (
    <View style={styles.container}>
      {/* Search Overlay Modal */}
      <Modal
        visible={searchVisible}
        transparent
        animationType="none"
        statusBarTranslucent
      >
        <Animated.View style={[s.overlay, { opacity: fadeAnim }]}>
          <StatusBar barStyle="light-content" />
          <Animated.View
            style={[
              s.searchModal,
              { paddingTop: insets.top + 10 },
              { transform: [{ translateY: slideAnim }, { scale: scaleAnim }] },
            ]}
          >
            {/* Search Header */}
            <View style={s.searchHeader}>
              <View style={s.searchInputRow}>
                <Image source={image.search_gray} style={s.searchInputIcon} />
                <TextInput
                  ref={searchInputRef}
                  style={s.searchModalInput}
                  placeholder="ค้นหาสินค้า..."
                  placeholderTextColor="#999"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  autoCorrect={false}
                  returnKeyType="search"
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity
                    onPress={() => setSearchQuery("")}
                    style={s.clearBtn}
                  >
                    <AppText style={{ fontSize: 13, color: "#999" }}>✕</AppText>
                  </TouchableOpacity>
                )}
              </View>
              <TouchableOpacity onPress={closeSearch} style={s.cancelBtn}>
                <AppText weight="medium" style={s.cancelText}>
                  Cancel
                </AppText>
              </TouchableOpacity>
            </View>

            <ScrollView
              style={s.searchBody}
              showsVerticalScrollIndicator={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* When not searching: show recent + trending */}
              {searchQuery.length === 0 && (
                <Animated.View style={{ opacity: fadeAnim }}>
                  {/* Recent Searches */}
                  <View style={s.searchSection}>
                    <View style={s.searchSectionHeader}>
                      <AppText weight="semibold" style={s.searchSectionTitle}>
                        🕐 ค้นหาล่าสุด
                      </AppText>
                      <TouchableOpacity>
                        <AppText weight="regular" style={s.clearAllText}>
                          ล้างทั้งหมด
                        </AppText>
                      </TouchableOpacity>
                    </View>
                    {RECENT_SEARCHES.map((term, idx) => (
                      <TouchableOpacity
                        key={idx}
                        style={s.recentItem}
                        onPress={() => setSearchQuery(term)}
                      >
                        <View style={s.recentIcon}>
                          <AppText style={{ fontSize: 14, color: "#999" }}>
                            ↻
                          </AppText>
                        </View>
                        <AppText weight="regular" style={s.recentText}>
                          {term}
                        </AppText>
                        <AppText
                          style={{
                            fontSize: 16,
                            color: "#D1D5DB",
                            marginLeft: "auto",
                          }}
                        >
                          ↗
                        </AppText>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* Hot Auctions */}
                  <View style={s.searchSection}>
                    <AppText weight="semibold" style={s.searchSectionTitle}>
                      🔥 Hot Auctions
                    </AppText>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                    >
                      {hotAuctions.map((item) => (
                        <TouchableOpacity
                          key={item.id}
                          style={styles.searchHotCard}
                          onPress={() => {
                            closeSearch();
                            setTimeout(() => {
                              router.push({
                                pathname: "/screens/product-detail",
                                params: {
                                  productId: item.id.toString(),
                                  productName: item.name,
                                  productImage: JSON.stringify(item.image),
                                  time: item.time,
                                  isHot: "true",
                                  isEnding: "false",
                                },
                              });
                            }, 300);
                          }}
                          activeOpacity={0.7}
                        >
                          <View style={styles.searchHotImageWrap}>
                            <Image
                              source={item.image}
                              style={styles.searchHotImage}
                            />
                            <View style={styles.searchHotBadge}>
                              <Image
                                source={image.hot_badge}
                                style={{ width: 12, height: 13 }}
                              />
                            </View>
                            <View style={styles.searchHotTime}>
                              <Image
                                source={image.incoming_time}
                                style={{
                                  width: 10,
                                  height: 10,
                                  marginRight: 3,
                                }}
                              />
                              <AppText
                                weight="medium"
                                style={{ fontSize: 9, color: "#fff" }}
                              >
                                {item.time}
                              </AppText>
                            </View>
                          </View>
                          <AppText
                            weight="medium"
                            style={styles.searchHotName}
                            numberOfLines={1}
                          >
                            {item.name}
                          </AppText>
                        </TouchableOpacity>
                      ))}
                      {/* View All Card */}
                      <TouchableOpacity
                        style={styles.searchHotViewAll}
                        onPress={() => {
                          closeSearch();
                          setTimeout(
                            () => router.push("/screens/view-all?type=hot"),
                            300,
                          );
                        }}
                        activeOpacity={0.7}
                      >
                        <View style={styles.searchHotViewAllInner}>
                          <View style={styles.searchHotViewAllCircle}>
                            <AppText
                              weight="bold"
                              style={styles.searchHotViewAllArrow}
                            >
                              →
                            </AppText>
                          </View>
                          <AppText
                            weight="semibold"
                            style={styles.searchHotViewAllText}
                          >
                            View All
                          </AppText>
                          <AppText
                            weight="regular"
                            style={styles.searchHotViewAllSub}
                          >
                            Hot Auctions
                          </AppText>
                        </View>
                      </TouchableOpacity>
                    </ScrollView>
                  </View>
                </Animated.View>
              )}

              {/* Search Results */}
              {searchQuery.length > 0 && (
                <View style={s.resultsSection}>
                  <AppText weight="medium" style={s.resultsCount}>
                    {searchResults.length > 0
                      ? `พบ ${searchResults.length} รายการ`
                      : ""}
                  </AppText>
                  {searchResults.length === 0 ? (
                    <View style={s.noResults}>
                      <AppText style={s.noResultsEmoji}>🔍</AppText>
                      <AppText weight="semibold" style={s.noResultsTitle}>
                        ไม่พบสินค้า
                      </AppText>
                      <AppText weight="regular" style={s.noResultsSub}>
                        ลองค้นหาด้วยคำอื่น
                      </AppText>
                    </View>
                  ) : (
                    searchResults.map((item, idx) => {
                      const badge = getBadgeForType(item.type);
                      return (
                        <TouchableOpacity
                          key={`${item.type}-${item.id}-${idx}`}
                          style={s.resultCard}
                          onPress={() => handleSearchItemPress(item)}
                          activeOpacity={0.7}
                        >
                          <Image source={item.image} style={s.resultImage} />
                          <View style={s.resultInfo}>
                            <AppText
                              weight="semibold"
                              style={s.resultName}
                              numberOfLines={1}
                            >
                              {item.name}
                            </AppText>
                            <View style={s.resultMeta}>
                              <View
                                style={[
                                  s.resultBadge,
                                  { backgroundColor: badge.bg },
                                ]}
                              >
                                <AppText
                                  weight="medium"
                                  style={s.resultBadgeText}
                                >
                                  {badge.label}
                                </AppText>
                              </View>
                              <AppText weight="regular" style={s.resultTime}>
                                ⏱ {item.time}
                              </AppText>
                            </View>
                          </View>
                          <AppText style={{ fontSize: 18, color: "#D1D5DB" }}>
                            ›
                          </AppText>
                        </TouchableOpacity>
                      );
                    })
                  )}
                </View>
              )}
              <View style={{ height: 40 }} />
            </ScrollView>
          </Animated.View>
        </Animated.View>
      </Modal>

      {/* Header */}
      <ImageBackground
        source={image.header_home}
        style={[styles.header, { paddingTop: insets.top + 6 }]}
      >
        <View style={styles.headerLeft}>
          <Image source={image.logo} style={{ width: 36, height: 36 }} />
          <AppText weight="bold" style={styles.logoText}>
            BidKhong
          </AppText>
        </View>
        {isLoggedIn && !isGuest ? (
          <View style={styles.balanceContainer}>
            <View>
              <AppText weight="regular" style={styles.balanceLabel}>
                Total Balance
              </AppText>
              <AppText weight="bold" style={styles.balanceAmount}>
                ฿125,000
              </AppText>
            </View>
            <Image source={image.bang} style={styles.avatar} />
          </View>
        ) : (
          <TouchableOpacity
            style={styles.guestHeaderBtn}
            onPress={() => setAuthModalVisible(true)}
            activeOpacity={0.8}
          >
            <View style={styles.guestAvatarCircle}>
              <AppText weight="bold" style={{ fontSize: 16, color: "#003994" }}>
                ?
              </AppText>
            </View>
            <AppText weight="semibold" style={styles.guestSignInText}>
              Sign In
            </AppText>
          </TouchableOpacity>
        )}
      </ImageBackground>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View
            style={[
              styles.searchWrapper,
              isSearching && styles.searchWrapperActive,
            ]}
          >
            <Image source={image.search_gray} style={styles.searchIcon} />
            <TextInput
              ref={searchInputRef}
              style={styles.searchInput}
              placeholder="Search for items to bid..."
              placeholderTextColor="#B0B0B0"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onFocus={() => setIsSearching(true)}
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
          {isSearching && (
            <TouchableOpacity onPress={cancelSearch} style={styles.cancelBtn}>
              <AppText weight="medium" style={styles.cancelText}>
                Cancel
              </AppText>
            </TouchableOpacity>
          )}
        </View>

        {isSearching ? (
          <View style={styles.searchPanel}>
            {searchQuery.length === 0 ? (
              <>
                {/* Recent Searches */}
                <View style={styles.searchSection}>
                  <View style={styles.searchSectionHeader}>
                    <AppText
                      weight="semibold"
                      style={styles.searchSectionTitle}
                    >
                      Recent
                    </AppText>
                    <TouchableOpacity>
                      <AppText weight="regular" style={styles.clearAllText}>
                        Clear All
                      </AppText>
                    </TouchableOpacity>
                  </View>
                  {RECENT_SEARCHES.map((term, idx) => (
                    <TouchableOpacity
                      key={idx}
                      style={styles.recentItem}
                      onPress={() => setSearchQuery(term)}
                    >
                      <View style={styles.recentIcon}>
                        <AppText style={{ fontSize: 14, color: "#999" }}>
                          ↻
                        </AppText>
                      </View>
                      <AppText weight="regular" style={styles.recentText}>
                        {term}
                      </AppText>
                      <AppText
                        style={{
                          fontSize: 16,
                          color: "#D1D5DB",
                          marginLeft: "auto",
                        }}
                      >
                        ↗
                      </AppText>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Hot Auctions */}
                <View style={styles.searchSection}>
                  <AppText weight="semibold" style={styles.searchSectionTitle}>
                    🔥 Hot Auctions
                  </AppText>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                    {hotAuctions.map((item) => (
                      <TouchableOpacity
                        key={item.id}
                        style={styles.searchHotCard}
                        onPress={() => {
                          cancelSearch();
                          router.push({
                            pathname: "/screens/product-detail",
                            params: {
                              productId: item.id.toString(),
                              productName: item.name,
                              productImage: JSON.stringify(item.image),
                              time: item.time,
                              isHot: "true",
                              isEnding: "false",
                            },
                          });
                        }}
                        activeOpacity={0.7}
                      >
                        <View style={styles.searchHotImageWrap}>
                          <Image
                            source={item.image}
                            style={styles.searchHotImage}
                          />
                          <View style={styles.searchHotBadge}>
                            <Image
                              source={image.hot_badge}
                              style={{ width: 12, height: 13 }}
                            />
                          </View>
                          <View style={styles.searchHotTime}>
                            <Image
                              source={image.incoming_time}
                              style={{ width: 10, height: 10, marginRight: 3 }}
                            />
                            <AppText
                              weight="medium"
                              style={{ fontSize: 9, color: "#fff" }}
                            >
                              {item.time}
                            </AppText>
                          </View>
                        </View>
                        <AppText
                          weight="medium"
                          style={styles.searchHotName}
                          numberOfLines={1}
                        >
                          {item.name}
                        </AppText>
                      </TouchableOpacity>
                    ))}
                    {/* View All Card */}
                    <TouchableOpacity
                      style={styles.searchHotViewAll}
                      onPress={() => {
                        cancelSearch();
                        router.push("/screens/view-all?type=hot");
                      }}
                      activeOpacity={0.7}
                    >
                      <View style={styles.searchHotViewAllInner}>
                        <View style={styles.searchHotViewAllCircle}>
                          <AppText
                            weight="bold"
                            style={styles.searchHotViewAllArrow}
                          >
                            →
                          </AppText>
                        </View>
                        <AppText
                          weight="semibold"
                          style={styles.searchHotViewAllText}
                        >
                          View All
                        </AppText>
                        <AppText
                          weight="regular"
                          style={styles.searchHotViewAllSub}
                        >
                          Hot Auctions
                        </AppText>
                      </View>
                    </TouchableOpacity>
                  </ScrollView>
                </View>
              </>
            ) : (
              <View style={styles.resultsSection}>
                <View style={styles.productsGrid}>
                  {searchResults.length > 0 ? (
                    searchResults.map((item, idx) => (
                      <TouchableOpacity
                        key={`${item.type}-${item.id}-${idx}`}
                        style={styles.productCard}
                        onPress={() => handleSearchItemPress(item)}
                        activeOpacity={0.7}
                      >
                        <View style={styles.productImageContainer}>
                          {item.type === "hot" && (
                            <View style={styles.srHotBadge}>
                              <Image
                                source={image.hot_badge}
                                style={{ width: 13, height: 14 }}
                              />
                            </View>
                          )}
                          {item.type === "ending" && (
                            <View style={styles.srEndingBadge}>
                              <Image
                                source={image.ending_badge}
                                style={{ width: 18, height: 18 }}
                              />
                            </View>
                          )}
                          <View style={styles.srTimeBadge}>
                            <Image
                              source={image.incoming_time}
                              style={{ width: 12, height: 12, marginRight: 4 }}
                            />
                            <AppText weight="medium" style={styles.srTimeText}>
                              {item.time}
                            </AppText>
                          </View>
                          <Image
                            source={item.image}
                            style={styles.productImage}
                          />
                        </View>
                        <AppText weight="medium" style={styles.productName}>
                          {item.name}
                        </AppText>
                      </TouchableOpacity>
                    ))
                  ) : (
                    <View style={styles.emptyStateContainer}>
                      <Animated.View
                        style={[
                          styles.emptyStateContent,
                          {
                            transform: [{ scale: emptyScaleAnim }],
                            opacity: emptyOpacityAnim,
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
                        >
                          No Products Found
                        </AppText>
                        <AppText weight="regular" style={styles.emptyStateSub}>
                          Try adjusting your search
                        </AppText>
                      </Animated.View>
                    </View>
                  )}
                </View>
              </View>
            )}
          </View>
        ) : (
          <>
            {/* Categories */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <AppText weight="semibold" style={styles.sectionTitle}>
                  Categories
                </AppText>
              </View>
              <View style={styles.categoriesGrid}>
                {categories.map((category) => (
                  <TouchableOpacity
                    key={category.id}
                    style={styles.categoryCard}
                    onPress={() =>
                      router.push(`/screens/category?category=${category.id}`)
                    }
                  >
                    {category.image ? (
                      <Image
                        source={category.image}
                        style={styles.categoryImage}
                      />
                    ) : (
                      <View
                        style={[styles.categoryImage, styles.categoryOthers]}
                      />
                    )}
                    <AppText weight="semibold" style={styles.categoryText}>
                      {category.name}
                    </AppText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Hot Auctions */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Image
                    source={image.hot}
                    style={{ width: 22, height: 24, marginRight: 8 }}
                  />
                  <AppText weight="semibold" style={styles.sectionTitle}>
                    Hot Auctions
                  </AppText>
                </View>
                <TouchableOpacity
                  onPress={() => router.push("/screens/view-all?type=hot")}
                >
                  <AppText weight="regular" style={styles.viewAll}>
                    View All →
                  </AppText>
                </TouchableOpacity>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.horizontalScroll}
              >
                {hotAuctions.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.auctionCard}
                    onPress={() =>
                      router.push({
                        pathname: "/screens/product-detail",
                        params: {
                          productId: item.id.toString(),
                          productName: item.name,
                          productImage: JSON.stringify(item.image),
                          time: item.time,
                          isHot: item.isHot ? "true" : "false",
                          isEnding: "false",
                        },
                      })
                    }
                  >
                    {item.isHot && (
                      <View style={styles.hotBadge}>
                        <Image
                          source={image.hot_badge}
                          style={{ width: 13, height: 14 }}
                        />
                      </View>
                    )}
                    <View
                      style={[
                        styles.timeBadge,
                        { flexDirection: "row", alignItems: "center", gap: 6 },
                      ]}
                    >
                      <Image
                        source={image.incoming_time}
                        style={{ width: 12, height: 12 }}
                      />
                      <AppText weight="medium" style={styles.timeText}>
                        {item.time}
                      </AppText>
                    </View>
                    <Image
                      source={item.image}
                      style={[styles.auctionImage, { marginBottom: 8 }]}
                    />
                    <AppText weight="medium" style={styles.auctionName}>
                      {item.name}
                    </AppText>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Ending Soon */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Image
                    source={image.ending}
                    style={{ width: 24, height: 24, marginRight: 8 }}
                  />
                  <AppText weight="semibold" style={styles.sectionTitle}>
                    Ending Soon
                  </AppText>
                </View>
                <TouchableOpacity
                  onPress={() => router.push("/screens/view-all?type=ending")}
                >
                  <AppText weight="regular" style={styles.viewAll}>
                    View All →
                  </AppText>
                </TouchableOpacity>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.horizontalScroll}
              >
                {endingSoon.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.auctionCard}
                    onPress={() =>
                      router.push({
                        pathname: "/screens/product-detail",
                        params: {
                          productId: item.id.toString(),
                          productName: item.name,
                          productImage: JSON.stringify(item.image),
                          time: item.time,
                          isHot: "false",
                          isEnding: "true",
                        },
                      })
                    }
                  >
                    <View style={styles.soonBadge}>
                      <Image
                        source={image.ending_badge}
                        style={{ width: 18, height: 18 }}
                      />
                    </View>
                    <View
                      style={[
                        styles.timeBadge,
                        { flexDirection: "row", alignItems: "center", gap: 6 },
                      ]}
                    >
                      <Image
                        source={image.incoming_time}
                        style={{ width: 12, height: 12 }}
                      />
                      <AppText weight="medium" style={styles.timeText}>
                        {item.time}
                      </AppText>
                    </View>
                    <Image
                      source={item.image}
                      style={[styles.auctionImage, { marginBottom: 8 }]}
                    />
                    <AppText weight="medium" style={styles.auctionName}>
                      {item.name}
                    </AppText>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            {/* Incoming */}
            <View style={[styles.section, { marginBottom: 30 }]}>
              <View style={styles.sectionHeader}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Image
                    source={image.incoming}
                    style={{ width: 27, height: 25, marginRight: 8 }}
                  />
                  <AppText weight="semibold" style={styles.sectionTitle}>
                    Incoming
                  </AppText>
                </View>
                <TouchableOpacity
                  onPress={() => router.push("/screens/view-all?type=incoming")}
                >
                  <AppText weight="regular" style={styles.viewAll}>
                    View All →
                  </AppText>
                </TouchableOpacity>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.horizontalScroll}
              >
                {incoming.map((item) => (
                  <TouchableOpacity
                    key={item.id}
                    style={styles.auctionCard}
                    onPress={() =>
                      router.push({
                        pathname: "/screens/product-detail",
                        params: {
                          productId: item.id.toString(),
                          productName: item.name,
                          productImage: JSON.stringify(item.image),
                          time: item.time,
                          isHot: "false",
                          isEnding: "false",
                          isIncoming: "true",
                        },
                      })
                    }
                  >
                    <View
                      style={[
                        styles.incomingBadge,
                        {
                          flexDirection: "row",
                          alignItems: "center",
                          paddingHorizontal: 6,
                        },
                      ]}
                    >
                      <Image
                        source={image.incoming_time}
                        style={{ width: 14, height: 14, marginRight: 4 }}
                      />
                      <AppText weight="medium" style={styles.incomingText}>
                        {item.time}
                      </AppText>
                    </View>
                    <Image
                      source={item.image}
                      style={[styles.auctionImage, { marginBottom: 8 }]}
                    />
                    <AppText weight="medium" style={styles.auctionName}>
                      {item.name}
                    </AppText>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>
          </>
        )}
      </ScrollView>

      <AuthModal
        visible={authModalVisible}
        onClose={() => setAuthModalVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    backgroundColor: "#003d82",
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  logo: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  logoIcon: {
    fontSize: 20,
  },
  logoText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  balanceContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingVertical: 8,
    paddingLeft: 15,
    paddingRight: 8,
    borderRadius: 25,
  },
  balanceLabel: {
    fontSize: 10,
    color: "#fff",
    opacity: 0.9,
  },
  balanceAmount: {
    fontSize: 18,
    color: "#fff",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginLeft: 10,
  },
  guestHeaderBtn: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.35)",
  },
  guestAvatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  guestSignInText: {
    fontSize: 14,
    color: "#fff",
  },
  content: {
    flex: 1,
    backgroundColor: "#fff",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#fff",
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    padding: 0,
  },
  section: {
    marginTop: 10,
    backgroundColor: "#fff",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#000",
  },
  viewAll: {
    fontSize: 15,
    color: "#4285F4",
    fontWeight: "600",
  },
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  categoryCard: {
    width: "31%",
    aspectRatio: 1,
    margin: "1%",
    borderRadius: 15,
    overflow: "hidden",
  },
  categoryImage: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  categoryOthers: {
    backgroundColor: "#4165A3",
  },
  categoryText: {
    position: "absolute",
    bottom: 10,
    left: 10,
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textShadowColor: "rgba(0,0,0,0.9)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  horizontalScroll: {
    paddingLeft: 20,
    paddingBottom: 20,
  },
  auctionCard: {
    width: 180,
    marginRight: 15,
    backgroundColor: "#fff",
    borderRadius: 15,
    alignItems: "center",
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
  hotIcon: {
    fontSize: 20,
  },
  soonBadge: {
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
  soonIcon: {
    fontSize: 20,
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
  incomingBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#9b27b0b4",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 2,
  },
  incomingText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
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
  auctionName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#000",
    marginTop: 8,
  },
  searchWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 8,
  },
  searchIcon: {
    width: 22,
    height: 22,
    marginRight: 12,
    opacity: 0.5,
  },
  searchPlaceholder: {
    fontSize: 16,
    color: "#B0B0B0",
  },
  searchWrapperActive: {
    borderColor: "#4285F4",
    borderWidth: 1.5,
    shadowOpacity: 0.3,
    shadowRadius: 8,
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
  searchPanel: {
    flex: 1,
    paddingBottom: 20,
  },
  searchSection: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  searchSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  searchSectionTitle: {
    fontSize: 17,
    color: "#111827",
    marginBottom: 12,
  },
  clearAllText: {
    fontSize: 13,
    color: "#9CA3AF",
    marginBottom: 12,
  },
  recentItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 11,
    borderBottomWidth: 0.5,
    borderBottomColor: "#F3F4F6",
  },
  recentIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  recentText: {
    fontSize: 15,
    color: "#374151",
  },
  trendingGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  trendingTag: {
    borderWidth: 1.5,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: "#FFF",
  },
  trendingText: {
    fontSize: 13,
  },
  quickCatCard: {
    width: 120,
    height: 80,
    borderRadius: 14,
    overflow: "hidden",
    marginRight: 10,
  },
  quickCatImage: {
    width: "100%",
    height: "100%",
  },
  quickCatGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
  },
  quickCatText: {
    position: "absolute",
    bottom: 8,
    left: 10,
    color: "#FFF",
    fontSize: 12,
    textShadowColor: "rgba(0,0,0,0.6)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  resultsSection: {
    paddingHorizontal: 16,
    paddingTop: 6,
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
    fontSize: 13,
    color: "#111827",
    paddingHorizontal: 8,
    paddingVertical: 8,
    textAlign: "center",
  },
  srHotBadge: {
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
  srEndingBadge: {
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
  srTimeBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 6,
    paddingVertical: 4,
    borderRadius: 4,
    zIndex: 2,
  },
  srTimeText: {
    fontSize: 10,
    color: "#fff",
  },
  emptyStateContainer: {
    width: "100%",
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
  emptyStateSub: {
    fontSize: 14,
    color: "#6B7280",
  },
  searchHotCard: {
    width: 140,
    marginRight: 12,
    backgroundColor: "#FFF",
    borderRadius: 14,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  searchHotImageWrap: {
    width: "100%",
    height: 110,
    position: "relative",
  },
  searchHotImage: {
    width: "100%",
    height: "100%",
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
  },
  searchHotBadge: {
    position: "absolute",
    top: 6,
    left: 6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#FF0000",
    justifyContent: "center",
    alignItems: "center",
  },
  searchHotTime: {
    position: "absolute",
    top: 6,
    right: 6,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.6)",
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 8,
  },
  searchHotName: {
    fontSize: 12,
    color: "#111827",
    paddingHorizontal: 8,
    paddingVertical: 8,
    textAlign: "center",
  },
  searchHotViewAll: {
    width: 110,
    height: 148,
    marginRight: 12,
    borderRadius: 14,
    overflow: "hidden",
    borderWidth: 1.5,
    borderColor: "#FF3B3020",
    borderStyle: "dashed",
  },
  searchHotViewAllInner: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FFF5F5",
  },
  searchHotViewAllCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FF3B30",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  searchHotViewAllArrow: {
    fontSize: 18,
    color: "#FFF",
  },
  searchHotViewAllText: {
    fontSize: 13,
    color: "#FF3B30",
  },
  searchHotViewAllSub: {
    fontSize: 10,
    color: "#999",
    marginTop: 2,
  },
});

// Search Overlay Styles
const s = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  searchModal: {
    flex: 1,
    backgroundColor: "#FFF",
    borderTopLeftRadius: 0,
    borderTopRightRadius: 0,
  },
  searchHeader: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
    gap: 10,
  },
  searchInputRow: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3F4F6",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  searchInputIcon: {
    width: 20,
    height: 20,
    opacity: 0.4,
    marginRight: 10,
  },
  searchModalInput: {
    flex: 1,
    fontSize: 16,
    color: "#111",
    fontFamily: "Poppins_400Regular",
    padding: 0,
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
  cancelBtn: {
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  cancelText: {
    fontSize: 15,
    color: "#4285F4",
  },
  searchBody: {
    flex: 1,
    paddingTop: 8,
  },
  searchSection: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  searchSectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  searchSectionTitle: {
    fontSize: 17,
    color: "#111827",
    marginBottom: 12,
  },
  clearAllText: {
    fontSize: 13,
    color: "#9CA3AF",
    marginBottom: 12,
  },
  recentItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 11,
    borderBottomWidth: 0.5,
    borderBottomColor: "#F3F4F6",
  },
  recentIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  recentText: {
    fontSize: 15,
    color: "#374151",
  },
  trendingGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  trendingTag: {
    borderWidth: 1.5,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: "#FFF",
  },
  trendingText: {
    fontSize: 13,
  },
  quickCatCard: {
    width: 120,
    height: 80,
    borderRadius: 14,
    overflow: "hidden",
    marginRight: 10,
  },
  quickCatImage: {
    width: "100%",
    height: "100%",
  },
  quickCatGradient: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 40,
  },
  quickCatText: {
    position: "absolute",
    bottom: 8,
    left: 10,
    color: "#FFF",
    fontSize: 12,
    textShadowColor: "rgba(0,0,0,0.6)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  },
  resultsSection: {
    paddingHorizontal: 20,
    paddingTop: 6,
  },
  resultsCount: {
    fontSize: 14,
    color: "#9CA3AF",
    marginBottom: 14,
  },
  noResults: {
    alignItems: "center",
    paddingVertical: 60,
  },
  noResultsEmoji: {
    fontSize: 52,
    marginBottom: 16,
  },
  noResultsTitle: {
    fontSize: 18,
    color: "#111827",
    marginBottom: 6,
  },
  noResultsSub: {
    fontSize: 14,
    color: "#9CA3AF",
  },
  resultCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 10,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  resultImage: {
    width: 64,
    height: 64,
    borderRadius: 12,
    backgroundColor: "#F5F5F5",
  },
  resultInfo: {
    flex: 1,
    marginLeft: 14,
  },
  resultName: {
    fontSize: 15,
    color: "#111827",
    marginBottom: 6,
  },
  resultMeta: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  resultBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  resultBadgeText: {
    fontSize: 11,
    color: "#FFF",
  },
  resultTime: {
    fontSize: 12,
    color: "#6B7280",
  },
});

export default HomePage;
