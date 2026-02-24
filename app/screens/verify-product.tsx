import { image } from "@/assets/images";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppText } from "../components/appText";
import { AppTextInput } from "../components/appTextInput";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

type ProductStatus = "won" | "verified" | "received" | "expired";

const DEADLINE_HOURS = 24;

interface WonProduct {
  id: number;
  name: string;
  image: any;
  winPrice: number;
  wonDate: string;
  wonTimestamp: number;
  status: ProductStatus;
  seller: {
    name: string;
    phone: string;
    email: string;
    avatar: any;
  };
}

// Countdown Timer Component
const CountdownTimer = ({
  wonTimestamp,
  onExpire,
  size = "normal",
}: {
  wonTimestamp: number;
  onExpire?: () => void;
  size?: "small" | "normal";
}) => {
  const [remaining, setRemaining] = useState(() => {
    const deadline = wonTimestamp + DEADLINE_HOURS * 60 * 60 * 1000;
    return Math.max(0, deadline - Date.now());
  });
  const expiredRef = useRef(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const deadline = wonTimestamp + DEADLINE_HOURS * 60 * 60 * 1000;
      const left = Math.max(0, deadline - Date.now());
      setRemaining(left);
      if (left <= 0 && !expiredRef.current) {
        expiredRef.current = true;
        onExpire?.();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [wonTimestamp]);

  const hours = Math.floor(remaining / (1000 * 60 * 60));
  const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
  const timeStr = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

  const isUrgent = remaining < 2 * 60 * 60 * 1000; // < 2 hours
  const isExpired = remaining <= 0;

  if (size === "small") {
    return (
      <View
        style={[
          styles.countdownBadgeSmall,
          {
            backgroundColor: isExpired
              ? "#FFEBEE"
              : isUrgent
                ? "#FFF3E0"
                : "#F3E5F5",
          },
        ]}
      >
        <AppText
          weight="semibold"
          style={{
            fontSize: 10,
            color: isExpired ? "#D32F2F" : isUrgent ? "#E65100" : "#7B1FA2",
          }}
        >
          {isExpired ? "⛔ Expired" : `⏳ ${timeStr}`}
        </AppText>
      </View>
    );
  }

  return (
    <View
      style={[
        styles.countdownCard,
        {
          backgroundColor: isExpired
            ? "#FFEBEE"
            : isUrgent
              ? "#FFF8E1"
              : "#F3E8FF",
          borderColor: isExpired ? "#EF9A9A" : isUrgent ? "#FFE082" : "#CE93D8",
        },
      ]}
    >
      <AppText
        weight="medium"
        style={{
          fontSize: 12,
          color: isExpired ? "#C62828" : isUrgent ? "#E65100" : "#6A1B9A",
          marginBottom: 6,
        }}
      >
        {isExpired
          ? "Verification Deadline Passed"
          : "Time Remaining to Verify"}
      </AppText>
      <View style={styles.countdownTimerRow}>
        {isExpired ? (
          <AppText weight="bold" style={{ fontSize: 24, color: "#D32F2F" }}>
            00:00:00
          </AppText>
        ) : (
          <>
            <View style={styles.countdownBlock}>
              <AppText
                weight="bold"
                style={[
                  styles.countdownDigit,
                  { color: isUrgent ? "#E65100" : "#4A148C" },
                ]}
              >
                {hours.toString().padStart(2, "0")}
              </AppText>
              <AppText weight="regular" style={styles.countdownUnit}>
                hrs
              </AppText>
            </View>
            <AppText
              weight="bold"
              style={[
                styles.countdownSep,
                { color: isUrgent ? "#E65100" : "#4A148C" },
              ]}
            >
              :
            </AppText>
            <View style={styles.countdownBlock}>
              <AppText
                weight="bold"
                style={[
                  styles.countdownDigit,
                  { color: isUrgent ? "#E65100" : "#4A148C" },
                ]}
              >
                {minutes.toString().padStart(2, "0")}
              </AppText>
              <AppText weight="regular" style={styles.countdownUnit}>
                min
              </AppText>
            </View>
            <AppText
              weight="bold"
              style={[
                styles.countdownSep,
                { color: isUrgent ? "#E65100" : "#4A148C" },
              ]}
            >
              :
            </AppText>
            <View style={styles.countdownBlock}>
              <AppText
                weight="bold"
                style={[
                  styles.countdownDigit,
                  { color: isUrgent ? "#E65100" : "#4A148C" },
                ]}
              >
                {seconds.toString().padStart(2, "0")}
              </AppText>
              <AppText weight="regular" style={styles.countdownUnit}>
                sec
              </AppText>
            </View>
          </>
        )}
      </View>
    </View>
  );
};

const INITIAL_PRODUCTS: WonProduct[] = [
  {
    id: 1,
    name: "Macbook Pro M3",
    image: image.macbook,
    winPrice: 15000,
    wonDate: "Feb 15, 2026",
    wonTimestamp: Date.now() - 2 * 60 * 60 * 1000, // won 2 hours ago
    status: "won",
    seller: {
      name: "Krittapas Wannawilai",
      phone: "081-693-5880",
      email: "krittapas@email.com",
      avatar: image.bang,
    },
  },
  {
    id: 2,
    name: "BMW i8 Model Car",
    image: image.i8,
    winPrice: 8500,
    wonDate: "Feb 8, 2026",
    wonTimestamp: Date.now() - 3 * 24 * 60 * 60 * 1000,
    status: "verified",
    seller: {
      name: "Krittapas Wannawilai",
      phone: "081-693-5880",
      email: "krittapas@email.com",
      avatar: image.bang,
    },
  },
  {
    id: 3,
    name: "Labubu New Collection",
    image: image.labubu,
    winPrice: 4200,
    wonDate: "Feb 5, 2026",
    wonTimestamp: Date.now() - 7 * 24 * 60 * 60 * 1000,
    status: "received",
    seller: {
      name: "Krittapas Wannawilai",
      phone: "081-693-5880",
      email: "krittapas@email.com",
      avatar: image.bang,
    },
  },
];

const VerifyProductPage = () => {
  const router = useRouter();
  const [products, setProducts] = useState<WonProduct[]>(INITIAL_PRODUCTS);
  const [selectedProduct, setSelectedProduct] = useState<WonProduct | null>(
    null,
  );
  const [modalVisible, setModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<"all" | ProductStatus>("all");

  const handleExpire = useCallback((productId: number) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId && p.status === "won"
          ? { ...p, status: "expired" as ProductStatus }
          : p,
      ),
    );
    setSelectedProduct((prev) =>
      prev && prev.id === productId && prev.status === "won"
        ? { ...prev, status: "expired" as ProductStatus }
        : prev,
    );
  }, []);

  const filteredProducts =
    activeTab === "all"
      ? products
      : products.filter((p) => p.status === activeTab);

  const openProductDetail = (product: WonProduct) => {
    setSelectedProduct(product);
    setModalVisible(true);
  };

  const handleVerify = (productId: number) => {
    Alert.alert(
      "ยืนยันการติดต่อ",
      "คุณได้ติดต่อกับผู้ขายเรื่องการจัดส่งสินค้าเรียบร้อยแล้วใช่ไหม?",
      [
        { text: "ยกเลิก" },
        {
          text: "ยืนยัน",
          onPress: () => {
            setProducts((prev) =>
              prev.map((p) =>
                p.id === productId ? { ...p, status: "verified" } : p,
              ),
            );
            setSelectedProduct((prev) =>
              prev ? { ...prev, status: "verified" } : null,
            );
          },
        },
      ],
    );
  };

  // Review Modal States
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewComment, setReviewComment] = useState("");
  const [reviewProductId, setReviewProductId] = useState<number | null>(null);
  const [starAnimations] = useState(() =>
    Array.from({ length: 5 }, () => new Animated.Value(1)),
  );

  const animateStar = (index: number) => {
    Animated.sequence([
      Animated.timing(starAnimations[index], {
        toValue: 1.4,
        duration: 120,
        useNativeDriver: true,
      }),
      Animated.timing(starAnimations[index], {
        toValue: 1,
        duration: 120,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleStarPress = (star: number) => {
    setReviewRating(star);
    animateStar(star - 1);
  };

  const handleReceived = (productId: number) => {
    setReviewProductId(productId);
    setReviewRating(0);
    setReviewComment("");
    // Close detail modal first, then show review modal after delay
    setModalVisible(false);
    setTimeout(() => {
      setShowReviewModal(true);
    }, 400);
  };

  const handleSubmitReview = () => {
    if (reviewRating === 0) {
      Alert.alert("กรุณาให้คะแนน", "กรุณากดดาวเพื่อให้คะแนนผู้ขาย");
      return;
    }
    if (reviewProductId !== null) {
      setProducts((prev) =>
        prev.map((p) =>
          p.id === reviewProductId ? { ...p, status: "received" } : p,
        ),
      );
      setSelectedProduct((prev) =>
        prev ? { ...prev, status: "received" } : null,
      );
    }
    setShowReviewModal(false);
    Alert.alert(
      "ขอบคุณสำหรับรีวิว! 🎉",
      `คุณให้คะแนนผู้ขาย ${reviewRating} ดาว`,
    );
  };

  const getStatusConfig = (status: ProductStatus) => {
    switch (status) {
      case "won":
        return {
          label: "Won",
          color: "#FF9500",
          bg: "#FFF3E0",
          icon: "🏆",
        };
      case "verified":
        return {
          label: "Verified",
          color: "#2196F3",
          bg: "#E3F2FD",
          icon: "📦",
        };
      case "received":
        return {
          label: "Received",
          color: "#4CAF50",
          bg: "#E8F5E9",
          icon: "✅",
        };
      case "expired":
        return {
          label: "Expired",
          color: "#D32F2F",
          bg: "#FFEBEE",
          icon: "⛔",
        };
    }
  };

  const tabCounts = {
    all: products.length,
    won: products.filter((p) => p.status === "won").length,
    verified: products.filter((p) => p.status === "verified").length,
    received: products.filter((p) => p.status === "received").length,
    expired: products.filter((p) => p.status === "expired").length,
  };

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
          <AppText
            weight="bold"
            style={styles.headerTitle}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            Verify Product
          </AppText>
          <View style={{ width: 40 }} />
        </SafeAreaView>
      </LinearGradient>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {(
            [
              { key: "all", label: "All" },
              { key: "won", label: "🏆 Won" },
              { key: "verified", label: "📦 Shipping" },
              { key: "received", label: "✅ Done" },
              { key: "expired", label: "⛔ Expired" },
            ] as const
          ).map((tab) => (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, activeTab === tab.key && styles.tabActive]}
              onPress={() => setActiveTab(tab.key)}
            >
              <AppText
                weight={activeTab === tab.key ? "semibold" : "regular"}
                style={[
                  styles.tabText,
                  activeTab === tab.key && styles.tabTextActive,
                ]}
                numberOfLines={1}
              >
                {tab.label}{" "}
                <AppText
                  weight="medium"
                  style={{
                    fontSize: 12,
                    color: activeTab === tab.key ? "#003994" : "#9CA3AF",
                  }}
                >
                  ({tabCounts[tab.key]})
                </AppText>
              </AppText>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Product List */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 30 }}
      >
        {filteredProducts.length === 0 ? (
          <View style={styles.emptyState}>
            <AppText style={{ fontSize: 48, marginBottom: 16 }}>📭</AppText>
            <AppText
              weight="semibold"
              style={styles.emptyTitle}
              numberOfLines={1}
            >
              No products found
            </AppText>
            <AppText weight="regular" style={styles.emptySub} numberOfLines={2}>
              {activeTab === "all"
                ? "You haven't won any auctions yet"
                : `No products in this status`}
            </AppText>
          </View>
        ) : (
          filteredProducts.map((product) => {
            const statusConfig = getStatusConfig(product.status);
            return (
              <TouchableOpacity
                key={product.id}
                style={[
                  styles.productCard,
                  product.status === "expired" && { opacity: 0.6 },
                ]}
                onPress={() => openProductDetail(product)}
                activeOpacity={0.7}
              >
                <Image source={product.image} style={styles.productImage} />
                <View style={styles.productInfo}>
                  <AppText
                    weight="semibold"
                    style={[
                      styles.productName,
                      product.status === "expired" && {
                        textDecorationLine: "line-through",
                        color: "#9CA3AF",
                      },
                    ]}
                    numberOfLines={1}
                  >
                    {product.name}
                  </AppText>
                  <AppText
                    weight="regular"
                    style={styles.productDate}
                    numberOfLines={1}
                  >
                    Won on {product.wonDate}
                  </AppText>
                  {product.status === "won" && (
                    <CountdownTimer
                      wonTimestamp={product.wonTimestamp}
                      onExpire={() => handleExpire(product.id)}
                      size="small"
                    />
                  )}
                  {product.status !== "won" && (
                    <AppText
                      weight="bold"
                      style={styles.productPrice}
                      numberOfLines={1}
                      adjustsFontSizeToFit
                    >
                      ฿{product.winPrice.toLocaleString("en-US")}
                    </AppText>
                  )}
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: statusConfig.bg },
                  ]}
                >
                  <AppText
                    weight="semibold"
                    style={[styles.statusText, { color: statusConfig.color }]}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                  >
                    {statusConfig.icon} {statusConfig.label}
                  </AppText>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </ScrollView>

      {/* Product Detail Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        {selectedProduct && (
          <SafeAreaView style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <AppText
                  weight="medium"
                  style={styles.modalClose}
                  numberOfLines={1}
                >
                  ✕
                </AppText>
              </TouchableOpacity>
              <AppText
                weight="bold"
                style={styles.modalTitle}
                numberOfLines={1}
              >
                Product Details
              </AppText>
              <View style={{ width: 28 }} />
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 40 }}
            >
              {/* Product Info */}
              <View style={styles.modalProductSection}>
                <Image
                  source={selectedProduct.image}
                  style={styles.modalProductImage}
                  resizeMode="contain"
                />
                <AppText
                  weight="bold"
                  numberOfLines={2}
                  style={styles.modalProductName}
                >
                  {selectedProduct.name}
                </AppText>
                <View style={styles.modalPriceRow}>
                  <AppText
                    weight="regular"
                    style={styles.modalPriceLabel}
                    numberOfLines={1}
                  >
                    Winning Price
                  </AppText>
                  <AppText
                    weight="bold"
                    style={styles.modalPriceValue}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                  >
                    ฿{selectedProduct.winPrice.toLocaleString("en-US")}
                  </AppText>
                </View>
                <View style={styles.modalDateRow}>
                  <AppText
                    weight="regular"
                    style={styles.modalDateLabel}
                    numberOfLines={1}
                  >
                    Won on
                  </AppText>
                  <AppText
                    weight="medium"
                    style={styles.modalDateValue}
                    numberOfLines={1}
                  >
                    {selectedProduct.wonDate}
                  </AppText>
                </View>
              </View>

              {/* Countdown Timer — only for won status */}
              {selectedProduct.status === "won" && (
                <View style={styles.countdownSection}>
                  <CountdownTimer
                    wonTimestamp={selectedProduct.wonTimestamp}
                    onExpire={() => handleExpire(selectedProduct.id)}
                  />
                </View>
              )}

              {/* Status Progress */}
              <View style={styles.progressSection}>
                <AppText
                  weight="bold"
                  style={styles.progressTitle}
                  numberOfLines={1}
                >
                  Order Progress
                </AppText>
                <View style={styles.progressTrack}>
                  {/* Step 1: Won */}
                  <View style={styles.progressStep}>
                    <View
                      style={[
                        styles.progressDot,
                        selectedProduct.status === "expired"
                          ? { backgroundColor: "#D32F2F" }
                          : styles.progressDotDone,
                      ]}
                    >
                      <AppText style={{ fontSize: 12, color: "#fff" }}>
                        {selectedProduct.status === "expired" ? "✗" : "✓"}
                      </AppText>
                    </View>
                    <AppText
                      weight="semibold"
                      style={styles.progressLabel}
                      numberOfLines={1}
                    >
                      Won Auction
                    </AppText>
                  </View>

                  <View
                    style={[
                      styles.progressLine,
                      selectedProduct.status === "expired" && {
                        backgroundColor: "#EF9A9A",
                      },
                      selectedProduct.status !== "won" &&
                        selectedProduct.status !== "expired" &&
                        styles.progressLineDone,
                    ]}
                  />

                  {/* Step 2: Verified */}
                  <View style={styles.progressStep}>
                    <View
                      style={[
                        styles.progressDot,
                        selectedProduct.status === "expired" && {
                          backgroundColor: "#D32F2F",
                        },
                        selectedProduct.status !== "won" &&
                          selectedProduct.status !== "expired" &&
                          styles.progressDotDone,
                      ]}
                    >
                      {selectedProduct.status === "expired" ? (
                        <AppText style={{ fontSize: 12, color: "#fff" }}>
                          ✗
                        </AppText>
                      ) : selectedProduct.status !== "won" ? (
                        <AppText style={{ fontSize: 12, color: "#fff" }}>
                          ✓
                        </AppText>
                      ) : (
                        <AppText style={{ fontSize: 10, color: "#9CA3AF" }}>
                          2
                        </AppText>
                      )}
                    </View>
                    <AppText
                      weight={
                        selectedProduct.status !== "won" &&
                        selectedProduct.status !== "expired"
                          ? "semibold"
                          : "regular"
                      }
                      style={[
                        styles.progressLabel,
                        (selectedProduct.status === "won" ||
                          selectedProduct.status === "expired") && {
                          color:
                            selectedProduct.status === "expired"
                              ? "#D32F2F"
                              : "#9CA3AF",
                        },
                      ]}
                    >
                      {selectedProduct.status === "expired"
                        ? "Expired"
                        : "Verified"}
                    </AppText>
                  </View>

                  <View
                    style={[
                      styles.progressLine,
                      selectedProduct.status === "received" &&
                        styles.progressLineDone,
                    ]}
                  />

                  {/* Step 3: Received */}
                  <View style={styles.progressStep}>
                    <View
                      style={[
                        styles.progressDot,
                        selectedProduct.status === "received" &&
                          styles.progressDotDone,
                      ]}
                    >
                      {selectedProduct.status === "received" ? (
                        <AppText style={{ fontSize: 12, color: "#fff" }}>
                          ✓
                        </AppText>
                      ) : (
                        <AppText style={{ fontSize: 10, color: "#9CA3AF" }}>
                          3
                        </AppText>
                      )}
                    </View>
                    <AppText
                      weight={
                        selectedProduct.status === "received"
                          ? "semibold"
                          : "regular"
                      }
                      style={[
                        styles.progressLabel,
                        selectedProduct.status !== "received" && {
                          color: "#9CA3AF",
                        },
                      ]}
                    >
                      Received
                    </AppText>
                  </View>
                </View>
              </View>

              {/* Seller Contact */}
              <View style={styles.sellerSection}>
                <AppText
                  weight="bold"
                  style={styles.sellerSectionTitle}
                  numberOfLines={1}
                >
                  Seller Contact
                </AppText>
                <View style={styles.sellerCard}>
                  <Image
                    source={selectedProduct.seller.avatar}
                    style={styles.sellerAvatar}
                  />
                  <View style={{ flex: 1 }}>
                    <AppText
                      weight="semibold"
                      style={styles.sellerName}
                      numberOfLines={1}
                    >
                      {selectedProduct.seller.name}
                    </AppText>
                    <View style={styles.sellerContactRow}>
                      <Image
                        source={image.phone}
                        style={{
                          width: 14,
                          height: 14,
                          tintColor: "#6B7280",
                          marginRight: 8,
                        }}
                      />
                      <AppText
                        weight="regular"
                        style={styles.sellerContact}
                        numberOfLines={1}
                      >
                        {selectedProduct.seller.phone}
                      </AppText>
                    </View>
                    <View style={styles.sellerContactRow}>
                      <Image
                        source={image.mail}
                        style={{
                          width: 16,
                          height: 12,
                          tintColor: "#6B7280",
                          marginRight: 8,
                        }}
                      />
                      <AppText
                        weight="regular"
                        style={styles.sellerContact}
                        numberOfLines={1}
                      >
                        {selectedProduct.seller.email}
                      </AppText>
                    </View>
                  </View>
                </View>
              </View>

              {/* Action Section */}
              {selectedProduct.status === "won" && (
                <View style={styles.actionSection}>
                  <View style={styles.actionNote}>
                    <Image
                      source={image.info}
                      style={{
                        width: 16,
                        height: 16,
                        tintColor: "#FF9500",
                        marginRight: 10,
                      }}
                    />
                    <AppText
                      weight="regular"
                      style={styles.actionNoteText}
                      numberOfLines={2}
                    >
                      Please contact the seller to arrange shipping before
                      verifying.
                    </AppText>
                  </View>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => handleVerify(selectedProduct.id)}
                  >
                    <LinearGradient
                      colors={["#00112E", "#003994"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.actionButton}
                    >
                      <AppText
                        weight="bold"
                        style={styles.actionButtonText}
                        numberOfLines={1}
                      >
                        ✓ Verify Contact
                      </AppText>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              )}

              {selectedProduct.status === "verified" && (
                <View style={styles.actionSection}>
                  <View style={styles.shippingCard}>
                    <View style={styles.shippingIconCircle}>
                      <AppText style={{ fontSize: 28 }}>📦</AppText>
                    </View>
                    <AppText
                      weight="semibold"
                      style={styles.shippingTitle}
                      numberOfLines={1}
                    >
                      Waiting for Delivery
                    </AppText>
                    <AppText
                      weight="regular"
                      style={styles.shippingSub}
                      numberOfLines={3}
                    >
                      Your product is being shipped. Once you receive it, press
                      the button below to confirm.
                    </AppText>
                  </View>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => handleReceived(selectedProduct.id)}
                  >
                    <LinearGradient
                      colors={["#2EA200", "#3CD500"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.actionButton}
                    >
                      <AppText
                        weight="bold"
                        style={styles.actionButtonText}
                        numberOfLines={1}
                      >
                        Product Received
                      </AppText>
                    </LinearGradient>
                  </TouchableOpacity>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => handleReceived(selectedProduct.id)}
                  >
                    <LinearGradient
                      colors={["#da0303", "#ff4d4d"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={[styles.actionButton, { marginTop: 12 }]}
                    >
                      <AppText
                        weight="bold"
                        style={styles.actionButtonText}
                        numberOfLines={1}
                      >
                        Report an Issue
                      </AppText>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              )}

              {selectedProduct.status === "received" && (
                <View style={styles.actionSection}>
                  <View style={styles.completedCard}>
                    <View style={styles.completedIconCircle}>
                      <AppText style={{ fontSize: 32 }}>🎉</AppText>
                    </View>
                    <AppText
                      weight="bold"
                      style={styles.completedTitle}
                      numberOfLines={1}
                    >
                      Completed!
                    </AppText>
                    <AppText
                      weight="regular"
                      style={styles.completedSub}
                      numberOfLines={3}
                    >
                      This transaction has been completed successfully. Thank
                      you for using BidKhong!
                    </AppText>
                  </View>
                </View>
              )}

              {selectedProduct.status === "expired" && (
                <View style={styles.actionSection}>
                  <View style={styles.expiredCard}>
                    <View style={styles.expiredIconCircle}>
                      <AppText style={{ fontSize: 32 }}>⛔</AppText>
                    </View>
                    <AppText
                      weight="bold"
                      style={styles.expiredTitle}
                      numberOfLines={1}
                    >
                      Auction Voided
                    </AppText>
                    <AppText
                      weight="regular"
                      style={styles.expiredSub}
                      numberOfLines={3}
                    >
                      The 24-hour verification deadline has passed without
                      contact confirmation. This auction has been voided.
                    </AppText>
                  </View>
                </View>
              )}
            </ScrollView>
          </SafeAreaView>
        )}
      </Modal>

      {/* ═══════════════════════════════════════════ */}
      {/* Star Rating Review Modal */}
      {/* ═══════════════════════════════════════════ */}
      <Modal
        visible={showReviewModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowReviewModal(false)}
      >
        <View style={styles.reviewOverlay}>
          <View style={styles.reviewModal}>
            <AppText style={styles.reviewEmoji}>
              {reviewRating >= 5
                ? "🤩"
                : reviewRating >= 4
                  ? "😊"
                  : reviewRating >= 3
                    ? "🙂"
                    : reviewRating >= 2
                      ? "😐"
                      : reviewRating >= 1
                        ? "😕"
                        : "📦"}
            </AppText>
            <AppText weight="bold" style={styles.reviewTitle} numberOfLines={1}>
              ยืนยันรับสินค้า
            </AppText>
            <AppText weight="regular" style={styles.reviewSubtitle}>
              กรุณาให้คะแนนผู้ขายเพื่อช่วยให้ผู้ใช้คนอื่น{"\n"}
              ตัดสินใจได้ดีขึ้น
            </AppText>

            {/* Star Rating */}
            <View style={styles.starsRow}>
              {[1, 2, 3, 4, 5].map((star) => (
                <TouchableOpacity
                  key={star}
                  onPress={() => handleStarPress(star)}
                  style={styles.starButton}
                  activeOpacity={0.7}
                >
                  <Animated.Text
                    style={[
                      styles.starText,
                      { transform: [{ scale: starAnimations[star - 1] }] },
                    ]}
                  >
                    {star <= reviewRating ? "⭐" : "☆"}
                  </Animated.Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Rating Label */}
            <AppText weight="medium" style={styles.ratingLabel}>
              {reviewRating === 0
                ? "กดดาวเพื่อให้คะแนน"
                : reviewRating === 1
                  ? "แย่มาก"
                  : reviewRating === 2
                    ? "ไม่ค่อยดี"
                    : reviewRating === 3
                      ? "พอใช้"
                      : reviewRating === 4
                        ? "ดี"
                        : "ยอดเยี่ยม!"}
            </AppText>

            {/* Comment Input */}
            <View style={styles.reviewInputWrapper}>
              <AppTextInput
                placeholder="เขียนรีวิวเพิ่มเติม (ไม่บังคับ)..."
                value={reviewComment}
                onChangeText={setReviewComment}
                multiline
                numberOfLines={3}
                style={styles.reviewInput}
              />
            </View>

            {/* Buttons */}
            <View style={styles.reviewButtonsRow}>
              <TouchableOpacity
                onPress={() => setShowReviewModal(false)}
                style={styles.reviewCancelBtn}
                activeOpacity={0.7}
              >
                <AppText weight="semibold" style={styles.reviewCancelText}>
                  ยกเลิก
                </AppText>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSubmitReview}
                style={styles.reviewSubmitBtn}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={
                    reviewRating > 0 ? ["#00112E", "#003994"] : ["#999", "#BBB"]
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.reviewSubmitGradient}
                >
                  <AppText weight="bold" style={styles.reviewSubmitText}>
                    ส่งรีวิว
                  </AppText>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
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
  tabsContainer: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  tab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    marginRight: 8,
  },
  tabActive: {
    backgroundColor: "#E3F2FD",
  },
  tabText: {
    fontSize: 13,
    color: "#6B7280",
  },
  tabTextActive: {
    color: "#003994",
  },
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 80,
  },
  emptyTitle: {
    fontSize: 18,
    color: "#111827",
    marginBottom: 6,
  },
  emptySub: {
    fontSize: 14,
    color: "#9CA3AF",
  },
  productCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
  },
  productImage: {
    width: 70,
    height: 70,
    borderRadius: 12,
    backgroundColor: "#F5F5F5",
  },
  productInfo: {
    flex: 1,
    marginLeft: 14,
  },
  productName: {
    fontSize: 14,
    color: "#111827",
    marginBottom: 4,
  },
  productDate: {
    fontSize: 12,
    color: "#9CA3AF",
    marginBottom: 4,
  },
  productPrice: {
    fontSize: 15,
    color: "#003994",
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 11,
  },

  // Modal
  modalContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  modalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  modalClose: {
    fontSize: 22,
    color: "#6B7280",
  },
  modalTitle: {
    fontSize: 18,
    color: "#111827",
  },
  modalProductSection: {
    alignItems: "center",
    padding: 20,
  },
  modalProductImage: {
    width: SCREEN_WIDTH - 80,
    height: 200,
    borderRadius: 16,
    backgroundColor: "#F9FAFB",
    marginBottom: 16,
  },
  modalProductName: {
    fontSize: 20,
    color: "#111827",
    marginBottom: 16,
    textAlign: "center",
  },
  modalPriceRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    backgroundColor: "#F9FAFB",
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 8,
  },
  modalPriceLabel: {
    fontSize: 14,
    color: "#6B7280",
  },
  modalPriceValue: {
    fontSize: 18,
    color: "#003994",
  },
  modalDateRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  modalDateLabel: {
    fontSize: 14,
    color: "#6B7280",
  },
  modalDateValue: {
    fontSize: 14,
    color: "#111827",
  },

  // Progress
  progressSection: {
    paddingHorizontal: 20,
    paddingVertical: 20,
  },
  progressTitle: {
    fontSize: 16,
    color: "#111827",
    marginBottom: 20,
  },
  progressTrack: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  progressStep: {
    alignItems: "center",
    width: 80,
  },
  progressDot: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: "#E5E7EB",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  progressDotDone: {
    backgroundColor: "#003994",
  },
  progressLabel: {
    fontSize: 10,
    color: "#111827",
    textAlign: "center",
  },
  progressLine: {
    flex: 1,
    height: 3,
    backgroundColor: "#E5E7EB",
    marginBottom: 24,
    borderRadius: 2,
  },
  progressLineDone: {
    backgroundColor: "#003994",
  },

  // Seller
  sellerSection: {
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  sellerSectionTitle: {
    fontSize: 16,
    color: "#111827",
    marginBottom: 14,
  },
  sellerCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F9FAFB",
    padding: 16,
    borderRadius: 14,
  },
  sellerAvatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    marginRight: 14,
  },
  sellerName: {
    fontSize: 15,
    color: "#111827",
    marginBottom: 6,
  },
  sellerContactRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 4,
  },
  sellerContact: {
    fontSize: 13,
    color: "#6B7280",
  },

  // Action
  actionSection: {
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  actionNote: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#FFF8E1",
    padding: 14,
    borderRadius: 12,
    marginBottom: 16,
  },
  actionNoteText: {
    flex: 1,
    fontSize: 13,
    color: "#F57C00",
    lineHeight: 20,
  },
  actionButton: {
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  actionButtonText: {
    fontSize: 15,
    color: "#fff",
  },

  // Shipping
  shippingCard: {
    alignItems: "center",
    backgroundColor: "#E3F2FD",
    padding: 24,
    borderRadius: 16,
    marginBottom: 16,
  },
  shippingIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  shippingTitle: {
    fontSize: 15,
    color: "#1565C0",
    marginBottom: 8,
  },
  shippingSub: {
    fontSize: 13,
    color: "#1976D2",
    textAlign: "center",
    lineHeight: 20,
  },

  // Completed
  completedCard: {
    alignItems: "center",
    backgroundColor: "#E8F5E9",
    padding: 24,
    borderRadius: 16,
  },
  completedIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  completedTitle: {
    fontSize: 16,
    color: "#2E7D32",
    marginBottom: 8,
  },
  completedSub: {
    fontSize: 13,
    color: "#388E3C",
    textAlign: "center",
    lineHeight: 20,
  },

  // Countdown
  countdownSection: {
    paddingHorizontal: 20,
  },
  countdownCard: {
    alignItems: "center",
    padding: 18,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  countdownTimerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  countdownBlock: {
    alignItems: "center",
    minWidth: 50,
  },
  countdownDigit: {
    fontSize: 28,
  },
  countdownUnit: {
    fontSize: 10,
    color: "#9CA3AF",
    marginTop: 2,
  },
  countdownSep: {
    fontSize: 24,
    marginHorizontal: 4,
    marginBottom: 14,
  },
  countdownBadgeSmall: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    alignSelf: "flex-start",
    marginTop: 2,
  },

  // Expired
  expiredCard: {
    alignItems: "center",
    backgroundColor: "#FFEBEE",
    padding: 24,
    borderRadius: 16,
  },
  expiredIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  expiredTitle: {
    fontSize: 16,
    color: "#C62828",
    marginBottom: 8,
  },
  expiredSub: {
    fontSize: 13,
    color: "#D32F2F",
    textAlign: "center",
    lineHeight: 20,
  },

  // Review Modal Styles
  reviewOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  reviewModal: {
    backgroundColor: "#FFF",
    borderRadius: 24,
    padding: 28,
    width: "100%",
    maxWidth: 380,
    alignItems: "center",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 20,
  },
  reviewEmoji: {
    fontSize: 48,
    marginBottom: 12,
  },
  reviewTitle: {
    fontSize: 20,
    color: "#001A3D",
    marginBottom: 6,
  },
  reviewSubtitle: {
    fontSize: 13,
    color: "#888",
    textAlign: "center",
    marginBottom: 20,
    lineHeight: 19,
  },
  starsRow: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
    marginBottom: 12,
  },
  starButton: {
    padding: 4,
  },
  starText: {
    fontSize: 36,
  },
  ratingLabel: {
    fontSize: 13,
    color: "#888",
    marginBottom: 18,
  },
  reviewInputWrapper: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    backgroundColor: "#FAFAFA",
    paddingHorizontal: 14,
    paddingVertical: 10,
    marginBottom: 22,
    minHeight: 80,
  },
  reviewInput: {
    fontSize: 13,
    color: "#333",
    textAlignVertical: "top",
    padding: 0,
  },
  reviewButtonsRow: {
    flexDirection: "row",
    gap: 12,
    width: "100%",
  },
  reviewCancelBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    alignItems: "center",
    backgroundColor: "#F5F5F5",
  },
  reviewCancelText: {
    fontSize: 14,
    color: "#666",
  },
  reviewSubmitBtn: {
    flex: 1,
    borderRadius: 12,
    overflow: "hidden",
  },
  reviewSubmitGradient: {
    paddingVertical: 14,
    alignItems: "center",
  },
  reviewSubmitText: {
    fontSize: 14,
    color: "#FFF",
  },
});

export default VerifyProductPage;
