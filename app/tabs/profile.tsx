import { image } from "@/assets/images";
import { LinearGradient } from "expo-linear-gradient";
import { useFocusEffect, useRouter } from "expo-router";
import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../contexts/AuthContext";
import { getFullImageUrl } from "../../utils/api";
import { AppText } from "../components/appText";

const ProfilePage = () => {
  const router = useRouter();
  const { user, logout: contextLogout, refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      refreshUser();
    }, []),
  );

  const formatJoinDate = (dateStr?: string) => {
    if (!dateStr) return "Unknown";
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  };

  const formatBalance = (amount?: string) => {
    if (!amount) return "฿0";
    const num = parseFloat(amount);
    return `฿${num.toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;
  };

  const handleLogout = async () => {
    Alert.alert("ออกจากระบบ", "คุณแน่ใจที่ต้องการออกจากระบบหรือไม่?", [
      { text: "ยกเลิก", onPress: () => {} },
      {
        text: "ออกจากระบบ",
        onPress: async () => {
          await contextLogout();
          router.replace("/welcome");
        },
        style: "destructive",
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0088FF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header Background */}
      <LinearGradient
        colors={["#00112E", "#003994"]}
        style={styles.headerBackground}
      />

      {/* Profile Card */}
      <View style={styles.profileCard}>
        {/* Profile Picture */}
        <View style={styles.profilePictureContainer}>
          <View style={styles.profilePicture}>
            {user?.profile_image ? (
              <Image
                source={{ uri: getFullImageUrl(user.profile_image)! }}
                style={{ width: 90, height: 90, borderRadius: 50 }}
              />
            ) : (
              <View style={styles.defaultAvatar}>
                <AppText weight="bold" style={styles.defaultAvatarText}>
                  {user?.name?.charAt(0).toUpperCase() || "U"}
                </AppText>
              </View>
            )}
          </View>
        </View>

        {/* User Info */}
        <AppText weight="bold" numberOfLines={1} style={styles.userName}>
          {user?.name || "Unknown User"}
        </AppText>

        <View style={styles.infoRow}>
          <Image
            source={image.calendar}
            style={{ width: 13, height: 16, marginRight: 4 }}
          />
          <AppText weight="regular" numberOfLines={1} style={styles.infoLabel}>
            Joined {formatJoinDate(user?.join_date || user?.created_at)}
          </AppText>
        </View>

        <View style={styles.contactRow}>
          <View style={styles.contactItem}>
            <Image
              source={image.mail}
              style={{ width: 18, height: 14, marginRight: 4 }}
            />
            <AppText
              weight="regular"
              numberOfLines={1}
              style={styles.contactValue}
            >
              {user?.email || "-"}
            </AppText>
          </View>
          <View style={styles.contactSpacer} />
          <View style={styles.contactItem}>
            <Image
              source={image.phone}
              style={{ width: 15, height: 14, marginRight: 4 }}
            />
            <AppText
              weight="regular"
              numberOfLines={1}
              style={styles.contactValue}
            >
              {user?.phone_number || "-"}
            </AppText>
          </View>
        </View>

        {/* Wallet Balance Summary */}
        {user?.wallet && (
          <View style={styles.walletSummary}>
            <View style={styles.walletItem}>
              <AppText
                weight="regular"
                numberOfLines={1}
                style={styles.walletLabel}
              >
                Balance
              </AppText>
              <AppText
                weight="bold"
                numberOfLines={1}
                adjustsFontSizeToFit
                style={styles.walletValue}
              >
                {formatBalance(user.wallet.balance_available)}
              </AppText>
            </View>
            <View style={styles.walletDivider} />
            <View style={styles.walletItem}>
              <AppText
                weight="regular"
                numberOfLines={1}
                style={styles.walletLabel}
              >
                Pending
              </AppText>
              <AppText
                weight="bold"
                numberOfLines={1}
                adjustsFontSizeToFit
                style={[styles.walletValue, { color: "#FF9800" }]}
              >
                {formatBalance(user.wallet.balance_pending)}
              </AppText>
            </View>
            <View style={styles.walletDivider} />
            <View style={styles.walletItem}>
              <AppText
                weight="regular"
                numberOfLines={1}
                style={styles.walletLabel}
              >
                Total
              </AppText>
              <AppText
                weight="bold"
                numberOfLines={1}
                adjustsFontSizeToFit
                style={[styles.walletValue, { color: "#003994" }]}
              >
                {formatBalance(user.wallet.balance_total)}
              </AppText>
            </View>
          </View>
        )}

        {/* Menu Items */}
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push("/screens/edit-profile")}
        >
          <View style={styles.menuIconContainer}>
            <Image source={image.editprofile} style={{ width: 20, height: 20 }} />
          </View>
          <View style={styles.menuContent}>
            <AppText
              weight="semibold"
              numberOfLines={1}
              style={styles.menuTitle}
            >
              Edit Profile
            </AppText>
          </View>
          <AppText weight="regular" style={styles.menuArrow}>
            ›
          </AppText>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push("/screens/verify-product")}
        >
          <View
            style={[styles.menuIconContainer, { backgroundColor: "#E8F5E9" }]}
          >
            <Image source={image.verify} style={{ width: 20, height: 20 }} />
            
          </View>
          <View style={styles.menuContent}>
            <AppText
              weight="semibold"
              numberOfLines={1}
              style={styles.menuTitle}
            >
              Verify Product
            </AppText>
          </View>
          <AppText weight="regular" style={styles.menuArrow}>
            ›
          </AppText>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push("/screens/help-support")}
        >
          <View
            style={[styles.menuIconContainer, { backgroundColor: "#FFF3E0" }]}
          >
            <Image source={image.support} style={{ width: 20, height: 20 }} />
          </View>
          <View style={styles.menuContent}>
            <AppText
              weight="semibold"
              numberOfLines={1}
              style={styles.menuTitle}
            >
              Help & Support
            </AppText>
          </View>
          <AppText weight="regular" style={styles.menuArrow}>
            ›
          </AppText>
        </TouchableOpacity>

        {/* About App */}
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() => router.push("/screens/about-app")}
        >
          <View style={[styles.menuIconContainer, { backgroundColor: "#f2def9" }]}>
            <Image source={image.about} style={{ width: 20, height: 20 }} />
          </View>
          <View style={styles.menuContent}>
            <AppText
              weight="semibold"
              numberOfLines={1}
              style={styles.menuTitle}
            >
              About app
            </AppText>
          </View>
          <AppText weight="regular" style={styles.menuArrow}>
            ›
          </AppText>
        </TouchableOpacity>

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButtonWrapper}
          onPress={handleLogout}
        >
          <LinearGradient
            colors={["#FFE8E8", "#FFD6D6"]}
            style={styles.logoutButton}
          >
            <View style={styles.logoutContent}>
              <Image source={image.logout} style={{ width: 16, height: 16, marginRight: 16, }} />
              <AppText
                weight="semibold"
                numberOfLines={1}
                style={styles.logoutText}
              >
                Log out
              </AppText>
            </View>
            <AppText weight="regular" style={styles.logoutArrow}>
              ›
            </AppText>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  content: {
    paddingBottom: 20,
  },
  headerBackground: {
    height: 220,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
  },
  profileCard: {
    flex: 1,
    marginTop: 140,
    marginHorizontal: 20,
    marginBottom: 40,
    paddingHorizontal: 20,
    paddingTop: 55,
    paddingBottom: 20,
    backgroundColor: "#FFF",
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    alignItems: "center",
  },
  profilePictureContainer: {
    position: "absolute",
    top: -45,
    alignItems: "center",
  },
  profilePicture: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 4,
    borderColor: "#FFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  profileInitial: {
    fontSize: 40,
    color: "#FFF",
  },
  defaultAvatar: {
    width: 90,
    height: 90,
    borderRadius: 50,
    backgroundColor: "#003994",
    justifyContent: "center",
    alignItems: "center",
  },
  defaultAvatarText: {
    fontSize: 36,
    color: "#FFF",
  },
  userName: {
    fontSize: 18,
    color: "#00112E",
    marginTop: 20,
    marginBottom: 8,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 13,
    color: "#666",
  },
  contactRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 25,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  contactIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  contactSpacer: {
    width: 10,
  },
  contactValue: {
    fontSize: 11,
    color: "#666",
  },
  skeletonBar: {
    width: "100%",
    height: 44,
    backgroundColor: "#E8ECF0",
    borderRadius: 10,
    marginBottom: 10,
  },
  menuIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: "#E8F0FF",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  menuIcon: {
    fontSize: 18,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 13,
    color: "#00112E",
  },
  menuArrow: {
    fontSize: 20,
    color: "#999",
  },
  logoutButtonWrapper: {
    width: "100%",
    marginTop: 60,
    borderRadius: 12,
    overflow: "hidden",
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 15,
  },
  logoutContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    paddingLeft: 12
  },
  logoutIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  logoutText: {
    fontSize: 14,
    color: "#CC0000",
  },
  logoutArrow: {
    fontSize: 20,
    color: "#FF8080",
  },
  menuItem: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 15,
    backgroundColor: "#F5F5F5",
    borderRadius: 12,
    marginTop: 12,
  },
  walletSummary: {
    flexDirection: "row",
    width: "100%",
    backgroundColor: "#F0F6FF",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 10,
    marginBottom: 8,
  },
  walletItem: {
    flex: 1,
    alignItems: "center",
  },
  walletLabel: {
    fontSize: 11,
    color: "#666",
    marginBottom: 4,
  },
  walletValue: {
    fontSize: 13,
    color: "#2E7D32",
  },
  walletDivider: {
    width: 1,
    backgroundColor: "#D0D8E8",
  },
  additionalSection: {
    width: "100%",
    marginTop: 30,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
});

export default ProfilePage;
