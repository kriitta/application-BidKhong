import { useFocusEffect } from "expo-router";
import LottieView from "lottie-react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Image,
  ImageBackground,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { image } from "../../assets/images";
import { useAuth } from "../../contexts/AuthContext";
import { apiService } from "../../utils/api";
import { UserWallet } from "../../utils/api/types";
import { AppText } from "../components/appText";
import { HistoryFilterModal } from "../components/HistoryFilterModal";
import { TopUpModal } from "../components/TopUpModal";
import { WithdrawModal } from "../components/WithdrawModal";

const WalletPage = () => {
  const insets = useSafeAreaInsets();
  const scrollY = useRef(new Animated.Value(0)).current;
  const { user, refreshUser } = useAuth();

  const [disablePointer, setDisablePointer] = useState(false);
  const [topUpModalVisible, setTopUpModalVisible] = useState(false);
  const [withdrawModalVisible, setWithdrawModalVisible] = useState(false);
  const [historyFilterModalVisible, setHistoryFilterModalVisible] =
    useState(false);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [transLoading, setTransLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const { height: SCREEN_HEIGHT } = Dimensions.get("window");

  const HEADER_MAX_HEIGHT = Math.min(
    SCREEN_HEIGHT * 0.35,
    340, // ไม่ให้สูงเกิน
  );

  const HEADER_MIN_HEIGHT = insets.top + 100;

  useFocusEffect(
    useCallback(() => {
      refreshUser();
      fetchTransactions();
    }, []),
  );

  /** ดึง transactions จาก API */
  const fetchTransactions = async (
    month?: number | null,
    year?: number | null,
  ) => {
    try {
      setTransLoading(true);
      const params: any = {};
      if (month) params.month = month;
      if (year) params.year = year;
      const data = await apiService.wallet.getTransactions(
        Object.keys(params).length > 0 ? params : undefined,
      );
      setTransactions(data);
    } catch (error: any) {
      console.error("Failed to fetch transactions:", error.message);
    } finally {
      setTransLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    refreshUser();
    fetchTransactions(selectedMonth, selectedYear);
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
        title = tx.description || "Top Up";
        icon = image.topup;
        bgColor = "#D4F5DD";
        break;
      case "withdraw":
      case "withdrawal":
        title = tx.description || "Withdraw";
        icon = image.withdraw_trans;
        bgColor = "#FFE5E5";
        break;
      case "won":
      case "purchase":
      case "bid_won":
        title = tx.description || "Won Auction";
        icon = image.won_auction;
        bgColor = "#FFE5E5";
        break;
      case "bid":
        title = tx.description || "Bid Placed";
        icon = image.won_auction;
        bgColor = "#FFF3E0";
        break;
      case "refund":
        title = tx.description || "Refund";
        icon = image.topup;
        bgColor = "#D4F5DD";
        break;
      case "sale":
      case "earning":
        title = tx.description || "Sale Earning";
        icon = image.topup;
        bgColor = "#D4F5DD";
        break;
      default:
        title = tx.description || type || "Transaction";
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
      if (diffMins < 1) timeText = "just now";
      else if (diffMins < 60) timeText = `${diffMins} min ago`;
      else if (diffMins < 1440)
        timeText = `${Math.floor(diffMins / 60)} hours ago`;
      else if (diffMins < 43200)
        timeText = `${Math.floor(diffMins / 1440)} days ago`;
      else
        timeText = txDate.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });
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

  const wallet: UserWallet | undefined = user?.wallet;

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
    { id: 1, name: "Deposit", icon: image.deposit, bgColor: "#D6E9FF" },
    { id: 2, name: "Withdraw", icon: image.withdraw, bgColor: "#D4F5DD" },
    { id: 3, name: "History", icon: image.history, bgColor: "#E8D9FF" },
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
                My Wallet
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
                  Total Balance
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
                    + Top Up
                  </AppText>
                </TouchableOpacity>
              </View>

              <View style={styles.divider} />

              <View style={styles.balanceDetails}>
                <View style={styles.balanceItem}>
                  <AppText numberOfLines={1} style={styles.balanceSubLabel}>
                    Available
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
                    In Pending Bids
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
                  resizeMode="contain"
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
                ? `Transactions - ${new Date(selectedYear, selectedMonth - 1).toLocaleDateString("en-US", { month: "long", year: "numeric" })}`
                : "Recent Transactions"}
            </AppText>
            {selectedMonth && selectedYear && (
              <TouchableOpacity
                onPress={() => {
                  setSelectedMonth(null);
                  setSelectedYear(null);
                  fetchTransactions(null, null);
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
                  Clear
                </AppText>
              </TouchableOpacity>
            )}
          </View>

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
                    ? "No transactions found for this period"
                    : "No recent transactions"}
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
                        resizeMode="contain"
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
        onConfirm={(amount, method) => {
          alert(`Top Up ฿${amount} via ${method} successful!`);
        }}
      />

      {/* Withdraw Modal */}
      <WithdrawModal
        visible={withdrawModalVisible}
        onClose={() => setWithdrawModalVisible(false)}
        onConfirm={(amount, bank, accountNumber, accountName) => {
          alert(
            `Withdraw ฿${amount} to ${bank}\nAccount: ${accountNumber}\nHolder: ${accountName}`,
          );
        }}
      />

      {/* History Filter Modal */}
      <HistoryFilterModal
        visible={historyFilterModalVisible}
        onClose={() => setHistoryFilterModalVisible(false)}
        onApply={(month, year) => {
          setSelectedMonth(month);
          setSelectedYear(year);
          fetchTransactions(month, year);
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
