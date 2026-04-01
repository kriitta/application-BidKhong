import { image } from "@/assets/images";
import { apiService } from "@/utils/api";
import { getFullImageUrl } from "@/utils/api/config";
import { Order, OrderStatus } from "@/utils/api/types";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import LottieView from "lottie-react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Dimensions,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../../contexts/AuthContext";
import { useLanguage } from "../../contexts/LanguageContext";
import { AppText } from "../components/appText";
import { AppTextInput } from "../components/appTextInput";

const { width: SCREEN_WIDTH } = Dimensions.get("window");

// Backend may return either "pending_confirmation" or "pending_buyer_confirm"
const isPendingConfirm = (status: OrderStatus) =>
  status === "pending_confirmation" || status === "pending_buyer_confirm";

// Map API OrderStatus to UI tab filter
type UITab = "all" | "won" | "shipping" | "completed" | "problem";

const mapStatusToTab = (status: OrderStatus): UITab => {
  switch (status) {
    case "pending_confirmation":
    case "pending_buyer_confirm":
      return "won";
    case "confirmed":
    case "shipped":
      return "shipping";
    case "completed":
      return "completed";
    case "disputed":
    case "cancelled":
    case "expired":
      return "problem";
  }
};

// Returns true if the order's confirmation deadline has already passed (client-side)
const isDeadlinePassed = (order: Order): boolean =>
  !!(order.deadline_at && new Date(order.deadline_at) < new Date());

// Maps an order to its display tab — deadline-expired pending orders go to "problem"
const getOrderTab = (order: Order): UITab => {
  if (isPendingConfirm(order.status) && isDeadlinePassed(order))
    return "problem";
  return mapStatusToTab(order.status);
};

type TFunc = (key: any) => string;

const getStatusConfig = (status: OrderStatus, t: TFunc) => {
  switch (status) {
    case "pending_confirmation":
    case "pending_buyer_confirm":
      return {
        label: t("statusWon"),
        color: "#FF9500",
        bg: "#FFF3E0",
        icon: "trophy-outline",
      };
    case "confirmed":
      return {
        label: t("statusConfirmed"),
        color: "#2196F3",
        bg: "#E3F2FD",
        icon: "checkmark-circle-outline",
      };
    case "shipped":
      return {
        label: t("statusShipped"),
        color: "#7B1FA2",
        bg: "#F3E5F5",
        icon: "cube-outline",
      };
    case "completed":
      return {
        label: t("statusCompleted"),
        color: "#4CAF50",
        bg: "#E8F5E9",
        icon: "ribbon-outline",
      };
    case "disputed":
      return {
        label: t("statusDisputed"),
        color: "#E65100",
        bg: "#FFF3E0",
        icon: "warning-outline",
      };
    case "cancelled":
      return {
        label: t("statusCancelled"),
        color: "#D32F2F",
        bg: "#FFEBEE",
        icon: "close-circle-outline",
      };
    case "expired":
      return {
        label: t("statusExpired"),
        color: "#D32F2F",
        bg: "#FFEBEE",
        icon: "close-circle-outline",
      };
    default:
      return {
        label: t("statusUnknown"),
        color: "#9CA3AF",
        bg: "#F3F4F6",
        icon: "help-circle-outline",
      };
  }
};

// ─── Countdown Timer Component ───────────────────────────────
const CountdownTimer = ({
  deadlineAt,
  onExpire,
  size = "normal",
  t,
}: {
  deadlineAt: string;
  onExpire?: () => void;
  size?: "small" | "normal";
  t: TFunc;
}) => {
  const getRemaining = () => {
    const deadline = new Date(deadlineAt).getTime();
    return Math.max(0, deadline - Date.now());
  };

  const [remaining, setRemaining] = useState(getRemaining);
  const expiredRef = useRef(false);

  useEffect(() => {
    const interval = setInterval(() => {
      const left = getRemaining();
      setRemaining(left);
      if (left <= 0 && !expiredRef.current) {
        expiredRef.current = true;
        onExpire?.();
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [deadlineAt]);

  const hours = Math.floor(remaining / (1000 * 60 * 60));
  const minutes = Math.floor((remaining % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((remaining % (1000 * 60)) / 1000);
  const timeStr = `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;

  const isUrgent = remaining < 2 * 60 * 60 * 1000;
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
          {isExpired ? (
            <>
              <Ionicons name="close-circle-outline" size={10} color="#D32F2F" />{" "}
              {t("statusExpired")}
            </>
          ) : (
            <>
              <Ionicons
                name="hourglass-outline"
                size={10}
                color={isUrgent ? "#E65100" : "#7B1FA2"}
              />{" "}
              {timeStr}
            </>
          )}
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
          ? t("verificationDeadlinePassed")
          : t("timeRemainingToVerify")}
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
                {t("hrs")}
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
                {t("min")}
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
                {t("sec")}
              </AppText>
            </View>
          </>
        )}
      </View>
    </View>
  );
};

// ─── Helper: get product image URL ──────────────────────────
const getOrderProductImage = (order: Order): { uri: string } | null => {
  if (order.product?.images && order.product.images.length > 0) {
    const url = getFullImageUrl(order.product.images[0].image_url);
    if (url) return { uri: url };
  }
  if (order.product?.image_url) {
    const url = getFullImageUrl(order.product.image_url);
    if (url) return { uri: url };
  }
  if (order.product?.picture) {
    const url = getFullImageUrl(order.product.picture);
    if (url) return { uri: url };
  }
  return null;
};

const formatDate = (dateStr: string | null): string => {
  if (!dateStr) return "-";
  const d = new Date(dateStr);
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const VerifyProductPage = () => {
  const router = useRouter();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [activeTab, setActiveTab] = useState<UITab>("all");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  // Dispute modal states
  const [showDisputeModal, setShowDisputeModal] = useState(false);
  const [disputeReason, setDisputeReason] = useState("");
  const [disputeImages, setDisputeImages] = useState<
    { uri: string; name: string; type: string }[]
  >([]);
  const [disputeOrderId, setDisputeOrderId] = useState<number | null>(null);

  // Track whether current orders are constructed (fake IDs) vs real
  const isConstructedRef = useRef(false);

  // ─── Resolve real order ID ─────────────────────────────────
  // When using constructed orders, the `id` is actually the product_id.
  // We need to find the real order ID from the backend.
  const resolveRealOrderId = useCallback(
    async (orderId: number, productId: number): Promise<number> => {
      // If we already have real orders, use the ID directly
      if (!isConstructedRef.current) {
        return orderId;
      }

      // Constructed orders: id === product_id. Fetch real orders to find the match.
      try {
        const realOrders = await apiService.order.getMyOrders();
        if (Array.isArray(realOrders) && realOrders.length > 0) {
          const match = realOrders.find((o) => o.product_id === productId);
          if (match) {
            isConstructedRef.current = false;
            setOrders(realOrders);
            return match.id;
          }
        }
      } catch {
        // GET /users/me/orders failed
      }

      // Last resort: use what we have
      return orderId;
    },
    [],
  );

  // ─── Fetch Orders ──────────────────────────────────────────
  const fetchOrders = useCallback(async () => {
    try {
      // Try the real orders endpoint first
      const data = await apiService.order.getMyOrders();
      if (Array.isArray(data) && data.length > 0) {
        // Real orders found — mark role + ensure deadline_at for pending orders
        const tagged = data.map((o) => {
          const role =
            o.my_role ??
            (user?.id && o.seller_id === user.id ? "seller" : "buyer");
          // Compute deadline locally if backend doesn't provide one
          let deadline = o.deadline_at;
          if (!deadline && isPendingConfirm(o.status) && o.created_at) {
            deadline = new Date(
              new Date(o.created_at).getTime() + 24 * 60 * 60 * 1000,
            ).toISOString();
          }
          return { ...o, my_role: role, deadline_at: deadline };
        });
        isConstructedRef.current = false;
        setOrders(tagged as Order[]);
        return;
      }
      // API returned empty array — fall through to constructed fallback
      throw new Error("empty");
    } catch {
      // Fallback: construct orders from both buyer wins AND seller products
      if (user?.id) {
        try {
          const [buyerOrders, sellerOrders] = await Promise.all([
            apiService.order
              .getMyOrdersConstructed(user.id)
              .catch(() => [] as Order[]),
            apiService.order
              .getMySellerOrdersConstructed(user.id)
              .catch(() => [] as Order[]),
          ]);

          // Merge, dedup by product_id (buyer order takes precedence if same product)
          const seen = new Set<number>();
          const merged: Order[] = [];
          for (const o of [...buyerOrders, ...sellerOrders]) {
            if (!seen.has(o.product_id)) {
              seen.add(o.product_id);
              merged.push(o);
            }
          }

          isConstructedRef.current = true;
          setOrders(merged);
        } catch (e2: any) {
          console.error("Failed to construct orders:", e2.message);
        }
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchOrders();
  }, [fetchOrders]);

  // ─── Filter orders by tab ─────────────────────────────────
  const filteredOrders =
    activeTab === "all"
      ? orders
      : orders.filter((o) => getOrderTab(o) === activeTab);

  const tabCounts = {
    all: orders.length,
    won: orders.filter((o) => getOrderTab(o) === "won").length,
    shipping: orders.filter((o) => getOrderTab(o) === "shipping").length,
    completed: orders.filter((o) => getOrderTab(o) === "completed").length,
    problem: orders.filter((o) => getOrderTab(o) === "problem").length,
  };

  // ─── Open detail & refresh from API ────────────────────────
  const openOrderDetail = async (order: Order) => {
    setSelectedOrder(order);
    setModalVisible(true);

    let enrichedOrder = order;

    // 1) Try the real order detail endpoint
    try {
      const detail = await apiService.order.getOrderDetail(order.id);
      enrichedOrder = {
        ...detail,
        // Preserve locally-computed deadline if API doesn't return one
        deadline_at: detail.deadline_at || order.deadline_at,
        // Preserve role + product fallback from original constructed order
        my_role: detail.my_role ?? order.my_role,
        product: detail.product ?? order.product,
      };
    } catch {
      // order endpoint likely 404 — continue with list-level data
    }

    // 2) Always fetch full product detail to get seller info (email, profile_image)
    try {
      const productId =
        enrichedOrder.product_id ||
        enrichedOrder.product?.id ||
        order.product_id ||
        order.product?.id;
      if (productId) {
        const fullProduct = await apiService.product.getProduct(productId);
        if (fullProduct?.user) {
          enrichedOrder = {
            ...enrichedOrder,
            seller: {
              ...(enrichedOrder.seller || ({} as any)),
              id: fullProduct.user.id,
              name: fullProduct.user.name,
              email:
                fullProduct.user.email || enrichedOrder.seller?.email || "",
              phone_number:
                fullProduct.user.phone_number ||
                enrichedOrder.seller?.phone_number ||
                null,
              profile_image:
                fullProduct.user.profile_image ||
                enrichedOrder.seller?.profile_image ||
                null,
            },
          };
        }
      }
    } catch {
      // product detail also failed — keep what we have
    }

    setSelectedOrder(enrichedOrder);
    setOrders((prev) =>
      prev.map((o) => (o.id === enrichedOrder.id ? enrichedOrder : o)),
    );
  };

  // ─── Confirm Order (Buyer) ─────────────────────────────────
  const handleConfirm = (orderId: number, productId: number) => {
    Alert.alert(
      "ยืนยันการติดต่อ",
      "คุณได้ติดต่อกับผู้ขายเรื่องการจัดส่งสินค้าเรียบร้อยแล้วใช่ไหม?",
      [
        { text: "ยกเลิก" },
        {
          text: "ยืนยัน",
          onPress: async () => {
            setActionLoading(true);
            try {
              const realId = await resolveRealOrderId(orderId, productId);
              const updated = await apiService.order.confirmOrder(realId);
              // Refresh orders to get real IDs after a successful action
              try {
                const freshOrders = await apiService.order.getMyOrders();
                if (Array.isArray(freshOrders) && freshOrders.length > 0) {
                  isConstructedRef.current = false;
                  setOrders(freshOrders);
                  const freshSelected = freshOrders.find(
                    (o) => o.product_id === productId,
                  );
                  setSelectedOrder(freshSelected ?? updated);
                } else {
                  setOrders((prev) =>
                    prev.map((o) => (o.id === orderId ? updated : o)),
                  );
                  setSelectedOrder((prev) =>
                    prev && prev.id === orderId ? updated : prev,
                  );
                }
              } catch {
                setOrders((prev) =>
                  prev.map((o) => (o.id === orderId ? updated : o)),
                );
                setSelectedOrder((prev) =>
                  prev && prev.id === orderId ? updated : prev,
                );
              }
              Alert.alert("สำเร็จ", "ยืนยันการติดต่อเรียบร้อยแล้ว");
            } catch (error: any) {
              const msg = error.message || "";
              const is404 =
                msg.includes("not found") ||
                msg.includes("404") ||
                msg.includes("Not Found");
              Alert.alert(
                "เกิดข้อผิดพลาด",
                is404
                  ? "ระบบคำสั่งซื้อยังไม่พร้อมใช้งาน กรุณาติดต่อผู้ดูแลระบบ"
                  : msg || "ไม่สามารถยืนยันคำสั่งซื้อได้ กรุณาลองใหม่อีกครั้ง",
              );
            } finally {
              setActionLoading(false);
            }
          },
        },
      ],
    );
  };

  // ─── Ship Order (Seller) ───────────────────────────────────
  const handleShip = (orderId: number, productId: number) => {
    Alert.alert(
      "ยืนยันการจัดส่ง",
      "คุณได้จัดส่งสินค้าให้ผู้ซื้อแล้วใช่ไหม? ผู้ซื้อจะได้รับการแจ้งเตือน",
      [
        { text: "ยกเลิก" },
        {
          text: "ยืนยัน",
          onPress: async () => {
            setActionLoading(true);
            try {
              const realId = await resolveRealOrderId(orderId, productId);
              const updated = await apiService.order.shipOrder(realId);
              try {
                const freshOrders = await apiService.order.getMyOrders();
                if (Array.isArray(freshOrders) && freshOrders.length > 0) {
                  isConstructedRef.current = false;
                  setOrders(freshOrders);
                  const freshSelected = freshOrders.find(
                    (o) => o.product_id === productId,
                  );
                  setSelectedOrder(freshSelected ?? updated);
                } else {
                  setOrders((prev) =>
                    prev.map((o) => (o.id === orderId ? updated : o)),
                  );
                  setSelectedOrder((prev) =>
                    prev && prev.id === orderId ? updated : prev,
                  );
                }
              } catch {
                setOrders((prev) =>
                  prev.map((o) => (o.id === orderId ? updated : o)),
                );
                setSelectedOrder((prev) =>
                  prev && prev.id === orderId ? updated : prev,
                );
              }
              Alert.alert("สำเร็จ", "แจ้งจัดส่งสินค้าเรียบร้อยแล้ว");
            } catch (error: any) {
              const msg = error.message || "";
              Alert.alert(
                "เกิดข้อผิดพลาด",
                msg || "ไม่สามารถแจ้งจัดส่งได้ กรุณาลองใหม่อีกครั้ง",
              );
            } finally {
              setActionLoading(false);
            }
          },
        },
      ],
    );
  };

  // ─── Receive Order (Buyer) ─────────────────────────────────
  // Review Modal States
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewOrderId, setReviewOrderId] = useState<number | null>(null);
  const [reviewProductId, setReviewProductId] = useState<number | null>(null);
  const [reviewSellerId, setReviewSellerId] = useState<number | null>(null);
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

  const handleReceived = (
    orderId: number,
    productId: number,
    sellerId: number,
  ) => {
    setReviewOrderId(orderId);
    setReviewProductId(productId);
    setReviewSellerId(sellerId);
    setReviewRating(0);
    setModalVisible(false);
    setTimeout(() => {
      setShowReviewModal(true);
    }, 400);
  };

  const handleSubmitReview = async () => {
    if (reviewRating === 0) {
      Alert.alert("กรุณาให้คะแนน", "กรุณากดดาวเพื่อให้คะแนนผู้ขาย");
      return;
    }
    if (reviewOrderId !== null && reviewProductId !== null) {
      setActionLoading(true);
      try {
        const realId = await resolveRealOrderId(reviewOrderId, reviewProductId);
        // 1. Confirm receipt
        const updated = await apiService.order.receiveOrder(realId);

        // 2. Rate seller
        if (reviewSellerId) {
          try {
            await apiService.order.rateSeller(
              reviewSellerId,
              realId,
              reviewRating,
            );
          } catch (rateError: any) {
            console.warn("Rate seller failed:", rateError.message);
          }
        }

        // Refresh orders with real data
        try {
          const freshOrders = await apiService.order.getMyOrders();
          if (Array.isArray(freshOrders) && freshOrders.length > 0) {
            isConstructedRef.current = false;
            setOrders(freshOrders);
            const freshSelected = freshOrders.find(
              (o) => o.product_id === reviewProductId,
            );
            setSelectedOrder(freshSelected ?? updated);
          } else {
            setOrders((prev) =>
              prev.map((o) => (o.id === reviewOrderId ? updated : o)),
            );
            setSelectedOrder((prev) =>
              prev && prev.id === reviewOrderId ? updated : prev,
            );
          }
        } catch {
          setOrders((prev) =>
            prev.map((o) => (o.id === reviewOrderId ? updated : o)),
          );
          setSelectedOrder((prev) =>
            prev && prev.id === reviewOrderId ? updated : prev,
          );
        }
        setShowReviewModal(false);
        Alert.alert(
          "ขอบคุณสำหรับรีวิว!",
          `คุณให้คะแนนผู้ขาย ${reviewRating} ดาว`,
        );
      } catch (error: any) {
        const msg = error.message || "";
        const is404 =
          msg.includes("not found") ||
          msg.includes("404") ||
          msg.includes("Not Found");
        Alert.alert(
          "เกิดข้อผิดพลาด",
          is404
            ? "ระบบคำสั่งซื้อยังไม่พร้อมใช้งาน กรุณาติดต่อผู้ดูแลระบบ"
            : msg || "ไม่สามารถยืนยันการรับสินค้าได้ กรุณาลองใหม่อีกครั้ง",
        );
      } finally {
        setActionLoading(false);
      }
    }
  };

  // ─── Dispute Order ─────────────────────────────────────────
  const [disputeProductId, setDisputeProductId] = useState<number | null>(null);

  const openDisputeModal = (orderId: number, productId: number) => {
    setDisputeOrderId(orderId);
    setDisputeProductId(productId);
    setDisputeReason("");
    setDisputeImages([]);
    setModalVisible(false);
    setTimeout(() => {
      setShowDisputeModal(true);
    }, 400);
  };

  const pickDisputeImage = async () => {
    if (disputeImages.length >= 5) {
      Alert.alert("จำกัดจำนวนรูป", "อัพโหลดได้สูงสุด 5 รูป");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.7,
      allowsMultipleSelection: true,
      selectionLimit: 5 - disputeImages.length,
    });
    if (!result.canceled && result.assets) {
      const newImages = result.assets.map((asset) => ({
        uri: asset.uri,
        name: asset.fileName || `evidence_${Date.now()}.jpg`,
        type: asset.mimeType || "image/jpeg",
      }));
      setDisputeImages((prev) => [...prev, ...newImages].slice(0, 5));
    }
  };

  const handleSubmitDispute = async () => {
    if (!disputeReason.trim()) {
      Alert.alert("กรุณากรอกเหตุผล", "กรุณาอธิบายปัญหาที่พบ");
      return;
    }
    if (disputeOrderId !== null && disputeProductId !== null) {
      setActionLoading(true);
      try {
        const realId = await resolveRealOrderId(
          disputeOrderId,
          disputeProductId,
        );
        const updated = await apiService.order.disputeOrder(
          realId,
          disputeReason,
          disputeImages.length > 0 ? disputeImages : undefined,
        );
        // Refresh orders with real data
        try {
          const freshOrders = await apiService.order.getMyOrders();
          if (Array.isArray(freshOrders) && freshOrders.length > 0) {
            isConstructedRef.current = false;
            setOrders(freshOrders);
            const freshSelected = freshOrders.find(
              (o) => o.product_id === disputeProductId,
            );
            setSelectedOrder(freshSelected ?? updated);
          } else {
            setOrders((prev) =>
              prev.map((o) => (o.id === disputeOrderId ? updated : o)),
            );
            setSelectedOrder((prev) =>
              prev && prev.id === disputeOrderId ? updated : prev,
            );
          }
        } catch {
          setOrders((prev) =>
            prev.map((o) => (o.id === disputeOrderId ? updated : o)),
          );
          setSelectedOrder((prev) =>
            prev && prev.id === disputeOrderId ? updated : prev,
          );
        }
        setShowDisputeModal(false);
        Alert.alert("ส่งเรื่องเรียบร้อย", "ทีมงานจะตรวจสอบและติดต่อกลับ");
      } catch (error: any) {
        const msg = error.message || "";
        const is404 =
          msg.includes("not found") ||
          msg.includes("404") ||
          msg.includes("Not Found");
        Alert.alert(
          "เกิดข้อผิดพลาด",
          is404
            ? "ระบบคำสั่งซื้อยังไม่พร้อมใช้งาน กรุณาติดต่อผู้ดูแลระบบ"
            : msg || "ไม่สามารถส่งเรื่องร้องเรียนได้ กรุณาลองใหม่อีกครั้ง",
        );
      } finally {
        setActionLoading(false);
      }
    }
  };

  // Derived values used in the detail modal
  const modalIsExpiredByDeadline =
    !!selectedOrder &&
    isPendingConfirm(selectedOrder.status) &&
    isDeadlinePassed(selectedOrder);
  const modalMyRole: "buyer" | "seller" = selectedOrder
    ? (selectedOrder.my_role ??
      (user?.id === selectedOrder.seller_id ? "seller" : "buyer"))
    : "buyer";

  if (loading) {
    return (
      <View
        style={[
          styles.container,
          { justifyContent: "center", alignItems: "center" },
        ]}
      >
        <LottieView
          source={require("@/assets/animations/loading.json")}
          autoPlay
          loop
          style={{ width: 120, height: 120 }}
        />
      </View>
    );
  }

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
            {t("verifyProductTitle")}
          </AppText>
          <View style={{ width: 40 }} />
        </SafeAreaView>
      </LinearGradient>

      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {[
            { key: "all" as UITab, label: t("tabAll") },
            { key: "won" as UITab, label: t("tabWon") },
            { key: "shipping" as UITab, label: t("tabShipping") },
            { key: "completed" as UITab, label: t("tabDone") },
            { key: "problem" as UITab, label: t("tabProblem") },
          ].map((tab) => (
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
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {filteredOrders.length === 0 ? (
          <View style={styles.emptyState}>
            <LottieView
              source={require("@/assets/animations/empty.json")}
              autoPlay
              loop
              style={{ width: 180, height: 180 }}
            />
            <AppText
              weight="semibold"
              style={styles.emptyTitle}
              numberOfLines={1}
            >
              {t("noOrdersFound")}
            </AppText>
            <AppText weight="regular" style={styles.emptySub} numberOfLines={2}>
              {activeTab === "all" ? t("noWonAuctions") : t("noOrdersInStatus")}
            </AppText>
          </View>
        ) : (
          filteredOrders.map((order) => {
            const productImage = getOrderProductImage(order);
            const deadlinePassed =
              isPendingConfirm(order.status) && isDeadlinePassed(order);
            const cardRole =
              order.my_role ??
              (user?.id === order.seller_id ? "seller" : "buyer");
            const statusConfig = deadlinePassed
              ? cardRole === "seller"
                ? {
                    label: "สิ้นสุดแล้ว",
                    color: "#D32F2F",
                    bg: "#FFEBEE",
                    icon: "flag-outline",
                  }
                : {
                    label: t("statusExpired"),
                    color: "#D32F2F",
                    bg: "#FFEBEE",
                    icon: "close-circle-outline",
                  }
              : getStatusConfig(order.status, t);
            const isProblem =
              order.status === "expired" ||
              order.status === "cancelled" ||
              order.status === "disputed" ||
              deadlinePassed;
            const isConfirmedSeller =
              order.status === "confirmed" && cardRole === "seller";
            return (
              <View
                key={order.id}
                style={[styles.productCard, isProblem && { opacity: 0.6 }]}
              >
                <TouchableOpacity
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    flex: 1,
                  }}
                  onPress={() => openOrderDetail(order)}
                  activeOpacity={0.7}
                >
                  {productImage ? (
                    <Image source={productImage} style={styles.productImage} />
                  ) : (
                    <View
                      style={[
                        styles.productImage,
                        {
                          justifyContent: "center",
                          alignItems: "center",
                          backgroundColor: "#F0F0F0",
                        },
                      ]}
                    >
                      <Ionicons name="cube-outline" size={28} color="#9CA3AF" />
                    </View>
                  )}
                  <View style={styles.productInfo}>
                    <AppText
                      weight="semibold"
                      style={[
                        styles.productName,
                        isProblem && {
                          textDecorationLine: "line-through",
                          color: "#9CA3AF",
                        },
                      ]}
                      numberOfLines={1}
                    >
                      {order.product?.name || `Order #${order.id}`}
                    </AppText>
                    <AppText
                      weight="regular"
                      style={styles.productDate}
                      numberOfLines={1}
                    >
                      {t("wonOn")} {formatDate(order.created_at)}
                    </AppText>
                    {isPendingConfirm(order.status) &&
                      !deadlinePassed &&
                      order.deadline_at && (
                        <CountdownTimer
                          deadlineAt={order.deadline_at}
                          onExpire={() => fetchOrders()}
                          size="small"
                          t={t}
                        />
                      )}
                    {(!isPendingConfirm(order.status) || deadlinePassed) && (
                      <AppText
                        weight="bold"
                        style={styles.productPrice}
                        numberOfLines={1}
                        adjustsFontSizeToFit
                      >
                        ฿{parseFloat(order.final_price).toLocaleString("en-US")}
                      </AppText>
                    )}
                  </View>
                </TouchableOpacity>
                {isConfirmedSeller ? (
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => handleShip(order.id, order.product_id)}
                    disabled={actionLoading}
                    style={styles.cardShipButton}
                  >
                    {actionLoading ? (
                      <ActivityIndicator size="small" color="#fff" />
                    ) : (
                      <AppText
                        weight="bold"
                        style={styles.cardShipButtonText}
                        numberOfLines={1}
                      >
                        <Ionicons name="cube-outline" size={14} color="#fff" />{" "}
                        จัดส่ง
                      </AppText>
                    )}
                  </TouchableOpacity>
                ) : (
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
                      <Ionicons
                        name={statusConfig.icon as any}
                        size={11}
                        color={statusConfig.color}
                      />{" "}
                      {statusConfig.label}
                    </AppText>
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>

      {/* ═══════════════════════════════════════════ */}
      {/* Product Detail Modal */}
      {/* ═══════════════════════════════════════════ */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        {selectedOrder && (
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
                {t("orderDetails")}
              </AppText>
              <View style={{ width: 28 }} />
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 40 }}
            >
              {/* Product Info */}
              <View style={styles.modalProductSection}>
                {getOrderProductImage(selectedOrder) ? (
                  <Image
                    source={getOrderProductImage(selectedOrder)!}
                    style={styles.modalProductImage}
                    contentFit="contain"
                  />
                ) : (
                  <View
                    style={[
                      styles.modalProductImage,
                      {
                        justifyContent: "center",
                        alignItems: "center",
                        backgroundColor: "#F0F0F0",
                      },
                    ]}
                  >
                    <Ionicons name="cube-outline" size={48} color="#9CA3AF" />
                  </View>
                )}
                <AppText
                  weight="bold"
                  numberOfLines={2}
                  style={styles.modalProductName}
                >
                  {selectedOrder.product?.name || `Order #${selectedOrder.id}`}
                </AppText>
                <View style={styles.modalPriceRow}>
                  <AppText
                    weight="regular"
                    style={styles.modalPriceLabel}
                    numberOfLines={1}
                  >
                    {t("winningPrice")}
                  </AppText>
                  <AppText
                    weight="bold"
                    style={styles.modalPriceValue}
                    numberOfLines={1}
                    adjustsFontSizeToFit
                  >
                    ฿
                    {parseFloat(selectedOrder.final_price).toLocaleString(
                      "en-US",
                    )}
                  </AppText>
                </View>
                <View style={styles.modalDateRow}>
                  <AppText
                    weight="regular"
                    style={styles.modalDateLabel}
                    numberOfLines={1}
                  >
                    {t("wonOn")}
                  </AppText>
                  <AppText
                    weight="medium"
                    style={styles.modalDateValue}
                    numberOfLines={1}
                  >
                    {formatDate(selectedOrder.created_at)}
                  </AppText>
                </View>
              </View>

              {/* Countdown Timer — only for pending_confirmation / pending_buyer_confirm */}
              {isPendingConfirm(selectedOrder.status) &&
                selectedOrder.deadline_at && (
                  <View style={styles.countdownSection}>
                    <CountdownTimer
                      deadlineAt={selectedOrder.deadline_at}
                      onExpire={() => fetchOrders()}
                      t={t}
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
                  {t("orderProgress")}
                </AppText>
                <View style={styles.progressTrack}>
                  {/* Step 1: Won */}
                  <View style={styles.progressStep}>
                    <View
                      style={[
                        styles.progressDot,
                        selectedOrder.status === "expired" ||
                        selectedOrder.status === "cancelled" ||
                        modalIsExpiredByDeadline
                          ? { backgroundColor: "#D32F2F" }
                          : styles.progressDotDone,
                      ]}
                    >
                      <AppText style={{ fontSize: 12, color: "#fff" }}>
                        {selectedOrder.status === "expired" ||
                        selectedOrder.status === "cancelled" ||
                        modalIsExpiredByDeadline
                          ? "✗"
                          : "✓"}
                      </AppText>
                    </View>
                    <AppText
                      weight="semibold"
                      style={styles.progressLabel}
                      numberOfLines={1}
                    >
                      {t("wonAuction")}
                    </AppText>
                  </View>

                  <View
                    style={[
                      styles.progressLine,
                      (selectedOrder.status === "expired" ||
                        selectedOrder.status === "cancelled" ||
                        modalIsExpiredByDeadline) && {
                        backgroundColor: "#EF9A9A",
                      },
                      !isPendingConfirm(selectedOrder.status) &&
                        selectedOrder.status !== "expired" &&
                        selectedOrder.status !== "cancelled" &&
                        !modalIsExpiredByDeadline &&
                        styles.progressLineDone,
                    ]}
                  />

                  {/* Step 2: Confirmed */}
                  <View style={styles.progressStep}>
                    <View
                      style={[
                        styles.progressDot,
                        (selectedOrder.status === "expired" ||
                          selectedOrder.status === "cancelled" ||
                          modalIsExpiredByDeadline) && {
                          backgroundColor: "#D32F2F",
                        },
                        !isPendingConfirm(selectedOrder.status) &&
                          selectedOrder.status !== "expired" &&
                          selectedOrder.status !== "cancelled" &&
                          !modalIsExpiredByDeadline &&
                          styles.progressDotDone,
                      ]}
                    >
                      {selectedOrder.status === "expired" ||
                      selectedOrder.status === "cancelled" ||
                      modalIsExpiredByDeadline ? (
                        <AppText style={{ fontSize: 12, color: "#fff" }}>
                          ✗
                        </AppText>
                      ) : !isPendingConfirm(selectedOrder.status) ? (
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
                        !isPendingConfirm(selectedOrder.status) &&
                        selectedOrder.status !== "expired" &&
                        selectedOrder.status !== "cancelled" &&
                        !modalIsExpiredByDeadline
                          ? "semibold"
                          : "regular"
                      }
                      style={[
                        styles.progressLabel,
                        (isPendingConfirm(selectedOrder.status) ||
                          selectedOrder.status === "expired" ||
                          selectedOrder.status === "cancelled" ||
                          modalIsExpiredByDeadline) && {
                          color:
                            selectedOrder.status === "expired" ||
                            selectedOrder.status === "cancelled" ||
                            modalIsExpiredByDeadline
                              ? "#D32F2F"
                              : "#9CA3AF",
                        },
                      ]}
                    >
                      {selectedOrder.status === "expired" ||
                      modalIsExpiredByDeadline
                        ? t("statusExpired")
                        : selectedOrder.status === "cancelled"
                          ? t("statusCancelled")
                          : t("statusConfirmed")}
                    </AppText>
                  </View>

                  <View
                    style={[
                      styles.progressLine,
                      (selectedOrder.status === "shipped" ||
                        selectedOrder.status === "completed") &&
                        styles.progressLineDone,
                    ]}
                  />

                  {/* Step 3: Shipped */}
                  <View style={styles.progressStep}>
                    <View
                      style={[
                        styles.progressDot,
                        (selectedOrder.status === "shipped" ||
                          selectedOrder.status === "completed") &&
                          styles.progressDotDone,
                      ]}
                    >
                      {selectedOrder.status === "shipped" ||
                      selectedOrder.status === "completed" ? (
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
                        selectedOrder.status === "shipped" ||
                        selectedOrder.status === "completed"
                          ? "semibold"
                          : "regular"
                      }
                      style={[
                        styles.progressLabel,
                        selectedOrder.status !== "shipped" &&
                          selectedOrder.status !== "completed" && {
                            color: "#9CA3AF",
                          },
                      ]}
                    >
                      {t("statusShipped")}
                    </AppText>
                  </View>

                  <View
                    style={[
                      styles.progressLine,
                      selectedOrder.status === "completed" &&
                        styles.progressLineDone,
                    ]}
                  />

                  {/* Step 4: Received */}
                  <View style={styles.progressStep}>
                    <View
                      style={[
                        styles.progressDot,
                        selectedOrder.status === "completed" &&
                          styles.progressDotDone,
                      ]}
                    >
                      {selectedOrder.status === "completed" ? (
                        <AppText style={{ fontSize: 12, color: "#fff" }}>
                          ✓
                        </AppText>
                      ) : (
                        <AppText style={{ fontSize: 10, color: "#9CA3AF" }}>
                          4
                        </AppText>
                      )}
                    </View>
                    <AppText
                      weight={
                        selectedOrder.status === "completed"
                          ? "semibold"
                          : "regular"
                      }
                      style={[
                        styles.progressLabel,
                        selectedOrder.status !== "completed" && {
                          color: "#9CA3AF",
                        },
                      ]}
                    >
                      {t("receivedItem")}
                    </AppText>
                  </View>
                </View>
              </View>

              {/* Seller Contact */}
              {selectedOrder.seller && (
                <View style={styles.sellerSection}>
                  <AppText
                    weight="bold"
                    style={styles.sellerSectionTitle}
                    numberOfLines={1}
                  >
                    {t("sellerContact")}
                  </AppText>
                  <View style={styles.sellerCard}>
                    {selectedOrder.seller.profile_image ? (
                      <Image
                        source={{
                          uri:
                            getFullImageUrl(
                              selectedOrder.seller.profile_image,
                            ) || undefined,
                        }}
                        style={styles.sellerAvatar}
                      />
                    ) : (
                      <View
                        style={[
                          styles.sellerAvatar,
                          {
                            justifyContent: "center",
                            alignItems: "center",
                            backgroundColor: "#E3F2FD",
                          },
                        ]}
                      >
                        <Ionicons
                          name="person-outline"
                          size={22}
                          color="#2196F3"
                        />
                      </View>
                    )}
                    <View style={{ flex: 1 }}>
                      <AppText
                        weight="semibold"
                        style={styles.sellerName}
                        numberOfLines={1}
                      >
                        {selectedOrder.seller.name}
                      </AppText>
                      {selectedOrder.seller.phone_number && (
                        <View style={styles.sellerContactRow}>
                          <Image
                            source={image.phone}
                            style={{
                              width: 14,
                              height: 14,
                              marginRight: 8,
                            }}
                            tintColor="#6B7280"
                          />
                          <AppText
                            weight="regular"
                            style={styles.sellerContact}
                            numberOfLines={1}
                          >
                            {selectedOrder.seller.phone_number}
                          </AppText>
                        </View>
                      )}
                      {selectedOrder.seller.email ? (
                        <View style={styles.sellerContactRow}>
                          <Image
                            source={image.mail}
                            style={{
                              width: 16,
                              height: 12,
                              marginRight: 8,
                            }}
                            tintColor="#6B7280"
                          />
                          <AppText
                            weight="regular"
                            style={styles.sellerContact}
                            numberOfLines={1}
                          >
                            {selectedOrder.seller.email}
                          </AppText>
                        </View>
                      ) : null}
                    </View>
                  </View>
                </View>
              )}

              {/* ─── Action Section per Status ─────────────── */}
              {isPendingConfirm(selectedOrder.status) &&
                !modalIsExpiredByDeadline && (
                  <View style={styles.actionSection}>
                    <View style={styles.actionNote}>
                      <Image
                        source={image.info}
                        style={{
                          width: 16,
                          height: 16,
                          marginRight: 10,
                        }}
                        tintColor="#FF9500"
                      />
                      <AppText
                        weight="regular"
                        style={styles.actionNoteText}
                        numberOfLines={2}
                      >
                        {t("confirmContactNote")}
                      </AppText>
                    </View>
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() =>
                        handleConfirm(
                          selectedOrder.id,
                          selectedOrder.product_id,
                        )
                      }
                      disabled={actionLoading}
                    >
                      <LinearGradient
                        colors={["#00112E", "#003994"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.actionButton}
                      >
                        {actionLoading ? (
                          <ActivityIndicator color="#fff" />
                        ) : (
                          <AppText
                            weight="bold"
                            style={styles.actionButtonText}
                            numberOfLines={1}
                          >
                            {t("confirmContact")}
                          </AppText>
                        )}
                      </LinearGradient>
                    </TouchableOpacity>
                  </View>
                )}

              {/* ─── Deadline Expired (no contact) ─────────── */}
              {isPendingConfirm(selectedOrder.status) &&
                modalIsExpiredByDeadline && (
                  <View style={styles.actionSection}>
                    <View style={styles.expiredCard}>
                      <View style={styles.expiredIconCircle}>
                        <AppText style={{ fontSize: 32 }}>
                          <Ionicons
                            name={
                              modalMyRole === "seller"
                                ? "flag-outline"
                                : "close-circle-outline"
                            }
                            size={32}
                            color="#D32F2F"
                          />
                        </AppText>
                      </View>
                      <AppText
                        weight="bold"
                        style={styles.expiredTitle}
                        numberOfLines={1}
                      >
                        {modalMyRole === "seller"
                          ? "สินค้าสิ้นสุดแล้ว"
                          : "หมดเวลาการติดต่อ"}
                      </AppText>
                      <AppText
                        weight="regular"
                        style={styles.expiredSub}
                        numberOfLines={4}
                      >
                        {modalMyRole === "seller"
                          ? "ผู้ซื้อไม่ได้ยืนยันการติดต่อภายในเวลาที่กำหนด สินค้าของคุณพร้อมนำออกประมูลใหม่ได้"
                          : "ไม่มีการติดต่อภายในระยะเวลาที่กำหนด คำสั่งซื้อนี้ถูกยกเลิกโดยอัตโนมัติ กรุณาติดต่อทีมงานหากมีข้อสงสัย"}
                      </AppText>
                    </View>
                  </View>
                )}

              {(selectedOrder.status === "confirmed" ||
                selectedOrder.status === "shipped") && (
                <View style={styles.actionSection}>
                  {(() => {
                    const myRole =
                      selectedOrder.my_role ??
                      (user?.id === selectedOrder.seller_id
                        ? "seller"
                        : "buyer");
                    return (
                      <View style={styles.shippingCard}>
                        <View style={styles.shippingIconCircle}>
                          <Ionicons
                            name="cube-outline"
                            size={28}
                            color="#7B1FA2"
                          />
                        </View>
                        <AppText
                          weight="semibold"
                          style={styles.shippingTitle}
                          numberOfLines={1}
                        >
                          {selectedOrder.status === "confirmed"
                            ? myRole === "seller"
                              ? "กรุณาจัดส่งสินค้า"
                              : t("waitingSellerShip")
                            : t("waitingDelivery")}
                        </AppText>
                        <AppText
                          weight="regular"
                          style={styles.shippingSub}
                          numberOfLines={3}
                        >
                          {selectedOrder.status === "confirmed"
                            ? myRole === "seller"
                              ? "ผู้ซื้อยืนยันแล้ว กรุณาจัดส่งสินค้าภายใน 3 วัน"
                              : "The seller has been notified. Waiting for shipment."
                            : "Your product is being shipped. Once you receive it, press the button below to confirm."}
                        </AppText>

                        {/* Seller: Ship button */}
                        {myRole === "seller" &&
                          selectedOrder.status === "confirmed" && (
                            <TouchableOpacity
                              activeOpacity={0.8}
                              onPress={() =>
                                handleShip(
                                  selectedOrder.id,
                                  selectedOrder.product_id,
                                )
                              }
                              disabled={actionLoading}
                              style={{ marginTop: 16, width: "100%" }}
                            >
                              <LinearGradient
                                colors={["#7B1FA2", "#AB47BC"]}
                                start={{ x: 0, y: 0 }}
                                end={{ x: 1, y: 0 }}
                                style={styles.actionButton}
                              >
                                {actionLoading ? (
                                  <ActivityIndicator color="#fff" />
                                ) : (
                                  <AppText
                                    weight="bold"
                                    style={styles.actionButtonText}
                                    numberOfLines={1}
                                  >
                                    <Ionicons
                                      name="cube-outline"
                                      size={14}
                                      color="#fff"
                                    />{" "}
                                    แจ้งจัดส่งสินค้า
                                  </AppText>
                                )}
                              </LinearGradient>
                            </TouchableOpacity>
                          )}

                        {/* Buyer: Received + Dispute buttons */}
                        {myRole === "buyer" &&
                          selectedOrder.status === "shipped" && (
                            <>
                              <TouchableOpacity
                                activeOpacity={0.8}
                                onPress={() =>
                                  handleReceived(
                                    selectedOrder.id,
                                    selectedOrder.product_id,
                                    selectedOrder.seller_id,
                                  )
                                }
                                disabled={actionLoading}
                                style={{ marginTop: 16, width: "100%" }}
                              >
                                <LinearGradient
                                  colors={["#2EA200", "#3CD500"]}
                                  start={{ x: 0, y: 0 }}
                                  end={{ x: 1, y: 0 }}
                                  style={styles.actionButton}
                                >
                                  {actionLoading ? (
                                    <ActivityIndicator color="#fff" />
                                  ) : (
                                    <AppText
                                      weight="bold"
                                      style={styles.actionButtonText}
                                      numberOfLines={1}
                                    >
                                      {t("productReceived")}
                                    </AppText>
                                  )}
                                </LinearGradient>
                              </TouchableOpacity>
                              <TouchableOpacity
                                activeOpacity={0.8}
                                onPress={() =>
                                  openDisputeModal(
                                    selectedOrder.id,
                                    selectedOrder.product_id,
                                  )
                                }
                                disabled={actionLoading}
                                style={{ marginTop: 12, width: "100%" }}
                              >
                                <LinearGradient
                                  colors={["#da0303", "#ff4d4d"]}
                                  start={{ x: 0, y: 0 }}
                                  end={{ x: 1, y: 0 }}
                                  style={styles.actionButton}
                                >
                                  <AppText
                                    weight="bold"
                                    style={styles.actionButtonText}
                                    numberOfLines={1}
                                  >
                                    {t("reportIssue")}
                                  </AppText>
                                </LinearGradient>
                              </TouchableOpacity>
                            </>
                          )}
                      </View>
                    );
                  })()}
                </View>
              )}

              {selectedOrder.status === "completed" && (
                <View style={styles.actionSection}>
                  <View style={styles.completedCard}>
                    <View style={styles.completedIconCircle}>
                      <Ionicons
                        name="ribbon-outline"
                        size={32}
                        color="#4CAF50"
                      />
                    </View>
                    <AppText
                      weight="bold"
                      style={styles.completedTitle}
                      numberOfLines={1}
                    >
                      {t("completedTitle")}
                    </AppText>
                    <AppText
                      weight="regular"
                      style={styles.completedSub}
                      numberOfLines={3}
                    >
                      {t("completedSub")}
                    </AppText>
                  </View>
                </View>
              )}

              {selectedOrder.status === "disputed" && (
                <View style={styles.actionSection}>
                  <View
                    style={[styles.expiredCard, { backgroundColor: "#FFF3E0" }]}
                  >
                    <View style={styles.expiredIconCircle}>
                      <Ionicons
                        name="warning-outline"
                        size={32}
                        color="#E65100"
                      />
                    </View>
                    <AppText
                      weight="bold"
                      style={[styles.expiredTitle, { color: "#E65100" }]}
                      numberOfLines={1}
                    >
                      {t("underDispute")}
                    </AppText>
                    <AppText
                      weight="regular"
                      style={[styles.expiredSub, { color: "#F57C00" }]}
                      numberOfLines={5}
                    >
                      {selectedOrder.dispute_reason ||
                        "A dispute has been filed. Our team is reviewing the case."}
                    </AppText>
                  </View>
                </View>
              )}

              {(selectedOrder.status === "expired" ||
                selectedOrder.status === "cancelled") && (
                <View style={styles.actionSection}>
                  <View style={styles.expiredCard}>
                    <View style={styles.expiredIconCircle}>
                      <Ionicons
                        name="close-circle-outline"
                        size={32}
                        color="#D32F2F"
                      />
                    </View>
                    <AppText
                      weight="bold"
                      style={styles.expiredTitle}
                      numberOfLines={1}
                    >
                      {selectedOrder.status === "expired"
                        ? t("orderExpired")
                        : t("orderCancelled")}
                    </AppText>
                    <AppText
                      weight="regular"
                      style={styles.expiredSub}
                      numberOfLines={3}
                    >
                      {selectedOrder.status === "expired"
                        ? t("orderExpiredSub")
                        : t("orderCancelledSub")}
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
                disabled={actionLoading}
              >
                <LinearGradient
                  colors={
                    reviewRating > 0 ? ["#00112E", "#003994"] : ["#999", "#BBB"]
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.reviewSubmitGradient}
                >
                  {actionLoading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <AppText weight="bold" style={styles.reviewSubmitText}>
                      ส่งรีวิว
                    </AppText>
                  )}
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ═══════════════════════════════════════════ */}
      {/* Dispute Modal */}
      {/* ═══════════════════════════════════════════ */}
      <Modal
        visible={showDisputeModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowDisputeModal(false)}
      >
        <View style={styles.reviewOverlay}>
          <View style={styles.reviewModal}>
            <Ionicons
              name="warning-outline"
              size={40}
              color="#E65100"
              style={styles.reviewEmoji}
            />
            <AppText weight="bold" style={styles.reviewTitle} numberOfLines={1}>
              แจ้งปัญหา
            </AppText>
            <AppText weight="regular" style={styles.reviewSubtitle}>
              กรุณาอธิบายปัญหาที่พบเพื่อให้ทีมงาน{"\n"}ตรวจสอบ
            </AppText>

            {/* Reason Input */}
            <View style={[styles.reviewInputWrapper, { minHeight: 100 }]}>
              <AppTextInput
                placeholder="อธิบายปัญหาที่พบ..."
                value={disputeReason}
                onChangeText={setDisputeReason}
                multiline
                numberOfLines={4}
                style={styles.reviewInput}
                maxLength={1000}
              />
            </View>
            <AppText
              weight="regular"
              style={{
                fontSize: 11,
                color: "#9CA3AF",
                alignSelf: "flex-end",
                marginTop: -16,
                marginBottom: 12,
                marginRight: 4,
              }}
            >
              {disputeReason.length}/1000
            </AppText>

            {/* Evidence Images */}
            <TouchableOpacity
              onPress={pickDisputeImage}
              style={{
                flexDirection: "row",
                alignItems: "center",
                alignSelf: "flex-start",
                marginBottom: 8,
              }}
            >
              <AppText style={{ fontSize: 18, marginRight: 6 }}>📷</AppText>
              <AppText
                weight="medium"
                style={{ fontSize: 13, color: "#003994" }}
              >
                แนบรูปหลักฐาน ({disputeImages.length}/5)
              </AppText>
            </TouchableOpacity>
            {disputeImages.length > 0 && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={{ marginBottom: 16 }}
              >
                {disputeImages.map((img, index) => (
                  <View key={index} style={{ marginRight: 8 }}>
                    <Image
                      source={{ uri: img.uri }}
                      style={{
                        width: 60,
                        height: 60,
                        borderRadius: 8,
                      }}
                    />
                    <TouchableOpacity
                      onPress={() =>
                        setDisputeImages((prev) =>
                          prev.filter((_, i) => i !== index),
                        )
                      }
                      style={{
                        position: "absolute",
                        top: -6,
                        right: -6,
                        backgroundColor: "#D32F2F",
                        borderRadius: 10,
                        width: 20,
                        height: 20,
                        justifyContent: "center",
                        alignItems: "center",
                      }}
                    >
                      <AppText
                        weight="bold"
                        style={{ color: "#fff", fontSize: 10 }}
                      >
                        ✕
                      </AppText>
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            )}

            {/* Buttons */}
            <View style={styles.reviewButtonsRow}>
              <TouchableOpacity
                onPress={() => setShowDisputeModal(false)}
                style={styles.reviewCancelBtn}
                activeOpacity={0.7}
              >
                <AppText weight="semibold" style={styles.reviewCancelText}>
                  ยกเลิก
                </AppText>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleSubmitDispute}
                style={styles.reviewSubmitBtn}
                activeOpacity={0.8}
                disabled={actionLoading}
              >
                <LinearGradient
                  colors={
                    disputeReason.trim()
                      ? ["#da0303", "#ff4d4d"]
                      : ["#999", "#BBB"]
                  }
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.reviewSubmitGradient}
                >
                  {actionLoading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <AppText weight="bold" style={styles.reviewSubmitText}>
                      ส่งเรื่อง
                    </AppText>
                  )}
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
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 60,
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
  cardShipButton: {
    backgroundColor: "#7B1FA2",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    minWidth: 76,
  },
  cardShipButtonText: {
    fontSize: 12,
    color: "#fff",
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
