import { LinearGradient } from "expo-linear-gradient";
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
  Dimensions,
  Image,
  Modal,
  NativeScrollEvent,
  NativeSyntheticEvent,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { image } from "../../assets/images";
import { apiService, getFullImageUrl } from "../../utils/api";
import { Product } from "../../utils/api/types";
import { AppText } from "../components/appText";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

type FilterTab = "all" | "incoming" | "active" | "ended";

const MyProductsPage = () => {
  const router = useRouter();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [activeTab, setActiveTab] = useState<FilterTab>("all");
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const [detailImageIndex, setDetailImageIndex] = useState(0);
  const detailScrollRef = useRef<ScrollView>(null);

  // Real-time countdown tick
  const [, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  // ─── Fetch products from API ───
  const fetchProducts = useCallback(async () => {
    try {
      const data = await apiService.product.getMyProducts();
      setProducts(data);
    } catch (error: any) {
      console.error("Failed to load my products:", error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const openDetail = (product: Product) => {
    setSelectedProduct(product);
    setDetailImageIndex(0);
    setDetailVisible(true);
  };

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
    if (activeTab === "ended") return products.filter((p) => isRealEnded(p));
    return products;
  }, [products, activeTab, isRealEnded]);

  const stats = useMemo(
    () => ({
      all: products.length,
      incoming: products.filter((p) => p.tag === "incoming").length,
      active: products.filter(
        (p) =>
          (p.tag === "hot" || p.tag === "ending" || p.tag === "default") &&
          !isRealEnded(p),
      ).length,
      ended: products.filter((p) => isRealEnded(p)).length,
    }),
    [products, isRealEnded],
  );

  const formatTimeRemaining = (endTime: string) => {
    const end = new Date(endTime).getTime();
    const now = Date.now();
    const diff = end - now;
    if (diff <= 0) return "Ended";
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  const formatDetailTime = (endTime: string) => {
    const now = new Date();
    const end = new Date(endTime);
    const diff = end.getTime() - now.getTime();
    if (diff <= 0) return "สิ้นสุดแล้ว";
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
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

  /** Get gallery images for detail modal */
  const getProductGallery = (product: Product) => {
    const gallery: any[] = [];
    if (product.images && product.images.length > 0) {
      product.images.forEach((img) => {
        const url = getFullImageUrl(img.image_url);
        if (url) gallery.push({ uri: url });
      });
    }
    if (gallery.length === 0 && product.image_url) {
      const url = getFullImageUrl(product.image_url);
      if (url) gallery.push({ uri: url });
    }
    if (gallery.length === 0 && product.picture) {
      const url = getFullImageUrl(product.picture);
      if (url) gallery.push({ uri: url });
    }
    if (gallery.length === 0) gallery.push(image.macbook);
    return gallery;
  };

  const getTagConfig = (tag: string) => {
    switch (tag) {
      case "hot":
        return { label: "Hot", color: "#FF3B30", bg: "#FFEBEE", icon: "🔥" };
      case "ending":
        return {
          label: "Ending",
          color: "#FF9500",
          bg: "#FFF3E0",
          icon: "⏰",
        };
      case "incoming":
        return {
          label: "Incoming",
          color: "#7B1FA2",
          bg: "#F3E5F5",
          icon: "📦",
        };
      default:
        return {
          label: "Active",
          color: "#4CAF50",
          bg: "#E8F5E9",
          icon: "✅",
        };
    }
  };

  const getStatusConfig = (product: Product) => {
    if (isRealEnded(product)) {
      return { label: "Ended", color: "#999", bg: "#F5F5F5" };
    }
    return getTagConfig(product.tag);
  };

  const tabs: { key: FilterTab; label: string; count: number }[] = [
    { key: "all", label: "All", count: stats.all },
    { key: "incoming", label: "Incoming", count: stats.incoming },
    { key: "active", label: "Active", count: stats.active },
    { key: "ended", label: "Ended", count: stats.ended },
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
            My Products
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
              ไม่มีสินค้า
            </AppText>
            <AppText weight="regular" style={styles.emptySubtitle}>
              {activeTab === "all"
                ? "คุณยังไม่มีสินค้าที่วางขาย\nกดปุ่ม Seller เพื่อเริ่มสร้างรายการประมูล"
                : "ไม่มีสินค้าในหมวดนี้"}
            </AppText>
          </View>
        ) : (
          filteredProducts.map((product) => {
            const statusConfig = getStatusConfig(product);
            const isEnded = isRealEnded(product);
            const timeDisplay =
              product.tag === "incoming"
                ? formatTimeRemaining(product.auction_start_time)
                : formatTimeRemaining(product.auction_end_time);

            return (
              <TouchableOpacity
                key={product.id}
                style={styles.productCard}
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
                        {isEnded ? "ราคาสุดท้าย" : "ราคาปัจจุบัน"}
                      </AppText>
                      <AppText weight="bold" style={styles.priceValue}>
                        ฿
                        {parseFloat(
                          product.current_price || product.starting_price,
                        ).toLocaleString()}
                      </AppText>
                    </View>
                    {!isEnded && (
                      <View style={styles.timeContainer}>
                        <AppText weight="regular" style={styles.timeLabel}>
                          {product.tag === "incoming" ? "เริ่มใน" : "เหลือเวลา"}
                        </AppText>
                        <AppText weight="semibold" style={styles.timeValue}>
                          {timeDisplay}
                        </AppText>
                      </View>
                    )}
                  </View>

                  <View style={styles.productMeta}>
                    <View style={styles.metaItem}>
                      <AppText weight="regular" style={styles.metaText}>
                        🏷️ เริ่มต้น ฿
                        {parseFloat(product.starting_price).toLocaleString()}
                      </AppText>
                    </View>
                    <View style={styles.metaItem}>
                      <AppText weight="regular" style={styles.metaText}>
                        👥 {product.bids_count || 0} bids
                      </AppText>
                    </View>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })
        )}
        <View style={{ height: 30 }} />
      </ScrollView>

      {/* ─── Product Detail Modal (styled like product-detail page) ─── */}
      <Modal
        visible={detailVisible}
        animationType="slide"
        onRequestClose={() => setDetailVisible(false)}
      >
        {selectedProduct &&
          (() => {
            const sp = selectedProduct;
            const ended = isRealEnded(sp);
            const isIncoming = sp.tag === "incoming";
            const isHot = sp.tag === "hot";
            const isEnding = sp.tag === "ending";
            const currentBid = parseFloat(sp.current_price);
            const buyNowPrice = parseFloat(sp.buyout_price);
            const bidIncrement = parseFloat(sp.bid_increment);
            const gallery = getProductGallery(sp);
            const categoryName = sp.category?.name || "";
            const sellerName = sp.user?.name || "You";

            return (
              <SafeAreaView style={dStyles.container}>
                <ScrollView
                  showsVerticalScrollIndicator={false}
                  contentContainerStyle={{ paddingBottom: 40 }}
                >
                  {/* Header */}
                  <View style={dStyles.headerContainer}>
                    <TouchableOpacity onPress={() => setDetailVisible(false)}>
                      <Image
                        source={image.back}
                        style={{ width: 32, height: 32 }}
                      />
                    </TouchableOpacity>
                  </View>

                  {/* Image Carousel */}
                  <View style={dStyles.imageCarouselContainer}>
                    <ScrollView
                      ref={detailScrollRef}
                      horizontal
                      pagingEnabled
                      showsHorizontalScrollIndicator={false}
                      onMomentumScrollEnd={(
                        e: NativeSyntheticEvent<NativeScrollEvent>,
                      ) => {
                        const idx = Math.round(
                          e.nativeEvent.contentOffset.x / SCREEN_WIDTH,
                        );
                        setDetailImageIndex(idx);
                      }}
                      scrollEnabled={gallery.length > 1}
                    >
                      {gallery.map((img, idx) => (
                        <View
                          key={idx}
                          style={[
                            dStyles.imageContainer,
                            { width: SCREEN_WIDTH },
                          ]}
                        >
                          <Image
                            source={img}
                            style={dStyles.productImage}
                            resizeMode="contain"
                          />
                        </View>
                      ))}
                    </ScrollView>

                    {gallery.length > 1 && (
                      <View style={dStyles.dotsContainer}>
                        {gallery.map((_, idx) => (
                          <View
                            key={idx}
                            style={[
                              dStyles.dot,
                              idx === detailImageIndex
                                ? dStyles.dotActive
                                : dStyles.dotInactive,
                            ]}
                          />
                        ))}
                      </View>
                    )}

                    {gallery.length > 1 && (
                      <View style={dStyles.imageCounterBadge}>
                        <AppText
                          weight="medium"
                          style={dStyles.imageCounterText}
                          numberOfLines={1}
                        >
                          {detailImageIndex + 1} / {gallery.length}
                        </AppText>
                      </View>
                    )}
                  </View>

                  {/* Tags */}
                  <View style={dStyles.tagsContainer}>
                    {sp.tag && !ended && (
                      <View
                        style={[
                          dStyles.tag,
                          {
                            backgroundColor: isHot
                              ? "#FFE5E5"
                              : isEnding
                                ? "#FFF3E0"
                                : isIncoming
                                  ? "#F3E5F5"
                                  : "#E3F2FD",
                          },
                        ]}
                      >
                        <AppText
                          weight="medium"
                          style={[
                            dStyles.tagText,
                            {
                              color: isHot
                                ? "#FF3B30"
                                : isEnding
                                  ? "#FF8C00"
                                  : isIncoming
                                    ? "#9B27B0"
                                    : "#4285F4",
                            },
                          ]}
                          numberOfLines={1}
                        >
                          {isHot
                            ? "🔥 Hot"
                            : isEnding
                              ? "⏰ Ending Soon"
                              : isIncoming
                                ? "🔜 Incoming"
                                : ""}
                        </AppText>
                      </View>
                    )}
                    {ended && (
                      <View
                        style={[dStyles.tag, { backgroundColor: "#F5F5F5" }]}
                      >
                        <AppText
                          weight="medium"
                          style={[dStyles.tagText, { color: "#999" }]}
                        >
                          สิ้นสุดแล้ว
                        </AppText>
                      </View>
                    )}
                    <View style={dStyles.tag}>
                      <AppText
                        weight="medium"
                        style={dStyles.tagText}
                        numberOfLines={1}
                      >
                        {categoryName}
                      </AppText>
                    </View>
                  </View>

                  {/* Product Title */}
                  <View style={dStyles.titleSection}>
                    <AppText
                      weight="bold"
                      numberOfLines={2}
                      style={dStyles.productTitle}
                    >
                      {sp.name}
                    </AppText>
                  </View>

                  {/* Seller Info */}
                  <View style={dStyles.sellerContainer}>
                    <View style={dStyles.sellerAvatar}>
                      <AppText
                        weight="bold"
                        style={{ color: "#FFF", fontSize: 18 }}
                      >
                        {sellerName.charAt(0).toUpperCase()}
                      </AppText>
                    </View>
                    <View style={{ flex: 1 }}>
                      <AppText
                        weight="semibold"
                        style={dStyles.sellerName}
                        numberOfLines={1}
                      >
                        {sellerName}
                      </AppText>
                      <View style={dStyles.userIdRow}>
                        <Image
                          source={image.location}
                          style={{
                            width: 12,
                            height: 14,
                            tintColor: "#9CA3AF",
                            marginRight: 4,
                          }}
                        />
                        <AppText
                          weight="regular"
                          style={dStyles.sellerLocation}
                          numberOfLines={1}
                        >
                          {sp.location}
                        </AppText>
                      </View>
                    </View>
                  </View>

                  {/* Incoming Banner */}
                  {isIncoming && !ended && (
                    <View style={dStyles.incomingBanner}>
                      <View style={dStyles.incomingBannerIcon}>
                        <Image
                          source={image.incoming_time}
                          style={{ width: 20, height: 20 }}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <AppText
                          weight="semibold"
                          style={dStyles.incomingBannerTitle}
                          numberOfLines={1}
                        >
                          Upcoming Auction
                        </AppText>
                        <AppText
                          weight="regular"
                          style={dStyles.incomingBannerSub}
                          numberOfLines={2}
                        >
                          This auction hasn't started yet. Starts in{" "}
                          {formatDetailTime(sp.auction_start_time)}.
                        </AppText>
                      </View>
                    </View>
                  )}

                  {/* Bid Info Cards */}
                  <View style={dStyles.bidInfoContainer}>
                    <View
                      style={[
                        dStyles.bidCard,
                        {
                          backgroundColor: "#E8F5E9",
                          borderWidth: 0.5,
                          borderColor: "#22C55E",
                        },
                      ]}
                    >
                      <View style={dStyles.bidCardHeader}>
                        <Image
                          source={image.current_bid}
                          style={{
                            width: 13,
                            height: 7,
                            tintColor: "#22C55E",
                            marginRight: 4,
                          }}
                        />
                        <AppText
                          weight="medium"
                          style={[dStyles.bidLabel, { color: "#22C55E" }]}
                          numberOfLines={1}
                        >
                          {sp.bids_count} Bids
                        </AppText>
                      </View>
                      <AppText
                        weight="regular"
                        style={dStyles.bidLabelSmall}
                        numberOfLines={1}
                      >
                        {ended ? "Final Price" : "Current Bid"}
                      </AppText>
                      <AppText
                        weight="bold"
                        style={dStyles.bidAmount}
                        numberOfLines={1}
                        adjustsFontSizeToFit
                      >
                        ฿{currentBid.toLocaleString("en-US")}
                      </AppText>
                    </View>

                    <View
                      style={[
                        dStyles.bidCard,
                        {
                          backgroundColor: "#E3F2FD",
                          borderWidth: 0.5,
                          borderColor: "#2C7BFC",
                        },
                      ]}
                    >
                      <View style={dStyles.bidCardHeader}>
                        <Image
                          source={image.buynow}
                          style={{
                            width: 14,
                            height: 14,
                            tintColor: "#2C7BFC",
                            marginRight: 4,
                          }}
                        />
                        <AppText
                          weight="medium"
                          style={[dStyles.bidLabel, { color: "#2C7BFC" }]}
                          numberOfLines={1}
                        >
                          Buy Now
                        </AppText>
                      </View>
                      <AppText
                        weight="regular"
                        style={dStyles.bidLabelSmall}
                        numberOfLines={1}
                      >
                        Buyout Price
                      </AppText>
                      <AppText
                        weight="bold"
                        style={dStyles.bidAmount}
                        numberOfLines={1}
                        adjustsFontSizeToFit
                      >
                        ฿{buyNowPrice.toLocaleString("en-US")}
                      </AppText>
                    </View>
                  </View>

                  {/* Min bid increment note */}
                  {!ended && (
                    <View style={dStyles.minBidNote}>
                      <Image
                        source={image.info}
                        style={{
                          width: 14,
                          height: 14,
                          tintColor: "#6B7280",
                          marginRight: 6,
                        }}
                      />
                      <AppText
                        weight="regular"
                        style={dStyles.minBidText}
                        numberOfLines={1}
                      >
                        Minimum bid increment: ฿{bidIncrement.toLocaleString()}
                      </AppText>
                    </View>
                  )}

                  {/* Auction Information */}
                  <View style={dStyles.auctionInfoSection}>
                    <AppText
                      weight="bold"
                      style={dStyles.sectionTitle}
                      numberOfLines={1}
                    >
                      Auction Information
                    </AppText>

                    <View style={dStyles.infoRow}>
                      <View style={dStyles.infoIconContainer}>
                        <Image
                          source={image.ends}
                          style={{
                            width: 16,
                            height: 16,
                            tintColor: "#6B7280",
                          }}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <AppText
                          weight="regular"
                          style={dStyles.infoLabel}
                          numberOfLines={1}
                        >
                          {isIncoming ? "Starts" : "Ends"}
                        </AppText>
                        <AppText
                          weight="semibold"
                          style={dStyles.infoValue}
                          numberOfLines={1}
                        >
                          {isIncoming
                            ? formatDate(sp.auction_start_time)
                            : formatDate(sp.auction_end_time)}
                        </AppText>
                      </View>
                    </View>

                    <View style={dStyles.infoRow}>
                      <View style={dStyles.infoIconContainer}>
                        <Image
                          source={image.time_remaining}
                          style={{
                            width: 10,
                            height: 17,
                            tintColor: "#6B7280",
                          }}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <AppText
                          weight="regular"
                          style={dStyles.infoLabel}
                          numberOfLines={1}
                        >
                          {ended
                            ? "Status"
                            : isIncoming
                              ? "Starts In"
                              : "Time Remaining"}
                        </AppText>
                        <AppText
                          weight="semibold"
                          style={[
                            dStyles.infoValue,
                            isIncoming && { color: "#9B27B0" },
                            ended && { color: "#999" },
                          ]}
                          numberOfLines={1}
                        >
                          {ended
                            ? "สิ้นสุดแล้ว"
                            : isIncoming
                              ? formatDetailTime(sp.auction_start_time)
                              : formatDetailTime(sp.auction_end_time)}
                        </AppText>
                      </View>
                    </View>

                    <View style={dStyles.infoRow}>
                      <View style={dStyles.infoIconContainer}>
                        <Image
                          source={image.starting_bid}
                          style={{
                            width: 17,
                            height: 17,
                            tintColor: "#6B7280",
                          }}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <AppText
                          weight="regular"
                          style={dStyles.infoLabel}
                          numberOfLines={1}
                        >
                          Starting Bid
                        </AppText>
                        <AppText
                          weight="semibold"
                          style={dStyles.infoValue}
                          numberOfLines={1}
                        >
                          {formatPrice(sp.starting_price)}
                        </AppText>
                      </View>
                    </View>

                    <View style={dStyles.infoRow}>
                      <View style={dStyles.infoIconContainer}>
                        <Image
                          source={image.location}
                          style={{
                            width: 16,
                            height: 18,
                            tintColor: "#6B7280",
                          }}
                        />
                      </View>
                      <View style={{ flex: 1 }}>
                        <AppText
                          weight="regular"
                          style={dStyles.infoLabel}
                          numberOfLines={1}
                        >
                          Location
                        </AppText>
                        <AppText
                          weight="semibold"
                          style={dStyles.infoValue}
                          numberOfLines={1}
                        >
                          {sp.location}
                        </AppText>
                      </View>
                    </View>
                  </View>

                  {/* Description */}
                  <View style={dStyles.descriptionSection}>
                    <AppText
                      weight="bold"
                      style={dStyles.sectionTitle}
                      numberOfLines={1}
                    >
                      Description
                    </AppText>
                    <AppText
                      weight="regular"
                      style={dStyles.descriptionText}
                      numberOfLines={10}
                    >
                      {sp.description}
                    </AppText>
                  </View>

                  {/* Bid History */}
                  {!isIncoming && (
                    <View style={dStyles.bidHistorySection}>
                      <AppText
                        weight="bold"
                        style={dStyles.sectionTitle}
                        numberOfLines={1}
                      >
                        Bid History
                      </AppText>
                      {sp.bids_count > 0 ? (
                        <AppText
                          weight="regular"
                          style={{
                            color: "#9CA3AF",
                            fontSize: 13,
                            marginTop: 8,
                          }}
                        >
                          Total {sp.bids_count} bids placed
                        </AppText>
                      ) : (
                        <AppText
                          weight="regular"
                          style={{
                            color: "#9CA3AF",
                            fontSize: 13,
                            marginTop: 8,
                          }}
                        >
                          No bids yet
                        </AppText>
                      )}
                    </View>
                  )}
                </ScrollView>
              </SafeAreaView>
            );
          })()}
      </Modal>
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
});

// ─── Detail Modal Styles (matching product-detail page) ───
const dStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  headerContainer: {
    paddingHorizontal: 12,
    paddingTop: 16,
    paddingBottom: 16,
  },
  imageCarouselContainer: {
    position: "relative",
    width: "100%",
    height: 280,
    backgroundColor: "#fff",
  },
  imageContainer: {
    width: "100%",
    height: 280,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  productImage: {
    width: "100%",
    height: "100%",
  },
  dotsContainer: {
    position: "absolute",
    bottom: 16,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  dotActive: {
    backgroundColor: "#1F3A93",
    width: 24,
  },
  dotInactive: {
    backgroundColor: "rgba(255, 255, 255, 0.5)",
  },
  imageCounterBadge: {
    position: "absolute",
    top: 12,
    right: 12,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  imageCounterText: {
    fontSize: 12,
    color: "#fff",
  },
  tagsContainer: {
    flexDirection: "row",
    paddingHorizontal: 12,
    paddingTop: 16,
    gap: 8,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: "#E3F2FD",
  },
  tagText: {
    fontSize: 12,
    color: "#1976D2",
  },
  titleSection: {
    paddingHorizontal: 20,
    paddingTop: 12,
  },
  productTitle: {
    fontSize: 20,
    color: "#111827",
  },
  sellerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingTop: 12,
    paddingBottom: 12,
    backgroundColor: "#F9FAFB",
    marginTop: 16,
    marginHorizontal: 20,
    borderRadius: 12,
  },
  sellerAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    marginRight: 12,
    backgroundColor: "#003994",
    justifyContent: "center",
    alignItems: "center",
  },
  sellerName: {
    fontSize: 14,
    color: "#111827",
    marginBottom: 4,
  },
  userIdRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  sellerLocation: {
    fontSize: 13,
    color: "#6B7280",
  },
  incomingBanner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F3E5F5",
    borderWidth: 1,
    borderColor: "#CE93D8",
    borderRadius: 14,
    marginHorizontal: 20,
    marginTop: 16,
    padding: 16,
  },
  incomingBannerIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#9B27B0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  incomingBannerTitle: {
    fontSize: 15,
    color: "#7B1FA2",
    marginBottom: 2,
  },
  incomingBannerSub: {
    fontSize: 12,
    color: "#9C27B0",
    lineHeight: 18,
  },
  bidInfoContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    flexDirection: "row",
    gap: 12,
  },
  bidCard: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 16,
  },
  bidCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  bidLabel: {
    fontSize: 12,
    color: "#111827",
  },
  bidLabelSmall: {
    fontSize: 11,
    color: "#6B7280",
    marginBottom: 4,
  },
  bidAmount: {
    fontSize: 18,
    color: "#111827",
  },
  minBidNote: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
    marginBottom: 16,
  },
  minBidText: {
    fontSize: 12,
    color: "#6B7280",
  },
  auctionInfoSection: {
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 16,
    color: "#111827",
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 12,
  },
  infoIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: "#F9FAFB",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  infoLabel: {
    fontSize: 12,
    color: "#9CA3AF",
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 14,
    color: "#111827",
  },
  descriptionSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  descriptionText: {
    fontSize: 14,
    color: "#6B7280",
    lineHeight: 22,
  },
  bidHistorySection: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 20,
  },
});

export default MyProductsPage;
