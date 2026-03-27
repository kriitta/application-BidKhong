import Ionicons from "@expo/vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import LottieView from "lottie-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  Image,
  Linking,
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
import { AdminStats, Product, User } from "../utils/api/types";
import { AppText } from "./components/appText";
import ImageViewerModal from "./components/ImageViewerModal";

const { width } = Dimensions.get("window");

// ─── Types ───────────────────────────────────────────────────

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

type AdminUser = {
  id: number;
  name: string;
  email: string;
  phone_number: string | null;
  email_verified_at: string | null;
  role: string;
  profile_image: string | null;
  created_at: string;
  updated_at: string;
  products_count?: number;
  orders_count?: number;
  reports_count?: number;
  reported_count?: number;
  wallet?: {
    id: number;
    user_id: number;
    balance_available: string;
    balance_total?: string;
    balance_pending?: string;
    withdraw?: string;
    deposit?: string;
  } | null;
  strikes?: any[];
  is_banned?: boolean;
  banned_until?: string | null;
  ban_reason?: string | null;
};

// ─── Helpers ─────────────────────────────────────────────────
const formatPrice = (n: number | string) => {
  const num = typeof n === "string" ? parseFloat(n) : n;
  return "฿" + num.toLocaleString("en-US", { maximumFractionDigits: 0 });
};

const formatDateTime = (dateStr: string) => {
  const d = new Date(dateStr);
  return d.toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

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
    case "harassment":
      return { name: "person-remove", color: "#EC4899" };
    case "inappropriate_content":
      return { name: "flag", color: "#EF4444" };
    case "other":
      return { name: "help-circle", color: "#6B7280" };
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
    case "harassment":
      return "คุกคาม";
    case "inappropriate_content":
      return "เนื้อหาไม่เหมาะสม";
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

const getRemainingBanDays = (bannedUntil?: string | null): number | null => {
  if (!bannedUntil) return null;
  const now = new Date();
  const until = new Date(bannedUntil);
  const diff = until.getTime() - now.getTime();
  if (diff <= 0) return 0;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
};

// ─── Component ───────────────────────────────────────────────
const AdminScreen = () => {
  const router = useRouter();
  const { logout: contextLogout } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"pending" | "reports" | "users">(
    "pending",
  );

  // Pending products state
  const [pendingProducts, setPendingProducts] = useState<Product[]>([]);
  const [pendingLoading, setPendingLoading] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [productModalVisible, setProductModalVisible] = useState(false);
  const [approveLoading, setApproveLoading] = useState(false);
  const [rejectModalVisible, setRejectModalVisible] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [rejectLoading, setRejectLoading] = useState(false);

  // Image Viewer state
  const [imageViewerVisible, setImageViewerVisible] = useState(false);
  const [imageViewerUrls, setImageViewerUrls] = useState<string[]>([]);
  const [imageViewerIndex, setImageViewerIndex] = useState(0);

  const openImageViewer = (urls: string[], index = 0) => {
    setImageViewerUrls(urls);
    setImageViewerIndex(index);
    setImageViewerVisible(true);
  };

  // Certificate state
  const [certModalVisible, setCertModalVisible] = useState(false);
  const [certVerifyLoading, setCertVerifyLoading] = useState(false);
  const [certRejectNote, setCertRejectNote] = useState("");
  const [certAction, setCertAction] = useState<"approve" | "reject" | null>(
    null,
  );

  // Reports state
  const [reports, setReports] = useState<ApiReport[]>([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [selectedReport, setSelectedReport] = useState<ApiReport | null>(null);
  const [reportModalVisible, setReportModalVisible] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [replyLoading, setReplyLoading] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);
  const [adminNote, setAdminNote] = useState("");

  // Users state
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [userModalVisible, setUserModalVisible] = useState(false);
  const [userDetailLoading, setUserDetailLoading] = useState(false);
  const [banModalVisible, setBanModalVisible] = useState(false);
  const [banReason, setBanReason] = useState("");
  const [banDuration, setBanDuration] = useState("7");
  const [banLoading, setBanLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Dashboard stats from API
  const [dashboardStats, setDashboardStats] = useState<AdminStats | null>(null);

  const fetchDashboardStats = async () => {
    try {
      const stats = await apiService.admin.getStats();
      setDashboardStats(stats);
    } catch (e: any) {
      console.error("Failed to fetch admin stats:", e.message);
    }
  };

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
      fetchDashboardStats();
      // Fetch reports
      fetchReports();
      // Fetch users
      fetchUsers();
      // Fetch pending products
      fetchPendingProducts();
    };
    loadUser();
  }, []);

  const fetchPendingProducts = async () => {
    try {
      setPendingLoading(true);
      const products = await apiService.admin.getPendingProducts("pending");
      setPendingProducts(products);
    } catch (e: any) {
      console.error("Failed to fetch pending products:", e.message);
    } finally {
      setPendingLoading(false);
    }
  };

  const fetchReports = async () => {
    try {
      setReportsLoading(true);
      const response = await apiService.admin.getReports();
      // Handle both array and paginated
      const data = response as any;
      let allReports: ApiReport[] = [];
      if (Array.isArray(data)) {
        allReports = data;
      } else if (data?.data && Array.isArray(data.data)) {
        allReports = data.data;
      }
      // Filter out resolved/dismissed — only show active reports
      const activeReports = allReports.filter(
        (r) => r.status !== "resolved" && r.status !== "dismissed",
      );
      setReports(activeReports);
    } catch (e: any) {
      console.error("Failed to fetch reports:", e.message);
    } finally {
      setReportsLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setUsersLoading(true);
      const response = await apiService.admin.getUsers();
      const data = response as any;
      let newUsers: AdminUser[] = [];
      if (Array.isArray(data)) {
        newUsers = data;
      } else if (data?.data && Array.isArray(data.data)) {
        newUsers = data.data;
      }

      // API ไม่ส่ง ban fields กลับมา → preserve ban info จาก state เดิม
      setUsers((prev) => {
        const banMap = new Map<
          number,
          {
            is_banned: boolean;
            banned_until: string | null;
            ban_reason: string | null;
          }
        >();
        prev.forEach((u) => {
          if (u.is_banned) {
            banMap.set(u.id, {
              is_banned: true,
              banned_until: u.banned_until ?? null,
              ban_reason: u.ban_reason ?? null,
            });
          }
        });
        return newUsers.map((u) => {
          const banInfo = banMap.get(u.id);
          return banInfo ? { ...u, ...banInfo } : u;
        });
      });
    } catch (e: any) {
      console.error("Failed to fetch users:", e.message);
    } finally {
      setUsersLoading(false);
    }
  };

  const openUserDetail = async (u: AdminUser) => {
    setSelectedUser(u);
    setUserModalVisible(true);
    setUserDetailLoading(true);
    try {
      const detail = await apiService.admin.getUserDetail(u.id);
      // Preserve ban info if API doesn't return it
      if (u.is_banned && !detail.is_banned) {
        detail.is_banned = u.is_banned;
        detail.banned_until = u.banned_until;
        detail.ban_reason = u.ban_reason;
      }
      setSelectedUser(detail);
    } catch (e: any) {
      console.error("Failed to fetch user detail:", e.message);
    } finally {
      setUserDetailLoading(false);
    }
  };

  const handleBanUser = async () => {
    if (!selectedUser || !banReason.trim()) {
      Alert.alert("ข้อผิดพลาด", "กรุณากรอกเหตุผลในการแบน");
      return;
    }
    const days = parseInt(banDuration, 10);
    if (isNaN(days) || days <= 0) {
      Alert.alert("ข้อผิดพลาด", "กรุณากรอกจำนวนวันที่ถูกต้อง");
      return;
    }
    setBanLoading(true);
    const userName = selectedUser.name;
    const userId = selectedUser.id;
    try {
      await apiService.admin.banUser(userId, banReason.trim(), days);

      // Calculate banned_until date
      const bannedUntil = new Date();
      bannedUntil.setDate(bannedUntil.getDate() + days);
      const bannedUntilStr = bannedUntil.toISOString();

      // Optimistically update the users list so the UI reflects the ban immediately
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId
            ? {
                ...u,
                is_banned: true,
                banned_until: bannedUntilStr,
                ban_reason: banReason.trim(),
              }
            : u,
        ),
      );

      // Also update selectedUser so the detail modal shows ban info
      setSelectedUser((prev) =>
        prev && prev.id === userId
          ? {
              ...prev,
              is_banned: true,
              banned_until: bannedUntilStr,
              ban_reason: banReason.trim(),
            }
          : prev,
      );

      // Close ban modal but keep user detail modal OPEN so user sees the ban status change
      setBanModalVisible(false);
      setBanReason("");
      setBanDuration("7");
      setBanLoading(false);
      Alert.alert("สำเร็จ", `แบนผู้ใช้ ${userName} เรียบร้อยแล้ว`);
    } catch (error: any) {
      setBanLoading(false);
      Alert.alert("ผิดพลาด", error.message || "ไม่สามารถแบนผู้ใช้ได้");
    }
  };

  const handleUnbanUser = async (u: AdminUser) => {
    Alert.alert("ยืนยัน", `ปลดแบนผู้ใช้ "${u.name}"?`, [
      { text: "ยกเลิก" },
      {
        text: "ยืนยัน",
        onPress: async () => {
          try {
            await apiService.admin.unbanUser(u.id);
            Alert.alert("สำเร็จ", `ปลดแบนผู้ใช้ ${u.name} เรียบร้อยแล้ว`);
            // Optimistically update users list
            setUsers((prev) =>
              prev.map((user) =>
                user.id === u.id
                  ? {
                      ...user,
                      is_banned: false,
                      banned_until: null,
                      ban_reason: null,
                    }
                  : user,
              ),
            );
            // Update selectedUser so detail modal reflects unban immediately
            if (selectedUser?.id === u.id) {
              setSelectedUser((prev) =>
                prev
                  ? {
                      ...prev,
                      is_banned: false,
                      banned_until: null,
                      ban_reason: null,
                    }
                  : prev,
              );
            }
          } catch (error: any) {
            Alert.alert("ผิดพลาด", error.message || "ไม่สามารถปลดแบนผู้ใช้ได้");
          }
        },
      },
    ]);
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

  const handleRejectProduct = async () => {
    if (!selectedProduct || !rejectReason.trim()) {
      Alert.alert("ข้อผิดพลาด", "กรุณากรอกเหตุผลในการปฏิเสธ");
      return;
    }
    setRejectLoading(true);
    try {
      await apiService.admin.rejectProductById(
        selectedProduct.id,
        rejectReason.trim(),
      );
      // Optimistic update
      setPendingProducts((prev) =>
        prev.filter((p) => p.id !== selectedProduct.id),
      );
      setRejectModalVisible(false);
      setRejectReason("");
      setProductModalVisible(false);
      setSelectedProduct(null);
      Alert.alert("สำเร็จ", "ปฏิเสธสินค้าเรียบร้อยแล้ว");
      fetchPendingProducts();
      fetchDashboardStats();
    } catch (error: any) {
      Alert.alert("ผิดพลาด", error.message || "ไม่สามารถปฏิเสธสินค้าได้");
    } finally {
      setRejectLoading(false);
    }
  };

  const handleApproveProduct = (product: Product) => {
    Alert.alert(
      "อนุมัติสินค้า",
      `อนุมัติ "${product.name}" ให้เข้าสู่ระบบประมูล?`,
      [
        { text: "ยกเลิก" },
        {
          text: "อนุมัติ",
          onPress: async () => {
            setApproveLoading(true);
            try {
              await apiService.admin.approveProductById(product.id);
              // Optimistic update
              setPendingProducts((prev) =>
                prev.filter((p) => p.id !== product.id),
              );
              setProductModalVisible(false);
              setSelectedProduct(null);
              Alert.alert("สำเร็จ", "อนุมัติสินค้าเรียบร้อยแล้ว");
              fetchPendingProducts();
              fetchDashboardStats();
            } catch (error: any) {
              Alert.alert(
                "ผิดพลาด",
                error.message || "ไม่สามารถอนุมัติสินค้าได้",
              );
            } finally {
              setApproveLoading(false);
            }
          },
        },
      ],
    );
  };

  const handleVerifyCertificate = async (status: "approved" | "rejected") => {
    if (!selectedProduct?.certificate) return;
    setCertVerifyLoading(true);
    try {
      await apiService.admin.verifyCertificate(
        selectedProduct.certificate.id,
        status,
        status === "rejected" ? certRejectNote.trim() : undefined,
      );
      // Update local state
      setSelectedProduct((prev) =>
        prev?.certificate
          ? {
              ...prev,
              certificate: { ...prev.certificate, status },
              is_certified: status === "approved",
            }
          : prev,
      );
      setCertAction(null);
      setCertRejectNote("");
      Alert.alert(
        "สำเร็จ",
        status === "approved"
          ? "อนุมัติใบรับรองเรียบร้อยแล้ว"
          : "ปฏิเสธใบรับรองเรียบร้อยแล้ว",
      );
      fetchPendingProducts();
      fetchDashboardStats();
    } catch (error: any) {
      Alert.alert("ผิดพลาด", error.message || "ไม่สามารถดำเนินการใบรับรองได้");
    } finally {
      setCertVerifyLoading(false);
    }
  };

  const getCertificateFileUrl = (): string | null => {
    if (!selectedProduct?.certificate) return null;
    const cert = selectedProduct.certificate;
    // Try file_path first via storage URL
    if (cert.file_path) {
      return getFullImageUrl(cert.file_path);
    }
    return null;
  };

  const isImageFile = (filename: string): boolean => {
    const ext = filename.toLowerCase().split(".").pop() || "";
    return ["jpg", "jpeg", "png", "gif", "webp", "bmp"].includes(ext);
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
              // If resolved/dismissed, remove from list & close modal
              if (newStatus === "resolved" || newStatus === "dismissed") {
                setReports((prev) => prev.filter((r) => r.id !== report.id));
                setAdminNote("");
                setReportModalVisible(false);
                Alert.alert("สำเร็จ", "อัปเดตสถานะเรียบร้อยแล้ว");
              } else {
                // Update local state for other status changes
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
              }
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

  const openProductDetail = (product: Product) => {
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
                {pendingProducts.length}
              </AppText>
              <AppText weight="regular" style={styles.statLabel}>
                Pending
              </AppText>
            </View>
            <View style={styles.statCard}>
              <AppText weight="bold" style={styles.statNumber}>
                {reports.length}
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
              style={[styles.tab, activeTab === "pending" && styles.tabActive]}
              onPress={() => setActiveTab("pending")}
            >
              <AppText
                weight="semibold"
                style={[
                  styles.tabText,
                  activeTab === "pending" && styles.tabTextActive,
                ]}
              >
                Pending ({pendingProducts.length})
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
                Reports ({reports.length})
              </AppText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.tab, activeTab === "users" && styles.tabActive]}
              onPress={() => setActiveTab("users")}
            >
              <AppText
                weight="semibold"
                style={[
                  styles.tabText,
                  activeTab === "users" && styles.tabTextActive,
                ]}
              >
                Users ({users.length})
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
        {activeTab === "pending" ? (
          /* ─── PENDING TAB ─────────────────────────────── */
          <>
            {pendingLoading ? (
              <View style={{ alignItems: "center", paddingVertical: 40 }}>
                <LottieView
                  source={require("../assets/animations/loading.json")}
                  autoPlay
                  loop
                  style={{ width: 80, height: 80 }}
                />
              </View>
            ) : pendingProducts.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons
                  name="checkmark-done-circle-outline"
                  size={52}
                  color="#9CA3AF"
                  style={{ marginBottom: 12 }}
                />
                <AppText weight="semibold" style={styles.emptyTitle}>
                  ไม่มีสินค้ารออนุมัติ
                </AppText>
                <AppText weight="regular" style={styles.emptySub}>
                  สินค้าทั้งหมดได้รับการตรวจสอบแล้ว
                </AppText>
              </View>
            ) : (
              pendingProducts.map((product) => {
                const imgUrl = getFullImageUrl(
                  product.picture || product.image_url,
                );
                return (
                  <TouchableOpacity
                    key={product.id}
                    style={styles.productCard}
                    onPress={() => openProductDetail(product)}
                    activeOpacity={0.7}
                  >
                    {imgUrl ? (
                      <Image
                        source={{ uri: imgUrl }}
                        style={styles.productCardImage}
                      />
                    ) : (
                      <View
                        style={[
                          styles.productCardImage,
                          {
                            backgroundColor: "#F3F4F6",
                            justifyContent: "center",
                            alignItems: "center",
                          },
                        ]}
                      >
                        <Ionicons
                          name="image-outline"
                          size={24}
                          color="#9CA3AF"
                        />
                      </View>
                    )}
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
                          {product.user?.name || "Unknown Seller"}
                        </AppText>
                      </View>
                      <View style={styles.productCardPrices}>
                        <View style={styles.priceTag}>
                          <AppText weight="regular" style={styles.priceLabel}>
                            Start
                          </AppText>
                          <AppText weight="semibold" style={styles.priceValue}>
                            {formatPrice(product.starting_price)}
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
                            {formatPrice(product.buyout_price)}
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
                            {product.category?.name || "-"}
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
                            {formatDateTime(product.created_at)}
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
                          setSelectedProduct(product);
                          setRejectModalVisible(true);
                        }}
                      >
                        <Ionicons
                          name="close-circle"
                          size={20}
                          color="#EF4444"
                        />
                      </TouchableOpacity>
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </>
        ) : activeTab === "reports" ? (
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
        ) : activeTab === "users" ? (
          /* ─── USERS TAB ──────────────────────────────── */
          <>
            {/* Search */}
            <View style={styles.userSearchRow}>
              <View style={styles.userSearchInput}>
                <Ionicons name="search" size={18} color="#9CA3AF" />
                <TextInput
                  style={styles.userSearchText}
                  placeholder="ค้นหาชื่อหรืออีเมล..."
                  placeholderTextColor="#9CA3AF"
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                />
                {searchQuery.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchQuery("")}>
                    <Ionicons name="close-circle" size={18} color="#9CA3AF" />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {usersLoading ? (
              <View style={{ alignItems: "center", paddingVertical: 40 }}>
                <LottieView
                  source={require("../assets/animations/loading.json")}
                  autoPlay
                  loop
                  style={{ width: 80, height: 80 }}
                />
              </View>
            ) : users.length === 0 ? (
              <View style={styles.emptyState}>
                <Ionicons
                  name="people-outline"
                  size={52}
                  color="#9CA3AF"
                  style={{ marginBottom: 12 }}
                />
                <AppText weight="semibold" style={styles.emptyTitle}>
                  ไม่มีผู้ใช้
                </AppText>
                <AppText weight="regular" style={styles.emptySub}>
                  ยังไม่มีผู้ใช้ในระบบ
                </AppText>
              </View>
            ) : (
              users
                .filter((u) => {
                  if (!searchQuery.trim()) return true;
                  const q = searchQuery.toLowerCase();
                  return (
                    u.name.toLowerCase().includes(q) ||
                    u.email.toLowerCase().includes(q) ||
                    String(u.id).includes(q)
                  );
                })
                .map((u) => (
                  <TouchableOpacity
                    key={u.id}
                    style={[
                      styles.userCard,
                      u.is_banned && {
                        borderWidth: 1,
                        borderColor: "#FECACA",
                        backgroundColor: "#FFFBFB",
                      },
                    ]}
                    onPress={() => openUserDetail(u)}
                    activeOpacity={0.7}
                  >
                    <View style={styles.userCardLeft}>
                      {u.profile_image ? (
                        <Image
                          source={{ uri: getFullImageUrl(u.profile_image)! }}
                          style={styles.userAvatar}
                        />
                      ) : (
                        <View
                          style={[
                            styles.userAvatar,
                            styles.userAvatarPlaceholder,
                          ]}
                        >
                          <AppText weight="bold" style={styles.userAvatarText}>
                            {u.name.charAt(0).toUpperCase()}
                          </AppText>
                        </View>
                      )}
                      <View style={{ flex: 1 }}>
                        <View
                          style={{
                            flexDirection: "row",
                            alignItems: "center",
                            gap: 6,
                          }}
                        >
                          <AppText
                            weight="semibold"
                            style={styles.userName}
                            numberOfLines={1}
                          >
                            {u.name}
                          </AppText>
                          {u.role === "admin" && (
                            <View style={styles.adminBadge}>
                              <AppText
                                weight="semibold"
                                style={styles.adminBadgeText}
                              >
                                Admin
                              </AppText>
                            </View>
                          )}
                          {u.is_banned && (
                            <View style={styles.bannedBadge}>
                              <AppText
                                weight="semibold"
                                style={styles.bannedBadgeText}
                              >
                                Banned
                              </AppText>
                            </View>
                          )}
                        </View>
                        <AppText
                          weight="regular"
                          style={styles.userEmail}
                          numberOfLines={1}
                        >
                          {u.email}
                        </AppText>
                        {!u.is_banned && (
                          <View
                            style={{
                              flexDirection: "row",
                              alignItems: "center",
                              gap: 4,
                              marginTop: 4,
                            }}
                          >
                            <Ionicons
                              name="calendar-outline"
                              size={11}
                              color="#9CA3AF"
                            />
                            <AppText
                              weight="regular"
                              style={{ fontSize: 11, color: "#9CA3AF" }}
                            >
                              สมัครเมื่อ {formatReportDate(u.created_at)}
                            </AppText>
                          </View>
                        )}
                        {u.is_banned && (
                          <View style={{ marginTop: 6 }}>
                            <View
                              style={{
                                backgroundColor: "#FEF2F2",
                                borderRadius: 8,
                                paddingHorizontal: 10,
                                paddingVertical: 6,
                              }}
                            >
                              {u.ban_reason && (
                                <AppText
                                  weight="regular"
                                  style={{
                                    fontSize: 11,
                                    color: "#991B1B",
                                    marginBottom: 2,
                                  }}
                                  numberOfLines={1}
                                >
                                  เหตุผล: {u.ban_reason}
                                </AppText>
                              )}
                              <View
                                style={{
                                  flexDirection: "row",
                                  alignItems: "center",
                                  gap: 4,
                                }}
                              >
                                <Ionicons
                                  name="time-outline"
                                  size={11}
                                  color="#DC2626"
                                />
                                <AppText
                                  weight="semibold"
                                  style={{
                                    fontSize: 11,
                                    color: "#DC2626",
                                  }}
                                >
                                  {(() => {
                                    const remaining = getRemainingBanDays(
                                      u.banned_until,
                                    );
                                    if (remaining === null) return "แบนถาวร";
                                    if (remaining === 0)
                                      return "หมดอายุแบนแล้ว";
                                    return `เหลือ ${remaining} วัน`;
                                  })()}
                                </AppText>
                              </View>
                            </View>
                          </View>
                        )}
                      </View>
                    </View>
                    <View style={{ alignItems: "center", gap: 6 }}>
                      {u.is_banned ? (
                        <TouchableOpacity
                          style={{
                            backgroundColor: "#22C55E",
                            paddingHorizontal: 12,
                            paddingVertical: 6,
                            borderRadius: 8,
                          }}
                          onPress={(e) => {
                            e.stopPropagation?.();
                            handleUnbanUser(u);
                          }}
                        >
                          <AppText
                            weight="semibold"
                            style={{ fontSize: 11, color: "#FFF" }}
                          >
                            ปลดแบน
                          </AppText>
                        </TouchableOpacity>
                      ) : (
                        <Ionicons
                          name="chevron-forward"
                          size={18}
                          color="#D1D5DB"
                        />
                      )}
                    </View>
                  </TouchableOpacity>
                ))
            )}
          </>
        ) : null}
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
              {(() => {
                const modalImgUrl = getFullImageUrl(
                  selectedProduct.picture || selectedProduct.image_url,
                );
                // Collect all product images for full-screen viewer
                const allImgUrls: string[] = [];
                if (modalImgUrl) allImgUrls.push(modalImgUrl);
                if (
                  selectedProduct.images &&
                  selectedProduct.images.length > 0
                ) {
                  selectedProduct.images.forEach((img) => {
                    const url = getFullImageUrl(img.image_url);
                    if (url) allImgUrls.push(url);
                  });
                }
                return modalImgUrl ? (
                  <TouchableOpacity
                    activeOpacity={0.9}
                    onPress={() => openImageViewer(allImgUrls, 0)}
                  >
                    <Image
                      source={{ uri: modalImgUrl }}
                      style={styles.modalProductImage}
                    />
                  </TouchableOpacity>
                ) : (
                  <View
                    style={[
                      styles.modalProductImage,
                      {
                        backgroundColor: "#F3F4F6",
                        justifyContent: "center",
                        alignItems: "center",
                      },
                    ]}
                  >
                    <Ionicons name="image-outline" size={48} color="#9CA3AF" />
                  </View>
                );
              })()}

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
                  {selectedProduct.user?.profile_image ? (
                    <Image
                      source={{
                        uri: getFullImageUrl(
                          selectedProduct.user.profile_image,
                        )!,
                      }}
                      style={[styles.sellerAvatar, { borderRadius: 22 }]}
                    />
                  ) : (
                    <View style={styles.sellerAvatar}>
                      <Ionicons name="person" size={20} color="#3B82F6" />
                    </View>
                  )}
                  <View style={{ flex: 1 }}>
                    <AppText weight="semibold" style={styles.sellerName}>
                      {selectedProduct.user?.name || "Unknown Seller"}
                    </AppText>
                    <AppText weight="regular" style={styles.sellerEmail}>
                      {selectedProduct.user?.email || "-"}
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
                      {formatPrice(selectedProduct.starting_price)}
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
                      {formatPrice(selectedProduct.buyout_price)}
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
                      {formatPrice(selectedProduct.bid_increment)}
                    </AppText>
                  </View>
                </View>

                {/* Details */}
                <View style={styles.detailSection}>
                  <View style={styles.labelRow}>
                    <Ionicons name="document-text" size={16} color="#111827" />
                    <AppText weight="semibold" style={styles.detailLabel}>
                      รายละเอียดสินค้า
                    </AppText>
                  </View>
                  <AppText weight="regular" style={styles.detailText}>
                    {selectedProduct.description}
                  </AppText>
                </View>

                {/* Additional Images */}
                {selectedProduct.images &&
                  selectedProduct.images.length > 0 && (
                    <View style={styles.detailSection}>
                      <View style={styles.labelRow}>
                        <Ionicons name="images" size={16} color="#111827" />
                        <AppText weight="semibold" style={styles.detailLabel}>
                          รูปภาพเพิ่มเติม ({selectedProduct.images.length})
                        </AppText>
                      </View>
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        style={{ marginTop: 8 }}
                      >
                        {(() => {
                          const extraUrls = selectedProduct.images
                            .map((img) => getFullImageUrl(img.image_url))
                            .filter(Boolean) as string[];
                          // Prepend main image
                          const mainUrl = getFullImageUrl(
                            selectedProduct.picture ||
                              selectedProduct.image_url,
                          );
                          const allUrls = mainUrl
                            ? [mainUrl, ...extraUrls]
                            : extraUrls;
                          return selectedProduct.images.map((img, idx) => {
                            const extraImgUrl = getFullImageUrl(img.image_url);
                            return extraImgUrl ? (
                              <TouchableOpacity
                                key={idx}
                                activeOpacity={0.9}
                                onPress={() =>
                                  openImageViewer(
                                    allUrls,
                                    mainUrl ? idx + 1 : idx,
                                  )
                                }
                              >
                                <Image
                                  source={{ uri: extraImgUrl }}
                                  style={{
                                    width: 100,
                                    height: 100,
                                    borderRadius: 10,
                                    marginRight: 8,
                                    backgroundColor: "#F3F4F6",
                                  }}
                                />
                              </TouchableOpacity>
                            ) : null;
                          });
                        })()}
                      </ScrollView>
                    </View>
                  )}

                {/* Certificate */}
                {selectedProduct.certificate && (
                  <View
                    style={[
                      styles.detailSection,
                      {
                        backgroundColor:
                          selectedProduct.certificate.status === "approved"
                            ? "#ECFDF5"
                            : selectedProduct.certificate.status === "rejected"
                              ? "#FEF2F2"
                              : "#FEF3C7",
                        borderRadius: 12,
                        padding: 14,
                      },
                    ]}
                  >
                    {/* Header */}
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <View style={styles.labelRow}>
                        <Ionicons
                          name="shield-checkmark"
                          size={16}
                          color={
                            selectedProduct.certificate.status === "approved"
                              ? "#16A34A"
                              : selectedProduct.certificate.status ===
                                  "rejected"
                                ? "#DC2626"
                                : "#D97706"
                          }
                        />
                        <AppText
                          weight="semibold"
                          style={[
                            styles.detailLabel,
                            {
                              color:
                                selectedProduct.certificate.status ===
                                "approved"
                                  ? "#166534"
                                  : selectedProduct.certificate.status ===
                                      "rejected"
                                    ? "#991B1B"
                                    : "#92400E",
                              marginBottom: 0,
                            },
                          ]}
                        >
                          ใบรับรอง / Certificate
                        </AppText>
                      </View>
                      <View
                        style={{
                          backgroundColor:
                            selectedProduct.certificate.status === "approved"
                              ? "#16A34A20"
                              : selectedProduct.certificate.status ===
                                  "rejected"
                                ? "#DC262620"
                                : "#D9770620",
                          paddingHorizontal: 10,
                          paddingVertical: 3,
                          borderRadius: 12,
                        }}
                      >
                        <AppText
                          weight="semibold"
                          style={{
                            fontSize: 11,
                            color:
                              selectedProduct.certificate.status === "approved"
                                ? "#16A34A"
                                : selectedProduct.certificate.status ===
                                    "rejected"
                                  ? "#DC2626"
                                  : "#D97706",
                          }}
                        >
                          {selectedProduct.certificate.status === "approved"
                            ? "✅ อนุมัติแล้ว"
                            : selectedProduct.certificate.status === "rejected"
                              ? "❌ ปฏิเสธแล้ว"
                              : "⏳ รอตรวจสอบ"}
                        </AppText>
                      </View>
                    </View>

                    {/* File name */}
                    <AppText
                      weight="regular"
                      style={{
                        fontSize: 13,
                        color: "#6B7280",
                        marginTop: 8,
                      }}
                    >
                      📎{" "}
                      {selectedProduct.certificate.original_name ||
                        "มีใบรับรองแนบ"}
                    </AppText>

                    {/* Certificate Image Inline */}
                    {(() => {
                      const certUrl = getCertificateFileUrl();
                      if (certUrl) {
                        return (
                          <TouchableOpacity
                            activeOpacity={0.9}
                            onPress={() => openImageViewer([certUrl], 0)}
                            style={{ marginTop: 10 }}
                          >
                            <Image
                              source={{ uri: certUrl }}
                              style={{
                                width: "100%",
                                height: 220,
                                borderRadius: 10,
                                backgroundColor: "#E5E7EB",
                              }}
                              resizeMode="contain"
                            />
                          </TouchableOpacity>
                        );
                      }
                      return null;
                    })()}

                    {/* Approve/Reject Certificate buttons — only show for pending */}
                    {selectedProduct.certificate.status === "pending" && (
                      <View
                        style={{
                          flexDirection: "row",
                          gap: 8,
                          marginTop: 10,
                        }}
                      >
                        <TouchableOpacity
                          style={{
                            flex: 1,
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 4,
                            backgroundColor: "#22C55E",
                            borderRadius: 10,
                            paddingVertical: 10,
                          }}
                          onPress={() => {
                            Alert.alert(
                              "อนุมัติใบรับรอง",
                              "ยืนยันอนุมัติใบรับรองนี้? สินค้าจะได้รับ badge Certified ✅",
                              [
                                { text: "ยกเลิก" },
                                {
                                  text: "อนุมัติ",
                                  onPress: () =>
                                    handleVerifyCertificate("approved"),
                                },
                              ],
                            );
                          }}
                        >
                          <Ionicons
                            name="checkmark-circle"
                            size={16}
                            color="#FFF"
                          />
                          <AppText
                            weight="semibold"
                            style={{ fontSize: 13, color: "#FFF" }}
                          >
                            อนุมัติ Cert
                          </AppText>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={{
                            flex: 1,
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "center",
                            gap: 4,
                            backgroundColor: "#EF4444",
                            borderRadius: 10,
                            paddingVertical: 10,
                          }}
                          onPress={() => setCertAction("reject")}
                        >
                          <Ionicons
                            name="close-circle"
                            size={16}
                            color="#FFF"
                          />
                          <AppText
                            weight="semibold"
                            style={{ fontSize: 13, color: "#FFF" }}
                          >
                            ปฏิเสธ Cert
                          </AppText>
                        </TouchableOpacity>
                      </View>
                    )}

                    {/* Reject Certificate Note Input */}
                    {certAction === "reject" && (
                      <View style={{ marginTop: 10 }}>
                        <TextInput
                          style={[
                            styles.replyInput,
                            {
                              minHeight: 60,
                              marginBottom: 6,
                            },
                          ]}
                          value={certRejectNote}
                          onChangeText={setCertRejectNote}
                          placeholder="ระบุเหตุผล (ไม่จำเป็น)..."
                          placeholderTextColor="#9CA3AF"
                          multiline
                          maxLength={1000}
                        />
                        <View
                          style={{
                            flexDirection: "row",
                            gap: 8,
                          }}
                        >
                          <TouchableOpacity
                            style={{
                              flex: 1,
                              paddingVertical: 10,
                              borderRadius: 10,
                              backgroundColor: "#F3F4F6",
                              alignItems: "center",
                            }}
                            onPress={() => {
                              setCertAction(null);
                              setCertRejectNote("");
                            }}
                          >
                            <AppText
                              weight="semibold"
                              style={{ fontSize: 13, color: "#6B7280" }}
                            >
                              ยกเลิก
                            </AppText>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={{
                              flex: 1,
                              paddingVertical: 10,
                              borderRadius: 10,
                              backgroundColor: "#EF4444",
                              alignItems: "center",
                            }}
                            onPress={() => handleVerifyCertificate("rejected")}
                            disabled={certVerifyLoading}
                          >
                            <AppText
                              weight="semibold"
                              style={{ fontSize: 13, color: "#FFF" }}
                            >
                              {certVerifyLoading
                                ? "กำลังดำเนินการ..."
                                : "ยืนยันปฏิเสธ"}
                            </AppText>
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}

                    {/* Show admin_note if certificate was rejected */}
                    {selectedProduct.certificate.status === "rejected" &&
                      selectedProduct.certificate.admin_note && (
                        <View
                          style={{
                            marginTop: 8,
                            backgroundColor: "#FEE2E2",
                            borderRadius: 8,
                            padding: 10,
                          }}
                        >
                          <AppText
                            weight="semibold"
                            style={{
                              fontSize: 12,
                              color: "#991B1B",
                              marginBottom: 2,
                            }}
                          >
                            เหตุผลที่ปฏิเสธ:
                          </AppText>
                          <AppText
                            weight="regular"
                            style={{ fontSize: 12, color: "#7F1D1D" }}
                          >
                            {selectedProduct.certificate.admin_note}
                          </AppText>
                        </View>
                      )}
                  </View>
                )}

                <View style={styles.detailGrid}>
                  <View style={styles.detailItem}>
                    <View style={styles.labelRow}>
                      <Ionicons name="pricetag" size={12} color="#9CA3AF" />
                      <AppText weight="regular" style={styles.detailItemLabel}>
                        หมวดหมู่
                      </AppText>
                    </View>
                    <AppText weight="semibold" style={styles.detailItemValue}>
                      {selectedProduct.category?.name || "-"}
                    </AppText>
                  </View>
                  <View style={styles.detailItem}>
                    <View style={styles.labelRow}>
                      <Ionicons name="layers" size={12} color="#9CA3AF" />
                      <AppText weight="regular" style={styles.detailItemLabel}>
                        หมวดย่อย
                      </AppText>
                    </View>
                    <AppText weight="semibold" style={styles.detailItemValue}>
                      {selectedProduct.subcategory?.name || "-"}
                    </AppText>
                  </View>
                  <View style={styles.detailItem}>
                    <View style={styles.labelRow}>
                      <Ionicons name="location" size={12} color="#9CA3AF" />
                      <AppText weight="regular" style={styles.detailItemLabel}>
                        ที่ตั้ง
                      </AppText>
                    </View>
                    <AppText weight="semibold" style={styles.detailItemValue}>
                      {selectedProduct.location || "-"}
                    </AppText>
                  </View>
                  <View style={styles.detailItem}>
                    <View style={styles.labelRow}>
                      <Ionicons name="calendar" size={12} color="#9CA3AF" />
                      <AppText weight="regular" style={styles.detailItemLabel}>
                        วันที่ส่ง
                      </AppText>
                    </View>
                    <AppText weight="semibold" style={styles.detailItemValue}>
                      {formatDateTime(selectedProduct.created_at)}
                    </AppText>
                  </View>
                  <View style={styles.detailItem}>
                    <View style={styles.labelRow}>
                      <Ionicons name="time" size={12} color="#9CA3AF" />
                      <AppText weight="regular" style={styles.detailItemLabel}>
                        เริ่มประมูล
                      </AppText>
                    </View>
                    <AppText weight="semibold" style={styles.detailItemValue}>
                      {formatDateTime(selectedProduct.auction_start_time)}
                    </AppText>
                  </View>
                  <View style={styles.detailItem}>
                    <View style={styles.labelRow}>
                      <Ionicons name="time" size={12} color="#9CA3AF" />
                      <AppText weight="regular" style={styles.detailItemLabel}>
                        สิ้นสุดประมูล
                      </AppText>
                    </View>
                    <AppText weight="semibold" style={styles.detailItemValue}>
                      {formatDateTime(selectedProduct.auction_end_time)}
                    </AppText>
                  </View>
                </View>

                {/* Bids Count */}
                {selectedProduct.bids_count > 0 && (
                  <View
                    style={[
                      styles.detailSection,
                      {
                        backgroundColor: "#EFF6FF",
                        borderRadius: 12,
                        padding: 12,
                        marginBottom: 20,
                      },
                    ]}
                  >
                    <View style={styles.labelRow}>
                      <Ionicons name="stats-chart" size={16} color="#3B82F6" />
                      <AppText
                        weight="semibold"
                        style={[styles.detailLabel, { color: "#1E40AF" }]}
                      >
                        จำนวนการเสนอราคา: {selectedProduct.bids_count}
                      </AppText>
                    </View>
                  </View>
                )}

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
                          อนุมัติสินค้า
                        </AppText>
                      </View>
                    </LinearGradient>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.deleteBtn}
                    onPress={() => {
                      setRejectModalVisible(true);
                    }}
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
                        <Ionicons name="close-circle" size={18} color="#FFF" />
                        <AppText weight="semibold" style={styles.actionBtnText}>
                          ปฏิเสธสินค้า
                        </AppText>
                      </View>
                    </LinearGradient>
                  </TouchableOpacity>
                </View>
              </View>
            </ScrollView>

            {/* Image Viewer inside Product Detail Modal */}
            <ImageViewerModal
              visible={imageViewerVisible}
              images={imageViewerUrls}
              initialIndex={imageViewerIndex}
              onClose={() => setImageViewerVisible(false)}
            />

            {/* Reject Reason Modal (inside Product Detail) */}
            <Modal
              visible={rejectModalVisible}
              transparent
              animationType="fade"
              onRequestClose={() => setRejectModalVisible(false)}
            >
              <View style={styles.banModalOverlay}>
                <View style={styles.banModalContent}>
                  <AppText
                    weight="bold"
                    style={{ fontSize: 18, color: "#111827", marginBottom: 4 }}
                  >
                    ปฏิเสธสินค้า
                  </AppText>
                  <AppText
                    weight="regular"
                    style={{ fontSize: 13, color: "#6B7280", marginBottom: 16 }}
                  >
                    กรุณาระบุเหตุผลในการปฏิเสธสินค้า "{selectedProduct?.name}"
                  </AppText>

                  <AppText
                    weight="semibold"
                    style={{ fontSize: 13, color: "#374151", marginBottom: 6 }}
                  >
                    เหตุผล (จำเป็น)
                  </AppText>
                  <TextInput
                    style={styles.replyInput}
                    value={rejectReason}
                    onChangeText={setRejectReason}
                    placeholder="ระบุเหตุผลในการปฏิเสธ..."
                    placeholderTextColor="#9CA3AF"
                    multiline
                    maxLength={1000}
                  />
                  <AppText
                    weight="regular"
                    style={{
                      fontSize: 11,
                      color: "#9CA3AF",
                      textAlign: "right",
                      marginBottom: 12,
                    }}
                  >
                    {rejectReason.length}/1000
                  </AppText>

                  <View style={{ flexDirection: "row", gap: 10 }}>
                    <TouchableOpacity
                      style={{
                        flex: 1,
                        paddingVertical: 12,
                        borderRadius: 12,
                        backgroundColor: "#F3F4F6",
                        alignItems: "center",
                      }}
                      onPress={() => {
                        setRejectModalVisible(false);
                        setRejectReason("");
                      }}
                    >
                      <AppText
                        weight="semibold"
                        style={{ fontSize: 14, color: "#6B7280" }}
                      >
                        ยกเลิก
                      </AppText>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={{
                        flex: 1,
                        paddingVertical: 12,
                        borderRadius: 12,
                        backgroundColor: rejectReason.trim()
                          ? "#EF4444"
                          : "#FCA5A5",
                        alignItems: "center",
                      }}
                      onPress={handleRejectProduct}
                      disabled={rejectLoading || !rejectReason.trim()}
                    >
                      <AppText
                        weight="semibold"
                        style={{ fontSize: 14, color: "#FFF" }}
                      >
                        {rejectLoading ? "กำลังดำเนินการ..." : "ปฏิเสธ"}
                      </AppText>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>
          </View>
        )}
      </Modal>

      {/* ─── Certificate Viewer Modal ─────────────────── */}
      <Modal
        visible={certModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setCertModalVisible(false)}
      >
        <View style={styles.modalContainer}>
          <SafeAreaView edges={["top"]} style={{ backgroundColor: "#FFF" }}>
            <View style={styles.modalHeader}>
              <TouchableOpacity
                onPress={() => setCertModalVisible(false)}
                style={styles.modalCloseBtn}
              >
                <AppText weight="semibold" style={styles.modalCloseText}>
                  ✕
                </AppText>
              </TouchableOpacity>
              <AppText weight="bold" style={styles.modalTitle}>
                ใบรับรอง
              </AppText>
              <TouchableOpacity
                onPress={() => {
                  const url = getCertificateFileUrl();
                  if (url) Linking.openURL(url);
                }}
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 18,
                  backgroundColor: "#EFF6FF",
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Ionicons name="download-outline" size={18} color="#3B82F6" />
              </TouchableOpacity>
            </View>
          </SafeAreaView>

          <View style={{ flex: 1, backgroundColor: "#F9FAFB" }}>
            {(() => {
              const certUrl = getCertificateFileUrl();
              const fileName =
                selectedProduct?.certificate?.original_name || "";
              if (!certUrl) {
                return (
                  <View
                    style={{
                      flex: 1,
                      justifyContent: "center",
                      alignItems: "center",
                      padding: 20,
                    }}
                  >
                    <Ionicons
                      name="document-outline"
                      size={64}
                      color="#9CA3AF"
                    />
                    <AppText
                      weight="semibold"
                      style={{
                        fontSize: 16,
                        color: "#6B7280",
                        marginTop: 12,
                      }}
                    >
                      ไม่สามารถโหลดใบรับรองได้
                    </AppText>
                  </View>
                );
              }

              if (isImageFile(fileName)) {
                return (
                  <ScrollView
                    style={{ flex: 1 }}
                    contentContainerStyle={{
                      alignItems: "center",
                      padding: 16,
                    }}
                    maximumZoomScale={3}
                    minimumZoomScale={1}
                  >
                    <Image
                      source={{ uri: certUrl }}
                      style={{
                        width: width - 32,
                        height: (width - 32) * 1.4,
                        borderRadius: 12,
                        backgroundColor: "#E5E7EB",
                      }}
                      resizeMode="contain"
                    />
                    <AppText
                      weight="regular"
                      style={{
                        fontSize: 12,
                        color: "#9CA3AF",
                        marginTop: 12,
                        textAlign: "center",
                      }}
                    >
                      {fileName}
                    </AppText>
                  </ScrollView>
                );
              }

              // PDF or other file — show info + open externally
              return (
                <View
                  style={{
                    flex: 1,
                    justifyContent: "center",
                    alignItems: "center",
                    padding: 20,
                  }}
                >
                  <View
                    style={{
                      width: 80,
                      height: 80,
                      borderRadius: 20,
                      backgroundColor: "#FEE2E2",
                      justifyContent: "center",
                      alignItems: "center",
                      marginBottom: 16,
                    }}
                  >
                    <Ionicons name="document-text" size={40} color="#EF4444" />
                  </View>
                  <AppText
                    weight="semibold"
                    style={{
                      fontSize: 16,
                      color: "#111827",
                      marginBottom: 4,
                    }}
                  >
                    {fileName || "Certificate File"}
                  </AppText>
                  <AppText
                    weight="regular"
                    style={{
                      fontSize: 13,
                      color: "#6B7280",
                      textAlign: "center",
                      marginBottom: 20,
                    }}
                  >
                    ไฟล์นี้เป็น PDF ไม่สามารถแสดงในแอปได้{"\n"}
                    กดปุ่มด้านล่างเพื่อเปิดดู
                  </AppText>
                  <TouchableOpacity
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 6,
                      backgroundColor: "#3B82F6",
                      paddingHorizontal: 20,
                      paddingVertical: 12,
                      borderRadius: 12,
                    }}
                    onPress={() => Linking.openURL(certUrl)}
                  >
                    <Ionicons name="open-outline" size={18} color="#FFF" />
                    <AppText
                      weight="semibold"
                      style={{ fontSize: 14, color: "#FFF" }}
                    >
                      เปิดไฟล์
                    </AppText>
                  </TouchableOpacity>
                </View>
              );
            })()}

            {/* Bottom action bar for pending certs */}
            {selectedProduct?.certificate?.status === "pending" && (
              <View
                style={{
                  flexDirection: "row",
                  gap: 10,
                  padding: 16,
                  paddingBottom: 30,
                  backgroundColor: "#FFF",
                  borderTopWidth: 1,
                  borderTopColor: "#F3F4F6",
                }}
              >
                <TouchableOpacity
                  style={{
                    flex: 1,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    backgroundColor: "#22C55E",
                    borderRadius: 12,
                    paddingVertical: 14,
                  }}
                  disabled={certVerifyLoading}
                  onPress={() => {
                    Alert.alert(
                      "อนุมัติใบรับรอง",
                      "ยืนยันอนุมัติใบรับรองนี้?",
                      [
                        { text: "ยกเลิก" },
                        {
                          text: "อนุมัติ",
                          onPress: () => {
                            handleVerifyCertificate("approved");
                            setCertModalVisible(false);
                          },
                        },
                      ],
                    );
                  }}
                >
                  {certVerifyLoading ? (
                    <ActivityIndicator color="#FFF" size="small" />
                  ) : (
                    <>
                      <Ionicons
                        name="checkmark-circle"
                        size={18}
                        color="#FFF"
                      />
                      <AppText
                        weight="semibold"
                        style={{ fontSize: 15, color: "#FFF" }}
                      >
                        อนุมัติใบรับรอง
                      </AppText>
                    </>
                  )}
                </TouchableOpacity>
                <TouchableOpacity
                  style={{
                    flex: 1,
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: 6,
                    backgroundColor: "#EF4444",
                    borderRadius: 12,
                    paddingVertical: 14,
                  }}
                  onPress={() => {
                    setCertModalVisible(false);
                    setCertAction("reject");
                  }}
                >
                  <Ionicons name="close-circle" size={18} color="#FFF" />
                  <AppText
                    weight="semibold"
                    style={{ fontSize: 15, color: "#FFF" }}
                  >
                    ปฏิเสธใบรับรอง
                  </AppText>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
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
                        {(() => {
                          const evidenceUrls = selectedReport.evidence_images
                            .map((img) => getFullImageUrl(img))
                            .filter(Boolean) as string[];
                          return selectedReport.evidence_images.map(
                            (img, idx) => (
                              <TouchableOpacity
                                key={idx}
                                activeOpacity={0.9}
                                onPress={() =>
                                  openImageViewer(evidenceUrls, idx)
                                }
                              >
                                <Image
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
                              </TouchableOpacity>
                            ),
                          );
                        })()}
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
                  {selectedReport.order_id ? (
                    <View
                      style={{
                        backgroundColor: "#FFF8E1",
                        borderRadius: 10,
                        padding: 12,
                        borderWidth: 1,
                        borderColor: "#FFC107",
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <Ionicons
                        name="information-circle"
                        size={18}
                        color="#F59E0B"
                      />
                      <AppText
                        weight="regular"
                        style={{ fontSize: 13, color: "#92400E", flex: 1 }}
                      >
                        รายงานนี้มาจาก dispute คำสั่งซื้อ สถานะจัดการผ่านระบบ
                        order โดยอัตโนมัติ
                      </AppText>
                    </View>
                  ) : (
                    <>
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
                    </>
                  )}
                </View>
              </View>
            </ScrollView>

            {/* Image Viewer inside Report Detail Modal */}
            <ImageViewerModal
              visible={imageViewerVisible}
              images={imageViewerUrls}
              initialIndex={imageViewerIndex}
              onClose={() => setImageViewerVisible(false)}
            />
          </View>
        )}
      </Modal>

      {/* ─── User Detail Modal ────────────────────────── */}
      <Modal
        visible={userModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        {selectedUser && (
          <View style={styles.modalContainer}>
            <SafeAreaView edges={["top"]} style={{ backgroundColor: "#FFF" }}>
              <View style={styles.modalHeader}>
                <TouchableOpacity
                  onPress={() => {
                    setUserModalVisible(false);
                    fetchUsers(); // Sync with server when closing detail modal
                  }}
                  style={styles.modalCloseBtn}
                >
                  <AppText weight="semibold" style={styles.modalCloseText}>
                    ✕
                  </AppText>
                </TouchableOpacity>
                <AppText weight="bold" style={styles.modalTitle}>
                  User Detail
                </AppText>
                <View style={{ width: 36 }} />
              </View>
            </SafeAreaView>

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: 40 }}
            >
              <View style={styles.modalBody}>
                {/* User Avatar & Name */}
                <View style={{ alignItems: "center", marginBottom: 20 }}>
                  {selectedUser.profile_image ? (
                    <Image
                      source={{
                        uri: getFullImageUrl(selectedUser.profile_image)!,
                      }}
                      style={{
                        width: 80,
                        height: 80,
                        borderRadius: 40,
                        marginBottom: 12,
                        backgroundColor: "#F3F4F6",
                      }}
                    />
                  ) : (
                    <View
                      style={{
                        width: 80,
                        height: 80,
                        borderRadius: 40,
                        backgroundColor: "#E8F0FF",
                        justifyContent: "center",
                        alignItems: "center",
                        marginBottom: 12,
                      }}
                    >
                      <AppText
                        weight="bold"
                        style={{ fontSize: 28, color: "#3B82F6" }}
                      >
                        {selectedUser.name.charAt(0).toUpperCase()}
                      </AppText>
                    </View>
                  )}
                  <View
                    style={{
                      flexDirection: "row",
                      alignItems: "center",
                      gap: 8,
                    }}
                  >
                    <AppText
                      weight="bold"
                      style={{ fontSize: 20, color: "#111827" }}
                    >
                      {selectedUser.name}
                    </AppText>
                    {selectedUser.role === "admin" && (
                      <View style={styles.adminBadge}>
                        <AppText
                          weight="semibold"
                          style={styles.adminBadgeText}
                        >
                          Admin
                        </AppText>
                      </View>
                    )}
                    {selectedUser.is_banned && (
                      <View style={styles.bannedBadge}>
                        <AppText
                          weight="semibold"
                          style={styles.bannedBadgeText}
                        >
                          Banned
                        </AppText>
                      </View>
                    )}
                  </View>
                  <AppText
                    weight="regular"
                    style={{ fontSize: 13, color: "#6B7280", marginTop: 4 }}
                  >
                    ID: {selectedUser.id}
                  </AppText>
                </View>

                {/* Contact Info */}
                <View style={styles.detailSection}>
                  <View style={styles.labelRow}>
                    <Ionicons name="person-circle" size={16} color="#111827" />
                    <AppText weight="semibold" style={styles.detailLabel}>
                      ข้อมูลติดต่อ
                    </AppText>
                  </View>
                  <View style={styles.detailGrid}>
                    <View style={styles.detailItem}>
                      <View style={styles.labelRow}>
                        <Ionicons name="mail" size={12} color="#9CA3AF" />
                        <AppText
                          weight="regular"
                          style={styles.detailItemLabel}
                        >
                          อีเมล
                        </AppText>
                      </View>
                      <AppText
                        weight="semibold"
                        style={styles.detailItemValue}
                        numberOfLines={1}
                      >
                        {selectedUser.email}
                      </AppText>
                    </View>
                    <View style={styles.detailItem}>
                      <View style={styles.labelRow}>
                        <Ionicons name="call" size={12} color="#9CA3AF" />
                        <AppText
                          weight="regular"
                          style={styles.detailItemLabel}
                        >
                          เบอร์โทร
                        </AppText>
                      </View>
                      <AppText weight="semibold" style={styles.detailItemValue}>
                        {selectedUser.phone_number || "-"}
                      </AppText>
                    </View>
                    <View style={styles.detailItem}>
                      <View style={styles.labelRow}>
                        <Ionicons
                          name="shield-checkmark"
                          size={12}
                          color="#9CA3AF"
                        />
                        <AppText
                          weight="regular"
                          style={styles.detailItemLabel}
                        >
                          บทบาท
                        </AppText>
                      </View>
                      <AppText weight="semibold" style={styles.detailItemValue}>
                        {selectedUser.role}
                      </AppText>
                    </View>
                    <View style={styles.detailItem}>
                      <View style={styles.labelRow}>
                        <Ionicons name="calendar" size={12} color="#9CA3AF" />
                        <AppText
                          weight="regular"
                          style={styles.detailItemLabel}
                        >
                          สมัครเมื่อ
                        </AppText>
                      </View>
                      <AppText weight="semibold" style={styles.detailItemValue}>
                        {formatReportDate(selectedUser.created_at)}
                      </AppText>
                    </View>
                  </View>
                </View>

                {/* Stats */}
                {selectedUser.products_count !== undefined && (
                  <View style={styles.detailSection}>
                    <View style={styles.labelRow}>
                      <Ionicons name="stats-chart" size={16} color="#111827" />
                      <AppText weight="semibold" style={styles.detailLabel}>
                        สถิติ
                      </AppText>
                    </View>
                    <View style={styles.detailGrid}>
                      <View style={styles.detailItem}>
                        <AppText
                          weight="regular"
                          style={styles.detailItemLabel}
                        >
                          สินค้า
                        </AppText>
                        <AppText
                          weight="bold"
                          style={[
                            styles.detailItemValue,
                            { fontSize: 18, color: "#3B82F6" },
                          ]}
                        >
                          {selectedUser.products_count ?? 0}
                        </AppText>
                      </View>
                      <View style={styles.detailItem}>
                        <AppText
                          weight="regular"
                          style={styles.detailItemLabel}
                        >
                          ออเดอร์
                        </AppText>
                        <AppText
                          weight="bold"
                          style={[
                            styles.detailItemValue,
                            { fontSize: 18, color: "#22C55E" },
                          ]}
                        >
                          {selectedUser.orders_count ?? 0}
                        </AppText>
                      </View>
                      <View style={styles.detailItem}>
                        <AppText
                          weight="regular"
                          style={styles.detailItemLabel}
                        >
                          รายงาน
                        </AppText>
                        <AppText
                          weight="bold"
                          style={[
                            styles.detailItemValue,
                            { fontSize: 18, color: "#F59E0B" },
                          ]}
                        >
                          {selectedUser.reports_count ?? 0}
                        </AppText>
                      </View>
                      <View style={styles.detailItem}>
                        <AppText
                          weight="regular"
                          style={styles.detailItemLabel}
                        >
                          ถูกรายงาน
                        </AppText>
                        <AppText
                          weight="bold"
                          style={[
                            styles.detailItemValue,
                            { fontSize: 18, color: "#EF4444" },
                          ]}
                        >
                          {selectedUser.reported_count ?? 0}
                        </AppText>
                      </View>
                    </View>
                  </View>
                )}

                {/* Wallet */}
                {selectedUser.wallet && (
                  <View style={styles.detailSection}>
                    <View style={styles.labelRow}>
                      <Ionicons name="wallet" size={16} color="#111827" />
                      <AppText weight="semibold" style={styles.detailLabel}>
                        กระเป๋าเงิน
                      </AppText>
                    </View>
                    <View
                      style={[
                        styles.sellerCard,
                        { backgroundColor: "#F0FDF4" },
                      ]}
                    >
                      <View
                        style={[
                          styles.sellerAvatar,
                          { backgroundColor: "#DCFCE7" },
                        ]}
                      >
                        <Ionicons name="cash" size={20} color="#22C55E" />
                      </View>
                      <View style={{ flex: 1 }}>
                        <AppText
                          weight="regular"
                          style={{ fontSize: 11, color: "#9CA3AF" }}
                        >
                          ยอดคงเหลือ
                        </AppText>
                        <AppText
                          weight="bold"
                          style={{ fontSize: 18, color: "#22C55E" }}
                        >
                          ฿
                          {parseFloat(
                            selectedUser.wallet.balance_available,
                          ).toLocaleString()}
                        </AppText>
                      </View>
                    </View>
                  </View>
                )}

                {/* Ban Info (if banned) */}
                {selectedUser.is_banned && (
                  <View
                    style={[
                      styles.detailSection,
                      {
                        backgroundColor: "#FEF2F2",
                        borderRadius: 16,
                        padding: 16,
                        borderWidth: 1,
                        borderColor: "#FECACA",
                      },
                    ]}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: 12,
                      }}
                    >
                      <View style={[styles.labelRow, { marginBottom: 0 }]}>
                        <Ionicons name="ban" size={18} color="#EF4444" />
                        <AppText
                          weight="bold"
                          style={{
                            fontSize: 15,
                            color: "#EF4444",
                            marginBottom: 0,
                          }}
                        >
                          ถูกระงับการใช้งาน
                        </AppText>
                      </View>
                      {(() => {
                        const remaining = getRemainingBanDays(
                          selectedUser.banned_until,
                        );
                        return (
                          <View
                            style={{
                              backgroundColor: "#DC2626",
                              paddingHorizontal: 10,
                              paddingVertical: 4,
                              borderRadius: 12,
                            }}
                          >
                            <AppText
                              weight="bold"
                              style={{ fontSize: 11, color: "#FFF" }}
                            >
                              {remaining === null
                                ? "ถาวร"
                                : remaining === 0
                                  ? "หมดอายุ"
                                  : `เหลือ ${remaining} วัน`}
                            </AppText>
                          </View>
                        );
                      })()}
                    </View>

                    {selectedUser.ban_reason && (
                      <View
                        style={{
                          backgroundColor: "#FFF",
                          borderRadius: 10,
                          padding: 12,
                          marginBottom: 10,
                        }}
                      >
                        <AppText
                          weight="semibold"
                          style={{
                            fontSize: 11,
                            color: "#9CA3AF",
                            marginBottom: 4,
                          }}
                        >
                          เหตุผลในการแบน
                        </AppText>
                        <AppText
                          weight="regular"
                          style={{
                            fontSize: 13,
                            color: "#374151",
                            lineHeight: 20,
                          }}
                        >
                          {selectedUser.ban_reason}
                        </AppText>
                      </View>
                    )}

                    <View
                      style={{
                        flexDirection: "row",
                        gap: 12,
                      }}
                    >
                      {selectedUser.banned_until && (
                        <View style={{ flex: 1 }}>
                          <AppText
                            weight="semibold"
                            style={{
                              fontSize: 11,
                              color: "#9CA3AF",
                              marginBottom: 2,
                            }}
                          >
                            แบนถึงวันที่
                          </AppText>
                          <AppText
                            weight="semibold"
                            style={{ fontSize: 13, color: "#991B1B" }}
                          >
                            {formatReportDate(selectedUser.banned_until)}
                          </AppText>
                        </View>
                      )}
                    </View>
                  </View>
                )}

                {/* Actions */}
                <View style={styles.modalActions}>
                  {selectedUser.is_banned ? (
                    <TouchableOpacity
                      style={styles.approveBtn}
                      onPress={() => handleUnbanUser(selectedUser)}
                    >
                      <LinearGradient
                        colors={["#22C55E", "#16A34A"]}
                        style={styles.actionGradient}
                      >
                        <AppText weight="semibold" style={styles.actionBtnText}>
                          ปลดแบนผู้ใช้
                        </AppText>
                      </LinearGradient>
                    </TouchableOpacity>
                  ) : selectedUser.role !== "admin" ? (
                    <TouchableOpacity
                      style={styles.deleteBtn}
                      onPress={() => {
                        setBanReason("");
                        setBanDuration("7");
                        setBanModalVisible(true);
                      }}
                    >
                      <LinearGradient
                        colors={["#EF4444", "#DC2626"]}
                        style={styles.actionGradient}
                      >
                        <AppText weight="semibold" style={styles.actionBtnText}>
                          แบนผู้ใช้
                        </AppText>
                      </LinearGradient>
                    </TouchableOpacity>
                  ) : null}
                </View>
              </View>
            </ScrollView>

            {/* ─── Ban User Modal (inside User Detail Modal) ─── */}
            <Modal visible={banModalVisible} animationType="fade" transparent>
              <View style={styles.banModalOverlay}>
                <View style={styles.banModalContent}>
                  <AppText
                    weight="bold"
                    style={{ fontSize: 18, color: "#111827", marginBottom: 4 }}
                  >
                    แบนผู้ใช้
                  </AppText>
                  <AppText
                    weight="regular"
                    style={{ fontSize: 13, color: "#6B7280", marginBottom: 16 }}
                  >
                    {selectedUser?.name} (ID: {selectedUser?.id})
                  </AppText>

                  <AppText
                    weight="medium"
                    style={{ fontSize: 13, color: "#374151", marginBottom: 6 }}
                  >
                    เหตุผลในการแบน *
                  </AppText>
                  <TextInput
                    style={[styles.replyInput, { minHeight: 80 }]}
                    placeholder="กรอกเหตุผลในการแบน..."
                    placeholderTextColor="#9CA3AF"
                    multiline
                    value={banReason}
                    onChangeText={setBanReason}
                  />

                  <AppText
                    weight="medium"
                    style={{ fontSize: 13, color: "#374151", marginBottom: 6 }}
                  >
                    จำนวนวัน
                  </AppText>
                  <View
                    style={{ flexDirection: "row", gap: 8, marginBottom: 16 }}
                  >
                    {["7", "14", "30", "90", "365"].map((d) => (
                      <TouchableOpacity
                        key={d}
                        style={{
                          paddingHorizontal: 14,
                          paddingVertical: 8,
                          borderRadius: 20,
                          backgroundColor:
                            banDuration === d ? "#EF4444" : "#F3F4F6",
                        }}
                        onPress={() => setBanDuration(d)}
                      >
                        <AppText
                          weight="semibold"
                          style={{
                            fontSize: 12,
                            color: banDuration === d ? "#FFF" : "#6B7280",
                          }}
                        >
                          {d} วัน
                        </AppText>
                      </TouchableOpacity>
                    ))}
                  </View>

                  <View style={{ flexDirection: "row", gap: 10 }}>
                    <TouchableOpacity
                      style={{
                        flex: 1,
                        paddingVertical: 12,
                        borderRadius: 12,
                        backgroundColor: "#F3F4F6",
                        alignItems: "center",
                      }}
                      onPress={() => setBanModalVisible(false)}
                    >
                      <AppText
                        weight="semibold"
                        style={{ fontSize: 14, color: "#6B7280" }}
                      >
                        ยกเลิก
                      </AppText>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={{
                        flex: 1,
                        paddingVertical: 12,
                        borderRadius: 12,
                        backgroundColor: "#EF4444",
                        alignItems: "center",
                        opacity: banLoading || !banReason.trim() ? 0.5 : 1,
                      }}
                      disabled={banLoading || !banReason.trim()}
                      onPress={handleBanUser}
                    >
                      <AppText
                        weight="semibold"
                        style={{ fontSize: 14, color: "#FFF" }}
                      >
                        {banLoading ? "กำลังดำเนินการ..." : "ยืนยันแบน"}
                      </AppText>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>
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

  // User Card
  userSearchRow: {
    marginBottom: 12,
  },
  userSearchInput: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFF",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  userSearchText: {
    flex: 1,
    fontSize: 14,
    color: "#111827",
  },
  userCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#FFF",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  userCardLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: 12,
  },
  userAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#F3F4F6",
  },
  userAvatarPlaceholder: {
    backgroundColor: "#E8F0FF",
    justifyContent: "center",
    alignItems: "center",
  },
  userAvatarText: {
    fontSize: 18,
    color: "#3B82F6",
  },
  userName: {
    fontSize: 15,
    color: "#111827",
    flexShrink: 1,
  },
  userEmail: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 1,
  },
  adminBadge: {
    backgroundColor: "#DBEAFE",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  adminBadgeText: {
    fontSize: 10,
    color: "#2563EB",
  },
  bannedBadge: {
    backgroundColor: "#FEE2E2",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  bannedBadgeText: {
    fontSize: 10,
    color: "#DC2626",
  },

  // Ban Modal
  banModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  banModalContent: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 24,
    width: "100%",
    maxWidth: 400,
  },
});

export default AdminScreen;
