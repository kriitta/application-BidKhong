import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  TextInput,
} from "react-native";
import React, { useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { image } from "../../assets/images";
import { AppText } from "../components/appText";
import { AppTextInput } from "../components/appTextInput";

const MyBidPage = () => {
  const insets = useSafeAreaInsets();
  const [selectedFilter, setSelectedFilter] = useState("All Bids");
  const [showHistory, setShowHistory] = useState(false);

  const statsData = [
    {
      id: 1,
      label: "Total Bids",
      value: "6",
      bgColor: "#E3F2FD",
      bdColor: "#AFD6FF",
      textColor: "#1F7FE5",
    },
    {
      id: 2,
      label: "Outbid",
      value: "3",
      bgColor: "#FFF9C4",
      bdColor: "#FFE598",
      textColor: "#DBA400",
    },
    {
      id: 3,
      label: "Winning",
      value: "3",
      bgColor: "#C8E6C9",
      bdColor: "#9BECA7",
      textColor: "#2EA200",
    },
  ];

  const historyStatsData = [
    {
      id: 1,
      label: "Total Bids",
      value: "2",
      bgColor: "#E8F4FF",
      bdColor: "#B3D9FF",
      textColor: "#0066CC",
    },
    {
      id: 2,
      label: "Won",
      value: "1",
      bgColor: "#F0E6FF",
      bdColor: "#D4B3FF",
      textColor: "#7C3AED",
    },
    {
      id: 3,
      label: "Lost",
      value: "1",
      bgColor: "#F5F5F5",
      bdColor: "#D1D1D1",
      textColor: "#666666",
    },
  ];

  const bidsData = [
    {
      id: 1,
      title: "Macbook Pro M3 Max 2024",
      image: image.macbook,
      yourBid: "฿15,800",
      currentBid: "฿17,800",
      status: "Outbid",
      statusColor: "#FF991D",
      time: "2 hours ago",
      timeLabel: "02:17:41",
      buttonText: "Bid Again",
      buttonColor: "#FF8D01",
      icon: image.incoming_time,
      weight: 14,
      height: 14,
    },
    {
      id: 2,
      title: "Macbook Pro M3 Max 2024",
      image: image.macbook,
      yourBid: "฿17,800",
      currentBid: "฿17,800",
      status: "Winning",
      statusColor: "#38C500",
      time: "20 minutes ago",
      timeLabel: "01:17:41",
      buttonText: "Increase Bid",
      buttonColor: "#46D802",
      icon: image.bidding,
      weight: 14.86,
      height: 7,
    },
  ];

  const historyData = [
    {
      id: 1,
      title: "Macbook Pro M3 Max 2024",
      image: image.macbook,
      yourBid: "฿15,800",
      status: "Won",
      statusColor: "#0085FF",
      statusBgColor: "#0085FF",
      time: "2 days ago",
      timeLabel: "Ended",
      buttonText: "View Detail",
      buttonColor: "#0085FF",
      icon: image.won_mybids,
      weight: 14,
      height: 12,
    },
    {
      id: 2,
      title: "Macbook Pro M3 Max 2024",
      image: image.macbook,
      yourBid: "฿15,800",
      currentBid: "฿17,800",
      status: "Lost",
      statusColor: "#808080",
      statusBgColor: "#808080",
      time: "2 weeks ago",
      timeLabel: "Ended",
      buttonText: "View Detail",
      buttonColor: "#808080",
      icon: image.lost_mybids,
      weight: 13,
      height: 13,
    },
  ];

  return (
    <View style={[styles.container]}>
      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 20 }}
      >
        {/* Header */}
        <View style={[styles.header, { paddingTop: insets.top + 10 }]}>
          <View style={styles.headerTitle}>
            <View>
              <View style={{ flexDirection: "row", alignItems: "center" }}>
                <Image source={image.mybids} style={styles.headerIcon} />
                <AppText weight="semibold" style={styles.headerText}>
                  My Bids
                </AppText>
              </View>
              <AppText style={styles.headerSubtext}>
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
                      style={[styles.statLabel, { color: stat.textColor }]}
                    >
                      {stat.label}
                    </AppText>
                    <AppText weight="semibold" style={styles.statValue}>
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

        {/* Bids List or History List */}
        <View style={[styles.bidsContainer, { marginTop: 20 }]}>
          {(showHistory ? historyData : bidsData).map((bid) => (
            <View key={bid.id} style={styles.bidCard}>
              {/* Status Badge */}
              <View
                style={[
                  styles.statusBadge,
                  {
                    backgroundColor: bid.statusColor,
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 4,
                  },
                ]}
              >
                {bid.icon && (
                  <Image
                    source={bid.icon}
                    style={{
                      width: bid.weight || 14,
                      height: bid.height || 14,
                      tintColor: "#fff",
                    }}
                  />
                )}
                <AppText weight="medium" style={styles.statusText}>
                  {bid.status}
                </AppText>
              </View>

              {/* Product Image */}
              <Image source={bid.image} style={styles.productImage} />

              {/* Product Title */}
              <AppText weight="semibold" style={styles.productTitle}>
                {bid.title}
              </AppText>

              {/* Bid Info */}
              <View
                style={[
                  styles.bidInfo,
                  bid.status === "Outbid" && { backgroundColor: "#FFFAC5" },
                  bid.status === "Winning" && { backgroundColor: "#E9FFE0" },
                  bid.status === "Won" && { backgroundColor: "#E3F2FD" },
                  bid.status === "Lost" && { backgroundColor: "#F5F5F5" },
                ]}
              >
                <View style={styles.bidInfoRow}>
                  <AppText style={styles.bidInfoLabel}>Your Bid</AppText>
                  <AppText weight="semibold" style={styles.bidInfoValue}>
                    {bid.yourBid}
                  </AppText>
                </View>
                {bid.currentBid && (
                  <View style={styles.bidInfoRow}>
                    <AppText style={styles.bidInfoLabel}>Current Bid</AppText>
                    <AppText weight="semibold" style={styles.bidInfoValue}>
                      {bid.currentBid}
                    </AppText>
                  </View>
                )}
              </View>

              {/* Time Info */}
              <View style={[styles.timeInfo, { paddingVertical: 6 }]}>
                <View style={styles.timeLeft}>
                  <Image source={image.time_icon} style={styles.clockIcon} />
                  <AppText style={styles.timeLabel}>{bid.timeLabel}</AppText>
                </View>
                <AppText style={styles.timeAgo}>{bid.time}</AppText>
              </View>

              {/* Action Button */}
              <TouchableOpacity
                style={[
                  styles.actionButton,
                  {
                    backgroundColor: bid.buttonColor,
                    shadowOpacity: 0.3,
                    shadowRadius: 6,
                    shadowOffset: { width: 0, height: 4 },
                    elevation: 4,
                  },
                ]}
              >
                <AppText weight="semibold" style={styles.actionButtonText}>
                  {bid.buttonText}
                </AppText>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>
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
    fontSize: 22,
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
    paddingVertical: 16,
    paddingHorizontal: 12,
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
    fontSize: 12,
    color: "#666",
    marginBottom: 6,
  },
  statValue: {
    fontSize: 20,
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
    fontSize: 16,
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
    fontSize: 13,
  },
  bidInfoValue: {
    fontSize: 14,
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
    fontSize: 15,
    fontWeight: "bold",
    color: "#fff",
  },
});

export default MyBidPage;
