import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { useFocusEffect } from "expo-router";
import LottieView from "lottie-react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  ImageBackground,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { image } from "../../assets/images";
import { useAuth } from "../../contexts/AuthContext";
import { useLanguage } from "../../contexts/LanguageContext";
import { apiService } from "../../utils/api";
import { AppText } from "../components/appText";
import { HistoryFilterModal } from "../components/HistoryFilterModal";
import { TopUpModal } from "../components/TopUpModal";
import { WithdrawModal } from "../components/WithdrawModal";

const WalletPage = () => {
  const insets = useSafeAreaInsets();
  const scrollY = useRef(new Animated.Value(0)).current;
  const { user, updateWallet } = useAuth();
  const { t, lang } = useLanguage();

  const [disablePointer, setDisablePointer] = useState(false);
  const [topUpModalVisible, setTopUpModalVisible] = useState(false);
  const [withdrawModalVisible, setWithdrawModalVisible] = useState(false);
  const [historyFilterModalVisible, setHistoryFilterModalVisible] =
    useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [transLoading, setTransLoading] = useState(true);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [selectedType, setSelectedType] = useState<string | null>(null);
  const { height: SCREEN_HEIGHT } = Dimensions.get("window");

  const HEADER_MAX_HEIGHT = Math.min(
    SCREEN_HEIGHT * 0.35,
    340, // ไม่ให้สูงเกิน
  );

  const HEADER_MIN_HEIGHT = insets.top + 100;

  useFocusEffect(
    useCallback(() => {
      fetchWalletBalance();
      fetchTransactions(selectedMonth, selectedYear, selectedType);

      // Poll balance every 10 seconds while tab is focused
      const interval = setInterval(() => {
        fetchWalletBalance();
      }, 10000);

      return () => clearInterval(interval);
    }, [selectedMonth, selectedYear, selectedType]),
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

  /** ดึง transactions จาก API */
  const fetchTransactions = async (
    month?: number | null,
    year?: number | null,
    type?: string | null,
  ) => {
    try {
      setTransLoading(true);
      const params: any = {};
      if (month) params.month = month;
      if (year) params.year = year;
      if (type) params.type = type;
      const data = await apiService.wallet.getTransactions(
        Object.keys(params).length > 0 ? params : undefined,
      );

      // Client-side filter as fallback (in case API ignores filter params)
      let filtered = Array.isArray(data) ? data : [];
      if (month || year || type) {
        filtered = filtered.filter((tx: any) => {
          const dateStr = tx.created_at || tx.date;
          if ((month || year) && dateStr) {
            const txDate = new Date(dateStr);
            if (year && txDate.getFullYear() !== year) return false;
            if (month && txDate.getMonth() + 1 !== month) return false;
          }
          if (type) {
            const txType = tx.type || "";
            // Map aliases to match filter
            const typeAliases: Record<string, string[]> = {
              deposit: ["deposit", "topup", "top_up"],
              withdraw: ["withdraw", "withdrawal"],
              won: ["won", "purchase", "bid_won"],
              bid: ["bid"],
              refund: ["refund"],
            };
            const matchTypes = typeAliases[type] || [type];
            if (!matchTypes.includes(txType)) return false;
          }
          return true;
        });
      }

      setTransactions(filtered);
    } catch (error: any) {
      console.error("Failed to fetch transactions:", error.message);
    } finally {
      setTransLoading(false);
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    fetchWalletBalance();
    fetchTransactions(selectedMonth, selectedYear, selectedType);
  };

  /** แปลง API transaction เป็นรูปแบบ UI */
  const getTransactionDisplay = (tx: any) => {
    const type = tx.type || "";
    const amount = parseFloat(tx.amount || "0");
    const isNegative =
      amount < 0 || ["withdraw", "bid", "won", "purchase"].includes(type);

    let title = tx.description || type;
    let icon = image.recent_trans;
    let bgColor = "#E3F2FD";

    switch (type) {
      case "deposit":
      case "topup":
      case "top_up":
        title = tx.description || t("topUp");
        icon = image.topup;
        bgColor = "#D4F5DD";
        break;
      case "withdraw":
      case "withdrawal":
        title = tx.description || t("withdraw");
        icon = image.withdraw_trans;
        bgColor = "#FFE5E5";
        break;
      case "won":
      case "purchase":
      case "bid_won":
        title = tx.description || t("wonAuction");
        icon = image.won_auction;
        bgColor = "#FFE5E5";
        break;
      case "bid":
        title = tx.description || t("bidPlacedTx");
        icon = image.won_auction;
        bgColor = "#FFF3E0";
        break;
      case "refund":
        title = tx.description || t("refundTx");
        icon = image.topup;
        bgColor = "#D4F5DD";
        break;
      case "sale":
      case "earning":
        title = tx.description || t("saleEarningTx");
        icon = image.topup;
        bgColor = "#D4F5DD";
        break;
      default:
        title = tx.description || type || t("transactionTx");
        break;
    }

    const absAmount = Math.abs(amount);
    const formattedAmount = `${isNegative ? "-" : "+"}฿${absAmount.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

    // Format time
    let timeText = "";
    const dateStr = tx.created_at || tx.date;
    if (dateStr) {
      const txDate = new Date(dateStr);
      const now = new Date();
      const diffMs = now.getTime() - txDate.getTime();
      const diffMins = Math.floor(diffMs / 60000);
      if (diffMins < 1) timeText = t("justNow");
      else if (diffMins < 60) timeText = `${diffMins} ${t("minAgo")}`;
      else if (diffMins < 1440)
        timeText = `${Math.floor(diffMins / 60)} ${t("hoursAgo")}`;
      else if (diffMins < 43200)
        timeText = `${Math.floor(diffMins / 1440)} ${t("daysAgo")}`;
      else
        timeText = txDate.toLocaleDateString(
          lang === "th" ? "th-TH" : "en-US",
          {
            month: "short",
            day: "numeric",
            year: "numeric",
          },
        );
    }

    return {
      id: tx.id,
      title,
      time: timeText,
      amount: formattedAmount,
      icon,
      bgColor,
      isNegative,
    };
  };

  const wallet = user?.wallet;

  const formatBalance = (amount?: string) => {
    if (!amount) return "฿0";
    const num = parseFloat(amount);
    return `฿${num.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  };

  useEffect(() => {
    const id = scrollY.addListener(({ value }) => {
      setDisablePointer(value > 100); // ปรับ threshold ได้
    });

    return () => {
      scrollY.removeListener(id);
    };
  }, []);

  const quickActions = [
    { id: 1, name: t("topUp"), icon: image.deposit, bgColor: "#D6E9FF" },
    { id: 2, name: t("withdraw"), icon: image.withdraw, bgColor: "#D4F5DD" },
    { id: 3, name: t("filter"), icon: image.history, bgColor: "#E8D9FF" },
  ];

  // Animation values
  const headerHeight = scrollY.interpolate({
    inputRange: [0, HEADER_MAX_HEIGHT - HEADER_MIN_HEIGHT],
    outputRange: [HEADER_MAX_HEIGHT, HEADER_MIN_HEIGHT],
    extrapolate: "clamp",
  });

  const balanceCardOpacity = scrollY.interpolate({
    inputRange: [0, 150],
    outputRange: [1, 0],
    extrapolate: "clamp",
  });

  const balanceCardTranslateY = scrollY.interpolate({
    inputRange: [0, 150],
    outputRange: [0, -30],
    extrapolate: "clamp",
  });

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
      {/* Animated Header */}
      <Animated.View style={[styles.headerContainer, { height: headerHeight }]}>
        <ImageBackground
          source={image.header_wallet}
          style={[styles.header, { paddingTop: insets.top + 20 }]}
          resizeMode="cover"
        >
          <View style={styles.headerContent}>
            <View style={styles.headerTitle}>
              <Image
                source={image.mywallet}
                style={{ width: 24, height: 24, marginRight: 10 }}
              />
              <AppText
                weight="bold"
                numberOfLines={1}
                style={styles.headerText}
              >
                {t("walletTitle")}
              </AppText>
            </View>

            {/* Balance Card - Animated */}
            <Animated.View
              style={[
                styles.balanceCard,
                {
                  opacity: balanceCardOpacity,
                  transform: [{ translateY: balanceCardTranslateY }],
                },
              ]}
              pointerEvents={disablePointer ? "none" : "auto"}
            >
              <View style={styles.balanceHeader}>
                <AppText
                  weight="regular"
                  numberOfLines={1}
                  style={styles.balanceLabel}
                >
                  {t("totalBalance")}
                </AppText>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 16,
                }}
              >
                <AppText
                  weight="semibold"
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  style={styles.balanceAmount}
                >
                  {formatBalance(wallet?.balance_total)}
                </AppText>
                <TouchableOpacity
                  style={styles.topUpButton}
                  onPress={() => setTopUpModalVisible(true)}
                >
                  <AppText
                    weight="medium"
                    numberOfLines={1}
                    style={styles.topUpText}
                  >
                    + {t("topUp")}
                  </AppText>
                </TouchableOpacity>
              </View>

              <View style={styles.divider} />

              <View style={styles.balanceDetails}>
                <View style={styles.balanceItem}>
                  <AppText numberOfLines={1} style={styles.balanceSubLabel}>
                    {t("availableBalance")}
                  </AppText>
                  <AppText
                    weight="medium"
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    style={styles.availableAmount}
                  >
                    {formatBalance(wallet?.balance_available)}
                  </AppText>
                </View>
                <View style={styles.balanceItem}>
                  <AppText numberOfLines={1} style={styles.balanceSubLabel}>
                    {t("pendingBalance")}
                  </AppText>
                  <AppText
                    weight="medium"
                    numberOfLines={1}
                    adjustsFontSizeToFit
                    style={styles.pendingAmount}
                  >
                    {formatBalance(wallet?.balance_pending)}
                  </AppText>
                </View>
              </View>
            </Animated.View>
          </View>
        </ImageBackground>
      </Animated.View>

      {/* Scrollable Content */}
      <Animated.ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 30 }}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false },
        )}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            progressViewOffset={HEADER_MAX_HEIGHT}
          />
        }
      >
        {/* Quick Actions */}
        <View
          style={[styles.quickActions, { paddingTop: HEADER_MAX_HEIGHT + 15 }]}
        >
          {quickActions.map((action) => (
            <TouchableOpacity
              key={action.id}
              onPress={() => {
                if (action.id === 1) setTopUpModalVisible(true);
                else if (action.id === 2) setWithdrawModalVisible(true);
                else if (action.id === 3) setHistoryFilterModalVisible(true);
              }}
              style={styles.actionCard}
            >
              <View
                style={[styles.actionIcon, { backgroundColor: action.bgColor }]}
              >
                <Image
                  source={action.icon}
                  style={{ width: 24, height: 24 }}
                  contentFit="contain"
                />
              </View>
              <AppText numberOfLines={1} style={styles.actionText}>
                {action.name}
              </AppText>
            </TouchableOpacity>
          ))}
        </View>

        {/* Recent Transactions */}
        <View style={styles.transactionsSection}>
          <View style={styles.transactionsHeader}>
            <Image
              source={image.recent_trans}
              style={{ width: 20, height: 20, marginRight: 8 }}
            />
            <AppText
              weight="semibold"
              numberOfLines={1}
              style={styles.sectionTitle}
            >
              {selectedMonth && selectedYear
                ? `${t("transactionHistory")} - ${new Date(selectedYear, selectedMonth - 1).toLocaleDateString(lang === "th" ? "th-TH" : "en-US", { month: "long", year: "numeric" })}`
                : selectedYear
                  ? `${t("transactionHistory")} - ${selectedYear}`
                  : t("transactionHistory")}
            </AppText>
            {(selectedMonth || selectedYear || selectedType) && (
              <TouchableOpacity
                onPress={() => {
                  setSelectedMonth(null);
                  setSelectedYear(null);
                  setSelectedType(null);
                  fetchTransactions(null, null, null);
                }}
                style={{
                  backgroundColor: "#FFE5E5",
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 12,
                }}
              >
                <AppText
                  weight="medium"
                  style={{ fontSize: 11, color: "#FF4444" }}
                  numberOfLines={1}
                >
                  {t("clear")}
                </AppText>
              </TouchableOpacity>
            )}
          </View>

          {/* Active type filter chip */}
          {selectedType && (
            <View
              style={{
                flexDirection: "row",
                paddingHorizontal: 4,
                marginBottom: 10,
              }}
            >
              <View
                style={{
                  backgroundColor: "#D4ECFF",
                  paddingHorizontal: 10,
                  paddingVertical: 4,
                  borderRadius: 12,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <View
                  style={{ flexDirection: "row", alignItems: "center", gap: 3 }}
                >
                  <Ionicons
                    name={
                      (
                        {
                          deposit: "card-outline",
                          withdraw: "cash-outline",
                          won: "trophy-outline",
                          bid: "hammer-outline",
                          refund: "return-down-back-outline",
                        } as Record<string, any>
                      )[selectedType ?? ""] ?? "list-outline"
                    }
                    size={12}
                    color="#0087F5"
                  />
                  <AppText
                    weight="medium"
                    style={{ fontSize: 11, color: "#0087F5" }}
                  >
                    {[
                      { id: "deposit", label: "เติมเงิน" },
                      { id: "withdraw", label: "ถอนเงิน" },
                      { id: "won", label: "ชนะประมูล" },
                      { id: "bid", label: "วางเดิมพัน" },
                      { id: "refund", label: "คืนเงิน" },
                    ].find((t) => t.id === selectedType)?.label ?? selectedType}
                  </AppText>
                </View>
              </View>
            </View>
          )}

          <View style={styles.transactionsList}>
            {transLoading ? (
              <View style={{ alignItems: "center", paddingVertical: 30 }}>
                <LottieView
                  source={require("../../assets/animations/loading.json")}
                  autoPlay
                  loop
                  style={{ width: 80, height: 80 }}
                />
              </View>
            ) : transactions.length === 0 ? (
              <View style={{ alignItems: "center", paddingVertical: 30 }}>
                <LottieView
                  source={require("../../assets/animations/trans.json")}
                  autoPlay
                  loop
                  style={{ width: 100, height: 100 }}
                />
                <AppText
                  weight="medium"
                  style={{ color: "#9CA3AF", fontSize: 13, marginTop: 8 }}
                >
                  {selectedMonth && selectedYear
                    ? t("noTransactions")
                    : t("noTransactions")}
                </AppText>
              </View>
            ) : (
              transactions.map((tx) => {
                const display = getTransactionDisplay(tx);
                return (
                  <View key={display.id} style={styles.transactionItem}>
                    <View
                      style={[
                        styles.transactionIcon,
                        { backgroundColor: display.bgColor },
                      ]}
                    >
                      <Image
                        source={display.icon}
                        style={{ width: 28, height: 28 }}
                        contentFit="contain"
                      />
                    </View>

                    <View style={styles.transactionInfo}>
                      <AppText
                        numberOfLines={1}
                        style={styles.transactionTitle}
                      >
                        {display.title}
                      </AppText>
                      <AppText numberOfLines={1} style={styles.transactionTime}>
                        {display.time}
                      </AppText>
                    </View>

                    <AppText
                      weight="semibold"
                      numberOfLines={1}
                      style={[
                        styles.transactionAmount,
                        display.isNegative
                          ? styles.negativeAmount
                          : styles.positiveAmount,
                      ]}
                    >
                      {display.amount}
                    </AppText>
                  </View>
                );
              })
            )}
          </View>
        </View>
      </Animated.ScrollView>

      {/* Top Up Modal */}
      <TopUpModal
        visible={topUpModalVisible}
        onClose={() => setTopUpModalVisible(false)}
        onConfirm={(result) => {
          // TopUpModal จัดการเรียก API เสร็จแล้ว อัปเดต wallet จาก response
          const nb = result?.newBalance || result?.wallet;
          if (nb) {
            updateWallet({
              balance_available: String(
                nb.available ?? nb.balance_available ?? "",
              ),
              balance_total: String(nb.total ?? nb.balance_total ?? ""),
              balance_pending: String(nb.pending ?? nb.balance_pending ?? ""),
            });
          }
          fetchTransactions(selectedMonth, selectedYear, selectedType);
        }}
      />

      {/* Withdraw Modal */}
      <WithdrawModal
        visible={withdrawModalVisible}
        onClose={() => setWithdrawModalVisible(false)}
        onSuccess={(result) => {
          const nb = result?.newBalance || result?.wallet;
          if (nb) {
            updateWallet({
              balance_available: String(
                nb.available ?? nb.balance_available ?? "",
              ),
              balance_total: String(nb.total ?? nb.balance_total ?? ""),
              balance_pending: String(nb.pending ?? nb.balance_pending ?? ""),
            });
          }
          fetchTransactions(selectedMonth, selectedYear, selectedType);
        }}
      />

      {/* History Filter Modal */}
      <HistoryFilterModal
        visible={historyFilterModalVisible}
        onClose={() => setHistoryFilterModalVisible(false)}
        onApply={(month, year, type) => {
          setSelectedMonth(month);
          setSelectedYear(year);
          setSelectedType(type);
          fetchTransactions(month, year, type);
        }}
        onReset={() => {
          setSelectedMonth(null);
          setSelectedYear(null);
          setSelectedType(null);
          fetchTransactions(null, null, null);
        }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  headerContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    overflow: "hidden",
  },
  header: {
    flex: 1,
    paddingBottom: 30,
  },
  headerContent: {
    flex: 1,
    paddingHorizontal: 20,
  },
  headerTitle: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  headerText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  balanceCard: {
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    borderRadius: 20,
    padding: 20,
    backdropFilter: "blur(10px)",
  },
  balanceHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  balanceLabel: {
    fontSize: 12,
    color: "#fff",
    opacity: 0.9,
  },
  topUpButton: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  topUpText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#003d82",
  },
  balanceAmount: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.3)",
    marginBottom: 15,
  },
  balanceDetails: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  balanceItem: {
    flex: 1,
  },
  balanceSubLabel: {
    fontSize: 12,
    color: "#fff",
    opacity: 0.8,
    marginBottom: 4,
  },
  availableAmount: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#90EE90",
  },
  pendingAmount: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#FFD700",
  },
  content: {
    flex: 1,
  },
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  actionCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    alignItems: "center",
    width: "32%",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  actionIcon: {
    width: 50,
    height: 50,
    borderRadius: 30,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  actionText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#333",
  },
  transactionsSection: {
    backgroundColor: "#fff",
    borderRadius: 20,
    marginHorizontal: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
  },
  transactionsHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#000",
    flex: 1,
  },
  transactionsList: {
    gap: 8,
  },
  transactionItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    backgroundColor: "#F8F8F8",
    borderRadius: 15,
    paddingHorizontal: 12,
  },
  transactionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: "#000",
    marginBottom: 4,
  },
  transactionTime: {
    fontSize: 10,
    color: "#999",
  },
  transactionAmount: {
    fontSize: 14,
    fontWeight: "bold",
  },
  negativeAmount: {
    color: "#FF4444",
  },
  positiveAmount: {
    color: "#4CAF50",
  },
});

export default WalletPage;
