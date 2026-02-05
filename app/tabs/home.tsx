import { useRouter } from "expo-router";
import React from "react";
import {
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { image } from "../../assets/images";
import { AppText } from "../components/appText";
import { AppTextInput } from "../components/appTextInput";

const HomePage = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();

  // Use string ids to map across routes
  const categories = [
    { id: "electronics", name: "Electronics", image: image.electronic },
    { id: "fashion", name: "Fashion", image: image.shirt },
    { id: "collectibles", name: "Collectibles", image: image.collectible },
    { id: "home", name: "Home", image: image.house },
    { id: "vehicles", name: "Vehicles", image: image.car },
    { id: "others", name: "Others", image: image.other },
  ];

  const hotAuctions = [
    {
      id: 1,
      name: "Macbook Pro M3",
      time: "21:17:56",
      image: image.macbook,
      isHot: true,
    },
    {
      id: 2,
      name: "BMW i8",
      time: "21:17:56",
      image: image.i8,
      isHot: true,
    },
    {
      id: 3,
      name: "Labubu New Collection",
      time: "21:17:56",
      image: image.labubu,
      isHot: true,
    },
  ];

  const endingSoon = [
    {
      id: 1,
      name: "Macbook Pro M3",
      time: "21:17:56",
      image: image.macbook,
    },
    {
      id: 2,
      name: "BMW i8",
      time: "21:17:56",
      image: image.i8,
    },
    {
      id: 3,
      name: "Labubu New Collection",
      time: "21:17:56",
      image: image.labubu,
    },
  ];

  const incoming = [
    {
      id: 1,
      name: "Macbook Pro M3",
      time: "15 mins",
      image: image.macbook,
    },
    {
      id: 2,
      name: "BMW i8",
      time: "2 hours",
      image: image.i8,
    },
    {
      id: 3,
      name: "Labubu New Collection",
      time: "2 days",
      image: image.labubu,
    },
  ];

  return (
    <View style={styles.container}>
      {/* Header */}
      <ImageBackground
        source={image.header_home}
        style={[styles.header, { paddingTop: insets.top + 6 }]}
      >
        <View style={styles.headerLeft}>
          <Image source={image.logo} style={{ width: 36, height: 36 }} />
          <AppText weight="bold" style={styles.logoText}>
            BidKhong
          </AppText>
        </View>
        <View style={styles.balanceContainer}>
          <View>
            <AppText weight="regular" style={styles.balanceLabel}>
              Total Balance
            </AppText>
            <AppText weight="bold" style={styles.balanceAmount}>
              ฿125,000
            </AppText>
          </View>
          <Image source={image.bang} style={styles.avatar} />
        </View>
      </ImageBackground>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <View style={styles.searchWrapper}>
            <Image source={image.search_gray} style={styles.searchIcon} />
            <AppTextInput
              style={[styles.searchInput]}
              placeholder="Search for items to bid..."
              placeholderTextColor="#B0B0B0"
            />
          </View>
        </View>

        {/* Categories */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <AppText weight="semibold" style={styles.sectionTitle}>
              Categories
            </AppText>
          </View>
          <View style={styles.categoriesGrid}>
            {categories.map((category) => (
              <TouchableOpacity
                key={category.id}
                style={styles.categoryCard}
                onPress={() =>
                  router.push(`/screens/category?category=${category.id}`)
                }
              >
                {category.image ? (
                  <Image source={category.image} style={styles.categoryImage} />
                ) : (
                  <View style={[styles.categoryImage, styles.categoryOthers]} />
                )}
                <AppText weight="semibold" style={styles.categoryText}>
                  {category.name}
                </AppText>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Hot Auctions */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Image
                source={image.hot}
                style={{ width: 22, height: 24, marginRight: 8 }}
              />
              <AppText weight="semibold" style={styles.sectionTitle}>
                Hot Auctions
              </AppText>
            </View>
            <TouchableOpacity>
              <AppText weight="regular" style={styles.viewAll}>
                View All →
              </AppText>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.horizontalScroll}
          >
            {hotAuctions.map((item) => (
              <TouchableOpacity key={item.id} style={styles.auctionCard}>
                {item.isHot && (
                  <View style={styles.hotBadge}>
                    <Image
                      source={image.hot_badge}
                      style={{ width: 13, height: 14 }}
                    />
                  </View>
                )}
                <View
                  style={[
                    styles.timeBadge,
                    { flexDirection: "row", alignItems: "center", gap: 6 },
                  ]}
                >
                  <Image
                    source={image.incoming_time}
                    style={{ width: 12, height: 12 }}
                  />
                  <AppText weight="medium" style={styles.timeText}>
                    {item.time}
                  </AppText>
                </View>
                <Image
                  source={item.image}
                  style={[styles.auctionImage, { marginBottom: 8 }]}
                />
                <AppText weight="medium" style={styles.auctionName}>
                  {item.name}
                </AppText>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Ending Soon */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Image
                source={image.ending}
                style={{ width: 24, height: 24, marginRight: 8 }}
              />
              <AppText weight="semibold" style={styles.sectionTitle}>
                Ending Soon
              </AppText>
            </View>
            <TouchableOpacity>
              <AppText weight="regular" style={styles.viewAll}>
                View All →
              </AppText>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.horizontalScroll}
          >
            {endingSoon.map((item) => (
              <TouchableOpacity key={item.id} style={styles.auctionCard}>
                <View style={styles.soonBadge}>
                  <Image
                    source={image.ending_badge}
                    style={{ width: 18, height: 18 }}
                  />
                </View>
                <View
                  style={[
                    styles.timeBadge,
                    { flexDirection: "row", alignItems: "center", gap: 6 },
                  ]}
                >
                  <Image
                    source={image.incoming_time}
                    style={{ width: 12, height: 12 }}
                  />
                  <AppText weight="medium" style={styles.timeText}>
                    {item.time}
                  </AppText>
                </View>
                <Image
                  source={item.image}
                  style={[styles.auctionImage, { marginBottom: 8 }]}
                />
                <AppText weight="medium" style={styles.auctionName}>
                  {item.name}
                </AppText>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Incoming */}
        <View style={[styles.section, { marginBottom: 30 }]}>
          <View style={styles.sectionHeader}>
            <View style={{ flexDirection: "row", alignItems: "center" }}>
              <Image
                source={image.incoming}
                style={{ width: 27, height: 25, marginRight: 8 }}
              />
              <AppText weight="semibold" style={styles.sectionTitle}>
                Incoming
              </AppText>
            </View>
            <TouchableOpacity>
              <AppText weight="regular" style={styles.viewAll}>
                View All →
              </AppText>
            </TouchableOpacity>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.horizontalScroll}
          >
            {incoming.map((item) => (
              <TouchableOpacity key={item.id} style={styles.auctionCard}>
                <View
                  style={[
                    styles.incomingBadge,
                    {
                      flexDirection: "row",
                      alignItems: "center",
                      paddingHorizontal: 6,
                    },
                  ]}
                >
                  <Image
                    source={image.incoming_time}
                    style={{ width: 14, height: 14, marginRight: 4 }}
                  />
                  <AppText weight="medium" style={styles.incomingText}>
                    {item.time}
                  </AppText>
                </View>
                <Image
                  source={item.image}
                  style={[styles.auctionImage, { marginBottom: 8 }]}
                />
                <AppText weight="medium" style={styles.auctionName}>
                  {item.name}
                </AppText>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    backgroundColor: "#003d82",
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  logo: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  logoIcon: {
    fontSize: 20,
  },
  logoText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
  },
  balanceContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    paddingVertical: 8,
    paddingLeft: 15,
    paddingRight: 8,
    borderRadius: 25,
  },
  balanceLabel: {
    fontSize: 10,
    color: "#fff",
    opacity: 0.9,
  },
  balanceAmount: {
    fontSize: 18,
    color: "#fff",
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginLeft: 10,
  },
  content: {
    flex: 1,
    backgroundColor: "#fff",
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#fff",
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    padding: 0,
  },
  section: {
    marginTop: 10,
    backgroundColor: "#fff",
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#000",
  },
  viewAll: {
    fontSize: 15,
    color: "#4285F4",
    fontWeight: "600",
  },
  categoriesGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  categoryCard: {
    width: "31%",
    aspectRatio: 1,
    margin: "1%",
    borderRadius: 15,
    overflow: "hidden",
  },
  categoryImage: {
    width: "100%",
    height: "100%",
    justifyContent: "center",
    alignItems: "center",
  },
  categoryOthers: {
    backgroundColor: "#4165A3",
  },
  categoryText: {
    position: "absolute",
    bottom: 10,
    left: 10,
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    textShadowColor: "rgba(0,0,0,0.9)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },
  horizontalScroll: {
    paddingLeft: 20,
    paddingBottom: 20,
  },
  auctionCard: {
    width: 180,
    marginRight: 15,
    backgroundColor: "#fff",
    borderRadius: 15,
    alignItems: "center",
  },
  hotBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    width: 24,
    height: 24,
    borderRadius: 18,
    backgroundColor: "#FF0000",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
  },
  hotIcon: {
    fontSize: 20,
  },
  soonBadge: {
    position: "absolute",
    top: 8,
    left: 8,
    width: 24,
    height: 24,
    borderRadius: 18,
    backgroundColor: "#FF8C00",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
  },
  soonIcon: {
    fontSize: 20,
  },
  timeBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "rgba(0,0,0,0.7)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 2,
  },
  timeText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
  },
  incomingBadge: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#9b27b0b4",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 2,
  },
  incomingText: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "600",
  },
  auctionImage: {
    width: "100%",
    height: 140,
    borderRadius: 10,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  auctionName: {
    fontSize: 15,
    fontWeight: "600",
    color: "#000",
    marginTop: 8,
  },
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 8,
  },
  searchIcon: {
    width: 22,
    height: 22,
    marginRight: 12,
    opacity: 0.5,
  },
});

export default HomePage;
