import Ionicons from "@expo/vector-icons/Ionicons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import LottieView from "lottie-react-native";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
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
import { useLanguage } from "../contexts/LanguageContext";
import { apiService, getFullImageUrl } from "../utils/api";
import { AdminStats, Product, User } from "../utils/api/types";
import type { TranslationKeys } from "../utils/translations";
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
const formatPrice = (n: number | string | null | undefined) => {
  if (n === null || n === undefined) return "฿0";
  const num = typeof n === "string" ? parseFloat(n) : n;
  if (isNaN(num)) return "฿0";
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

const getReportStatusLabel = (
  s: string,
  t: (key: keyof TranslationKeys) => string,
) => {
  switch (s) {
    case "pending":
      return t("reportPending");
    case "reviewing":
      return t("reportReviewing");
    case "resolved":
      return t("reportResolved");
    case "dismissed":
      return t("reportDismissed");
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

const getReportTypeLabel = (
  type: string,
  t: (key: keyof TranslationKeys) => string,
) => {
  switch (type) {
    case "scam":
      return t("reportTypeScam");
    case "fake_product":
      return t("reportTypeFakeProduct");
    case "harassment":
      return t("reportTypeHarassment");
    case "inappropriate_content":
      return t("reportTypeInappropriate");
    case "other":
      return t("reportTypeOther");
    default:
      return type.replace(/_/g, " ");
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
  const { t } = useLanguage();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "pending" | "reports" | "users" | "withdrawals"
  >("pending");

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

  // Withdrawals state
  const [withdrawals, setWithdrawals] = useState<any[]>([]);
  const [withdrawalsLoading, setWithdrawalsLoading] = useState(false);
  const [wdFilter, setWdFilter] = useState<
    "pending" | "confirmed" | "rejected" | ""
  >("pending");
  const [wdDetailVisible, setWdDetailVisible] = useState(false);
  const [selectedWd, setSelectedWd] = useState<any | null>(null);
  const [wdRejectVisible, setWdRejectVisible] = useState(false);
  const [wdRejectNote, setWdRejectNote] = useState("");
  const [wdActionLoading, setWdActionLoading] = useState(false);

  const fetchDashboardStats = async () => {
    try {
      const stats = await apiService.admin.getStats();
      setDashboardStats(stats);
    } catch (e: any) {
      console.error("Failed to fetch admin stats:", e.message);
    }
  };

  const fetchWithdrawals = async (status?: string) => {
    try {
      setWithdrawalsLoading(true);
      const response = await apiService.admin.getWithdrawals(
        status || undefined,
      );
      const data = response as any;
      let list: any[] = [];
      if (Array.isArray(data)) {
        list = data;
      } else if (data?.data && Array.isArray(data.data)) {
        list = data.data;
      }
      setWithdrawals(list);
    } catch (e: any) {
      console.error("Failed to fetch withdrawals:", e.message);
    } finally {
      setWithdrawalsLoading(false);
    }
  };

  const handleConfirmWithdrawal = async (id: number) => {
    Alert.alert(t("adminConfirmWithdrawTitle"), t("adminConfirmWithdrawMsg"), [
      { text: t("cancel"), style: "cancel" },
      {
        text: t("confirm"),
        style: "default",
        onPress: async () => {
          try {
            setWdActionLoading(true);
            await apiService.admin.confirmWithdrawal(id);
            Alert.alert(t("success"), t("adminWithdrawConfirmed"));
            setWdDetailVisible(false);
            setSelectedWd(null);
            fetchWithdrawals(wdFilter);
          } catch (e: any) {
            Alert.alert(t("error"), e.message || t("adminCannotConfirm"));
          } finally {
            setWdActionLoading(false);
          }
        },
      },
    ]);
  };

  const handleRejectWithdrawal = async () => {
    if (!wdRejectNote.trim()) {
      Alert.alert(t("adminEnterReason"), t("adminSpecifyRejectReason"));
      return;
    }
    try {
      setWdActionLoading(true);
      await apiService.admin.rejectWithdrawal(
        selectedWd.id,
        wdRejectNote.trim(),
      );
      Alert.alert(t("success"), t("adminWithdrawRejected"));
      setWdRejectVisible(false);
      setWdRejectNote("");
      setWdDetailVisible(false);
      setSelectedWd(null);
      fetchWithdrawals(wdFilter);
    } catch (e: any) {
      Alert.alert(t("error"), e.message || t("adminCannotReject"));
    } finally {
      setWdActionLoading(false);
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
      // Fetch withdrawals
      fetchWithdrawals("pending");
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
      Alert.alert(t("error"), t("adminEnterBanReason"));
      return;
    }
    const days = parseInt(banDuration, 10);
    if (isNaN(days) || days <= 0) {
      Alert.alert(t("error"), t("adminEnterValidDays"));
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
      Alert.alert(
        t("success"),
        t("adminBanSuccess").replace("{name}", userName),
      );
    } catch (error: any) {
      setBanLoading(false);
      Alert.alert(t("error"), error.message || t("adminCannotBan"));
    }
  };

  const handleUnbanUser = async (u: AdminUser) => {
    Alert.alert(
      t("confirm"),
      t("adminUnbanConfirmMsg").replace("{name}", u.name),
      [
        { text: t("cancel") },
        {
          text: t("confirm"),
          onPress: async () => {
            try {
              await apiService.admin.unbanUser(u.id);
              Alert.alert(
                t("success"),
                t("adminUnbanSuccess").replace("{name}", u.name),
              );
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
              Alert.alert(t("error"), error.message || t("adminCannotUnban"));
            }
          },
        },
      ],
    );
  };

  const handleLogout = async () => {
    Alert.alert(t("logoutConfirmTitle"), t("logoutConfirmMessage"), [
      { text: t("cancel") },
      {
        text: t("logoutConfirmYes"),
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
      Alert.alert(t("error"), t("adminEnterRejectReason"));
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
      Alert.alert(t("success"), t("adminProductRejected"));
      fetchPendingProducts();
      fetchDashboardStats();
    } catch (error: any) {
      Alert.alert(t("error"), error.message || t("adminCannotRejectProduct"));
    } finally {
      setRejectLoading(false);
    }
  };

  const handleApproveProduct = (product: Product) => {
    Alert.alert(
      t("adminApproveProduct"),
      t("adminApproveConfirmMsg").replace("{name}", product.name),
      [
        { text: t("cancel") },
        {
          text: t("approve"),
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
              Alert.alert(t("success"), t("adminProductApproved"));
              fetchPendingProducts();
              fetchDashboardStats();
            } catch (error: any) {
              Alert.alert(t("error"), error.message || t("adminCannotApprove"));
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
        t("success"),
        status === "approved" ? t("adminCertApproved") : t("adminCertRejected"),
      );
      fetchPendingProducts();
      fetchDashboardStats();
    } catch (error: any) {
      Alert.alert(t("error"), error.message || t("adminCannotProcessCert"));
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
      t("adminChangeStatus"),
      `${t("adminChangeStatusMsg").replace("{status}", getReportStatusLabel(newStatus, t))}${adminNote.trim() ? `\n\n${t("adminNoteLabel")}: ${adminNote.trim()}` : ""}`,
      [
        { text: t("cancel") },
        {
          text: t("confirm"),
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
                Alert.alert(t("success"), t("adminStatusUpdated"));
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
                Alert.alert(t("success"), t("adminStatusUpdated"));
              }
              fetchReports(); // refresh list
            } catch (error: any) {
              Alert.alert(
                t("error"),
                error.message || t("adminCannotUpdateStatus"),
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
                {dashboardStats?.active_auctions ?? 0}
              </AppText>
              <AppText weight="regular" style={styles.statLabel}>
                Auctions
              </AppText>
            </View>
            <View style={styles.statCard}>
              <AppText weight="bold" style={styles.statNumber}>
                {dashboardStats?.pending_withdrawals ?? 0}
              </AppText>
              <AppText weight="regular" style={styles.statLabel}>
                Withdrawals
              </AppText>
            </View>
          </View>

          {/* Tab Switcher */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabRow}
          >
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
                {t("pending")} ({pendingProducts.length})
              </AppText>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === "withdrawals" && styles.tabActive,
              ]}
              onPress={() => setActiveTab("withdrawals")}
            >
              <AppText
                weight="semibold"
                style={[
                  styles.tabText,
                  activeTab === "withdrawals" && styles.tabTextActive,
                ]}
              >
                {t("adminWithdrawals")} ({withdrawals.length})
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
                {t("adminReports")} ({reports.length})
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
                {t("adminUsers")} ({users.length})
              </AppText>
            </TouchableOpacity>
          </ScrollView>
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
                  {t("adminNoPendingProducts")}
                </AppText>
                <AppText weight="regular" style={styles.emptySub}>
                  {t("adminAllApproved")}
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
                          {product.user?.name || t("unknownUser")}
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
                  {t("adminNoReports")}
                </AppText>
                <AppText weight="regular" style={styles.emptySub}>
                  {t("adminNoReportsSub")}
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
                          {getReportTypeLabel(report.type, t)}
                        </AppText>
                        <AppText
                          weight="regular"
                          style={styles.reportTypeBadgeText}
                        >
                          {report.report_code} •{" "}
                          {report.reporter?.name || t("unknownUser")}
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
                        {getReportStatusLabel(report.status, t)}
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
                  placeholder={t("adminSearchUserPlaceholder")}
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
                  {t("adminNoUsers")}
                </AppText>
                <AppText weight="regular" style={styles.emptySub}>
                  {t("adminNoUsersSub")}
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
                              {t("adminJoinedLabel")}{" "}
                              {formatReportDate(u.created_at)}
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
                                  {t("adminBanReasonPrefix")}: {u.ban_reason}
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
                                    if (remaining === null)
                                      return t("adminBanPermanent");
                                    if (remaining === 0)
                                      return t("adminBanExpired");
                                    return t("adminBanDaysLeft").replace(
                                      "{n}",
                                      String(remaining),
                                    );
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
                            {t("adminUnbanBtn")}
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
        ) : activeTab === "withdrawals" ? (
          /* ─── WITHDRAWALS TAB ─────────────────────────── */
          <>
            {/* Status Filter */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ gap: 8, marginBottom: 14 }}
            >
              {(
                [
                  { key: "pending", label: t("adminWdFilterPending") },
                  { key: "confirmed", label: t("adminWdFilterConfirmed") },
                  { key: "rejected", label: t("adminWdFilterRejected") },
                  { key: "", label: t("txTypeAll") },
                ] as const
              ).map((f) => (
                <TouchableOpacity
                  key={f.key}
                  onPress={() => {
                    setWdFilter(f.key);
                    fetchWithdrawals(f.key);
                  }}
                  style={{
                    paddingHorizontal: 14,
                    paddingVertical: 8,
                    borderRadius: 20,
                    backgroundColor: wdFilter === f.key ? "#003994" : "#F2F4F7",
                  }}
                >
                  <AppText
                    weight="semibold"
                    style={{
                      fontSize: 12,
                      color: wdFilter === f.key ? "#FFF" : "#666",
                    }}
                  >
                    {f.label}
                  </AppText>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {withdrawalsLoading ? (
              <View style={{ alignItems: "center", paddingVertical: 40 }}>
                <LottieView
                  source={require("../assets/animations/loading.json")}
                  autoPlay
                  loop
                  style={{ width: 80, height: 80 }}
                />
              </View>
            ) : withdrawals.length === 0 ? (
              <View style={{ alignItems: "center", paddingVertical: 40 }}>
                <LottieView
                  source={require("../assets/animations/empty.json")}
                  autoPlay
                  loop
                  style={{ width: 120, height: 120 }}
                />
                <AppText
                  weight="medium"
                  style={{ color: "#9CA3AF", marginTop: 8 }}
                >
                  {t("noWithdrawals")}
                </AppText>
              </View>
            ) : (
              withdrawals.map((wd) => {
                const statusColor =
                  wd.withdraw_status === "pending"
                    ? "#F59E0B"
                    : wd.withdraw_status === "confirmed"
                      ? "#22C55E"
                      : "#EF4444";
                const statusLabel =
                  wd.withdraw_status === "pending"
                    ? t("reportPending")
                    : wd.withdraw_status === "confirmed"
                      ? t("approved")
                      : t("rejected");
                return (
                  <TouchableOpacity
                    key={wd.id}
                    style={styles.wdCard}
                    onPress={() => {
                      setSelectedWd(wd);
                      setWdDetailVisible(true);
                    }}
                  >
                    <View style={styles.wdCardTop}>
                      <View style={{ flex: 1 }}>
                        <AppText
                          weight="semibold"
                          style={{ fontSize: 14, color: "#111" }}
                          numberOfLines={1}
                        >
                          {wd.user?.name || `User #${wd.user_id}`}
                        </AppText>
                        <AppText
                          weight="regular"
                          style={{
                            fontSize: 11,
                            color: "#777",
                            marginTop: 2,
                          }}
                          numberOfLines={1}
                        >
                          {wd.user?.email || ""}
                          {wd.user?.phone ? ` • ${wd.user.phone}` : ""}
                        </AppText>
                      </View>
                      <View
                        style={[
                          styles.wdStatusBadge,
                          { backgroundColor: statusColor + "18" },
                        ]}
                      >
                        <View
                          style={[
                            styles.wdStatusDot,
                            { backgroundColor: statusColor },
                          ]}
                        />
                        <AppText
                          weight="semibold"
                          style={{
                            fontSize: 11,
                            color: statusColor,
                          }}
                        >
                          {statusLabel}
                        </AppText>
                      </View>
                    </View>

                    <View style={styles.wdCardBody}>
                      <View style={styles.wdInfoRow}>
                        <AppText weight="regular" style={styles.wdInfoLabel}>
                          {t("adminWdAmountLabel")}
                        </AppText>
                        <AppText
                          weight="bold"
                          style={{
                            fontSize: 15,
                            color: "#003994",
                          }}
                        >
                          {formatPrice(wd.amount)}
                        </AppText>
                      </View>
                      <View style={styles.wdInfoRow}>
                        <AppText weight="regular" style={styles.wdInfoLabel}>
                          {t("adminWdBankLabel")}
                        </AppText>
                        <AppText
                          weight="medium"
                          style={{ fontSize: 13, color: "#333" }}
                          numberOfLines={1}
                        >
                          {wd.bank_code?.toUpperCase?.() || "-"}
                        </AppText>
                      </View>
                      <View style={styles.wdInfoRow}>
                        <AppText weight="regular" style={styles.wdInfoLabel}>
                          {t("adminWdAccountLabel")}
                        </AppText>
                        <AppText
                          weight="medium"
                          style={{ fontSize: 13, color: "#333" }}
                        >
                          {wd.account_number || "-"}
                        </AppText>
                      </View>
                      {wd.created_at && (
                        <View style={styles.wdInfoRow}>
                          <AppText weight="regular" style={styles.wdInfoLabel}>
                            {t("adminWdDateLabel")}
                          </AppText>
                          <AppText
                            weight="regular"
                            style={{ fontSize: 12, color: "#888" }}
                          >
                            {formatDateTime(wd.created_at)}
                          </AppText>
                        </View>
                      )}
                    </View>
                  </TouchableOpacity>
                );
              })
            )}
          </>
        ) : null}
      </ScrollView>

      {/* ─── Withdrawal Detail Modal ──────────────────── */}
      <Modal
        visible={wdDetailVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setWdDetailVisible(false)}
      >
        <View style={styles.wdModalOverlay}>
          <View style={styles.wdModalContent}>
            {selectedWd && (
              <>
                <View style={styles.wdModalHeader}>
                  <AppText
                    weight="bold"
                    style={{ fontSize: 17, color: "#111" }}
                  >
                    {t("adminWdDetails")}
                  </AppText>
                  <TouchableOpacity
                    onPress={() => setWdDetailVisible(false)}
                    disabled={wdActionLoading}
                  >
                    <Ionicons name="close" size={24} color="#666" />
                  </TouchableOpacity>
                </View>

                <ScrollView
                  style={{ maxHeight: 400 }}
                  showsVerticalScrollIndicator={false}
                >
                  {/* User Info */}
                  <View style={styles.wdDetailSection}>
                    <AppText
                      weight="semibold"
                      style={styles.wdDetailSectionTitle}
                    >
                      {t("adminUserInfoLabel")}
                    </AppText>
                    <View style={styles.wdDetailRow}>
                      <AppText weight="regular" style={styles.wdDetailLabel}>
                        {t("adminNameLabel")}
                      </AppText>
                      <AppText weight="medium" style={styles.wdDetailValue}>
                        {selectedWd.user?.name || `User #${selectedWd.user_id}`}
                      </AppText>
                    </View>
                    <View style={styles.wdDetailRow}>
                      <AppText weight="regular" style={styles.wdDetailLabel}>
                        {t("adminEmailLabel")}
                      </AppText>
                      <AppText weight="medium" style={styles.wdDetailValue}>
                        {selectedWd.user?.email || "-"}
                      </AppText>
                    </View>
                    {selectedWd.user?.phone && (
                      <View style={styles.wdDetailRow}>
                        <AppText weight="regular" style={styles.wdDetailLabel}>
                          {t("adminPhoneLabel")}
                        </AppText>
                        <AppText weight="medium" style={styles.wdDetailValue}>
                          {selectedWd.user.phone}
                        </AppText>
                      </View>
                    )}
                  </View>

                  {/* Bank Info */}
                  <View style={styles.wdDetailSection}>
                    <AppText
                      weight="semibold"
                      style={styles.wdDetailSectionTitle}
                    >
                      {t("adminAccountInfoLabel")}
                    </AppText>
                    <View style={styles.wdDetailRow}>
                      <AppText weight="regular" style={styles.wdDetailLabel}>
                        {t("adminAmountLabel")}
                      </AppText>
                      <AppText
                        weight="bold"
                        style={{
                          fontSize: 16,
                          color: "#003994",
                        }}
                      >
                        {formatPrice(selectedWd.amount)}
                      </AppText>
                    </View>
                    <View style={styles.wdDetailRow}>
                      <AppText weight="regular" style={styles.wdDetailLabel}>
                        {t("adminBankLabel")}
                      </AppText>
                      <AppText weight="medium" style={styles.wdDetailValue}>
                        {selectedWd.bank_code?.toUpperCase?.() || "-"}
                      </AppText>
                    </View>
                    <View style={styles.wdDetailRow}>
                      <AppText weight="regular" style={styles.wdDetailLabel}>
                        {t("adminAccountNumberLabel")}
                      </AppText>
                      <AppText weight="medium" style={styles.wdDetailValue}>
                        {selectedWd.account_number || "-"}
                      </AppText>
                    </View>
                    <View style={styles.wdDetailRow}>
                      <AppText weight="regular" style={styles.wdDetailLabel}>
                        {t("adminAccountHolderLabel")}
                      </AppText>
                      <AppText weight="medium" style={styles.wdDetailValue}>
                        {selectedWd.account_name || "-"}
                      </AppText>
                    </View>
                    <View style={styles.wdDetailRow}>
                      <AppText weight="regular" style={styles.wdDetailLabel}>
                        {t("adminStatusLabel")}
                      </AppText>
                      <View
                        style={[
                          styles.wdStatusBadge,
                          {
                            backgroundColor:
                              (selectedWd.withdraw_status === "pending"
                                ? "#F59E0B"
                                : selectedWd.withdraw_status === "confirmed"
                                  ? "#22C55E"
                                  : "#EF4444") + "18",
                          },
                        ]}
                      >
                        <AppText
                          weight="semibold"
                          style={{
                            fontSize: 12,
                            color:
                              selectedWd.withdraw_status === "pending"
                                ? "#F59E0B"
                                : selectedWd.withdraw_status === "confirmed"
                                  ? "#22C55E"
                                  : "#EF4444",
                          }}
                        >
                          {selectedWd.withdraw_status === "pending"
                            ? t("reportPending")
                            : selectedWd.withdraw_status === "confirmed"
                              ? t("approved")
                              : t("rejected")}
                        </AppText>
                      </View>
                    </View>
                    {selectedWd.created_at && (
                      <View style={styles.wdDetailRow}>
                        <AppText weight="regular" style={styles.wdDetailLabel}>
                          {t("adminWdDateRequested")}
                        </AppText>
                        <AppText
                          weight="regular"
                          style={{ fontSize: 12, color: "#888" }}
                        >
                          {formatDateTime(selectedWd.created_at)}
                        </AppText>
                      </View>
                    )}
                    {selectedWd.admin_note && (
                      <View style={styles.wdDetailRow}>
                        <AppText weight="regular" style={styles.wdDetailLabel}>
                          {t("adminNoteLabel")}
                        </AppText>
                        <AppText
                          weight="regular"
                          style={{
                            fontSize: 12,
                            color: "#DC2626",
                            flex: 1,
                            textAlign: "right",
                          }}
                        >
                          {selectedWd.admin_note}
                        </AppText>
                      </View>
                    )}
                  </View>
                </ScrollView>

                {/* Action Buttons / Reject Form — only for pending */}
                {selectedWd.withdraw_status === "pending" && (
                  <View>
                    {wdRejectVisible ? (
                      /* Inline reject form */
                      <View style={styles.wdInlineReject}>
                        <AppText
                          weight="semibold"
                          style={{
                            fontSize: 14,
                            color: "#DC2626",
                            marginBottom: 6,
                          }}
                        >
                          {t("adminWdRejectLabel")}
                        </AppText>
                        <AppText
                          weight="regular"
                          style={{
                            fontSize: 12,
                            color: "#888",
                            marginBottom: 8,
                          }}
                        >
                          {t("adminWdReturnNote")}
                        </AppText>
                        <TextInput
                          style={styles.wdRejectInput}
                          placeholder={t("adminRejectReasonPlaceholder")}
                          placeholderTextColor="#9CA3AF"
                          value={wdRejectNote}
                          onChangeText={setWdRejectNote}
                          multiline
                          numberOfLines={3}
                          textAlignVertical="top"
                          editable={!wdActionLoading}
                          autoFocus
                        />
                        <View
                          style={{
                            flexDirection: "row",
                            gap: 10,
                            marginTop: 12,
                          }}
                        >
                          <TouchableOpacity
                            style={styles.wdCancelBtn}
                            onPress={() => {
                              setWdRejectVisible(false);
                              setWdRejectNote("");
                            }}
                            disabled={wdActionLoading}
                          >
                            <AppText
                              weight="semibold"
                              style={{ fontSize: 14, color: "#666" }}
                            >
                              {t("cancel")}
                            </AppText>
                          </TouchableOpacity>
                          <TouchableOpacity
                            style={styles.wdRejectBtn}
                            onPress={handleRejectWithdrawal}
                            disabled={wdActionLoading}
                          >
                            {wdActionLoading ? (
                              <ActivityIndicator size="small" color="#FFF" />
                            ) : (
                              <AppText
                                weight="semibold"
                                style={{ fontSize: 14, color: "#FFF" }}
                              >
                                {t("adminConfirmReject")}
                              </AppText>
                            )}
                          </TouchableOpacity>
                        </View>
                      </View>
                    ) : (
                      <View style={styles.wdActionRow}>
                        <TouchableOpacity
                          style={styles.wdRejectBtn}
                          onPress={() => setWdRejectVisible(true)}
                          disabled={wdActionLoading}
                        >
                          <Ionicons
                            name="close-circle"
                            size={18}
                            color="#FFF"
                          />
                          <AppText
                            weight="semibold"
                            style={{ fontSize: 14, color: "#FFF" }}
                          >
                            {t("reject")}
                          </AppText>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.wdConfirmBtn}
                          onPress={() => handleConfirmWithdrawal(selectedWd.id)}
                          disabled={wdActionLoading}
                        >
                          {wdActionLoading ? (
                            <ActivityIndicator size="small" color="#FFF" />
                          ) : (
                            <>
                              <Ionicons
                                name="checkmark-circle"
                                size={18}
                                color="#FFF"
                              />
                              <AppText
                                weight="semibold"
                                style={{ fontSize: 14, color: "#FFF" }}
                              >
                                {t("adminWdConfirmTransfer")}
                              </AppText>
                            </>
                          )}
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                )}
              </>
            )}
          </View>
        </View>
      </Modal>

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
                      {selectedProduct.user?.name || t("unknownUser")}
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
                      {t("adminProductDetails")}
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
                          {t("adminAdditionalImages")} (
                          {selectedProduct.images.length})
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
                          {t("adminCertLabel")} / Certificate
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
                            ? t("adminCertStatusApproved")
                            : selectedProduct.certificate.status === "rejected"
                              ? t("adminCertStatusRejected")
                              : t("adminCertStatusPending")}
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
                        t("adminHasCertificate")}
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
                              contentFit="contain"
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
                              t("adminConfirmCertTitle"),
                              t("adminConfirmCertMsg"),
                              [
                                { text: t("cancel") },
                                {
                                  text: t("approve"),
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
                            {t("adminCertApproveBtn")}
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
                            {t("adminCertRejectBtn")}
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
                          placeholder={t("adminOptionalReasonPlaceholder")}
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
                              {t("cancel")}
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
                                ? t("processing")
                                : t("adminConfirmReject")}
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
                            {t("adminCertRejectionReason")}
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
                        {t("adminCategoryLabel")}
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
                        {t("adminSubcategoryLabel")}
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
                        {t("adminLocationLabel")}
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
                        {t("adminSubmittedDate")}
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
                        {t("adminAuctionStart")}
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
                        {t("adminAuctionEnd")}
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
                        {t("adminBidCount").replace(
                          "{n}",
                          String(selectedProduct.bids_count),
                        )}
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
                          {t("adminApproveProduct")}
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
                          {t("adminRejectProduct")}
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
                    {t("adminRejectProduct")}
                  </AppText>
                  <AppText
                    weight="regular"
                    style={{ fontSize: 13, color: "#6B7280", marginBottom: 16 }}
                  >
                    {t("adminRejectProductReason")} "{selectedProduct?.name}"
                  </AppText>

                  <AppText
                    weight="semibold"
                    style={{ fontSize: 13, color: "#374151", marginBottom: 6 }}
                  >
                    {t("adminEnterReason")}
                  </AppText>
                  <TextInput
                    style={styles.replyInput}
                    value={rejectReason}
                    onChangeText={setRejectReason}
                    placeholder={t("adminRejectReasonPlaceholder")}
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
                        {t("cancel")}
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
                        {rejectLoading ? t("processing") : t("reject")}
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
                {t("adminCertLabel")}
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
                      {t("adminCertLoadFailed")}
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
                      contentFit="contain"
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
                    {t("adminPdfNote")}
                    {"\n"}
                    {t("adminPdfOpenNote")}
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
                      {t("adminOpenFile")}
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
                      t("adminConfirmCertTitle"),
                      t("adminConfirmCertMsgShort"),
                      [
                        { text: t("cancel") },
                        {
                          text: t("approve"),
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
                        {t("adminConfirmCertTitle")}
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
                    {t("adminCertRejectBtnLabel")}
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
                  {t("reportDetailTitle")}
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
                    {getReportTypeLabel(selectedReport.type, t)}
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
                        {getReportStatusLabel(selectedReport.status, t)}
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
                      {selectedReport.reporter?.name || t("unknownUser")}
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
                        {t("adminReportedUserLabel")}
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
                      {t("adminReportDescLabel")}
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
                          {t("adminEvidenceLabel").replace(
                            "{n}",
                            String(selectedReport.evidence_images.length),
                          )}
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
                                  contentFit="cover"
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
                        {t("adminTypeLabel")}
                      </AppText>
                    </View>
                    <AppText weight="semibold" style={styles.detailItemValue}>
                      {getReportTypeLabel(selectedReport.type, t)}
                    </AppText>
                  </View>
                  <View style={styles.detailItem}>
                    <View style={styles.labelRow}>
                      <Ionicons name="calendar" size={12} color="#9CA3AF" />
                      <AppText weight="regular" style={styles.detailItemLabel}>
                        {t("adminReportDateLabel")}
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
                          {t("adminRelatedProduct")}
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
                        {t("adminReportCodeLabel")}
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
                          {t("adminTimelineLabel")}
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
                        {t("adminReplyLabel")}
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
                        {t("adminRepliedAtLabel")}{" "}
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
                      {t("adminChangeStatus")}
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
                        {t("adminDisputeNote")}
                      </AppText>
                    </View>
                  ) : (
                    <>
                      <TextInput
                        style={[styles.replyInput, { marginBottom: 12 }]}
                        placeholder={t("adminNoteOptional")}
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
                              {getReportStatusLabel(st, t)}
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
                      {t("adminContactInfoLabel")}
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
                          {t("adminEmailLabel")}
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
                          {t("adminPhoneLabel")}
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
                          {t("adminRoleLabel")}
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
                          {t("adminJoinedLabel")}
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
                        {t("adminStatsLabel")}
                      </AppText>
                    </View>
                    <View style={styles.detailGrid}>
                      <View style={styles.detailItem}>
                        <AppText
                          weight="regular"
                          style={styles.detailItemLabel}
                        >
                          {t("adminProductsLabel")}
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
                          {t("adminOrdersLabel")}
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
                          {t("adminReportsCountLabel")}
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
                          {t("adminReportedByLabel")}
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
                        {t("adminWalletLabel")}
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
                          {t("adminBalanceLabel")}
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
                          {t("adminBannedLabel")}
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
                                ? t("adminBanPermanentShort")
                                : remaining === 0
                                  ? t("adminBanExpiredShort")
                                  : t("adminBanDaysLeft").replace(
                                      "{n}",
                                      String(remaining),
                                    )}
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
                          {t("adminBanReasonLabel")}
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
                            {t("adminBanUntilLabel")}
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
                          {t("adminUnbanBtn")}
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
                          {t("adminBanUserBtn")}
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
                    {t("adminBanUserBtn")}
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
                    {t("adminBanReasonLabel")} *
                  </AppText>
                  <TextInput
                    style={[styles.replyInput, { minHeight: 80 }]}
                    placeholder={t("adminBanReasonPlaceholder")}
                    placeholderTextColor="#9CA3AF"
                    multiline
                    value={banReason}
                    onChangeText={setBanReason}
                  />

                  <AppText
                    weight="medium"
                    style={{ fontSize: 13, color: "#374151", marginBottom: 6 }}
                  >
                    {t("adminBanDurationLabel")}
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
                          {d} {t("days")}
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
                        {t("cancel")}
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
                        {banLoading ? t("processing") : t("adminConfirmBan")}
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
    paddingHorizontal: 0,
  },
  tab: {
    minWidth: 80,
    paddingVertical: 12,
    paddingHorizontal: 14,
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
    fontFamily: "NotoSansThai_400Regular",
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

  // ─── Withdrawal Styles ─────────────────────────────
  wdCard: {
    backgroundColor: "#FFF",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#F0F0F0",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  wdCardTop: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  wdCardBody: {
    gap: 6,
  },
  wdInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  wdInfoLabel: {
    fontSize: 12,
    color: "#888",
  },
  wdStatusBadge: {
    flexDirection: "row",
    alignItems: "center",
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  wdStatusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  wdModalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  wdModalContent: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 20,
    width: "100%",
    maxWidth: 420,
  },
  wdModalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  wdDetailSection: {
    marginBottom: 16,
  },
  wdDetailSectionTitle: {
    fontSize: 14,
    color: "#003994",
    marginBottom: 10,
  },
  wdDetailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#F0F0F0",
  },
  wdDetailLabel: {
    fontSize: 13,
    color: "#888",
  },
  wdDetailValue: {
    fontSize: 13,
    color: "#333",
  },
  wdActionRow: {
    flexDirection: "row",
    gap: 10,
    marginTop: 16,
  },
  wdRejectBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    backgroundColor: "#DC2626",
    borderRadius: 10,
  },
  wdConfirmBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 12,
    backgroundColor: "#22C55E",
    borderRadius: 10,
  },
  wdCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    backgroundColor: "#F2F4F7",
    borderRadius: 10,
    alignItems: "center",
  },
  wdRejectInput: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 10,
    padding: 12,
    fontSize: 14,
    color: "#333",
    backgroundColor: "#FAFAFA",
    minHeight: 80,
    fontFamily: "NotoSansThai_400Regular",
  },
  wdInlineReject: {
    marginTop: 16,
    padding: 14,
    backgroundColor: "#FFF5F5",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#FFCCCC",
  },
});

export default AdminScreen;
