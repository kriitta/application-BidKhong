import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useFocusEffect, useRouter } from "expo-router";
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
  ImageBackground,
  Keyboard,
  Modal,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { image } from "../../assets/images";
import { useAppReady } from "../../contexts/AppReadyContext";
import { useAuth } from "../../contexts/AuthContext";
import { useLanguage } from "../../contexts/LanguageContext";
import { apiService, getFullImageUrl } from "../../utils/api";
import {
  Category,
  Product,
  SearchHistoryItem,
  SearchResult,
} from "../../utils/api/types";
import { AppText } from "../components/appText";
import { AuthModal } from "../components/AuthModal";

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get("window");

const HomePage = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { isGuest, isLoggedIn, user, refreshUser, updateWallet } = useAuth();
  const { t } = useLanguage();
  const [authModalVisible, setAuthModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);

  useFocusEffect(
    useCallback(() => {
      if (isLoggedIn && !isGuest) {
        fetchWalletBalance();
      }
    }, [isLoggedIn, isGuest]),
  );

  /** ดึงยอด wallet realtime จาก /wallet */
  const fetchWalletBalance = async () => {
    try {
      const balance = await apiService.wallet.getBalance();
      updateWallet(balance);
    } catch {
      // ใช้ข้อมูล cache ต่อไปหาก API ล้มเหลว
    }
  };

  const formatBalance = (amount?: string) => {
    if (!amount) return "฿0";
    const num = parseFloat(amount);
    return `฿${num.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  };

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

  // ─── Search History from API ───
  const [searchHistory, setSearchHistory] = useState<SearchHistoryItem[]>([]);

  const fetchSearchHistory = useCallback(async () => {
    if (isGuest) return;
    try {
      const data = await apiService.search.getRecentSearches();
      if (Array.isArray(data)) {
        setSearchHistory(data);
      }
    } catch {
      // silently fail
    }
  }, [isGuest]);

  // โหลดประวัติ search ทุกครั้งที่กลับมาที่หน้า home
  useFocusEffect(
    useCallback(() => {
      fetchSearchHistory();
    }, [fetchSearchHistory]),
  );

  const deleteSearchItem = useCallback(
    async (id: number) => {
      setSearchHistory((prev) => prev.filter((item) => item.id !== id));
      try {
        await apiService.search.deleteSearchHistoryItem(id);
      } catch {
        // re-fetch in case delete failed
        fetchSearchHistory();
      }
    },
    [fetchSearchHistory],
  );

  const clearAllSearchHistory = useCallback(async () => {
    const backup = searchHistory;
    setSearchHistory([]);
    try {
      await apiService.search.clearRecentSearches();
    } catch {
      setSearchHistory(backup);
    }
  }, [searchHistory]);

  // ─── Categories from API ───
  const [categories, setCategories] = useState<Category[]>([]);

  // Image mapping สำหรับ category (API ไม่ส่งรูปมา)
  const CATEGORY_IMAGES: Record<string, any> = {
    Electronics: image.electronic,
    Fashion: image.shirt,
    Collectibles: image.collectible,
    Home: image.house,
    Vehicles: image.car,
    Others: image.icon,
  };

  // ─── Products from API ───
  const [hotAuctions, setHotAuctions] = useState<Product[]>([]);
  const [endingSoon, setEndingSoon] = useState<Product[]>([]);
  const [allProductDefault, setAllProductDefault] = useState<Product[]>([]);
  const [incoming, setIncoming] = useState<Product[]>([]);
  const [recommendations, setRecommendations] = useState<Product[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // ─── Refresh products (reusable for pull-to-refresh & polling) ───
  const refreshProducts = useCallback(async () => {
    try {
      const [productsRes, recsRes] = await Promise.allSettled([
        apiService.product.getProducts({ per_page: 100 }),
        isLoggedIn && !isGuest
          ? apiService.product.getRecommendations(10)
          : Promise.resolve([]),
      ]);

      if (productsRes.status === "fulfilled") {
        const all = productsRes.value.data ?? [];
        setHotAuctions(all.filter((p) => p.tag === "hot"));
        setEndingSoon(all.filter((p) => p.tag === "ending"));
        setAllProductDefault(all.filter((p) => p.tag === "default"));
        setIncoming(all.filter((p) => p.tag === "incoming"));
      }

      if (recsRes.status === "fulfilled") {
        const recsData = recsRes.value;
        setRecommendations(Array.isArray(recsData) ? recsData : []);
      }
    } catch (e) {
      // silent
    }
  }, [isLoggedIn, isGuest]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshProducts();
    setRefreshing(false);
  }, [refreshProducts]);

  // Filter recommendations to only show active (non-ended) products
  const activeRecommendations = useMemo(() => {
    const now = new Date();
    return recommendations.filter((p) => {
      const endTime = new Date(p.auction_end_time);
      return endTime.getTime() > now.getTime();
    });
  }, [recommendations]);

  // ─── Real-time countdown tick (re-render every second) ───
  const [, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  // ─── Fetch all initial data & signal splash ready ───
  const { markHomeReady } = useAppReady();

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [categoriesData, productsRes, recsRes] = await Promise.allSettled(
          [
            apiService.category.getCategories(),
            apiService.product.getProducts({ per_page: 100 }),
            isLoggedIn && !isGuest
              ? apiService.product.getRecommendations(10)
              : Promise.resolve([]),
          ],
        );

        if (categoriesData.status === "fulfilled") {
          // Deduplicate by name (server may return same category with different IDs)
          const seenNames = new Set<string>();
          const unique = categoriesData.value.filter((c) => {
            const key = c.name.trim().toLowerCase();
            if (seenNames.has(key)) return false;
            seenNames.add(key);
            return true;
          });
          setCategories(unique);
        } else {
          console.error(
            "Failed to fetch categories:",
            categoriesData.reason?.message,
          );
        }

        if (productsRes.status === "fulfilled") {
          const all = productsRes.value.data ?? [];
          setHotAuctions(all.filter((p) => p.tag === "hot"));
          setEndingSoon(all.filter((p) => p.tag === "ending"));
          setAllProductDefault(all.filter((p) => p.tag === "default"));
          setIncoming(all.filter((p) => p.tag === "incoming"));
        } else {
          console.error(
            "Failed to fetch products:",
            productsRes.reason?.message,
          );
        }

        if (recsRes.status === "fulfilled") {
          const recsData = recsRes.value;
          setRecommendations(Array.isArray(recsData) ? recsData : []);
        }
      } finally {
        setLoading(false);
        markHomeReady();
      }
    };
    fetchInitialData();
  }, []);

  // ─── Polling: refresh products every 30 seconds ───
  const lastRefreshRef = useRef(Date.now());
  useEffect(() => {
    const interval = setInterval(() => {
      refreshProducts();
      lastRefreshRef.current = Date.now();
    }, 30000);
    return () => clearInterval(interval);
  }, [refreshProducts]);

  // ─── Refresh on focus (skip if recently refreshed) ───
  useFocusEffect(
    useCallback(() => {
      // Only refresh if more than 10 seconds since last refresh
      if (Date.now() - lastRefreshRef.current > 10_000) {
        refreshProducts();
        lastRefreshRef.current = Date.now();
      }
    }, [refreshProducts]),
  );

  /** ดึงรูปแรกของสินค้า หรือใช้ image_url / picture เป็น fallback */
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
    return image.macbook; // fallback
  };

  /** แปลง auction_end_time เป็นข้อความเวลาที่เหลือ */
  const formatTimeRemaining = (endTime: string) => {
    const now = new Date();
    const end = new Date(endTime);
    const diff = end.getTime() - now.getTime();
    if (diff <= 0) return t("ended");
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  // Aggregate all products for search
  const allProducts = useMemo(
    () => [
      ...hotAuctions.map((item) => ({ ...item, type: "hot" as const })),
      ...endingSoon.map((item) => ({ ...item, type: "ending" as const })),
      ...allProductDefault.map((item) => ({
        ...item,
        type: "default" as const,
      })),
      ...incoming.map((item) => ({ ...item, type: "incoming" as const })),
    ],
    [hotAuctions, endingSoon, allProductDefault, incoming],
  );

  // ─── API Search Results ───
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [isSearchLoading, setIsSearchLoading] = useState(false);
  const searchDebounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchResults([]);
      setIsSearchLoading(false);
      return;
    }
    setIsSearchLoading(true);
    if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    searchDebounceRef.current = setTimeout(async () => {
      const keyword = searchQuery.trim();
      try {
        const res = await apiService.search.search({ q: keyword });
        setSearchResults(res.data ?? []);
        // บันทึก keyword ลง history โดยอัตโนมัติ
        if (!isGuest) {
          apiService.search
            .saveSearchKeyword(keyword)
            .then(fetchSearchHistory)
            .catch(() => {});
        }
      } catch {
        setSearchResults([]);
      } finally {
        setIsSearchLoading(false);
      }
    }, 400);
    return () => {
      if (searchDebounceRef.current) clearTimeout(searchDebounceRef.current);
    };
  }, [searchQuery]);

  const saveKeywordAndRefreshHistory = useCallback(
    async (keyword: string) => {
      if (!keyword.trim() || isGuest) return;
      try {
        await apiService.search.saveSearchKeyword(keyword.trim());
        await fetchSearchHistory();
      } catch {
        // silently fail
      }
    },
    [isGuest, fetchSearchHistory],
  );

  useEffect(() => {
    if (
      searchQuery.length > 0 &&
      !isSearchLoading &&
      searchResults.length === 0
    ) {
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
  }, [searchQuery, isSearchLoading, searchResults.length]);

  const openSearch = useCallback(() => {
    setSearchVisible(true);
    fetchSearchHistory();
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
      setSearchResults([]);
    });
  }, []);

  const cancelSearch = useCallback(() => {
    Keyboard.dismiss();
    setIsSearching(false);
    setSearchQuery("");
    setSearchResults([]);
  }, []);

  // ─── Fetch history เมื่อ inline search panel เปิด ───
  useEffect(() => {
    if (isSearching) {
      fetchSearchHistory();
    }
  }, [isSearching]);

  const handleSearchItemPress = useCallback(
    (item: SearchResult) => {
      closeSearch();
      saveKeywordAndRefreshHistory(searchQuery);
      setTimeout(() => {
        router.push({
          pathname: "/screens/product-detail",
          params: { productId: item.id.toString() },
        });
      }, 300);
    },
    [closeSearch, saveKeywordAndRefreshHistory, searchQuery],
  );

  const getBadgeForStatus = (status: string) => {
    switch (status) {
      case "active":
        return { label: "Hot", bg: "#FF3B30", icon: "flame" as const };
      case "ending":
        return {
          label: "Ending",
          bg: "#FF8C00",
          icon: "alarm-outline" as const,
        };
      case "incoming":
        return {
          label: "Incoming",
          bg: "#9B27B0",
          icon: "arrow-forward-circle-outline" as const,
        };
      case "ended":
        return {
          label: "Ended",
          bg: "#6B7280",
          icon: "checkmark-circle-outline" as const,
        };
      default:
        return { label: "All", bg: "#4285F4", icon: "cube-outline" as const };
    }
  };

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <LottieView
          source={require("../../assets/animations/loading.json")}
          autoPlay
          loop
          style={{ width: 120, height: 120 }}
        />
      </View>
    );
  }

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
                  onSubmitEditing={() =>
                    saveKeywordAndRefreshHistory(searchQuery)
                  }
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
                <AppText weight="medium" style={s.cancelText} numberOfLines={1}>
                  {t("cancel")}
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
                  {searchHistory.length > 0 && (
                    <View style={s.searchSection}>
                      <View style={s.searchSectionHeader}>
                        <AppText
                          weight="semibold"
                          style={s.searchSectionTitle}
                          numberOfLines={1}
                        >
                          🕐 ค้นหาล่าสุด
                        </AppText>
                        <TouchableOpacity onPress={clearAllSearchHistory}>
                          <AppText
                            weight="regular"
                            style={s.clearAllText}
                            numberOfLines={1}
                          >
                            ล้างทั้งหมด
                          </AppText>
                        </TouchableOpacity>
                      </View>
                      {searchHistory.map((item) => (
                        <View key={item.id} style={s.recentItem}>
                          <TouchableOpacity
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              flex: 1,
                            }}
                            onPress={() => setSearchQuery(item.keyword)}
                          >
                            <View style={s.recentIcon}>
                              <AppText style={{ fontSize: 14, color: "#999" }}>
                                ↻
                              </AppText>
                            </View>
                            <AppText
                              weight="regular"
                              style={s.recentText}
                              numberOfLines={1}
                            >
                              {item.keyword}
                            </AppText>
                          </TouchableOpacity>
                          <TouchableOpacity
                            onPress={() => deleteSearchItem(item.id)}
                            hitSlop={{
                              top: 10,
                              bottom: 10,
                              left: 10,
                              right: 10,
                            }}
                            style={{ padding: 4, marginLeft: 8 }}
                          >
                            <AppText style={{ fontSize: 14, color: "#9CA3AF" }}>
                              ✕
                            </AppText>
                          </TouchableOpacity>
                        </View>
                      ))}
                    </View>
                  )}

                  {/* Hot Auctions */}
                  <View style={s.searchSection}>
                    <AppText
                      weight="semibold"
                      style={s.searchSectionTitle}
                      numberOfLines={1}
                    >
                      <Ionicons name="flame" size={14} color="#FF3B30" />{" "}
                      {t("hotBids")}
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
                                },
                              });
                            }, 300);
                          }}
                          activeOpacity={0.7}
                        >
                          <View style={styles.searchHotImageWrap}>
                            <Image
                              source={getProductImage(item)}
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
                                {formatTimeRemaining(item.auction_end_time)}
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
                            numberOfLines={1}
                          >
                            {t("viewAll")}
                          </AppText>
                          <AppText
                            weight="regular"
                            style={styles.searchHotViewAllSub}
                            numberOfLines={1}
                          >
                            {t("hotBids")}
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
                  {isSearchLoading ? (
                    <View style={s.noResults}>
                      <Ionicons
                        name="search-outline"
                        size={32}
                        color="#6B7280"
                      />
                      <AppText
                        weight="regular"
                        style={s.noResultsSub}
                        numberOfLines={1}
                      >
                        กำลังค้นหา...
                      </AppText>
                    </View>
                  ) : (
                    <>
                      <AppText
                        weight="medium"
                        style={s.resultsCount}
                        numberOfLines={1}
                      >
                        {searchResults.length > 0
                          ? `พบ ${searchResults.length} รายการ`
                          : ""}
                      </AppText>
                      {searchResults.length === 0 ? (
                        <View style={s.noResults}>
                          <Ionicons
                            name="search-outline"
                            size={32}
                            color="#6B7280"
                          />
                          <AppText
                            weight="semibold"
                            style={s.noResultsTitle}
                            numberOfLines={1}
                          >
                            ไม่พบสินค้า
                          </AppText>
                          <AppText
                            weight="regular"
                            style={s.noResultsSub}
                            numberOfLines={1}
                          >
                            ลองค้นหาด้วยคำอื่น
                          </AppText>
                        </View>
                      ) : (
                        searchResults.map((item, idx) => {
                          const badge = getBadgeForStatus(item.status);
                          const imgSrc = item.image
                            ? { uri: getFullImageUrl(item.image) ?? item.image }
                            : image.macbook;
                          return (
                            <TouchableOpacity
                              key={`${item.id}-${idx}`}
                              style={s.resultCard}
                              onPress={() => handleSearchItemPress(item)}
                              activeOpacity={0.7}
                            >
                              <Image source={imgSrc} style={s.resultImage} />
                              <View style={s.resultInfo}>
                                <AppText
                                  weight="semibold"
                                  style={s.resultName}
                                  numberOfLines={1}
                                >
                                  {item.title}
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
                                      numberOfLines={1}
                                    >
                                      <Ionicons
                                        name={badge.icon}
                                        size={10}
                                        color="#FFF"
                                      />{" "}
                                      {badge.label}
                                    </AppText>
                                  </View>
                                  {item.timeLeft && (
                                    <AppText
                                      weight="regular"
                                      style={s.resultTime}
                                      numberOfLines={1}
                                    >
                                      <Ionicons
                                        name="time-outline"
                                        size={11}
                                        color="#6B7280"
                                      />{" "}
                                      {item.timeLeft}
                                    </AppText>
                                  )}
                                </View>
                              </View>
                              <AppText
                                style={{ fontSize: 18, color: "#D1D5DB" }}
                              >
                                ›
                              </AppText>
                            </TouchableOpacity>
                          );
                        })
                      )}
                    </>
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
          <AppText weight="bold" numberOfLines={1} style={styles.logoText}>
            BidKhong
          </AppText>
        </View>
        {isLoggedIn && !isGuest ? (
          <View style={styles.balanceContainer}>
            <View>
              <AppText
                weight="regular"
                numberOfLines={1}
                style={styles.balanceLabel}
              >
                {t("totalBalance")}
              </AppText>
              <AppText
                weight="bold"
                numberOfLines={1}
                adjustsFontSizeToFit
                style={styles.balanceAmount}
              >
                {formatBalance(user?.wallet?.balance_total)}
              </AppText>
            </View>
            {user?.profile_image ? (
              <Image
                source={{ uri: getFullImageUrl(user.profile_image)! }}
                style={styles.avatar}
              />
            ) : (
              <View style={[styles.avatar, styles.defaultAvatar]}>
                <AppText weight="bold" style={styles.defaultAvatarText}>
                  {user?.name?.charAt(0).toUpperCase() || "U"}
                </AppText>
              </View>
            )}
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
            <AppText
              weight="semibold"
              numberOfLines={1}
              style={styles.guestSignInText}
            >
              {t("login")}
            </AppText>
          </TouchableOpacity>
        )}
      </ImageBackground>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
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
              placeholder={t("searchPlaceholder")}
              placeholderTextColor="#B0B0B0"
              value={searchQuery}
              onChangeText={setSearchQuery}
              onFocus={() => setIsSearching(true)}
              returnKeyType="search"
              autoCorrect={false}
              onSubmitEditing={() => saveKeywordAndRefreshHistory(searchQuery)}
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
              <AppText
                weight="medium"
                style={styles.cancelText}
                numberOfLines={1}
              >
                {t("cancel")}
              </AppText>
            </TouchableOpacity>
          )}
        </View>

        {isSearching ? (
          <View style={styles.searchPanel}>
            {searchQuery.length === 0 ? (
              <>
                {/* Recent Searches */}
                {searchHistory.length > 0 && (
                  <View style={styles.searchSection}>
                    <View style={styles.searchSectionHeader}>
                      <AppText
                        weight="semibold"
                        style={styles.searchSectionTitle}
                        numberOfLines={1}
                      >
                        {t("recentSearches")}
                      </AppText>
                      <TouchableOpacity onPress={clearAllSearchHistory}>
                        <AppText
                          weight="regular"
                          style={styles.clearAllText}
                          numberOfLines={1}
                        >
                          {t("clearAll")}
                        </AppText>
                      </TouchableOpacity>
                    </View>
                    {searchHistory.map((item) => (
                      <View key={item.id} style={styles.recentItem}>
                        <TouchableOpacity
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            flex: 1,
                          }}
                          onPress={() => setSearchQuery(item.keyword)}
                        >
                          <View style={styles.recentIcon}>
                            <AppText style={{ fontSize: 14, color: "#999" }}>
                              ↻
                            </AppText>
                          </View>
                          <AppText
                            weight="regular"
                            style={styles.recentText}
                            numberOfLines={1}
                          >
                            {item.keyword}
                          </AppText>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => deleteSearchItem(item.id)}
                          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                          style={{ padding: 4, marginLeft: 8 }}
                        >
                          <AppText style={{ fontSize: 14, color: "#9CA3AF" }}>
                            ✕
                          </AppText>
                        </TouchableOpacity>
                      </View>
                    ))}
                  </View>
                )}

                {/* Hot Auctions */}
                <View style={styles.searchSection}>
                  <AppText
                    weight="semibold"
                    style={styles.searchSectionTitle}
                    numberOfLines={1}
                  >
                    <Ionicons name="flame" size={14} color="#FF3B30" />{" "}
                    {t("hotBids")}
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
                            },
                          });
                        }}
                        activeOpacity={0.7}
                      >
                        <View style={styles.searchHotImageWrap}>
                          <Image
                            source={getProductImage(item)}
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
                              {formatTimeRemaining(item.auction_end_time)}
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
                          numberOfLines={1}
                        >
                          {t("viewAll")}
                        </AppText>
                        <AppText
                          weight="regular"
                          style={styles.searchHotViewAllSub}
                          numberOfLines={1}
                        >
                          {t("hotBids")}
                        </AppText>
                      </View>
                    </TouchableOpacity>
                  </ScrollView>
                </View>
              </>
            ) : (
              <View style={styles.resultsSection}>
                <View style={styles.productsGrid}>
                  {isSearchLoading ? (
                    <View style={styles.emptyStateContainer}>
                      <Animated.View style={styles.emptyStateContent}>
                        <AppText
                          weight="regular"
                          style={styles.emptyStateSub}
                          numberOfLines={1}
                        >
                          กำลังค้นหา...
                        </AppText>
                      </Animated.View>
                    </View>
                  ) : searchResults.length > 0 ? (
                    searchResults.map((item, idx) => {
                      const imgSrc = item.image
                        ? { uri: getFullImageUrl(item.image) ?? item.image }
                        : image.macbook;
                      return (
                        <TouchableOpacity
                          key={`${item.id}-${idx}`}
                          style={styles.productCard}
                          onPress={() => handleSearchItemPress(item)}
                          activeOpacity={0.7}
                        >
                          <View style={styles.productImageContainer}>
                            {item.status === "active" && (
                              <View style={styles.srHotBadge}>
                                <Image
                                  source={image.hot_badge}
                                  style={{ width: 13, height: 14 }}
                                />
                              </View>
                            )}
                            {item.status === "ending" && (
                              <View style={styles.srEndingBadge}>
                                <Image
                                  source={image.ending_badge}
                                  style={{ width: 18, height: 18 }}
                                />
                              </View>
                            )}
                            {item.timeLeft && (
                              <View style={styles.srTimeBadge}>
                                <Image
                                  source={image.incoming_time}
                                  style={{
                                    width: 12,
                                    height: 12,
                                    marginRight: 4,
                                  }}
                                />
                                <AppText
                                  weight="medium"
                                  style={styles.srTimeText}
                                  numberOfLines={1}
                                >
                                  {item.timeLeft}
                                </AppText>
                              </View>
                            )}
                            <Image
                              source={imgSrc}
                              style={styles.productImage}
                              contentFit="cover"
                            />
                          </View>
                          <AppText
                            weight="medium"
                            style={styles.productName}
                            numberOfLines={1}
                          >
                            {item.title}
                          </AppText>
                        </TouchableOpacity>
                      );
                    })
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
                          numberOfLines={1}
                        >
                          {t("noResults")}
                        </AppText>
                        <AppText
                          weight="regular"
                          style={styles.emptyStateSub}
                          numberOfLines={2}
                        >
                          {t("noProducts")}
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
                <AppText
                  weight="semibold"
                  numberOfLines={1}
                  style={styles.sectionTitle}
                >
                  {t("categories")}
                </AppText>
              </View>
              <View style={styles.categoriesGrid}>
                {categories.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    style={styles.categoryCard}
                    onPress={() =>
                      router.push(
                        `/screens/category?categoryId=${cat.id}&categoryName=${encodeURIComponent(cat.name)}`,
                      )
                    }
                  >
                    {CATEGORY_IMAGES[cat.name] ? (
                      <Image
                        source={CATEGORY_IMAGES[cat.name]}
                        style={styles.categoryImage}
                      />
                    ) : (
                      <View
                        style={[styles.categoryImage, styles.categoryOthers]}
                      />
                    )}
                    <AppText
                      weight="semibold"
                      style={styles.categoryText}
                      numberOfLines={1}
                    >
                      {cat.name}
                    </AppText>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* 🤖 Recommended For You */}
            {isLoggedIn && !isGuest && (
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={{ flexDirection: "row", alignItems: "center" }}>
                    <Image
                      source={image.recommend}
                      style={{ width: 30, height: 30, marginRight: 4 }}
                    />
                    <AppText
                      weight="semibold"
                      numberOfLines={1}
                      style={styles.sectionTitle}
                    >
                      {t("recommended")}
                    </AppText>
                  </View>
                  <TouchableOpacity
                    onPress={() =>
                      router.push("/screens/view-all?type=recommended")
                    }
                  >
                    <AppText
                      weight="regular"
                      numberOfLines={1}
                      style={styles.viewAll}
                    >
                      {t("viewAll")}
                    </AppText>
                  </TouchableOpacity>
                </View>
                {activeRecommendations.length === 0 ? (
                  <View style={styles.sectionEmpty}>
                    <LottieView
                      source={require("../../assets/animations/empty.json")}
                      autoPlay
                      loop
                      style={styles.sectionEmptyLottie}
                    />
                    <AppText weight="medium" style={styles.sectionEmptyText}>
                      {t("noProducts")}
                    </AppText>
                  </View>
                ) : (
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.horizontalScroll}
                  >
                    {activeRecommendations.slice(0, 5).map((item) => (
                      <TouchableOpacity
                        key={`rec-${item.id}`}
                        style={styles.auctionCard}
                        onPress={() =>
                          router.push({
                            pathname: "/screens/product-detail",
                            params: {
                              productId: item.id.toString(),
                            },
                          })
                        }
                      >
                        <View
                          style={{
                            position: "absolute",
                            top: 8,
                            left: 8,
                            zIndex: 2,
                            backgroundColor: "#7C3AED",
                            borderRadius: 6,
                            paddingHorizontal: 6,
                            paddingVertical: 2,
                          }}
                        >
                          <AppText
                            weight="semibold"
                            numberOfLines={1}
                            style={{ fontSize: 9, color: "#FFF" }}
                          >
                            AI Pick
                          </AppText>
                        </View>
                        <View
                          style={[
                            styles.timeBadge,
                            {
                              flexDirection: "row",
                              alignItems: "center",
                              gap: 6,
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
                          style={[styles.auctionImage, { marginBottom: 6 }]}
                        />
                        <AppText
                          weight="medium"
                          style={styles.auctionName}
                          numberOfLines={1}
                        >
                          {item.name}
                        </AppText>
                        {/* Category + Subcategory badges */}
                        {(item.category?.name || item.subcategory?.name) && (
                          <View
                            style={{
                              flexDirection: "row",
                              flexWrap: "wrap",
                              gap: 4,
                              marginTop: 4,
                              paddingHorizontal: 4,
                            }}
                          >
                            {item.category?.name && (
                              <View
                                style={{
                                  backgroundColor: "#EEF2FF",
                                  borderRadius: 4,
                                  paddingHorizontal: 5,
                                  paddingVertical: 2,
                                }}
                              >
                                <AppText
                                  weight="medium"
                                  numberOfLines={1}
                                  style={{ fontSize: 9, color: "#4338CA" }}
                                >
                                  {item.category.name}
                                </AppText>
                              </View>
                            )}
                            {item.subcategory?.name && (
                              <View
                                style={{
                                  backgroundColor: "#F0FDF4",
                                  borderRadius: 4,
                                  paddingHorizontal: 5,
                                  paddingVertical: 2,
                                }}
                              >
                                <AppText
                                  weight="medium"
                                  numberOfLines={1}
                                  style={{ fontSize: 9, color: "#15803D" }}
                                >
                                  {item.subcategory.name}
                                </AppText>
                              </View>
                            )}
                          </View>
                        )}
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                )}
              </View>
            )}

            {/* Hot Auctions */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Image
                    source={image.hot}
                    style={{ width: 22, height: 24, marginRight: 8 }}
                  />
                  <AppText
                    weight="semibold"
                    numberOfLines={1}
                    style={styles.sectionTitle}
                  >
                    {t("hotBids")}
                  </AppText>
                </View>
                <TouchableOpacity
                  onPress={() => router.push("/screens/view-all?type=hot")}
                >
                  <AppText
                    weight="regular"
                    numberOfLines={1}
                    style={styles.viewAll}
                  >
                    {t("viewAll")}
                  </AppText>
                </TouchableOpacity>
              </View>
              {hotAuctions.length === 0 ? (
                <View style={styles.sectionEmpty}>
                  <LottieView
                    source={require("../../assets/animations/empty.json")}
                    autoPlay
                    loop
                    style={styles.sectionEmptyLottie}
                  />
                  <AppText weight="medium" style={styles.sectionEmptyText}>
                    {t("noProducts")}
                  </AppText>
                </View>
              ) : (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.horizontalScroll}
                >
                  {hotAuctions.slice(0, 5).map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={styles.auctionCard}
                      onPress={() =>
                        router.push({
                          pathname: "/screens/product-detail",
                          params: {
                            productId: item.id.toString(),
                          },
                        })
                      }
                    >
                      <View style={styles.hotBadge}>
                        <Image
                          source={image.hot_badge}
                          style={{ width: 13, height: 14 }}
                        />
                      </View>
                      <View
                        style={[
                          styles.timeBadge,
                          {
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 6,
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
                          {formatTimeRemaining(item.auction_end_time)}
                        </AppText>
                      </View>
                      <Image
                        source={getProductImage(item)}
                        style={[styles.auctionImage, { marginBottom: 8 }]}
                      />
                      <AppText
                        weight="medium"
                        style={styles.auctionName}
                        numberOfLines={1}
                      >
                        {item.name}
                      </AppText>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </View>

            {/* Ending Soon */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Image
                    source={image.ending}
                    style={{ width: 24, height: 24, marginRight: 8 }}
                  />
                  <AppText
                    weight="semibold"
                    numberOfLines={1}
                    style={styles.sectionTitle}
                  >
                    {t("endingSoon")}
                  </AppText>
                </View>
                <TouchableOpacity
                  onPress={() => router.push("/screens/view-all?type=ending")}
                >
                  <AppText
                    weight="regular"
                    numberOfLines={1}
                    style={styles.viewAll}
                  >
                    {t("viewAll")}
                  </AppText>
                </TouchableOpacity>
              </View>
              {endingSoon.length === 0 ? (
                <View style={styles.sectionEmpty}>
                  <LottieView
                    source={require("../../assets/animations/empty.json")}
                    autoPlay
                    loop
                    style={styles.sectionEmptyLottie}
                  />
                  <AppText weight="medium" style={styles.sectionEmptyText}>
                    {t("noProducts")}
                  </AppText>
                </View>
              ) : (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.horizontalScroll}
                >
                  {endingSoon.slice(0, 5).map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={styles.auctionCard}
                      onPress={() =>
                        router.push({
                          pathname: "/screens/product-detail",
                          params: {
                            productId: item.id.toString(),
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
                          {
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 6,
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
                          {formatTimeRemaining(item.auction_end_time)}
                        </AppText>
                      </View>
                      <Image
                        source={getProductImage(item)}
                        style={[styles.auctionImage, { marginBottom: 8 }]}
                      />
                      <AppText
                        weight="medium"
                        style={styles.auctionName}
                        numberOfLines={1}
                      >
                        {item.name}
                      </AppText>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </View>

            {/* All Product */}
            <View style={styles.section}>
              <View style={styles.sectionHeader}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Image
                    source={image.all_product}
                    style={{ width: 24, height: 24, marginRight: 8 }}
                  />
                  <AppText
                    weight="semibold"
                    numberOfLines={1}
                    style={styles.sectionTitle}
                  >
                    {t("allProducts")}
                  </AppText>
                </View>
                <TouchableOpacity
                  onPress={() => router.push("/screens/view-all?type=default")}
                >
                  <AppText
                    weight="regular"
                    numberOfLines={1}
                    style={styles.viewAll}
                  >
                    {t("viewAll")}
                  </AppText>
                </TouchableOpacity>
              </View>
              {allProductDefault.length === 0 ? (
                <View style={styles.sectionEmpty}>
                  <LottieView
                    source={require("../../assets/animations/empty.json")}
                    autoPlay
                    loop
                    style={styles.sectionEmptyLottie}
                  />
                  <AppText weight="medium" style={styles.sectionEmptyText}>
                    {t("noProducts")}
                  </AppText>
                </View>
              ) : (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.horizontalScroll}
                >
                  {allProductDefault.slice(0, 5).map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={styles.auctionCard}
                      onPress={() =>
                        router.push({
                          pathname: "/screens/product-detail",
                          params: {
                            productId: item.id.toString(),
                          },
                        })
                      }
                    >
                      <View
                        style={[
                          styles.timeBadge,
                          {
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 6,
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
                          {formatTimeRemaining(item.auction_end_time)}
                        </AppText>
                      </View>
                      <Image
                        source={getProductImage(item)}
                        style={[styles.auctionImage, { marginBottom: 8 }]}
                      />
                      <AppText
                        weight="medium"
                        style={styles.auctionName}
                        numberOfLines={1}
                      >
                        {item.name}
                      </AppText>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
            </View>

            {/* Incoming */}
            <View style={[styles.section, { marginBottom: 30 }]}>
              <View style={styles.sectionHeader}>
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  <Image
                    source={image.incoming}
                    style={{ width: 27, height: 25, marginRight: 8 }}
                  />
                  <AppText
                    weight="semibold"
                    numberOfLines={1}
                    style={styles.sectionTitle}
                  >
                    {t("incoming")}
                  </AppText>
                </View>
                <TouchableOpacity
                  onPress={() => router.push("/screens/view-all?type=incoming")}
                >
                  <AppText
                    weight="regular"
                    numberOfLines={1}
                    style={styles.viewAll}
                  >
                    {t("viewAll")}
                  </AppText>
                </TouchableOpacity>
              </View>
              {incoming.length === 0 ? (
                <View style={styles.sectionEmpty}>
                  <LottieView
                    source={require("../../assets/animations/empty.json")}
                    autoPlay
                    loop
                    style={styles.sectionEmptyLottie}
                  />
                  <AppText weight="medium" style={styles.sectionEmptyText}>
                    {t("noProducts")}
                  </AppText>
                </View>
              ) : (
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={styles.horizontalScroll}
                >
                  {incoming.slice(0, 5).map((item) => (
                    <TouchableOpacity
                      key={item.id}
                      style={styles.auctionCard}
                      onPress={() =>
                        router.push({
                          pathname: "/screens/product-detail",
                          params: {
                            productId: item.id.toString(),
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
                        <AppText
                          weight="medium"
                          numberOfLines={1}
                          style={styles.incomingText}
                        >
                          {formatTimeRemaining(item.auction_start_time)}
                        </AppText>
                      </View>
                      <Image
                        source={getProductImage(item)}
                        style={[styles.auctionImage, { marginBottom: 8 }]}
                      />
                      <AppText
                        weight="medium"
                        style={styles.auctionName}
                        numberOfLines={1}
                      >
                        {item.name}
                      </AppText>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              )}
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

const CARD_WIDTH = SCREEN_WIDTH * 0.44;

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
    fontSize: 20,
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
    fontSize: 15,
    color: "#fff",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginLeft: 10,
  },
  defaultAvatar: {
    backgroundColor: "#003994",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.5)",
  },
  defaultAvatarText: {
    fontSize: 18,
    color: "#FFF",
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
    fontFamily: "NotoSansThai_400Regular",
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
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  viewAll: {
    fontSize: 13,
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
    right: 10,
    color: "#fff",
    fontSize: 13,
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
    width: CARD_WIDTH,
    marginRight: 12,
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
  allProductBadge: {
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
    fontSize: 13,
    fontWeight: "600",
    color: "#000",
    marginTop: 8,
    textAlign: "center",
    paddingHorizontal: 4,
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
  sectionEmpty: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
  },
  sectionEmptyLottie: {
    width: 120,
    height: 120,
  },
  sectionEmptyText: {
    fontSize: 13,
    color: "#9CA3AF",
    marginTop: 2,
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
    fontFamily: "NotoSansThai_400Regular",
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
