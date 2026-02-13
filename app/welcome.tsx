import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  ImageBackground,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { image } from "../assets/images";
import { useAuth } from "../contexts/AuthContext";
import { AppText } from "./components/appText";
import { AuthModal } from "./components/AuthModal";

const WelcomePage = () => {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { enterAsGuest } = useAuth();
  const [authModalVisible, setAuthModalVisible] = useState(false);

  return (
    <View style={styles.wrapper}>
      <ImageBackground
        source={image.background}
        style={styles.backgroundImage}
        resizeMode="cover"
      >
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
          showsVerticalScrollIndicator={false}
        >
          <View style={{ paddingTop: insets.top + 20, paddingHorizontal: 20 }}>
            <View style={styles.header}>
              <View style={styles.logoContainer}>
                <Image source={image.logo} style={{ width: 56, height: 56 }} />
                <AppText weight="semibold" style={styles.logoText}>
                  BidKhong
                </AppText>
              </View>

              <AppText
                weight="medium"
                style={[styles.subtitle, { fontWeight: 600 }]}
              >
                Your Ultimate Auction Platform
              </AppText>
              <AppText style={styles.description}>
                Discover unique items, place bids in real-time, and win amazing
                deals. Join thousands of happy bidders today!
              </AppText>
            </View>

            {/* Stats Cards */}
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <Image
                  source={image.activeusers}
                  style={{ width: 37, height: 20 }}
                />
                <AppText weight="medium" style={styles.statNumber}>
                  122
                </AppText>
                <AppText weight="medium" style={styles.statLabel}>
                  Active Users
                </AppText>
              </View>

              <View style={styles.statCard}>
                <Image
                  source={image.product}
                  style={{ width: 24, height: 24 }}
                />
                <AppText weight="medium" style={styles.statNumber}>
                  51
                </AppText>
                <AppText weight="medium" style={styles.statLabel}>
                  Product Auctions
                </AppText>
              </View>
            </View>

            <View style={styles.featuresContainer}>
              <View style={[styles.featureCard]}>
                <LinearGradient
                  colors={["#0077FF", "#00E1FF"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.featureIconContainer}
                >
                  <Image
                    source={image.bidding}
                    style={{ width: 18.5, height: 10 }}
                  />
                </LinearGradient>

                <AppText weight="semibold" style={styles.featureTitle}>
                  Real-Time Bidding
                </AppText>
                <AppText style={styles.featureDescription}>
                  Place bids instantly and track live auctions
                </AppText>
              </View>

              <View style={[styles.featureCard]}>
                <LinearGradient
                  colors={["#8800C2", "#DD63FC"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.featureIconContainer}
                >
                  <Image
                    source={image.alert}
                    style={{ width: 16, height: 20 }}
                  />
                </LinearGradient>

                <AppText weight="semibold" style={styles.featureTitle}>
                  Instant Alerts
                </AppText>
                <AppText style={styles.featureDescription}>
                  Get notified when you are outbid
                </AppText>
              </View>

              <View style={[styles.featureCard]}>
                <LinearGradient
                  colors={["#F28807", "#FFCC00"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.featureIconContainer}
                >
                  <Image
                    source={image.deals}
                    style={{ width: 20, height: 20 }}
                  />
                </LinearGradient>

                <AppText weight="semibold" style={styles.featureTitle}>
                  Win Great Deals
                </AppText>
                <AppText style={styles.featureDescription}>
                  Amazing products at competitive prices
                </AppText>
              </View>
            </View>

            {/* CTA Buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                onPress={() => {
                  enterAsGuest();
                  router.replace("/tabs/home");
                }}
                style={styles.primaryButton}
              >
                <LinearGradient
                  colors={["#0088FF", "#CC00FF", "#FF0088"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.gradientButton}
                >
                  <AppText weight="semibold" style={styles.primaryButtonText}>
                    Get Started Now
                  </AppText>
                  <AppText weight="semibold" style={styles.arrow}>
                    →
                  </AppText>
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => setAuthModalVisible(true)}
                style={styles.secondaryButton}
              >
                <AppText weight="semibold" style={styles.secondaryButtonText}>
                  I Have an Account
                </AppText>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </ImageBackground>

      <AuthModal
        visible={authModalVisible}
        onClose={() => setAuthModalVisible(false)}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    backgroundColor: "#001A3D",
  },
  backgroundImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    flexGrow: 1,
  },
  header: {
    alignItems: "center",
    marginBottom: 30,
  },
  logoContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  logo: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  logoIcon: {
    fontSize: 24,
  },
  logoText: {
    fontSize: 28,
    fontWeight: "bold",
    color: "white",
  },
  subtitle: {
    fontSize: 16,
    color: "white",
    marginBottom: 15,
  },
  description: {
    fontSize: 13,
    color: "#B0C4DE",
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 10,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 25,
    gap: 15,
  },
  statCard: {
    flex: 1,
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
    borderWidth: 1,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderColor: "rgba(255, 255, 255, 0.5)",
  },
  statIcon: {
    fontSize: 32,
    marginBottom: 10,
  },
  statNumber: {
    fontSize: 20,
    fontWeight: 400,
    color: "white",
    marginVertical: 8,
  },
  statLabel: {
    fontSize: 12,
    color: "#B0C4DE",
  },
  featuresContainer: {
    marginBottom: 30,
  },
  featureCard: {
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderColor: "rgba(255, 255, 255, 0.5)",
  },
  featureIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
  },
  featureIcon: {
    fontSize: 20,
  },
  featureTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "white",
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 13,
    color: "rgba(255, 255, 255, 0.8)",
    lineHeight: 20,
  },
  buttonContainer: {
    marginTop: 10,
    marginBottom: 40,
  },
  primaryButton: {
    marginBottom: 15,
    borderRadius: 12,
    overflow: "hidden",
  },
  gradientButton: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 18,
    paddingHorizontal: 30,
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
    marginRight: 8,
  },
  arrow: {
    fontSize: 18,
    color: "white",
  },
  secondaryButton: {
    borderWidth: 1,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    borderColor: "rgba(255, 255, 255, 0.5)",
    borderRadius: 12,
    paddingVertical: 18,
    paddingHorizontal: 30,
    alignItems: "center",
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "white",
  },
});

export default WelcomePage;
