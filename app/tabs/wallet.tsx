import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Image,
  ImageBackground,
  Animated,
  Dimensions,
} from "react-native";
import React, { useEffect, useRef, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { image } from "../../assets/images";
import { AppText } from "../components/appText";

const WalletPage = () => {
  const insets = useSafeAreaInsets();
  const scrollY = useRef(new Animated.Value(0)).current;

  const [disablePointer, setDisablePointer] = useState(false);
  const { height: SCREEN_HEIGHT } = Dimensions.get("window");

  const HEADER_MAX_HEIGHT = Math.min(
    SCREEN_HEIGHT * 0.35,
    340 // ไม่ให้สูงเกิน
  );

  const HEADER_MIN_HEIGHT = insets.top + 100;

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

  const transactions = [
    {
      id: 1,
      title: "Won Auction - Bid on iPhone 15 Pro Max",
      time: "2 hours ago",
      amount: "-฿32,300",
      icon: image.won_auction,
      bgColor: "#FFE5E5",
      isNegative: true,
    },
    {
      id: 2,
      title: "Top Up - Mobile Banking",
      time: "12 days ago",
      amount: "+฿100,000",
      icon: image.topup,
      bgColor: "#D4F5DD",
      isNegative: false,
    },
    {
      id: 3,
      title: "Withdraw - KBANK Kasikorn Bank",
      time: "21 days ago",
      amount: "-฿32,300",
      icon: image.withdraw_trans,
      bgColor: "#FFE5E5",
      isNegative: true,
    },
    {
      id: 4,
      title: "Withdraw - KBANK Kasikorn Bank",
      time: "21 days ago",
      amount: "-฿32,300",
      icon: image.withdraw_trans,
      bgColor: "#FFE5E5",
      isNegative: true,
    },
    {
      id: 5,
      title: "Withdraw - KBANK Kasikorn Bank",
      time: "21 days ago",
      amount: "-฿32,300",
      icon: image.withdraw_trans,
      bgColor: "#FFE5E5",
      isNegative: true,
    },
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
              <AppText weight="bold" style={styles.headerText}>My Wallet</AppText>
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
                <AppText weight="regular" style={styles.balanceLabel}>Total Balance</AppText>
              </View>
              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  justifyContent: "space-between",
                  marginBottom: 16,
                }}
              >
                <AppText weight="semibold" style={styles.balanceAmount}>฿125,000</AppText>
                <TouchableOpacity style={styles.topUpButton}>
                  <AppText weight="medium" style={styles.topUpText}>+ Top Up</AppText>
                </TouchableOpacity>
              </View>

              <View style={styles.divider} />

              <View style={styles.balanceDetails}>
                <View style={styles.balanceItem}>
                  <AppText style={styles.balanceSubLabel}>Available</AppText>
                  <AppText weight="medium" style={styles.availableAmount}>฿100,200</AppText>
                </View>
                <View style={styles.balanceItem}>
                  <AppText style={styles.balanceSubLabel}>In Pending Bids</AppText>
                  <AppText weight="medium" style={styles.pendingAmount}>฿2,300</AppText>
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
          { useNativeDriver: false }
        )}
      >
        {/* Quick Actions */}
        <View style={[styles.quickActions, { paddingTop: HEADER_MAX_HEIGHT+15 }]}>
          {quickActions.map((action) => (
            <TouchableOpacity key={action.id} style={styles.actionCard}>
              <View
                style={[styles.actionIcon, { backgroundColor: action.bgColor }]}
              >
                <Image
                  source={action.icon}
                  style={{ width: 24, height: 24 }}
                  resizeMode="contain"
                />
              </View>
              <AppText style={styles.actionText}>{action.name}</AppText>
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
            <AppText weight="semibold" style={styles.sectionTitle}>Recent Transactions</AppText>
          </View>

          <View style={styles.transactionsList}>
            {transactions.map((transaction) => (
              <View
                key={transaction.id}
                style={styles.transactionItem}
              >
                <View
                  style={[
                    styles.transactionIcon,
                    { backgroundColor: transaction.bgColor },
                  ]}
                >
                  <Image
                    source={transaction.icon}
                    style={{ width: 28, height: 28 }}
                    resizeMode="contain"
                  />
                </View>

                <View style={styles.transactionInfo}>
                  <AppText style={styles. transactionTitle}>
                    {transaction.title}
                  </AppText>
                  <AppText style={styles.transactionTime}>{transaction.time}</AppText>
                </View>

                <AppText weight="semibold"
                  style={[
                    styles.transactionAmount,
                    transaction.isNegative
                      ? styles.negativeAmount
                      : styles.positiveAmount,
                  ]}
                >
                  {transaction.amount}
                </AppText>
              </View>
            ))}
          </View>
        </View>
      </Animated.ScrollView>
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
    fontSize: 21,
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
    fontSize: 14,
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
    fontSize: 14,
    fontWeight: "600",
    color: "#003d82",
  },
  balanceAmount: {
    fontSize: 26,
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
    fontSize: 18,
    fontWeight: "bold",
    color: "#90EE90",
  },
  pendingAmount: {
    fontSize: 18,
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
    fontSize: 12,
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
    fontSize: 17,
    fontWeight: "bold",
    color: "#000",
  },
  transactionsList: {
    gap:8,
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
    fontSize: 16,
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
