import { image } from "@/assets/images";
import Ionicons from "@expo/vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import LottieView from "lottie-react-native";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from "../contexts/AuthContext";
import { apiService, getFullImageUrl } from "../utils/api";
import { AdminStats, User } from "../utils/api/types";
import { AppText } from "./components/appText";

const { width } = Dimensions.get("window");

// ─── Types ───────────────────────────────────────────────────
type IncomingProduct = {
  id: string;
  name: string;
  image: any;
  seller: string;
  sellerEmail: string;
  category: string;
  startingBid: number;
  buyNowPrice: number;
  minIncrement: number;
  description: string;
  submittedAt: string;
  scheduledStart: string;
  scheduledEnd: string;
  status: "pending" | "approved" | "rejected";
};

type ApiReport = {
  id: number;
  reporter_id: number;
  reported_user_id: number;
  reported_product_id: number | null;
  order_id: number | null;
  type: string;
  description: string;
  evidence_images: string[];
  status: "pending" | "reviewing" | "resolved" | "dismissed";
  admin_note: string | null;
  admin_reply: string | null;
  admin_reply_at: string | null;
  admin_reply_by: number | null;
  resolved_at: string | null;
  reviewing_at: string | null;
  created_at: string;
  updated_at: string;
  report_code: string;
  timeline: { status: string; label: string; date: string }[];
  reporter: { id: number; name: string; email: string } | null;
  reported_user: { id: number; name: string; email: string } | null;
  reported_product: {
    id: number;
    name: string;
    tag?: string;
    is_certified?: boolean;
    certificate?: any;
  } | null;
  order: any | null;
  replied_by: any | null;
};

// ─── Mock Data ───────────────────────────────────────────────
const MOCK_INCOMING: IncomingProduct[] = [
  {
    id: "INC-001",
    name: "MacBook Pro M4 Max",
    image: image.macbook,
    seller: "TechStore Bangkok",
    sellerEmail: "tech@store.com",
    category: "Electronics",
    startingBid: 45000,
    buyNowPrice: 89000,
    minIncrement: 500,
    description:
      "MacBook Pro M4 Max 16 นิ้ว RAM 48GB SSD 1TB สภาพใหม่ 99% ประกันศูนย์เหลือ 10 เดือน พร้อมกล่องและอุปกรณ์ครบ",
    submittedAt: "2026-02-15 14:30",
    scheduledStart: "2026-02-20 10:00",
    scheduledEnd: "2026-02-27 10:00",
    status: "pending",
  },
  {
    id: "INC-002",
    name: "Nike Air Jordan 1 Retro High OG",
    image: image.shirt,
    seller: "SneakerHead TH",
    sellerEmail: "sneaker@head.com",
    category: "Fashion",
    startingBid: 3500,
    buyNowPrice: 8900,
    minIncrement: 100,
    description:
      "Nike Air Jordan 1 Retro High OG 'Chicago' Size US 10 ของแท้ 100% DS ยังไม่แกะกล่อง พร้อมใบเสร็จ",
    submittedAt: "2026-02-15 16:45",
    scheduledStart: "2026-02-19 18:00",
    scheduledEnd: "2026-02-26 18:00",
    status: "pending",
  },
  {
    id: "INC-003",
    name: "Labubu The Monsters Blind Box Set",
    image: image.labubu,
    seller: "Pop Mart Official",
    sellerEmail: "popmart@official.com",
    category: "Collectibles",
    startingBid: 2000,
    buyNowPrice: 5500,
    minIncrement: 100,
    description:
      "Labubu The Monsters Series ครบชุด 12 ตัว รวม Secret ของแท้จาก Pop Mart สภาพกล่องสวย ไม่มีตำหนิ",
    submittedAt: "2026-02-14 09:15",
    scheduledStart: "2026-02-18 12:00",
    scheduledEnd: "2026-02-25 12:00",
    status: "pending",
  },
  {
    id: "INC-004",
    name: "BMW i8 2020 Hybrid",
    image: image.i8,
    seller: "Luxury Cars BKK",
    sellerEmail: "luxury@cars.com",
    category: "Vehicles",
    startingBid: 2500000,
    buyNowPrice: 4200000,
    minIncrement: 50000,
    description:
      "BMW i8 ปี 2020 Plug-in Hybrid ไมล์ 25,000 กม. สีขาว ภายในดำ Full Option ประวัติศูนย์ครบ เจ้าของขายเอง",
    submittedAt: "2026-02-16 08:00",
    scheduledStart: "2026-02-22 10:00",
    scheduledEnd: "2026-03-01 10:00",
    status: "pending",
  },
  {
    id: "INC-005",
    name: "Sony PlayStation 5 Pro",
    image: image.electronic,
    seller: "GameZone TH",
    sellerEmail: "game@zone.com",
    category: "Electronics",
    startingBid: 15000,
    buyNowPrice: 24900,
    minIncrement: 200,
    description:
      "PS5 Pro 2TB พร้อมจอย DualSense 2 ตัว และเกม 5 แผ่น สภาพดีมาก ใช้งาน 3 เดือน ประกันเหลือ 9 เดือน",
    submittedAt: "2026-02-16 10:20",
    scheduledStart: "2026-02-21 14:00",
    scheduledEnd: "2026-02-28 14:00",
    status: "pending",
  },
];

// ─── Helpers ─────────────────────────────────────────────────
const formatPrice = (n: number) =>
  "฿" + n.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

const getReportStatusColor = (s: string) => {
  switch (s) {
    case "pending":
      return "#F59E0B";
    case "reviewing":
      return "#3B82F6";
    case "resolved":
      return "#22C55E";
    case "dismissed":
      return "#6B7280";
    default:
      return "#9CA3AF";
  }
};

const getReportStatusLabel = (s: string) => {
  switch (s) {
    case "pending":
      return "รอดำเนินการ";
    case "reviewing":
      return "กำลังตรวจสอบ";
    case "resolved":
      return "แก้ไขแล้ว";
    case "dismissed":
      return "ยกเลิก";
    default:
      return s;
  }
};

const getReportTypeIcon = (
  t: string,
): { name: React.ComponentProps<typeof Ionicons>["name"]; color: string } => {
  switch (t) {
    case "scam":
      return { name: "warning", color: "#DC2626" };
    case "fake_product":
      return { name: "pricetag", color: "#F59E0B" };
    case "payment":
    case "payment_issue":
      return { name: "card", color: "#3B82F6" };
    case "delivery":
    case "delivery_issue":
      return { name: "cube", color: "#8B5CF6" };
    case "inappropriate_content":
      return { name: "flag", color: "#EF4444" };
    case "counterfeit":
      return { name: "alert-circle", color: "#F59E0B" };
    default:
      return { name: "help-circle", color: "#6B7280" };
  }
};

const getReportTypeLabel = (t: string) => {
  switch (t) {
    case "scam":
      return "หลอกลวง";
    case "fake_product":
      return "สินค้าปลอม";
    case "payment":
    case "payment_issue":
      return "การชำระเงิน";
    case "delivery":
    case "delivery_issue":
      return "การจัดส่ง";
    case "inappropriate_content":
      return "เนื้อหาไม่เหมาะสม";
    case "counterfeit":
      return "สินค้าปลอมแปลง";
    case "other":
      return "อื่นๆ";
    default:
      return t.replace(/_/g, " ");
  }
};

const formatReportDate = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// ─── Component ───────────────────────────────────────────────
const AdminScreen = () => {
  const router = useRouter();
  const { logout: contextLogout } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"incoming" | "reports">(
    "incoming",
  );

  // Incoming state
  const [incomingProducts, setIncomingProducts] =
    useState<IncomingProduct[]>(MOCK_INCOMING);
  const [selectedProduct, setSelectedProduct] =
    useState<IncomingProduct | null>(null);
  const [productModalVisible, setProductModalVisible] = useState(false);

  // Reports state
  const [reports, setReports] = useState<ApiReport[]>([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ApiReport | null>(null);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replyLoading, setReplyLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [adminNote, setAdminNote] = useState("");

  // Dashboard stats from API
  const [dashboardStats, setDashboardStats] = useState<AdminStats | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      const userData = await AsyncStorage.getItem("userData");
      const currentUser: User | null = userData ? JSON.parse(userData) : null;
      if (currentUser?.role !== "admin") {
        router.replace("/login");
        return;
      }
      setUser(currentUser);
      setLoading(false);
      // Fetch dashboard stats
      try {
        const stats = await apiService.admin.getStats();
        setDashboardStats(stats);
      } catch (e: any) {
        console.error("Failed to fetch admin stats:", e.message);
      }
      // Fetch reports
      fetchReports();
    };
    loadUser();
  }, []);

  const fetchReports = async () => {
    try {
      setReportsLoading(true);
      const response = await apiService.admin.getReports();
      // Handle both array and paginated
      const data = response as any;
      if (Array.isArray(data)) {
        setReports(data);
      } else if (data?.data && Array.isArray(data.data)) {
        setReports(data.data);
      } else {
        setReports([]);
      }
    } catch (e: any) {
      console.error("Failed to fetch reports:", e.message);
    } finally {
      setReportsLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert("ออกจากระบบ", "คุณแน่ใจที่ต้องการออกจากระบบหรือไม่?", [
      { text: "ยกเลิก" },
      {
        text: "ออกจากระบบ",
        style: "destructive",
        onPress: async () => {
          await contextLogout();
          router.replace("/welcome");
        },
      },
    ]);
  };

  const handleDeleteProduct = (product: IncomingProduct) => {
    Alert.alert(
      "ลบสินค้า",
      `คุณต้องการลบ "${product.name}" ออกจากรายการ Incoming หรือไม่?\n\nผู้ขาย: ${product.seller}\nหมวดหมู่: ${product.category}`,
      [
        { text: "ยกเลิก" },
        {
          text: "ลบสินค้า",
          style: "destructive",
          onPress: () => {
            setIncomingProducts((prev) =>
              prev.filter((p) => p.id !== product.id),
            );
            setProductModalVisible(false);
            setSelectedProduct(null);
          },
        },
      ],
    );
  };

  const handleApproveProduct = (product: IncomingProduct) => {
    Alert.alert(
      "อนุมัติสินค้า",
      `อนุมัติ "${product.name}" ให้เข้าสู่ระบบประมูล?`,
      [
        { text: "ยกเลิก" },
        {
          text: "อนุมัติ",
          onPress: () => {
            setIncomingProducts((prev) =>
              prev.filter((p) => p.id !== product.id),
            );
            setProductModalVisible(false);
            setSelectedProduct(null);
            Alert.alert("สำเร็จ", "อนุมัติสินค้าเรียบร้อยแล้ว");
          },
        },
      ],
    );
  };

  const handleUpdateReportStatus = (report: ApiReport, newStatus: string) => {
    Alert.alert(
      "เปลี่ยนสถานะ",
      `เปลี่ยนสถานะเป็น "${getReportStatusLabel(newStatus)}"?${adminNote.trim() ? `\n\nหมายเหตุ: ${adminNote.trim()}` : ""}`,
      [
        { text: "ยกเลิก" },
        {
          text: "ยืนยัน",
          onPress: async () => {
            setStatusLoading(true);
            try {
              await apiService.admin.updateReportStatus({
                reportId: String(report.id),
                status: newStatus as any,
                ...(adminNote.trim() ? { admin_note: adminNote.trim() } : {}),
              });
              // Update local state
              setReports((prev) =>
                prev.map((r) =>
                  r.id === report.id
                    ? {
                        ...r,
                        status: newStatus as any,
                        admin_note: adminNote.trim() || r.admin_note,
                      }
                    : r,
                ),
              );
              setSelectedReport((prev) =>
                prev?.id === report.id
                  ? {
                      ...prev,
                      status: newStatus as any,
                      admin_note: adminNote.trim() || prev.admin_note,
                    }
                  : prev,
              );
              setAdminNote("");
              Alert.alert("สำเร็จ", "อัปเดตสถานะเรียบร้อยแล้ว");
              fetchReports(); // refresh list
            } catch (error: any) {
              Alert.alert(
                "ผิดพลาด",
                error.message || "ไม่สามารถอัปเดตสถานะได้",
              );
            } finally {
              setStatusLoading(false);
            }
          },
        },
      ],
    );
  };

  const openProductDetail = (product: IncomingProduct) => {
    setSelectedProduct(product);
    setProductModalVisible(true);
  };

  const openReportDetail = (report: ApiReport) => {
    setSelectedReport(report);
    setReplyText("");
    setAdminNote("");
    setReportModalVisible(true);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <LottieView
          source={require("../assets/animations/loading.json")}
          autoPlay
          loop
          style={{ width: 120, height: 120 }}
        />
      </View>
    );
  }

  const openReportsCount = reports.filter(
    (r) => r.status === "pending" || r.status === "reviewing",
  ).length;

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={["#00112E", "#003994"]} style={styles.header}>
        <SafeAreaView edges={["top"]}>
          <View style={styles.headerTop}>
            <View>
              <AppText weight="bold" style={styles.headerTitle}>
                Admin Panel
              </AppText>
              <AppText weight="regular" style={styles.headerSubtitle}>
                {user?.name}
              </AppText>
            </View>
            <TouchableOpacity onPress={handleLogout} style={styles.logoutBtn}>
              <Ionicons name="log-out-outline" size={20} color="#FFF" />
            </TouchableOpacity>
          </View>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <AppText weight="bold" style={styles.statNumber}>
                {dashboardStats?.pending_certificates ??
                  incomingProducts.length}
              </AppText>
              <AppText weight="regular" style={styles.statLabel}>
                Pending Cert
              </AppText>
            </View>
            <View style={styles.statCard}>
              <AppText weight="bold" style={styles.statNumber}>
                {dashboardStats?.pending_reports ?? openReportsCount}
              </AppText>
              <AppText weight="regular" style={styles.statLabel}>
                Reports
              </AppText>
            </View>
            <View style={styles.statCard}>
              <AppText weight="bold" style={styles.statNumber}>
                {dashboardStats?.total_users ?? 0}
              </AppText>
              <AppText weight="regular" style={styles.statLabel}>
                Users
              </AppText>
            </View>
            <View style={styles.statCard}>
              <AppText weight="bold" style={styles.statNumber}>
                {dashboardStats?.total_products ?? 0}
              </AppText>
              <AppText weight="regular" style={styles.statLabel}>
                Products
              </AppText>
            </View>
          </View>

          {/* Tab Switcher */}
          <View style={styles.tabRow}>
            <TouchableOpacity
              style={[styles.tab, activeTab === "incoming" && styles.tabActive]}
              onPress={() => setActiveTab("incoming")}
            >
              <AppText
                weight="semibold"
                style={[
                  styles.tabText,
                  activeTab === "incoming" && styles.tabTextActive,
                ]}
              >
                Incoming ({incomingProducts.length})
              </AppText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === "reports" && styles.tabActive]}
              onPress={() => setActiveTab("reports")}
            >
              <AppText
                weight="semibold"
                style={[
                  styles.tabText,
                  activeTab === "reports" && styles.tabTextActive,
                ]}
              >
                Reports ({openReportsCount})
              </AppText>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </LinearGradient>

      {/* Content */}
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        {activeTab === "incoming" ? (
          /* ─── INCOMING TAB ────────────────────────────── */
          <>
            {incomingProducts.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons
                  name="mail-open-outline"
                  size={52}
                  color="#9CA3AF"
                  style={{ marginBottom: 12 }}
                />
                <AppText weight="semibold" style={styles.emptyTitle}>
                  No Incoming Products
                </AppText>
                <AppText weight="regular" style={styles.emptySub}>
                  All incoming products have been managed
                </AppText>
              </View>
            ) : (
              incomingProducts.map((product) => (
                <TouchableOpacity
                  key={product.id}
                  style={styles.productCard}
                  onPress={() => openProductDetail(product)}
                  activeOpacity={0.7}
                >
                  <Image
                    source={product.image}
                    style={styles.productCardImage}
                  />
                  <View style={styles.productCardInfo}>
                    <View style={styles.productCardTop}>
                      <AppText
                        weight="semibold"
                        style={styles.productCardName}
                        numberOfLines={1}
                      >
                        {product.name}
                      </AppText>
                      <View style={styles.pendingBadge}>
                        <AppText weight="medium" style={styles.pendingText}>
                          Pending
                        </AppText>
                      </View>
                    </View>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <Ionicons name="person" size={13} color="#6B7280" />
                      <AppText
                        weight="regular"
                        style={styles.productCardSeller}
                        numberOfLines={1}
                      >
                        {product.seller}
                      </AppText>
                    </View>
                    <View style={styles.productCardPrices}>
                      <View style={styles.priceTag}>
                        <AppText weight="regular" style={styles.priceLabel}>
                          Start
                        </AppText>
                        <AppText weight="semibold" style={styles.priceValue}>
                          {formatPrice(product.startingBid)}
                        </AppText>
                      </View>
                      <View style={styles.priceTag}>
                        <AppText weight="regular" style={styles.priceLabel}>
                          Buy Now
                        </AppText>
                        <AppText
                          weight="semibold"
                          style={[styles.priceValue, { color: "#22C55E" }]}
                        >
                          {formatPrice(product.buyNowPrice)}
                        </AppText>
                      </View>
                    </View>
                    <View style={styles.productCardBottom}>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <Ionicons name="pricetag" size={11} color="#9CA3AF" />
                        <AppText
                          weight="regular"
                          style={styles.productCardMeta}
                        >
                          {product.category}
                        </AppText>
                      </View>
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <Ionicons name="calendar" size={11} color="#9CA3AF" />
                        <AppText
                          weight="regular"
                          style={styles.productCardMeta}
                        >
                          {product.scheduledStart}
                        </AppText>
                      </View>
                    </View>
                  </View>

                  {/* Quick Actions */}
                  <View style={styles.quickActions}>
                    <TouchableOpacity
                      style={styles.quickApprove}
                      onPress={(e) => {
                        e.stopPropagation();
                        handleApproveProduct(product);
                      }}
                    >
                      <Ionicons
                        name="checkmark-circle"
                        size={20}
                        color="#22C55E"
                      />
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.quickDelete}
                      onPress={(e) => {
                        e.stopPropagation();
                        handleDeleteProduct(product);
                      }}
                    >
                      <Ionicons name="trash" size={20} color="#EF4444" />
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              ))
            )}
          </>
        ) : (
          /* ─── REPORTS TAB ─────────────────────────────── */
          <>
            {reports.length === 0 && !reportsLoading ? (
              <View style={styles.emptyState}>
                <Ionicons
                  name="shield-checkmark-outline"
                  size={52}
                  color="#9CA3AF"
                  style={{ marginBottom: 12 }}
                />
                <AppText weight="semibold" style={styles.emptyTitle}>
                  ไม่มีรายงานปัญหา
                </AppText>
                <AppText weight="regular" style={styles.emptySub}>
                  ยังไม่มีผู้ใช้แจ้งปัญหาเข้ามา
                </AppText>
              </View>
            ) : reportsLoading ? (
              <View style={{ alignItems: "center", paddingVertical: 40 }}>
                <LottieView
                  source={require("../assets/animations/loading.json")}
                  autoPlay
                  loop
                  style={{ width: 80, height: 80 }}
                />
              </View>
            ) : (
              reports.map((report) => (
                <TouchableOpacity
                  key={report.id}
                  style={styles.reportCard}
                  onPress={() => openReportDetail(report)}
                  activeOpacity={0.7}
                >
                  <View style={styles.reportCardHeader}>
                    <View style={styles.reportTypeRow}>
                      <Ionicons
                        name={getReportTypeIcon(report.type).name}
                        size={20}
                        color={getReportTypeIcon(report.type).color}
                      />
                      <View style={styles.reportTypeInfo}>
                        <AppText
                          weight="semibold"
                          style={styles.reportTitle}
                          numberOfLines={1}
                        >
                          {getReportTypeLabel(report.type)}
                        </AppText>
                        <AppText
                          weight="regular"
                          style={styles.reportTypeBadgeText}
                        >
                          {report.report_code} •{" "}
                          {report.reporter?.name || "Unknown"}
                        </AppText>
                      </View>
                    </View>
                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor:
                            getReportStatusColor(report.status) + "18",
                        },
                      ]}
                    >
                      <AppText
                        weight="semibold"
                        style={[
                          styles.statusText,
                          { color: getReportStatusColor(report.status) },
                        ]}
                      >
                        {getReportStatusLabel(report.status)}
                      </AppText>
                    </View>
                  </View>

                  <AppText
                    weight="regular"
                    style={styles.reportDesc}
                    numberOfLines={2}
                  >
                    {report.description}
                  </AppText>

                  <View style={styles.reportCardFooter}>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <Ionicons name="calendar" size={12} color="#9CA3AF" />
                      <AppText weight="regular" style={styles.reportMeta}>
                        {formatReportDate(report.created_at)}
                      </AppText>
                    </View>
                    {report.reported_product && (
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 4,
                        }}
                      >
                        <Ionicons name="cube" size={12} color="#9CA3AF" />
                        <AppText
                          weight="regular"
                          style={styles.reportMeta}
                          numberOfLines={1}
                        >
                          {report.reported_product.name}
                        </AppText>
                      </View>
                    )}
                  </View>
                </TouchableOpacity>
              ))
            )}
          </>
        )}
      </ScrollView>

      {/* ─── Product Detail Modal ─────────────────────── */}
      <Modal
        visible={productModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        {selectedProduct && (
          <View style={styles.modalContainer}>
            <SafeAreaView edges={["top"]} style={{ backgroundColor: "#FFF" }}>
              <View style={styles.modalHeader}>
                <TouchableOpacity
                  onPress={() => setProductModalVisible(false)}
                  style={styles.modalCloseBtn}
                >
                  <AppText weight="semibold" style={styles.modalCloseText}>
                    ✕
                  </AppText>
                </TouchableOpacity>
                <AppText weight="bold" style={styles.modalTitle}>
                  Product Detail
                </AppText>
                <View style={{ width: 36 }} />
              </View>
            </SafeAreaView>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 40 }}
            >
              {/* Product Image */}
              <Image
                source={selectedProduct.image}
                style={styles.modalProductImage}
              />

              {/* Product Info */}
              <View style={styles.modalBody}>
                <View style={styles.modalNameRow}>
                  <AppText
                    weight="bold"
                    style={styles.modalProductName}
                    numberOfLines={2}
                  >
                    {selectedProduct.name}
                  </AppText>
                  <View style={styles.pendingBadgeLg}>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 4,
                      }}
                    >
                      <Ionicons
                        name="hourglass-outline"
                        size={13}
                        color="#D97706"
                      />
                      <AppText weight="semibold" style={styles.pendingTextLg}>
                        Pending
                      </AppText>
                    </View>
                  </View>
                </View>

                {/* Seller Info */}
                <View style={styles.sellerCard}>
                  <View style={styles.sellerAvatar}>
                    <Ionicons name="person" size={20} color="#3B82F6" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <AppText weight="semibold" style={styles.sellerName}>
                      {selectedProduct.seller}
                    </AppText>
                    <AppText weight="regular" style={styles.sellerEmail}>
                      {selectedProduct.sellerEmail}
                    </AppText>
                  </View>
                </View>

                {/* Price Cards */}
                <View style={styles.modalPriceRow}>
                  <View
                    style={[
                      styles.modalPriceCard,
                      { borderColor: "#3B82F620" },
                    ]}
                  >
                    <AppText weight="regular" style={styles.modalPriceLabel}>
                      Starting Bid
                    </AppText>
                    <AppText
                      weight="bold"
                      style={[styles.modalPrice, { color: "#3B82F6" }]}
                    >
                      {formatPrice(selectedProduct.startingBid)}
                    </AppText>
                  </View>
                  <View
                    style={[
                      styles.modalPriceCard,
                      { borderColor: "#22C55E20" },
                    ]}
                  >
                    <AppText weight="regular" style={styles.modalPriceLabel}>
                      Buy Now
                    </AppText>
                    <AppText
                      weight="bold"
                      style={[styles.modalPrice, { color: "#22C55E" }]}
                    >
                      {formatPrice(selectedProduct.buyNowPrice)}
                    </AppText>
                  </View>
                  <View
                    style={[
                      styles.modalPriceCard,
                      { borderColor: "#F59E0B20" },
                    ]}
                  >
                    <AppText weight="regular" style={styles.modalPriceLabel}>
                      Min Increment
                    </AppText>
                    <AppText
                      weight="bold"
                      style={[styles.modalPrice, { color: "#F59E0B" }]}
                    >
                      {formatPrice(selectedProduct.minIncrement)}
                    </AppText>
                  </View>
                </View>

                {/* Details */}
                <View style={styles.detailSection}>
                  <View style={styles.labelRow}>
                    <Ionicons name="document-text" size={16} color="#111827" />
                    <AppText weight="semibold" style={styles.detailLabel}>
                      Product Detail
                    </AppText>
                  </View>
                  <AppText weight="regular" style={styles.detailText}>
                    {selectedProduct.description}
                  </AppText>
                </View>

                <View style={styles.detailGrid}>
                  <View style={styles.detailItem}>
                    <View style={styles.labelRow}>
                      <Ionicons name="pricetag" size={12} color="#9CA3AF" />
                      <AppText weight="regular" style={styles.detailItemLabel}>
                        Category
                      </AppText>
                    </View>
                    <AppText weight="semibold" style={styles.detailItemValue}>
                      {selectedProduct.category}
                    </AppText>
                  </View>
                  <View style={styles.detailItem}>
                    <View style={styles.labelRow}>
                      <Ionicons name="calendar" size={12} color="#9CA3AF" />
                      <AppText weight="regular" style={styles.detailItemLabel}>
                        Submitted At
                      </AppText>
                    </View>
                    <AppText weight="semibold" style={styles.detailItemValue}>
                      {selectedProduct.submittedAt}
                    </AppText>
                  </View>
                  <View style={styles.detailItem}>
                    <View style={styles.labelRow}>
                      <Ionicons name="time" size={12} color="#9CA3AF" />
                      <AppText weight="regular" style={styles.detailItemLabel}>
                        Auction Start
                      </AppText>
                    </View>
                    <AppText weight="semibold" style={styles.detailItemValue}>
                      {selectedProduct.scheduledStart}
                    </AppText>
                  </View>
                  <View style={styles.detailItem}>
                    <View style={styles.labelRow}>
                      <Ionicons name="time" size={12} color="#9CA3AF" />
                      <AppText weight="regular" style={styles.detailItemLabel}>
                        Auction End
                      </AppText>
                    </View>
                    <AppText weight="semibold" style={styles.detailItemValue}>
                      {selectedProduct.scheduledEnd}
                    </AppText>
                  </View>
                </View>

                {/* Action Buttons */}
                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.approveBtn}
                    onPress={() => handleApproveProduct(selectedProduct)}
                  >
                    <LinearGradient
                      colors={["#22C55E", "#16A34A"]}
                      style={styles.actionGradient}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <Ionicons
                          name="checkmark-circle"
                          size={18}
                          color="#FFF"
                        />
                        <AppText weight="semibold" style={styles.actionBtnText}>
                          Approve Product
                        </AppText>
                      </View>
                    </LinearGradient>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => handleDeleteProduct(selectedProduct)}
                  >
                    <LinearGradient
                      colors={["#EF4444", "#DC2626"]}
                      style={styles.actionGradient}
                    >
                      <View
                        style={{
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 6,
                        }}
                      >
                        <Ionicons name="trash" size={18} color="#FFF" />
                        <AppText weight="semibold" style={styles.actionBtnText}>
                          Delete Product
                        </AppText>
                      </View>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>
          </View>
        )}
      </Modal>

      {/* ─── Report Detail Modal ──────────────────────── */}
      <Modal
        visible={reportModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        {selectedReport && (
          <View style={styles.modalContainer}>
            <SafeAreaView edges={["top"]} style={{ backgroundColor: "#FFF" }}>
              <View style={styles.modalHeader}>
                <TouchableOpacity
                  onPress={() => setReportModalVisible(false)}
                  style={styles.modalCloseBtn}
                >
                  <AppText weight="semibold" style={styles.modalCloseText}>
                    ✕
                  </AppText>
                </TouchableOpacity>
                <AppText weight="bold" style={styles.modalTitle}>
                  รายละเอียดรายงาน
                </AppText>
                <View style={{ width: 36 }} />
              </View>
            </SafeAreaView>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 40 }}
            >
              <View style={styles.modalBody}>
                {/* Report Header */}
                <View style={styles.reportModalHeader}>
                  <View style={styles.reportModalIcon}>
                    <Ionicons
                      name={getReportTypeIcon(selectedReport.type).name}
                      size={32}
                      color={getReportTypeIcon(selectedReport.type).color}
                    />
                  </View>
                  <AppText weight="bold" style={styles.reportModalTitle}>
                    {getReportTypeLabel(selectedReport.type)}
                  </AppText>
                  <View style={styles.reportModalBadges}>
                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor:
                            getReportStatusColor(selectedReport.status) + "18",
                        },
                      ]}
                    >
                      <AppText
                        weight="semibold"
                        style={[
                          styles.statusText,
                          {
                            color: getReportStatusColor(selectedReport.status),
                          },
                        ]}
                      >
                        {getReportStatusLabel(selectedReport.status)}
                      </AppText>
                    </View>
                  </View>
                </View>

                {/* Reporter Info */}
                <View style={styles.sellerCard}>
                  <View style={styles.sellerAvatar}>
                    <Ionicons name="person" size={20} color="#3B82F6" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <AppText weight="semibold" style={styles.sellerName}>
                      {selectedReport.reporter?.name || "Unknown"}
                    </AppText>
                    <AppText weight="regular" style={styles.sellerEmail}>
                      {selectedReport.reporter?.email || "-"}
                    </AppText>
                  </View>
                </View>

                {/* Reported User */}
                {selectedReport.reported_user && (
                  <View
                    style={[
                      styles.sellerCard,
                      { borderColor: "#FEE2E2", backgroundColor: "#FFF5F5" },
                    ]}
                  >
                    <View
                      style={[
                        styles.sellerAvatar,
                        { backgroundColor: "#FEE2E2" },
                      ]}
                    >
                      <Ionicons name="alert-circle" size={20} color="#EF4444" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <AppText
                        weight="regular"
                        style={{
                          fontSize: 10,
                          color: "#9CA3AF",
                          marginBottom: 2,
                        }}
                      >
                        ผู้ถูกรายงาน
                      </AppText>
                      <AppText weight="semibold" style={styles.sellerName}>
                        {selectedReport.reported_user.name}
                      </AppText>
                      <AppText weight="regular" style={styles.sellerEmail}>
                        {selectedReport.reported_user.email}
                      </AppText>
                    </View>
                  </View>
                )}

                {/* Report Details */}
                <View style={styles.detailSection}>
                  <View style={styles.labelRow}>
                    <Ionicons name="clipboard" size={16} color="#111827" />
                    <AppText weight="semibold" style={styles.detailLabel}>
                      รายละเอียดปัญหา
                    </AppText>
                  </View>
                  <AppText weight="regular" style={styles.detailText}>
                    {selectedReport.description}
                  </AppText>
                </View>

                {/* Evidence Images */}
                {selectedReport.evidence_images &&
                  selectedReport.evidence_images.length > 0 && (
                    <View style={styles.detailSection}>
                      <View style={styles.labelRow}>
                        <Ionicons name="images" size={16} color="#111827" />
                        <AppText weight="semibold" style={styles.detailLabel}>
                          หลักฐาน ({selectedReport.evidence_images.length} รูป)
                        </AppText>
                      </View>
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={{ marginTop: 8 }}
                      >
                        {selectedReport.evidence_images.map((img, idx) => (
                          <Image
                            key={idx}
                            source={{ uri: getFullImageUrl(img)! }}
                            style={{
                              width: 100,
                              height: 100,
                              borderRadius: 8,
                              marginRight: 8,
                              backgroundColor: "#F3F4F6",
                            }}
                            resizeMode="cover"
                          />
                        ))}
                      </ScrollView>
                    </View>
                  )}

                <View style={styles.detailGrid}>
                  <View style={styles.detailItem}>
                    <View style={styles.labelRow}>
                      <Ionicons name="folder" size={12} color="#9CA3AF" />
                      <AppText weight="regular" style={styles.detailItemLabel}>
                        ประเภท
                      </AppText>
                    </View>
                    <AppText weight="semibold" style={styles.detailItemValue}>
                      {getReportTypeLabel(selectedReport.type)}
                    </AppText>
                  </View>
                  <View style={styles.detailItem}>
                    <View style={styles.labelRow}>
                      <Ionicons name="calendar" size={12} color="#9CA3AF" />
                      <AppText weight="regular" style={styles.detailItemLabel}>
                        วันที่แจ้ง
                      </AppText>
                    </View>
                    <AppText weight="semibold" style={styles.detailItemValue}>
                      {formatReportDate(selectedReport.created_at)}
                    </AppText>
                  </View>
                  {selectedReport.reported_product && (
                    <View style={styles.detailItem}>
                      <View style={styles.labelRow}>
                        <Ionicons name="cube" size={12} color="#9CA3AF" />
                        <AppText
                          weight="regular"
                          style={styles.detailItemLabel}
                        >
                          สินค้าที่เกี่ยวข้อง
                        </AppText>
                      </View>
                      <AppText weight="semibold" style={styles.detailItemValue}>
                        {selectedReport.reported_product.name}
                      </AppText>
                    </View>
                  )}
                  <View style={styles.detailItem}>
                    <View style={styles.labelRow}>
                      <Ionicons name="finger-print" size={12} color="#9CA3AF" />
                      <AppText weight="regular" style={styles.detailItemLabel}>
                        รหัสรายงาน
                      </AppText>
                    </View>
                    <AppText weight="semibold" style={styles.detailItemValue}>
                      {selectedReport.report_code}
                    </AppText>
                  </View>
                </View>

                {/* Timeline */}
                {selectedReport.timeline &&
                  selectedReport.timeline.length > 0 && (
                    <View style={styles.detailSection}>
                      <View style={styles.labelRow}>
                        <Ionicons name="time" size={16} color="#111827" />
                        <AppText weight="semibold" style={styles.detailLabel}>
                          ไทม์ไลน์
                        </AppText>
                      </View>
                      {selectedReport.timeline.map((t, idx) => (
                        <View
                          key={idx}
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            paddingVertical: 8,
                            gap: 10,
                          }}
                        >
                          <View
                            style={{
                              width: 8,
                              height: 8,
                              borderRadius: 4,
                              backgroundColor: getReportStatusColor(t.status),
                            }}
                          />
                          <View style={{ flex: 1 }}>
                            <AppText
                              weight="medium"
                              style={{ fontSize: 13, color: "#111827" }}
                            >
                              {t.label}
                            </AppText>
                            <AppText
                              weight="regular"
                              style={{ fontSize: 11, color: "#9CA3AF" }}
                            >
                              {formatReportDate(t.date)}
                            </AppText>
                          </View>
                        </View>
                      ))}
                    </View>
                  )}

                {/* Admin Reply (if already replied) */}
                {selectedReport.admin_reply && (
                  <View
                    style={[
                      styles.detailSection,
                      {
                        backgroundColor: "#F0FDF4",
                        borderRadius: 12,
                        padding: 12,
                      },
                    ]}
                  >
                    <View style={styles.labelRow}>
                      <Ionicons
                        name="chatbubble-ellipses"
                        size={16}
                        color="#22C55E"
                      />
                      <AppText
                        weight="semibold"
                        style={[styles.detailLabel, { color: "#22C55E" }]}
                      >
                        ข้อความตอบกลับจากแอดมิน
                      </AppText>
                    </View>
                    <AppText
                      weight="regular"
                      style={{
                        fontSize: 13,
                        color: "#374151",
                        marginTop: 4,
                        lineHeight: 20,
                      }}
                    >
                      {selectedReport.admin_reply}
                    </AppText>
                    {selectedReport.admin_reply_at && (
                      <AppText
                        weight="regular"
                        style={{ fontSize: 11, color: "#9CA3AF", marginTop: 4 }}
                      >
                        ตอบเมื่อ:{" "}
                        {formatReportDate(selectedReport.admin_reply_at)}
                      </AppText>
                    )}
                  </View>
                )}

                {/* Status Actions */}
                <View style={styles.detailSection}>
                  <View style={styles.labelRow}>
                    <Ionicons name="sync" size={16} color="#111827" />
                    <AppText weight="semibold" style={styles.detailLabel}>
                      เปลี่ยนสถานะ
                    </AppText>
                  </View>
                  <TextInput
                    style={[styles.replyInput, { marginBottom: 12 }]}
                    placeholder="หมายเหตุจากแอดมิน (ไม่บังคับ)..."
                    placeholderTextColor="#999"
                    multiline
                    numberOfLines={3}
                    textAlignVertical="top"
                    value={adminNote}
                    onChangeText={setAdminNote}
                  />
                  <View style={styles.statusActions}>
                    {(
                      [
                        "pending",
                        "reviewing",
                        "resolved",
                        "dismissed",
                      ] as string[]
                    ).map((st) => (
                      <TouchableOpacity
                        key={st}
                        style={[
                          styles.statusActionBtn,
                          {
                            backgroundColor:
                              selectedReport.status === st
                                ? getReportStatusColor(st)
                                : getReportStatusColor(st) + "15",
                            borderColor: getReportStatusColor(st) + "40",
                            borderWidth: 1,
                          },
                        ]}
                        disabled={statusLoading}
                        onPress={() =>
                          handleUpdateReportStatus(selectedReport, st)
                        }
                      >
                        <AppText
                          weight="semibold"
                          style={{
                            fontSize: 11,
                            color:
                              selectedReport.status === st
                                ? "#FFF"
                                : getReportStatusColor(st),
                          }}
                        >
                          {getReportStatusLabel(st)}
                        </AppText>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>
            </ScrollView>
          </View>
        )}
      </Modal>
    </View>
  );
};

// ─── Styles ──────────────────────────────────────────────────
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F4F7",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F2F4F7",
  },
  header: {
    paddingHorizontal: 20,
    paddingBottom: 0,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 10,
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 24,
    color: "#FFF",
  },
  headerSubtitle: {
    fontSize: 13,
    color: "#B0C4FF",
    marginTop: 2,
  },
  logoutBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.12)",
    justifyContent: "center",
    alignItems: "center",
  },

  // Stats
  statsRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: "rgba(255,255,255,0.12)",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 18,
    color: "#FFF",
  },
  statLabel: {
    fontSize: 10,
    color: "#B0C4FF",
    marginTop: 2,
  },

  // Tabs
  tabRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 0,
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
    backgroundColor: "rgba(255,255,255,0.08)",
  },
  tabActive: {
    backgroundColor: "#F2F4F7",
  },
  tabText: {
    fontSize: 13,
    color: "#B0C4FF",
  },
  tabTextActive: {
    color: "#00112E",
  },

  // Content
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },

  // Empty State
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

  // Product Card
  productCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    marginBottom: 12,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  productCardImage: {
    width: "100%",
    height: 180,
    backgroundColor: "#f0f0f0",
  },
  productCardInfo: {
    padding: 14,
  },
  productCardTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  productCardName: {
    fontSize: 16,
    color: "#111827",
    flex: 1,
    marginRight: 8,
  },
  pendingBadge: {
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  pendingText: {
    fontSize: 11,
    color: "#D97706",
  },
  productCardSeller: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 10,
  },
  productCardPrices: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 10,
  },
  priceTag: {
    flex: 1,
    backgroundColor: "#F8F9FC",
    borderRadius: 10,
    padding: 10,
    alignItems: "center",
  },
  priceLabel: {
    fontSize: 10,
    color: "#9CA3AF",
    marginBottom: 2,
  },
  priceValue: {
    fontSize: 14,
    color: "#3B82F6",
  },
  productCardBottom: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  productCardMeta: {
    fontSize: 11,
    color: "#9CA3AF",
  },
  quickActions: {
    position: "absolute",
    top: 12,
    right: 12,
    flexDirection: "row",
    gap: 8,
  },
  quickApprove: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.95)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  quickDelete: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.95)",
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },

  // Report Card
  reportCard: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  reportCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  reportTypeRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginRight: 8,
  },
  reportTypeInfo: {
    marginLeft: 10,
    flex: 1,
  },
  reportTitle: {
    fontSize: 15,
    color: "#111827",
    marginBottom: 2,
  },
  reportTypeBadgeText: {
    fontSize: 11,
    color: "#9CA3AF",
  },
  reportDesc: {
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 20,
    marginBottom: 12,
  },
  reportCardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  reportMeta: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  priorityBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    gap: 5,
  },
  priorityDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  priorityText: {
    fontSize: 11,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 11,
  },

  // Modal
  modalContainer: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  modalCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCloseText: {
    fontSize: 16,
    color: "#6B7280",
  },
  modalTitle: {
    fontSize: 17,
    color: "#111827",
  },
  modalProductImage: {
    width: "100%",
    height: 250,
    backgroundColor: "#f0f0f0",
  },
  modalBody: {
    padding: 20,
  },
  modalNameRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  modalProductName: {
    fontSize: 20,
    color: "#111827",
    flex: 1,
    marginRight: 10,
  },
  pendingBadgeLg: {
    backgroundColor: "#FEF3C7",
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
  },
  pendingTextLg: {
    fontSize: 12,
    color: "#D97706",
  },

  // Seller Card
  sellerCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FC",
    borderRadius: 14,
    padding: 14,
    marginBottom: 16,
  },
  sellerAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#E8F0FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  sellerName: {
    fontSize: 15,
    color: "#111827",
  },
  sellerEmail: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 2,
  },

  // Modal Prices
  modalPriceRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 20,
  },
  modalPriceCard: {
    flex: 1,
    backgroundColor: "#F8F9FC",
    borderRadius: 12,
    padding: 12,
    alignItems: "center",
    borderWidth: 1,
  },
  modalPriceLabel: {
    fontSize: 10,
    color: "#9CA3AF",
    marginBottom: 4,
  },
  modalPrice: {
    fontSize: 14,
  },

  // Detail Sections
  detailSection: {
    marginBottom: 20,
  },
  detailLabel: {
    fontSize: 15,
    color: "#111827",
    marginBottom: 10,
  },
  detailText: {
    fontSize: 14,
    color: "#4B5563",
    lineHeight: 22,
    backgroundColor: "#F8F9FC",
    borderRadius: 12,
    padding: 14,
  },
  detailGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 20,
  },
  detailItem: {
    width: (width - 70) / 2,
    backgroundColor: "#F8F9FC",
    borderRadius: 12,
    padding: 12,
  },
  detailItemLabel: {
    fontSize: 11,
    color: "#9CA3AF",
    marginBottom: 4,
  },
  detailItemValue: {
    fontSize: 13,
    color: "#111827",
  },

  // Label Row (icon + text)
  labelRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },

  // Actions
  modalActions: {
    gap: 10,
    marginTop: 10,
  },
  approveBtn: {
    borderRadius: 14,
    overflow: "hidden",
  },
  deleteBtn: {
    borderRadius: 14,
    overflow: "hidden",
  },
  actionGradient: {
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 14,
  },
  actionBtnText: {
    fontSize: 16,
    color: "#FFF",
  },

  // Report Modal
  reportModalHeader: {
    alignItems: "center",
    marginBottom: 20,
  },
  reportModalIcon: {
    width: 64,
    height: 64,
    borderRadius: 20,
    backgroundColor: "#FEF2F2",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  reportModalTitle: {
    fontSize: 18,
    color: "#111827",
    textAlign: "center",
    marginBottom: 10,
  },
  reportModalBadges: {
    flexDirection: "row",
    gap: 8,
  },

  // Reply
  replySection: {
    marginBottom: 20,
  },
  replyInput: {
    backgroundColor: "#F8F9FC",
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    color: "#111827",
    minHeight: 100,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 10,
  },
  replyBtn: {
    backgroundColor: "#3B82F6",
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  replyBtnText: {
    fontSize: 14,
    color: "#FFF",
  },

  // Status Actions
  statusActions: {
    flexDirection: "row",
    gap: 8,
    flexWrap: "wrap",
  },
  statusActionBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
});

export default AdminScreen;
