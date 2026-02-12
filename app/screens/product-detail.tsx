import { image } from "@/assets/images";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
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
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { AppText } from "../components/appText";
import { LinearGradient } from "expo-linear-gradient";

const { width } = Dimensions.get("window");

const ProductDetailPage = () => {
  const {
    productId,
    productName,
    productImage,
    time,
    isHot,
    isEnding,
    isIncoming,
  } = useLocalSearchParams();
  const router = useRouter();
  const [bidAmount, setBidAmount] = useState("");
  const [currentBid, setCurrentBid] = useState(12500);
  const [buyNowPrice, setBuyNowPrice] = useState(19500);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const imageScrollRef = useRef<ScrollView>(null);
  const insets = useSafeAreaInsets();

  // Mock product data - in real app, fetch from API
  const productData = {
    id: productId,
    name: productName || "Macbook Pro M3",
    images: [
      productImage ? JSON.parse(productImage as string) : image.macbook,
      image.i8,
      image.labubu,
    ],
    image: productImage ? JSON.parse(productImage as string) : image.macbook,
    time: time || "21:15:57",
    isHot: isHot === "true",
    isEnding: isEnding === "true",
    isIncoming: isIncoming === "true",
    seller: {
      name: "Krittapas Wannawilai",
      userId: "0816935880",
      avatar: image.bang,
    },
    currentBid: currentBid,
    buyNowPrice: buyNowPrice,
    biddingHistory: [
      {
        id: 1,
        bidder: "Krittapas Wannawilai",
        amount: 12500,
        time: "12 mins ago",
      },
      {
        id: 2,
        bidder: "Krittapas Wannawilai",
        amount: 12500,
        time: "12 mins ago",
      },
      {
        id: 3,
        bidder: "Krittapas Wannawilai",
        amount: 12500,
        time: "12 mins ago",
      },
    ],
    auctionInfo: {
      ends: "Dec 25, 2025 at 10:00 PM",
      timeRemaining: "21:15:57",
      startingBid: "฿8,000",
      location: "Bangkok, Thailand",
    },
    description:
      "Macbook Pro M3 Silver Macbook Pro M3 Silver Macbook Pro M3 Silver Macbook Pro M3 Silver Macbook Pro M3 Silver Macbook Pro M3 Silver Macbook Pro M3 Silver Macbook Pro M3 Silver",
    tags: ["Electronics", "Computer"],
    totalBids: 47,
  };

  const handleBid = () => {
    // Handle bid logic
    console.log("Bid placed:", bidAmount);
  };

  const handleBuyNow = () => {
    // Handle buy now logic
    console.log("Buy now clicked");
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Header with Back Button */}
        <View style={styles.headerContainer}>
          <TouchableOpacity onPress={() => router.back()}>
            <Image source={image.back} style={{ width: 28, height: 28 }} />
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
            scrollEnabled={productData.images.length > 1}
          >
            {productData.images.map((img, idx) => (
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
          {productData.images.length > 1 && (
            <View style={styles.dotsContainer}>
              {productData.images.map((_, idx) => (
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
          {productData.images.length > 1 && (
            <View style={styles.imageCounterBadge}>
              <AppText weight="medium" style={styles.imageCounterText}>
                {currentImageIndex + 1} / {productData.images.length}
              </AppText>
            </View>
          )}
        </View>

        {/* Tags */}
        <View style={styles.tagsContainer}>
          {productData.tags.map((tag, index) => (
            <View key={index} style={styles.tag}>
              <AppText weight="medium" style={styles.tagText}>
                {tag}
              </AppText>
            </View>
          ))}
        </View>

        {/* Product Title */}
        <View style={styles.titleSection}>
          <AppText weight="bold" style={styles.productTitle}>
            {productData.name}
          </AppText>
        </View>

        {/* Seller Info */}
        <View style={styles.sellerContainer}>
          <Image
            source={productData.seller.avatar}
            style={styles.sellerAvatar}
          />
          <View style={{ flex: 1 }}>
            <AppText weight="semibold" style={styles.sellerName}>
              {productData.seller.name}
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
              <AppText weight="regular" style={styles.sellerUserId}>
                {productData.seller.userId}
              </AppText>
            </View>
          </View>
        </View>

        {/* Bidding Info Cards */}
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
              >
                {productData.totalBids} Bids
              </AppText>
            </View>
            <AppText weight="regular" style={styles.bidLabelSmall}>
              Current Bid
            </AppText>
            <AppText weight="bold" style={styles.bidAmount}>
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
              >
                Buy Now
              </AppText>
            </View>
            <AppText weight="regular" style={styles.bidLabelSmall}>
              Buyout Price
            </AppText>
            <AppText weight="bold" style={styles.bidAmount}>
              ฿{buyNowPrice.toLocaleString("en-US")}
            </AppText>
          </View>
        </View>

        {/* Bidding Section */}
        <View style={styles.biddingSection}>
          <View style={styles.biddingInputContainer}>
            <View style={styles.bidInputWrapper}>
              <AppText weight="regular" style={styles.minBidLabel}>
                Place Your Bid
              </AppText>
              <View style={styles.inputRow}>
                <TextInput
                  style={styles.biddingInput}
                  placeholder="Min : ฿12,600"
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
                    <AppText weight="bold" style={styles.bidButtonText}>
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
                <AppText weight="regular" style={styles.minimumBidText}>
                  Minimum bid increment: ฿100
                </AppText>
              </View>
            </View>
          </View>
        </View>

        {/* Auction Information */}
        <View style={styles.auctionInfoSection}>
          <AppText weight="bold" style={styles.sectionTitle}>
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
              <AppText weight="regular" style={styles.infoLabel}>
                Ends
              </AppText>
              <AppText weight="semibold" style={styles.infoValue}>
                {productData.auctionInfo.ends}
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
              <AppText weight="regular" style={styles.infoLabel}>
                Time Remaining
              </AppText>
              <AppText weight="semibold" style={styles.infoValue}>
                {productData.auctionInfo.timeRemaining}
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
              <AppText weight="regular" style={styles.infoLabel}>
                Starting Bid
              </AppText>
              <AppText weight="semibold" style={styles.infoValue}>
                {productData.auctionInfo.startingBid}
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
              <AppText weight="regular" style={styles.infoLabel}>
                Location
              </AppText>
              <AppText weight="semibold" style={styles.infoValue}>
                {productData.auctionInfo.location}
              </AppText>
            </View>
          </View>
        </View>

        {/* Description */}
        <View style={styles.descriptionSection}>
          <AppText weight="bold" style={styles.sectionTitle}>
            Description
          </AppText>
          <AppText weight="regular" style={styles.descriptionText}>
            {productData.description}
          </AppText>
        </View>

        {/* Bid History */}
        <View style={styles.bidHistorySection}>
          <AppText weight="bold" style={styles.sectionTitle}>
            Bid History
            <AppText weight="regular" style={styles.bidHistoryCount}>
              {" "}
              ( 5 lastest bid )
            </AppText>
          </AppText>

          {productData.biddingHistory.map((bid) => (
            <View key={bid.id} style={styles.bidHistoryItem}>
              <View>
                <AppText weight="semibold" style={styles.bidHistoryName}>
                  {bid.bidder}
                </AppText>
                <AppText weight="regular" style={styles.bidHistoryTime}>
                  {bid.time}
                </AppText>
              </View>
              <AppText weight="bold" style={styles.bidHistoryAmount}>
                ฿{bid.amount.toLocaleString("en-US")}
              </AppText>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Bottom Action Buttons */}
      <View style={[styles.bottomButtonsContainer, { paddingBottom: insets.bottom }]}>
        <TouchableOpacity onPress={handleBid} activeOpacity={0.8}>
          <LinearGradient
            colors={["#2EA200", "#3CD500"]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.primaryButton2}
          >
            <AppText weight="bold" style={styles.placeBidButtonText}>
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
            <AppText weight="bold" style={styles.buyNowButtonText}>
              Buy Now
            </AppText>
          </LinearGradient>
        </TouchableOpacity>
      </View>
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
    fontSize: 22,
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
    fontSize: 15,
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
    fontSize: 20,
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
    fontSize: 14,
    color: "#111827",
    marginBottom: 4,
  },
  bidHistoryTime: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  bidHistoryAmount: {
    fontSize: 15,
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
    fontSize: 16,
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
    fontSize: 16,
    color: "#fff",
    fontWeight: 600,
  },
});

export default ProductDetailPage;
