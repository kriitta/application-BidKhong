import Ionicons from "@expo/vector-icons/Ionicons";
import { useRouter } from "expo-router";
import LottieView from "lottie-react-native";
import React, { useCallback, useEffect, useState } from "react";
import {
  Alert,
  Image,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { image } from "../../assets/images";
import { apiService, getFullImageUrl } from "../../utils/api";
import {
  ActiveBid,
  BidStats,
  HistoryBid,
  HistoryStats,
} from "../../utils/api/types";
import { AppText } from "../components/appText";
import { AppTextInput } from "../components/appTextInput";

const MyBidPage = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [selectedFilter, setSelectedFilter] = useState("All Bids");
  const [showHistory, setShowHistory] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // ─── API data ───
  const [activeBids, setActiveBids] = useState<ActiveBid[]>([]);
  const [historyBids, setHistoryBids] = useState<HistoryBid[]>([]);
  const [activeStats, setActiveStats] = useState<BidStats>({
    totalBids: 0,
    outbid: 0,
    winning: 0,
  });
  const [historyStats, setHistoryStats] = useState<HistoryStats>({
    total: 0,
    won: 0,
    lost: 0,
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // ─── Bid Modal ───
  const [bidModalVisible, setBidModalVisible] = useState(false);
  const [bidModalItem, setBidModalItem] = useState<ActiveBid | null>(null);
  const [bidAmount, setBidAmount] = useState("");
  const [bidSubmitting, setBidSubmitting] = useState(false);

  // ─── Real-time countdown tick ───
  const [, setTick] = useState(0);
  useEffect(() => {
    const timer = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  // ─── Fetch data ───
  const fetchData = useCallback(async () => {
    try {
      const [activeResult, historyResult] = await Promise.all([
        apiService.bid.getActiveBids(),
        apiService.bid.getHistoryBids(),
      ]);
      setActiveBids(activeResult.bids);
      setActiveStats(activeResult.stats);
      setHistoryBids(historyResult.bids);
      setHistoryStats(historyResult.stats);
    } catch (error: any) {
      console.error("Failed to load bids:", error.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchData();
  }, [fetchData]);

  // ─── Helpers ───
  const formatPrice = (price: number) =>
    `฿${price.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;

  const formatTimeRemaining = (timeLeft: string) => {
    // timeLeft could be ISO date or pre-formatted string
    const end = new Date(timeLeft);
    if (isNaN(end.getTime())) return timeLeft; // already formatted
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    if (diff <= 0) return "Ended";
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  };

  const getImageSource = (imgUrl: string) => {
    const full = getFullImageUrl(imgUrl);
    return full ? { uri: full } : image.macbook;
  };

  // ─── Search filter ───
  const filteredActiveBids = activeBids.filter((b) =>
    b.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );
  const filteredHistoryBids = historyBids.filter((b) =>
    b.title.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // ─── Bid Modal actions ───
  const openBidModal = (item: ActiveBid) => {
    setBidModalItem(item);
    const minBid = item.currentBid + 1; // default increment
    setBidAmount(String(minBid));
    setBidModalVisible(true);
  };

  const handlePlaceBid = async () => {
    if (!bidModalItem) return;
    const amount = parseFloat(bidAmount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert("Invalid Amount", "Please enter a valid bid amount.");
      return;
    }
    if (amount <= bidModalItem.currentBid) {
      Alert.alert(
        "Too Low",
        `Your bid must be higher than the current bid of ${formatPrice(bidModalItem.currentBid)}.`,
      );
      return;
    }
    try {
      setBidSubmitting(true);
      await apiService.bid.placeBid({
        auctionId: bidModalItem.auctionId,
        amount,
      });
      Alert.alert("Success", "Your bid has been placed!");
      setBidModalVisible(false);
      setBidModalItem(null);
      setBidAmount("");
      fetchData(); // refresh
    } catch (error: any) {
      Alert.alert(
        "Bid Failed",
        error.message || "Failed to place bid. Please try again.",
      );
    } finally {
      setBidSubmitting(false);
    }
  };

  // ─── Navigate to product detail ───
  const goToProductDetail = (auctionId: string) => {
    router.push({
      pathname: "/screens/product-detail",
      params: { productId: auctionId },
    });
  };

  // ─── Stats display data ───
  const statsData = [
    {
      id: 1,
      label: "Total Bids",
      value: String(activeStats.totalBids),
      bgColor: "#E3F2FD",
      bdColor: "#AFD6FF",
      textColor: "#1F7FE5",
    },
    {
      id: 2,
      label: "Outbid",
      value: String(activeStats.outbid),
      bgColor: "#FFF9C4",
      bdColor: "#FFE598",
      textColor: "#DBA400",
    },
    {
      id: 3,
      label: "Winning",
      value: String(activeStats.winning),
      bgColor: "#C8E6C9",
      bdColor: "#9BECA7",
      textColor: "#2EA200",
    },
  ];

  const historyStatsData = [
    {
      id: 1,
      label: "Total Bids",
      value: String(historyStats.total),
      bgColor: "#E8F4FF",
      bdColor: "#B3D9FF",
      textColor: "#0066CC",
    },
    {
      id: 2,
      label: "Won",
      value: String(historyStats.won),
      bgColor: "#F0E6FF",
      bdColor: "#D4B3FF",
      textColor: "#7C3AED",
    },
    {
      id: 3,
      label: "Lost",
      value: String(historyStats.lost),
      bgColor: "#F5F5F5",
      bdColor: "#D1D1D1",
      textColor: "#666666",
    },
  ];

  return (
    <View style={[styles.container]}>
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
          <View style={styles.headerTitle}>
            <View>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Image source={image.mybids} style={styles.headerIcon} />
                <AppText
                  weight="semibold"
                  numberOfLines={1}
                  style={styles.headerText}
                >
                  My Bids
                </AppText>
              </View>
              <AppText numberOfLines={1} style={styles.headerSubtext}>
                Track all your auction activities
              </AppText>
            </View>
          </View>

          {/* Stats Cards */}
          <View style={styles.statsContainer}>
            <View style={styles.statsRow}>
              {(showHistory ? historyStatsData : statsData)
                .slice(0, 3)
                .map((stat) => (
                  <View
                    key={stat.id}
                    style={[
                      styles.statCard,
                      {
                        backgroundColor: stat.bgColor,
                        borderColor: stat.bdColor,
                        borderWidth: 1,
                      },
                    ]}
                  >
                    <AppText
                      weight="medium"
                      numberOfLines={1}
                      adjustsFontSizeToFit
                      style={[styles.statLabel, { color: stat.textColor }]}
                    >
                      {stat.label}
                    </AppText>
                    <AppText
                      weight="semibold"
                      numberOfLines={1}
                      style={styles.statValue}
                    >
                      {stat.value}
                    </AppText>
                  </View>
                ))}
            </View>
          </View>

          {/* Search and Filter */}
          <View style={styles.searchFilterContainer}>
            <View style={styles.searchWrapper}>
              <Image source={image.search_gray} style={styles.searchIcon} />
              <AppTextInput
                style={styles.searchInput}
                placeholder="Search your bids..."
                placeholderTextColor="#999"
                value={searchQuery}
                onChangeText={setSearchQuery}
              />
            </View>
            <TouchableOpacity
              style={[
                styles.filterButton,
                { flexDirection: "row", alignItems: "center", gap: 6 },
                showHistory && styles.filterButtonActive,
              ]}
              onPress={() => setShowHistory(!showHistory)}
            >
              <Image
                source={showHistory ? image.bidding_mybids : image.recent_trans}
                style={{ width: 16, height: 16 }}
              />
              <AppText
                numberOfLines={1}
                style={[
                  styles.filterButtonText,
                  showHistory && styles.filterButtonTextActive,
                ]}
              >
                {showHistory ? "Bidding" : "History"}
              </AppText>
            </TouchableOpacity>
          </View>
        </View>

        {/* ═══ Loading ═══ */}
        {loading && (
          <View style={{ alignItems: "center", paddingVertical: 60 }}>
            <LottieView
              source={require("../../assets/animations/loading.json")}
              autoPlay
              loop
              style={{ width: 100, height: 100 }}
            />
          </View>
        )}

        {/* ═══ Active Bids List ═══ */}
        {!loading && !showHistory && (
          <View style={[styles.bidsContainer, { marginTop: 20 }]}>
            {filteredActiveBids.length === 0 ? (
              <View style={styles.emptyContainer}>
                <LottieView
                  source={require("../../assets/animations/empty.json")}
                  autoPlay
                  loop
                  style={{ width: 160, height: 160 }}
                />
                <AppText
                  weight="medium"
                  style={{ fontSize: 14, color: "#999", marginTop: 8 }}
                >
                  No active bids yet
                </AppText>
              </View>
            ) : (
              filteredActiveBids.map((bid) => {
                const isOutbid = bid.status === "Outbid";
                const statusColor = isOutbid ? "#FF991D" : "#38C500";
                const buttonColor = isOutbid ? "#FF8D01" : "#46D802";
                const buttonText = isOutbid ? "Bid Again" : "Increase Bid";
                const statusIcon = isOutbid
                  ? image.incoming_time
                  : image.bidding;

                return (
                  <View key={bid.id} style={styles.bidCard}>
                    {/* Status Badge */}
                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor: statusColor,
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 4,
                        },
                      ]}
                    >
                      <Image
                        source={statusIcon}
                        style={{
                          width: 14,
                          height: 14,
                          tintColor: "#fff",
                        }}
                      />
                      <AppText
                        weight="medium"
                        numberOfLines={1}
                        style={styles.statusText}
                      >
                        {bid.status}
                      </AppText>
                    </View>

                    {/* Product Image */}
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => goToProductDetail(bid.auctionId)}
                    >
                      <Image
                        source={getImageSource(bid.image)}
                        style={styles.productImage}
                      />
                    </TouchableOpacity>

                    {/* Product Title */}
                    <AppText
                      weight="semibold"
                      numberOfLines={2}
                      style={styles.productTitle}
                    >
                      {bid.title}
                    </AppText>

                    {/* Bid Info */}
                    <View
                      style={[
                        styles.bidInfo,
                        isOutbid
                          ? { backgroundColor: "#FFFAC5" }
                          : { backgroundColor: "#E9FFE0" },
                      ]}
                    >
                      <View style={styles.bidInfoRow}>
                        <AppText numberOfLines={1} style={styles.bidInfoLabel}>
                          Your Bid
                        </AppText>
                        <AppText
                          weight="semibold"
                          numberOfLines={1}
                          style={styles.bidInfoValue}
                        >
                          {formatPrice(bid.myBid)}
                        </AppText>
                      </View>
                      <View style={styles.bidInfoRow}>
                        <AppText numberOfLines={1} style={styles.bidInfoLabel}>
                          Current Bid
                        </AppText>
                        <AppText
                          weight="semibold"
                          numberOfLines={1}
                          style={styles.bidInfoValue}
                        >
                          {formatPrice(bid.currentBid)}
                        </AppText>
                      </View>
                    </View>

                    {/* Time Info */}
                    <View style={[styles.timeInfo, { paddingVertical: 6 }]}>
                      <View style={styles.timeLeft}>
                        <Image
                          source={image.time_icon}
                          style={styles.clockIcon}
                        />
                        <AppText numberOfLines={1} style={styles.timeLabel}>
                          {formatTimeRemaining(bid.timeLeft)}
                        </AppText>
                      </View>
                      <AppText numberOfLines={1} style={styles.timeAgo}>
                        {bid.totalBids} bid{bid.totalBids !== 1 ? "s" : ""}
                      </AppText>
                    </View>

                    {/* Action Button */}
                    <TouchableOpacity
                      style={[
                        styles.actionButton,
                        {
                          backgroundColor: buttonColor,
                          shadowOpacity: 0.3,
                          shadowRadius: 6,
                          shadowOffset: { width: 0, height: 4 },
                          elevation: 4,
                        },
                      ]}
                      onPress={() => openBidModal(bid)}
                    >
                      <AppText
                        weight="semibold"
                        numberOfLines={1}
                        style={styles.actionButtonText}
                      >
                        {buttonText}
                      </AppText>
                    </TouchableOpacity>
                  </View>
                );
              })
            )}
          </View>
        )}

        {/* ═══ History Bids List ═══ */}
        {!loading && showHistory && (
          <View style={[styles.bidsContainer, { marginTop: 20 }]}>
            {filteredHistoryBids.length === 0 ? (
              <View style={styles.emptyContainer}>
                <LottieView
                  source={require("../../assets/animations/empty.json")}
                  autoPlay
                  loop
                  style={{ width: 160, height: 160 }}
                />
                <AppText
                  weight="medium"
                  style={{ fontSize: 14, color: "#999", marginTop: 8 }}
                >
                  No bid history yet
                </AppText>
              </View>
            ) : (
              filteredHistoryBids.map((bid) => {
                const isWon = bid.status === "Won";
                const statusColor = isWon ? "#0085FF" : "#808080";
                const statusIcon = isWon ? image.won_mybids : image.lost_mybids;

                return (
                  <View key={bid.id} style={styles.bidCard}>
                    {/* Status Badge */}
                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor: statusColor,
                          flexDirection: "row",
                          alignItems: "center",
                          gap: 4,
                        },
                      ]}
                    >
                      <Image
                        source={statusIcon}
                        style={{
                          width: 14,
                          height: 13,
                          tintColor: "#fff",
                        }}
                      />
                      <AppText
                        weight="medium"
                        numberOfLines={1}
                        style={styles.statusText}
                      >
                        {bid.status}
                      </AppText>
                    </View>

                    {/* Product Image */}
                    <TouchableOpacity
                      activeOpacity={0.8}
                      onPress={() => goToProductDetail(bid.auctionId)}
                    >
                      <Image
                        source={getImageSource(bid.image)}
                        style={styles.productImage}
                      />
                    </TouchableOpacity>

                    {/* Product Title */}
                    <AppText
                      weight="semibold"
                      numberOfLines={2}
                      style={styles.productTitle}
                    >
                      {bid.title}
                    </AppText>

                    {/* Bid Info */}
                    <View
                      style={[
                        styles.bidInfo,
                        isWon
                          ? { backgroundColor: "#E3F2FD" }
                          : { backgroundColor: "#F5F5F5" },
                      ]}
                    >
                      <View style={styles.bidInfoRow}>
                        <AppText numberOfLines={1} style={styles.bidInfoLabel}>
                          Your Bid
                        </AppText>
                        <AppText
                          weight="semibold"
                          numberOfLines={1}
                          style={styles.bidInfoValue}
                        >
                          {formatPrice(bid.myBid)}
                        </AppText>
                      </View>
                      <View style={styles.bidInfoRow}>
                        <AppText numberOfLines={1} style={styles.bidInfoLabel}>
                          Final Price
                        </AppText>
                        <AppText
                          weight="semibold"
                          numberOfLines={1}
                          style={styles.bidInfoValue}
                        >
                          {formatPrice(bid.finalPrice)}
                        </AppText>
                      </View>
                    </View>

                    {/* Time Info */}
                    <View style={[styles.timeInfo, { paddingVertical: 6 }]}>
                      <View style={styles.timeLeft}>
                        <Image
                          source={image.time_icon}
                          style={styles.clockIcon}
                        />
                        <AppText numberOfLines={1} style={styles.timeLabel}>
                          Ended
                        </AppText>
                      </View>
                      <AppText numberOfLines={1} style={styles.timeAgo}>
                        {bid.totalBids} bid{bid.totalBids !== 1 ? "s" : ""}
                      </AppText>
                    </View>

                    {/* View Detail Button */}
                    <TouchableOpacity
                      style={[
                        styles.actionButton,
                        {
                          backgroundColor: statusColor,
                          shadowOpacity: 0.3,
                          shadowRadius: 6,
                          shadowOffset: { width: 0, height: 4 },
                          elevation: 4,
                        },
                      ]}
                      onPress={() => goToProductDetail(bid.auctionId)}
                    >
                      <AppText
                        weight="semibold"
                        numberOfLines={1}
                        style={styles.actionButtonText}
                      >
                        View Detail
                      </AppText>
                    </TouchableOpacity>
                  </View>
                );
              })
            )}
          </View>
        )}
      </ScrollView>

      {/* ═══ Bid Modal ═══ */}
      <Modal
        visible={bidModalVisible}
        animationType="slide"
        transparent
        statusBarTranslucent
        onRequestClose={() => setBidModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setBidModalVisible(false)}
        >
          <View />
        </TouchableOpacity>
        <View style={styles.bidModalContent}>
          {/* Modal Header */}
          <View style={styles.bidModalHeader}>
            <AppText weight="semibold" style={{ fontSize: 16, color: "#111" }}>
              {bidModalItem?.status === "Outbid" ? "Bid Again" : "Increase Bid"}
            </AppText>
            <TouchableOpacity onPress={() => setBidModalVisible(false)}>
              <Ionicons name="close-circle" size={28} color="#D1D5DB" />
            </TouchableOpacity>
          </View>

          {/* Product Info */}
          {bidModalItem && (
            <View style={styles.bidModalProductRow}>
              <Image
                source={getImageSource(bidModalItem.image)}
                style={styles.bidModalProductImage}
              />
              <View style={{ flex: 1 }}>
                <AppText
                  weight="semibold"
                  numberOfLines={2}
                  style={{ fontSize: 14, color: "#111" }}
                >
                  {bidModalItem.title}
                </AppText>
                <AppText
                  weight="regular"
                  style={{ fontSize: 12, color: "#6B7280", marginTop: 4 }}
                >
                  Current Bid:{" "}
                  <AppText weight="semibold" style={{ color: "#111" }}>
                    {formatPrice(bidModalItem.currentBid)}
                  </AppText>
                </AppText>
              </View>
            </View>
          )}

          {/* Bid Amount Input */}
          <View style={styles.bidModalInputContainer}>
            <AppText
              weight="medium"
              style={{ fontSize: 13, color: "#374151", marginBottom: 8 }}
            >
              Your Bid Amount
            </AppText>
            <View style={styles.bidModalInputWrapper}>
              <AppText
                weight="medium"
                style={{ fontSize: 18, color: "#6B7280", marginRight: 8 }}
              >
                ฿
              </AppText>
              <TextInput
                style={styles.bidModalInput}
                value={bidAmount}
                onChangeText={setBidAmount}
                keyboardType="numeric"
                placeholder="Enter amount"
                placeholderTextColor="#D1D5DB"
              />
            </View>
            {bidModalItem && (
              <AppText
                weight="regular"
                style={{ fontSize: 11, color: "#9CA3AF", marginTop: 6 }}
              >
                Minimum bid: {formatPrice(bidModalItem.currentBid + 1)}
              </AppText>
            )}
          </View>

          {/* Quick Amounts */}
          {bidModalItem && (
            <View style={styles.quickAmountRow}>
              {[100, 500, 1000, 5000].map((increment) => (
                <TouchableOpacity
                  key={increment}
                  style={styles.quickAmountBtn}
                  onPress={() =>
                    setBidAmount(String(bidModalItem.currentBid + increment))
                  }
                >
                  <AppText
                    weight="medium"
                    style={{ fontSize: 12, color: "#2563EB" }}
                  >
                    +฿{increment.toLocaleString()}
                  </AppText>
                </TouchableOpacity>
              ))}
            </View>
          )}

          {/* Place Bid Button */}
          <TouchableOpacity
            style={[styles.bidModalButton, bidSubmitting && { opacity: 0.7 }]}
            onPress={handlePlaceBid}
            disabled={bidSubmitting}
          >
            {bidSubmitting ? (
              <LottieView
                source={require("../../assets/animations/loading.json")}
                autoPlay
                loop
                style={{ width: 30, height: 30 }}
              />
            ) : (
              <AppText
                weight="semibold"
                style={{ fontSize: 15, color: "#fff" }}
              >
                Place Bid
              </AppText>
            )}
          </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
  },
  header: {
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  headerTitle: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerIcon: {
    width: 32,
    height: 32,
    marginRight: 12,
  },
  headerText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  headerSubtext: {
    fontSize: 13,
    color: "#666",
    marginTop: 2,
  },
  content: {
    flex: 1,
  },
  statsContainer: {
    paddingTop: 20,
    paddingBottom: 10,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: 12,
    marginHorizontal: 4,
    alignItems: "center",
  },
  statCardSmall: {
    flex: 1,
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginHorizontal: 4,
    alignItems: "center",
  },
  statLabel: {
    fontSize: 11,
    color: "#666",
    marginBottom: 6,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#000",
  },
  searchFilterContainer: {
    flexDirection: "row",
    gap: 10,
  },
  searchWrapper: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  searchIcon: {
    width: 18,
    height: 18,
    marginRight: 8,
    opacity: 0.5,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: "#333",
    padding: 0,
  },
  filterButton: {
    backgroundColor: "#fff",
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 12,
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  filterButtonActive: {
    backgroundColor: "#fff",
    borderColor: "#E0E0E0",
  },
  filterButtonText: {
    fontSize: 13,
    fontWeight: "600",
    color: "#333",
  },
  filterButtonTextActive: {
    color: "#000",
  },
  bidsContainer: {
    paddingHorizontal: 20,
    backgroundColor: "#F8F8F8",
  },
  bidCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  statusBadge: {
    position: "absolute",
    top: 16,
    right: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    zIndex: 1,
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#fff",
  },
  productImage: {
    width: "100%",
    height: 160,
    borderRadius: 12,
    backgroundColor: "#F0F0F0",
    marginBottom: 12,
  },
  productTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#000",
    paddingVertical: 16,
    borderTopColor: "#D1D1D1",
    borderTopWidth: 1,
  },
  bidInfo: {
    marginBottom: 12,
    borderRadius: 10,
  },
  bidInfoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  bidInfoLabel: {
    fontSize: 12,
  },
  bidInfoValue: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#000",
  },
  timeInfo: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  timeLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  clockIcon: {
    width: 14,
    height: 14,
    marginRight: 6,
  },
  timeLabel: {
    fontSize: 12,
    color: "#666",
  },
  timeAgo: {
    fontSize: 12,
    color: "#999",
  },
  actionButton: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
  },
  actionButtonText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#fff",
  },
  // ─── Empty State ───
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 40,
  },
  // ─── Bid Modal ───
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  bidModalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingBottom: 34,
    paddingTop: 16,
  },
  bidModalHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  bidModalProductRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    backgroundColor: "#F9FAFB",
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  bidModalProductImage: {
    width: 56,
    height: 56,
    borderRadius: 10,
    backgroundColor: "#E5E7EB",
  },
  bidModalInputContainer: {
    marginBottom: 12,
  },
  bidModalInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderColor: "#D1D5DB",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: "#fff",
  },
  bidModalInput: {
    flex: 1,
    fontSize: 18,
    fontWeight: "600",
    color: "#111",
    padding: 0,
  },
  quickAmountRow: {
    flexDirection: "row",
    gap: 8,
    marginBottom: 20,
  },
  quickAmountBtn: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  bidModalButton: {
    backgroundColor: "#2563EB",
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#2563EB",
    shadowOpacity: 0.3,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
});

export default MyBidPage;
