import { image } from "@/assets/images";
import { LinearGradient } from "expo-linear-gradient";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  NativeScrollEvent,
  NativeSyntheticEvent,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";
import { useAuth } from "../../contexts/AuthContext";
import { apiService, getFullImageUrl } from "../../utils/api";
import { Product } from "../../utils/api/types";
import { AppText } from "../components/appText";
import { AuthModal } from "../components/AuthModal";

const { width } = Dimensions.get("window");

const ProductDetailPage = () => {
  const { productId } = useLocalSearchParams();
  const router = useRouter();
  const [bidAmount, setBidAmount] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const imageScrollRef = useRef<ScrollView>(null);
  const insets = useSafeAreaInsets();
  const { isGuest } = useAuth();
  const [authModalVisible, setAuthModalVisible] = useState(false);
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  // ─── Real-time countdown tick (re-render every second) ───
  const [, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const id = Number(productId);
        if (!id) return;
        const data = await apiService.product.getProduct(id);
        setProduct(data);
      } catch (error: any) {
        console.error("Failed to fetch product:", error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId]);

  /** ดึงรูป product เป็น array เพื่อแสดง carousel */
  const getProductImages = () => {
    if (!product) return [image.macbook];
    const imgs: any[] = [];
    if (product.images && product.images.length > 0) {
      product.images.forEach((img) => {
        const url = getFullImageUrl(img.image_url);
        if (url) imgs.push({ uri: url });
      });
    }
    if (imgs.length === 0 && product.image_url) {
      const url = getFullImageUrl(product.image_url);
      if (url) imgs.push({ uri: url });
    }
    if (imgs.length === 0 && product.picture) {
      const url = getFullImageUrl(product.picture);
      if (url) imgs.push({ uri: url });
    }
    if (imgs.length === 0) imgs.push(image.macbook);
    return imgs;
  };

  /** แปลง string ราคาเป็นตัวเลข format */
  const formatPrice = (price: string | undefined) => {
    if (!price) return "฿0";
    const num = parseFloat(price);
    return `฿${num.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  /** แปลง auction_end_time เป็นข้อความ */
  const formatEndTime = (endTime: string) => {
    const d = new Date(endTime);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  /** คำนวณเวลาที่เหลือ */
  const formatTimeRemaining = (endTime: string) => {
    const now = new Date();
    const end = new Date(endTime);
    const diff = end.getTime() - now.getTime();
    if (diff <= 0) return "Ended";
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  const isIncoming = product?.tag === "incoming";
  const isHot = product?.tag === "hot";
  const isEnding = product?.tag === "ending";
  const isDefault = product?.tag === "default";
  const currentBid = product ? parseFloat(product.current_price) : 0;
  const buyNowPrice = product ? parseFloat(product.buyout_price) : 0;
  const startingPrice = product ? parseFloat(product.starting_price) : 0;
  const bidIncrement = product?.bid_increment
    ? parseFloat(product.bid_increment)
    : 0;
  const minBidAmount = currentBid + bidIncrement;
  const productImages = getProductImages();

  const handleBid = () => {
    if (isGuest) {
      setAuthModalVisible(true);
      return;
    }
    console.log("Bid placed:", bidAmount);
  };

  const handleBuyNow = () => {
    if (isGuest) {
      setAuthModalVisible(true);
      return;
    }
    console.log("Buy now clicked");
  };

  if (loading) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <ActivityIndicator size="large" color="#003d82" />
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <AppText weight="medium" style={{ color: "#999", fontSize: 16 }}>
          Product not found
        </AppText>
        <TouchableOpacity
          onPress={() => router.back()}
          style={{ marginTop: 16 }}
        >
          <AppText weight="semibold" style={{ color: "#003d82", fontSize: 16 }}>
            Go Back
          </AppText>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header with Back Button */}
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={() => router.back()}>
            <Image source={image.back} style={{ width: 32, height: 32 }} />
          </TouchableOpacity>
        </View>

        {/* Product Image Carousel */}
        <View style={styles.imageCarouselContainer}>
          <ScrollView
            ref={imageScrollRef}
            horizontal
            scrollEventThrottle={16}
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onScroll={(event: NativeSyntheticEvent<NativeScrollEvent>) => {
              const newIndex = Math.round(
                event.nativeEvent.contentOffset.x / width,
              );
              setCurrentImageIndex(newIndex);
            }}
            scrollEnabled={productImages.length > 1}
          >
            {productImages.map((img, idx) => (
              <View key={idx} style={[styles.imageContainer, { width }]}>
                <Image
                  source={img}
                  style={styles.productImage}
                  resizeMode="contain"
                />
              </View>
            ))}
          </ScrollView>

          {/* Image Counter Dots */}
          {productImages.length > 1 && (
            <View style={styles.dotsContainer}>
              {productImages.map((_, idx) => (
                <View
                  key={idx}
                  style={[
                    styles.dot,
                    currentImageIndex === idx
                      ? styles.dotActive
                      : styles.dotInactive,
                  ]}
                />
              ))}
            </View>
          )}

          {/* Image Counter Badge */}
          {productImages.length > 1 && (
            <View style={styles.imageCounterBadge}>
              <AppText
                weight="medium"
                style={styles.imageCounterText}
                numberOfLines={1}
              >
                {currentImageIndex + 1} / {productImages.length}
              </AppText>
            </View>
          )}
        </View>

        {/* Tags */}
        <View style={styles.tagsContainer}>
          {product.tag && (
            <View
              style={[
                styles.tag,
                {
                  backgroundColor: isHot
                    ? "#FFE5E5"
                    : isEnding
                      ? "#FFF3E0"
                      : isDefault
                        ? "#fff"
                        : "#F3E5F5",
                },
              ]}
            >
              <AppText
                weight="medium"
                style={[
                  styles.tagText,
                  {
                    color: isHot
                      ? "#FF3B30"
                      : isEnding
                        ? "#FF8C00"
                        : isDefault
                          ? "#4285F4"
                          : "#9B27B0",
                  },
                ]}
                numberOfLines={1}
              >
                {isHot
                  ? "🔥 Hot"
                  : isEnding
                    ? "⏰ Ending Soon"
                    : isDefault
                      ? ""
                      : "🔜 Incoming"}
              </AppText>
            </View>
          )}
          {product.category && (
            <View style={styles.tag}>
              <AppText weight="medium" style={styles.tagText} numberOfLines={1}>
                {product.category.name}
              </AppText>
            </View>
          )}
          {product.subcategory && (
            <View style={styles.tag}>
              <AppText weight="medium" style={styles.tagText} numberOfLines={1}>
                {product.subcategory.name}
              </AppText>
            </View>
          )}
        </View>

        {/* Product Title */}
        <View style={styles.titleSection}>
          <AppText weight="bold" numberOfLines={2} style={styles.productTitle}>
            {product.name}
          </AppText>
        </View>

        {/* Seller Info */}
        <View style={styles.sellerContainer}>
          {product.user?.profile_image ? (
            <Image
              source={{
                uri: getFullImageUrl(product.user.profile_image)!,
              }}
              style={styles.sellerAvatar}
            />
          ) : (
            <View style={[styles.sellerAvatar, styles.defaultAvatar]}>
              <AppText weight="bold" style={styles.defaultAvatarText}>
                {product.user?.name?.charAt(0).toUpperCase() || "U"}
              </AppText>
            </View>
          )}
          {/* <Image
            source={
              product.user?.profile_image
                ? { uri: getFullImageUrl(product.user.profile_image)! }
                : image.bang
            }
            style={styles.sellerAvatar}
          /> */}

          <View style={{ flex: 1 }}>
            <AppText
              weight="semibold"
              style={styles.sellerName}
              numberOfLines={1}
            >
              {product.user?.name || "Unknown Seller"}
            </AppText>
            <View style={styles.userIdRow}>
              <Image
                source={image.phone}
                style={{
                  width: 12,
                  height: 12,
                  tintColor: "#9CA3AF",
                  marginRight: 4,
                }}
              />
              <AppText
                weight="regular"
                style={styles.sellerUserId}
                numberOfLines={1}
              >
                {product.user?.phone_number ||
                  product.user?.email ||
                  `ID: ${product.user_id}`}
              </AppText>
            </View>
          </View>
        </View>

        {/* Incoming Banner */}
        {isIncoming && (
          <View style={styles.incomingBanner}>
            <View style={styles.incomingBannerIcon}>
              <Image
                source={image.incoming_time}
                style={{ width: 20, height: 20 }}
              />
            </View>
            <View style={{ flex: 1 }}>
              <AppText
                weight="semibold"
                style={styles.incomingBannerTitle}
                numberOfLines={1}
              >
                Upcoming Auction
              </AppText>
              <AppText
                weight="regular"
                style={styles.incomingBannerSub}
                numberOfLines={2}
              >
                This auction hasn't started yet. Starts in{" "}
                {formatTimeRemaining(product.auction_start_time)}.
              </AppText>
            </View>
          </View>
        )}

        {/* Incoming — show starting bid + buy now price */}
        {isIncoming && (
          <View style={styles.bidInfoContainer}>
            <View
              style={[
                styles.bidCard,
                {
                  backgroundColor: "#E8F5E9",
                  borderWidth: 0.5,
                  borderColor: "#22C55E",
                },
              ]}
            >
              <View style={styles.bidCardHeader}>
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
                  style={[styles.bidLabel, { color: "#22C55E" }]}
                  numberOfLines={1}
                >
                  {product.bids_count} Bids
                </AppText>
              </View>
              <AppText
                weight="regular"
                style={styles.bidLabelSmall}
                numberOfLines={1}
              >
                Current Bid
              </AppText>
              <AppText
                weight="bold"
                style={styles.bidAmount}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                {formatPrice(product.starting_price)}
              </AppText>
            </View>
            <View
              style={[
                styles.bidCard,
                {
                  backgroundColor: "#E3F2FD",
                  borderWidth: 0.5,
                  borderColor: "#2C7BFC",
                },
              ]}
            >
              <View style={styles.bidCardHeader}>
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
                  style={[styles.bidLabel, { color: "#2C7BFC" }]}
                  numberOfLines={1}
                >
                  Buy Now
                </AppText>
              </View>
              <AppText
                weight="regular"
                style={styles.bidLabelSmall}
                numberOfLines={1}
              >
                Buyout Price
              </AppText>
              <AppText
                weight="bold"
                style={styles.bidAmount}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                ฿{buyNowPrice.toLocaleString("en-US")}
              </AppText>
            </View>
          </View>
        )}

        {/* Minimum bid increment — for incoming */}
        {isIncoming && (
          <View style={styles.incomingMinBidNote}>
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
              style={styles.minimumBidText}
              numberOfLines={1}
            >
              Minimum bid increment: ฿{bidIncrement.toLocaleString()}
            </AppText>
          </View>
        )}

        {/* Bidding Info Cards — hidden for incoming */}
        {!isIncoming && (
          <View style={styles.bidInfoContainer}>
            {/* Current Bid Card */}
            <View
              style={[
                styles.bidCard,
                {
                  backgroundColor: "#E8F5E9",
                  borderWidth: 0.5,
                  borderColor: "#22C55E",
                },
              ]}
            >
              <View style={styles.bidCardHeader}>
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
                  style={[styles.bidLabel, { color: "#22C55E" }]}
                  numberOfLines={1}
                >
                  {product.bids_count} Bids
                </AppText>
              </View>
              <AppText
                weight="regular"
                style={styles.bidLabelSmall}
                numberOfLines={1}
              >
                Current Bid
              </AppText>
              <AppText
                weight="bold"
                style={styles.bidAmount}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                ฿{currentBid.toLocaleString("en-US")}
              </AppText>
            </View>

            {/* Buy Now Card */}
            <View
              style={[
                styles.bidCard,
                {
                  backgroundColor: "#E3F2FD",
                  borderWidth: 0.5,
                  borderColor: "#2C7BFC",
                },
              ]}
            >
              <View style={styles.bidCardHeader}>
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
                  style={[styles.bidLabel, { color: "#2C7BFC" }]}
                  numberOfLines={1}
                >
                  Buy Now
                </AppText>
              </View>
              <AppText
                weight="regular"
                style={styles.bidLabelSmall}
                numberOfLines={1}
              >
                Buyout Price
              </AppText>
              <AppText
                weight="bold"
                style={styles.bidAmount}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                ฿{buyNowPrice.toLocaleString("en-US")}
              </AppText>
            </View>
          </View>
        )}

        {/* Bidding Section — hidden for incoming */}
        {!isIncoming && (
          <View style={styles.biddingSection}>
            <View style={styles.biddingInputContainer}>
              <View style={styles.bidInputWrapper}>
                <AppText
                  weight="regular"
                  style={styles.minBidLabel}
                  numberOfLines={1}
                >
                  Place Your Bid
                </AppText>
                <View style={styles.inputRow}>
                  <TextInput
                    style={styles.biddingInput}
                    placeholder={`Min : ฿${minBidAmount.toLocaleString()}`}
                    placeholderTextColor="#9CA3AF"
                    keyboardType="decimal-pad"
                    value={bidAmount}
                    onChangeText={setBidAmount}
                  />
                  <TouchableOpacity onPress={handleBid}>
                    <LinearGradient
                      colors={["#00112E", "#003994"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.primaryButton}
                    >
                      <AppText
                        weight="bold"
                        style={styles.bidButtonText}
                        numberOfLines={1}
                      >
                        Bid
                      </AppText>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
                <View style={styles.minimumBidNote}>
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
                    style={styles.minimumBidText}
                    numberOfLines={1}
                  >
                    Minimum bid increment: ฿{bidIncrement.toLocaleString()}
                  </AppText>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Auction Information */}
        <View style={styles.auctionInfoSection}>
          <AppText weight="bold" style={styles.sectionTitle} numberOfLines={1}>
            Auction Information
          </AppText>

          <View style={styles.infoRow}>
            <View style={styles.infoIconContainer}>
              <Image
                source={image.ends}
                style={{ width: 16, height: 16, tintColor: "#6B7280" }}
              />
            </View>
            <View style={{ flex: 1 }}>
              <AppText
                weight="regular"
                style={styles.infoLabel}
                numberOfLines={1}
              >
                {isIncoming ? "Starts" : "Ends"}
              </AppText>
              <AppText
                weight="semibold"
                style={styles.infoValue}
                numberOfLines={1}
              >
                {isIncoming
                  ? formatEndTime(product.auction_start_time)
                  : formatEndTime(product.auction_end_time)}
              </AppText>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIconContainer}>
              <Image
                source={image.time_remaining}
                style={{ width: 10, height: 17, tintColor: "#6B7280" }}
              />
            </View>
            <View style={{ flex: 1 }}>
              <AppText
                weight="regular"
                style={styles.infoLabel}
                numberOfLines={1}
              >
                {isIncoming ? "Starts In" : "Time Remaining"}
              </AppText>
              <AppText
                weight="semibold"
                style={[styles.infoValue, isIncoming && { color: "#9B27B0" }]}
                numberOfLines={1}
              >
                {isIncoming
                  ? formatTimeRemaining(product.auction_start_time)
                  : formatTimeRemaining(product.auction_end_time)}
              </AppText>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIconContainer}>
              <Image
                source={image.starting_bid}
                style={{ width: 17, height: 17, tintColor: "#6B7280" }}
              />
            </View>
            <View style={{ flex: 1 }}>
              <AppText
                weight="regular"
                style={styles.infoLabel}
                numberOfLines={1}
              >
                Starting Bid
              </AppText>
              <AppText
                weight="semibold"
                style={styles.infoValue}
                numberOfLines={1}
              >
                {formatPrice(product.starting_price)}
              </AppText>
            </View>
          </View>

          <View style={styles.infoRow}>
            <View style={styles.infoIconContainer}>
              <Image
                source={image.location}
                style={{ width: 16, height: 18, tintColor: "#6B7280" }}
              />
            </View>
            <View style={{ flex: 1 }}>
              <AppText
                weight="regular"
                style={styles.infoLabel}
                numberOfLines={1}
              >
                Location
              </AppText>
              <AppText
                weight="semibold"
                style={styles.infoValue}
                numberOfLines={1}
              >
                {product.location}
              </AppText>
            </View>
          </View>
        </View>

        {/* Description */}
        <View style={styles.descriptionSection}>
          <AppText weight="bold" style={styles.sectionTitle} numberOfLines={1}>
            Description
          </AppText>
          <AppText
            weight="regular"
            style={styles.descriptionText}
            numberOfLines={10}
          >
            {product.description}
          </AppText>
        </View>

        {/* Bid History — hidden for incoming */}
        {!isIncoming && (
          <View style={styles.bidHistorySection}>
            <AppText
              weight="bold"
              style={styles.sectionTitle}
              numberOfLines={1}
            >
              Bid History
              <AppText
                weight="regular"
                style={styles.bidHistoryCount}
                numberOfLines={1}
              >
                {" "}
                ( 5 lastest bid )
              </AppText>
            </AppText>

            {product.bids_count > 0 ? (
              <AppText
                weight="regular"
                style={{ color: "#9CA3AF", fontSize: 13, marginTop: 8 }}
              >
                Total {product.bids_count} bids placed
              </AppText>
            ) : (
              <AppText
                weight="regular"
                style={{ color: "#9CA3AF", fontSize: 13, marginTop: 8 }}
              >
                No bids yet
              </AppText>
            )}
          </View>
        )}
      </ScrollView>

      {/* Bottom Action Buttons — hidden for incoming */}
      {!isIncoming && (
        <View
          style={[
            styles.bottomButtonsContainer,
            { paddingBottom: insets.bottom },
          ]}
        >
          <TouchableOpacity onPress={handleBid} activeOpacity={0.8}>
            <LinearGradient
              colors={["#2EA200", "#3CD500"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.primaryButton2}
            >
              <AppText
                weight="bold"
                style={styles.placeBidButtonText}
                numberOfLines={1}
              >
                Place Bid
              </AppText>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleBuyNow} activeOpacity={0.8}>
            <LinearGradient
              colors={["#00112E", "#003994"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.primaryButton2}
            >
              <AppText
                weight="bold"
                style={styles.buyNowButtonText}
                numberOfLines={1}
              >
                Buy Now
              </AppText>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}

      {/* Login Modal สำหรับ Guest */}
      <AuthModal
        visible={authModalVisible}
        onClose={() => setAuthModalVisible(false)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContent: {
    paddingBottom: 100,
  },
  headerContainer: {
    paddingHorizontal: 12,
    paddingTop: 16,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
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
  primaryButton: {
    paddingVertical: 14,
    paddingHorizontal: 32,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
  },
  primaryButton2: {
    paddingVertical: 14,
    paddingHorizontal: 60,
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 8,
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
  sellerUserId: {
    fontSize: 13,
    color: "#6B7280",
  },
  bidInfoContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
    flexDirection: "row",
    gap: 12,
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
  biddingSection: {
    paddingHorizontal: 20,
    paddingVertical: 24,
    backgroundColor: "#fff",
  },
  sectionTitle: {
    fontSize: 16,
    color: "#111827",
    marginBottom: 16,
  },
  biddingInputContainer: {
    marginBottom: 12,
  },
  bidInputWrapper: {
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 16,
  },
  minBidLabel: {
    fontSize: 12,
    color: "#000",
    marginBottom: 12,
  },
  inputRow: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  biddingInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: "#111827",
    backgroundColor: "#fff",
  },
  bidButton: {
    paddingHorizontal: 32,
    borderRadius: 8,
  },
  bidButtonText: {
    fontSize: 15,
    color: "#fff",
  },
  minimumBidNote: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 8,
  },
  minimumBidText: {
    fontSize: 12,
    color: "#6B7280",
  },
  incomingMinBidNote: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 10,
    marginBottom: 16,
  },
  auctionInfoSection: {
    paddingHorizontal: 20,
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
  bidHistoryCount: {
    fontSize: 13,
    color: "#9CA3AF",
    fontWeight: "normal",
  },
  bidHistoryItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  bidHistoryName: {
    fontSize: 13,
    color: "#111827",
    marginBottom: 4,
  },
  bidHistoryTime: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  bidHistoryAmount: {
    fontSize: 14,
    color: "#111827",
  },
  bottomButtonsContainer: {
    justifyContent: "center",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    gap: 24,
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 5,
  },
  placeBidButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: "#22C55E",
    justifyContent: "center",
    alignItems: "center",
  },
  placeBidButtonText: {
    fontSize: 15,
    color: "#fff",
    fontWeight: 600,
  },
  buyNowButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    backgroundColor: "#1F3A93",
    justifyContent: "center",
    alignItems: "center",
  },
  buyNowButtonText: {
    fontSize: 15,
    color: "#fff",
    fontWeight: 600,
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
});

export default ProductDetailPage;
