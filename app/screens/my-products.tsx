import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import LottieView from "lottie-react-native";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { image } from "../../assets/images";
import { useAuth } from "../../contexts/AuthContext";
import { useLanguage } from "../../contexts/LanguageContext";
import { apiService, getFullImageUrl } from "../../utils/api";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { Order, Product } from "../../utils/api/types";
import { AppText } from "../components/appText";

type FilterTab = "all" | "incoming" | "active" | "ended" | "shipping";

const MyProductsPage = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [products, setProducts] = useState<Product[]>([]);
  const [shippingProducts, setShippingProducts] = useState<Product[]>([]);
  const [sellerOrders, setSellerOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [shipLoading, setShipLoading] = useState<number | null>(null);

  // Real-time countdown tick
  const [, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  // ─── Fetch products from API (including shipping/completed) ───
  const fetchProducts = useCallback(async () => {
    try {
      if (user?.id) {
        const { allProducts, shippingProducts: shipping } =
          await apiService.product.getMyProductsWithShipping(user.id);
        setProducts(allProducts);
        setShippingProducts(shipping);

        // Get seller orders with real status from backend
        const shippingProductIds = shipping.map((p) => p.id);
        const sellerReal = await apiService.order.getSellerOrdersForProducts(
          user.id,
          shippingProductIds,
        );

        // If real orders found, use them; otherwise fall back to constructed
        let sellerSideOrders: Order[] = sellerReal;
        if (sellerReal.length === 0 && shippingProductIds.length > 0) {
          try {
            sellerSideOrders =
              await apiService.order.getMySellerOrdersConstructed(user.id);
          } catch {
            sellerSideOrders = [];
          }
        }

        setSellerOrders(sellerSideOrders);
      } else {
        const data = await apiService.product.getMyProducts();
        setProducts(data);
      }
    } catch (error: any) {
      console.error("Failed to load my products:", error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const openDetail = (product: Product) => {
    router.push({
      pathname: "/screens/product-detail",
      params: { productId: product.id.toString() },
    });
  };

  // ─── Get matching seller order for a product ──────────────
  const getSellerOrder = useCallback(
    (productId: number): Order | undefined =>
      sellerOrders.find((o) => o.product_id === productId),
    [sellerOrders],
  );

  // ─── Ship handler ─────────────────────────────────────────
  const handleShip = useCallback(
    (order: Order) => {
      Alert.alert(t("confirmShipTitle"), t("confirmShipMsg"), [
        { text: t("cancel"), style: "cancel" },
        {
          text: t("confirm"),
          onPress: async () => {
            setShipLoading(order.product_id);
            try {
              await apiService.order.shipOrder(order.id);
              Alert.alert(t("success"), t("shipSuccessMsg"));
              // Refresh everything
              fetchProducts();
            } catch (error: any) {
              Alert.alert(t("error"), error.message || t("shipFailedMsg"));
            } finally {
              setShipLoading(null);
            }
          },
        },
      ]);
    },
    [fetchProducts],
  );

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchProducts();
  }, [fetchProducts]);

  // Check if auction has actually ended (real-time)
  const isRealEnded = useCallback((product: Product) => {
    if (product.status === "ended") return true;
    if (product.tag === "incoming") return false;
    return new Date(product.auction_end_time).getTime() <= Date.now();
  }, []);

  const filteredProducts = useMemo(() => {
    if (activeTab === "all") return products;
    if (activeTab === "incoming")
      return products.filter((p) => p.tag === "incoming");
    if (activeTab === "active")
      return products.filter(
        (p) =>
          (p.tag === "hot" || p.tag === "ending" || p.tag === "default") &&
          !isRealEnded(p),
      );
    if (activeTab === "ended")
      return products.filter(
        (p) => isRealEnded(p) && !shippingProducts.some((sp) => sp.id === p.id),
      );
    if (activeTab === "shipping") return shippingProducts;
    return products;
  }, [products, shippingProducts, activeTab, isRealEnded]);

  const stats = useMemo(
    () => ({
      all: products.length,
      incoming: products.filter((p) => p.tag === "incoming").length,
      active: products.filter(
        (p) =>
          (p.tag === "hot" || p.tag === "ending" || p.tag === "default") &&
          !isRealEnded(p),
      ).length,
      ended: products.filter(
        (p) => isRealEnded(p) && !shippingProducts.some((sp) => sp.id === p.id),
      ).length,
      shipping: shippingProducts.length,
    }),
    [products, shippingProducts, isRealEnded],
  );

  const formatTimeRemaining = (endTime: string) => {
    const end = new Date(endTime).getTime();
    const now = Date.now();
    const diff = end - now;
    if (diff <= 0) return t("ended");
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("th-TH", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPrice = (price: string) => {
    return `฿${parseFloat(price).toLocaleString()}`;
  };

  /** Get the primary image source for a product */
  const getProductImageSource = (product: Product) => {
    if (product.image_url) {
      const url = getFullImageUrl(product.image_url);
      if (url) return { uri: url };
    }
    if (product.picture) {
      const url = getFullImageUrl(product.picture);
      if (url) return { uri: url };
    }
    if (product.images && product.images.length > 0) {
      const url = getFullImageUrl(product.images[0].image_url);
      if (url) return { uri: url };
    }
    return image.macbook;
  };

  const getTagConfig = (tag: string) => {
    switch (tag) {
      case "hot":
        return {
          label: t("tabHot"),
          color: "#FF3B30",
          bg: "#FFEBEE",
          icon: "🔥",
        };
      case "ending":
        return {
          label: t("tagEnding"),
          color: "#FF9500",
          bg: "#FFF3E0",
          icon: "⏰",
        };
      case "incoming":
        return {
          label: t("tabIncoming"),
          color: "#7B1FA2",
          bg: "#F3E5F5",
          icon: "📦",
        };
      default:
        return {
          label: t("tagActive"),
          color: "#4CAF50",
          bg: "#E8F5E9",
          icon: "✅",
        };
    }
  };

  /** Check if product is in shipping state (sold, waiting for buyer verification) */
  const isShippingProduct = useCallback(
    (product: Product) => {
      return shippingProducts.some((sp) => sp.id === product.id);
    },
    [shippingProducts],
  );

  const getStatusConfig = (product: Product) => {
    if (isShippingProduct(product)) {
      return {
        label: t("tagShipping"),
        color: "#E65100",
        bg: "#FFF3E0",
        icon: "📦",
      };
    }
    if (isRealEnded(product)) {
      return { label: t("tabEnded"), color: "#999", bg: "#F5F5F5" };
    }
    return getTagConfig(product.tag);
  };

  const tabs: { key: FilterTab; label: string; count: number }[] = [
    { key: "all", label: t("tabAll"), count: stats.all },
    { key: "incoming", label: t("tabIncoming"), count: stats.incoming },
    { key: "active", label: t("tabActive"), count: stats.active },
    { key: "ended", label: t("tabEnded"), count: stats.ended },
    { key: "shipping", label: t("tabShipping"), count: stats.shipping },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={["#00112E", "#003994"]} style={styles.header}>
        <SafeAreaView edges={["top"]} style={styles.headerInner}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
          >
            <Image source={image.back} style={{ width: 32, height: 32 }} />
          </TouchableOpacity>
          <AppText weight="bold" style={styles.headerTitle} numberOfLines={1}>
            {t("myProductsTitle")}
          </AppText>
          <View style={{ width: 40 }} />
        </SafeAreaView>
      </LinearGradient>

      {/* Filter Tabs */}
      <View style={styles.tabsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.key}
              onPress={() => setActiveTab(tab.key)}
              style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            >
              <AppText
                weight={activeTab === tab.key ? "bold" : "medium"}
                style={[
                  styles.tabText,
                  activeTab === tab.key && styles.tabTextActive,
                ]}
              >
                {tab.label} ({tab.count})
              </AppText>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Product List */}
      <ScrollView
        style={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {loading ? (
          <View style={{ alignItems: "center", paddingVertical: 60 }}>
            <LottieView
              source={require("../../assets/animations/loading.json")}
              autoPlay
              loop
              style={{ width: 100, height: 100 }}
            />
          </View>
        ) : filteredProducts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <LottieView
              source={require("../../assets/animations/empty.json")}
              autoPlay
              loop
              style={{ width: 160, height: 160 }}
            />
            <AppText weight="bold" style={styles.emptyTitle}>
              {t("noProductsYet")}
            </AppText>
            <AppText weight="regular" style={styles.emptySubtitle}>
              {activeTab === "all"
                ? t("emptyProductsAll")
                : activeTab === "shipping"
                  ? t("emptyProductsShipping")
                  : t("emptyProductsCategory")}
            </AppText>
          </View>
        ) : (
          filteredProducts.map((product) => {
            const statusConfig = getStatusConfig(product);
            const isEnded = isRealEnded(product);
            const isShipping = isShippingProduct(product);
            const sellerOrder = isShipping
              ? getSellerOrder(product.id)
              : undefined;
            // confirmed = buyer contacted, seller needs to ship
            const needsShip = sellerOrder?.status === "confirmed";
            const timeDisplay =
              product.tag === "incoming"
                ? formatTimeRemaining(product.auction_start_time)
                : formatTimeRemaining(product.auction_end_time);

            return (
              <TouchableOpacity
                key={product.id}
                style={[styles.productCard, isShipping && styles.shippingCard]}
                activeOpacity={0.7}
                onPress={() => openDetail(product)}
              >
                {/* Product Image */}
                <Image
                  source={getProductImageSource(product)}
                  style={styles.productImage}
                />

                {/* Product Info */}
                <View style={styles.productInfo}>
                  <View style={styles.productHeader}>
                    <AppText
                      weight="bold"
                      style={styles.productName}
                      numberOfLines={1}
                    >
                      {product.name}
                    </AppText>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: statusConfig.bg },
                      ]}
                    >
                      <AppText
                        weight="semibold"
                        style={[
                          styles.statusText,
                          { color: statusConfig.color },
                        ]}
                      >
                        {statusConfig.label}
                      </AppText>
                    </View>
                  </View>

                  <View style={styles.priceRow}>
                    <View>
                      <AppText weight="regular" style={styles.priceLabel}>
                        {isShipping
                          ? t("priceForSale")
                          : isEnded
                            ? t("priceFinal")
                            : t("priceCurrent")}
                      </AppText>
                      <AppText
                        weight="bold"
                        style={[
                          styles.priceValue,
                          isShipping && { color: "#E65100" },
                        ]}
                      >
                        ฿
                        {parseFloat(
                          product.current_price || product.starting_price,
                        ).toLocaleString()}
                      </AppText>
                    </View>
                    {isShipping ? (
                      <View style={styles.timeContainer}>
                        {needsShip ? (
                          <TouchableOpacity
                            activeOpacity={0.8}
                            onPress={(e) => {
                              e.stopPropagation();
                              handleShip(sellerOrder!);
                            }}
                            disabled={shipLoading === product.id}
                            style={styles.shipButton}
                          >
                            {shipLoading === product.id ? (
                              <ActivityIndicator size="small" color="#fff" />
                            ) : (
                              <AppText
                                weight="bold"
                                style={styles.shipButtonText}
                                numberOfLines={1}
                              >
                                {t("shipProduct")}
                              </AppText>
                            )}
                          </TouchableOpacity>
                        ) : sellerOrder?.status === "shipped" ? (
                          <View style={styles.shippingBadge}>
                            <AppText
                              weight="semibold"
                              style={styles.shippingBadgeText}
                            >
                              {t("shippedLabel")}
                            </AppText>
                          </View>
                        ) : (
                          <View
                            style={[
                              styles.shippingBadge,
                              {
                                borderColor: "#CE93D8",
                                backgroundColor: "#F3E5F5",
                              },
                            ]}
                          >
                            <AppText
                              weight="semibold"
                              style={[
                                styles.shippingBadgeText,
                                { color: "#7B1FA2" },
                              ]}
                            >
                              {t("waitingBuyerLabel")}
                            </AppText>
                          </View>
                        )}
                      </View>
                    ) : (
                      !isEnded && (
                        <View style={styles.timeContainer}>
                          <AppText weight="regular" style={styles.timeLabel}>
                            {product.tag === "incoming"
                              ? t("startsIn")
                              : t("timeRemaining")}
                          </AppText>
                          <AppText weight="semibold" style={styles.timeValue}>
                            {timeDisplay}
                          </AppText>
                        </View>
                      )
                    )}
                  </View>

                  <View style={styles.productMeta}>
                    {isShipping ? (
                      <View style={styles.metaItem}>
                        <AppText weight="regular" style={styles.metaText}>
                          {needsShip
                            ? t("buyerConfirmedPleaseShip")
                            : sellerOrder?.status === "shipped"
                              ? t("shippedWaitingBuyerConfirm")
                              : t("waitingBuyerContact")}
                        </AppText>
                      </View>
                    ) : (
                      <>
                        <View style={styles.metaItem}>
                          <AppText weight="regular" style={styles.metaText}>
                            🏷️ เริ่มต้น ฿
                            {parseFloat(
                              product.starting_price,
                            ).toLocaleString()}
                          </AppText>
                        </View>
                        <View style={styles.metaItem}>
                          <AppText weight="regular" style={styles.metaText}>
                            👥 {product.bids_count || 0} {t("bids")}
                          </AppText>
                        </View>
                      </>
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}
        <View style={{ height: 30 }} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F9FB",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    fontSize: 14,
    color: "#666",
  },

  // Header
  header: {
    paddingBottom: 15,
  },
  headerInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 16,
    color: "#FFF",
  },

  // Stats
  statsRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 14,
    gap: 8,
  },
  statCard: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 12,
  },
  statNumber: {
    fontSize: 18,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 10,
    color: "#666",
  },

  // Tabs
  tabsContainer: {
    paddingHorizontal: 16,
    marginBottom: 12,
    marginTop: 12,
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F0F0F0",
    marginRight: 8,
  },
  tabActive: {
    backgroundColor: "#001A3D",
  },
  tabText: {
    fontSize: 13,
    color: "#666",
  },
  tabTextActive: {
    color: "#FFF",
  },

  // List
  listContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },

  // Empty
  emptyContainer: {
    alignItems: "center",
    paddingTop: 80,
  },
  emptyTitle: {
    fontSize: 18,
    color: "#333",
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 13,
    color: "#999",
    textAlign: "center",
    lineHeight: 20,
  },

  // Product Card
  productCard: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  productImage: {
    width: 90,
    height: 90,
    borderRadius: 12,
    backgroundColor: "#F0F0F0",
  },
  productInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: "space-between",
  },
  productHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  productName: {
    fontSize: 15,
    color: "#001A3D",
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "600",
  },
  priceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 6,
  },
  priceLabel: {
    fontSize: 10,
    color: "#999",
    marginBottom: 1,
  },
  priceValue: {
    fontSize: 16,
    color: "#003994",
  },
  timeContainer: {
    alignItems: "flex-end",
  },
  timeLabel: {
    fontSize: 10,
    color: "#999",
    marginBottom: 1,
  },
  timeValue: {
    fontSize: 13,
    color: "#FF9500",
  },
  productMeta: {
    flexDirection: "row",
    gap: 12,
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  metaText: {
    fontSize: 11,
    color: "#999",
  },

  // Shipping card
  shippingCard: {
    borderWidth: 1,
    borderColor: "#FFB74D",
    backgroundColor: "#FFFBF5",
  },
  shippingBadge: {
    backgroundColor: "#FFF3E0",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#FFB74D",
  },
  shippingBadgeText: {
    fontSize: 11,
    color: "#E65100",
  },
  shipButton: {
    backgroundColor: "#7B1FA2",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 110,
  },
  shipButtonText: {
    fontSize: 12,
    color: "#fff",
  },
});

export default MyProductsPage;
