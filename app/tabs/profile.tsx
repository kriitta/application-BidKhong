import { image } from "@/assets/images";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useAuth } from "../../contexts/AuthContext";
import { authService, User } from "../../utils/authService";
import { AppText } from "../components/appText";

const ProfilePage = () => {
  const router = useRouter();
  const { logout: contextLogout } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
      setLoading(false);
    };
    loadUser();
  }, []);

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

  const handleEditProfile = () => {
    Alert.alert("แก้ไขโปรไฟล์", "ฟีเจอร์นี้จะมาในเร็วๆนี้");
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
            {/* <AppText weight="bold" style={styles.profileInitial}>
              {user?.fullName?.charAt(0).toUpperCase() || "U"}
            </AppText> */}
            <Image
              source={image.bang}
              style={{ width: 90, height: 90, borderRadius: 50 }}
            />
          </View>
        </View>

        {/* User Info */}
        <AppText weight="bold" style={styles.userName}>
          {/* {user?.fullName} */}
          Krittapas Wannawilai
        </AppText>

        <View style={styles.infoRow}>
          <Image
            source={image.calendar}
            style={{ width: 13, height: 16, marginRight: 4 }}
          />
          <AppText weight="regular" style={styles.infoLabel}>
            Joined January 2024
          </AppText>
        </View>

        <View style={styles.contactRow}>
          <View style={styles.contactItem}>
            <Image
              source={image.mail}
              style={{ width: 18, height: 14, marginRight: 4 }}
            />
            <AppText weight="regular" style={styles.contactValue}>
              {user?.email}
            </AppText>
          </View>
          <View style={styles.contactSpacer} />
          <View style={styles.contactItem}>
            <Image
              source={image.phone}
              style={{ width: 15, height: 14, marginRight: 4 }}
            />
            <AppText weight="regular" style={styles.contactValue}>
              {user?.phoneNumber}
            </AppText>
          </View>
        </View>

        {/* Menu Items */}
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() =>
            Alert.alert("แก้ไขโปรไฟล์", "ฟีเจอร์นี้จะมาในเร็วๆนี้")
          }
        >
          <View style={styles.menuIconContainer}>
            <AppText weight="semibold" style={styles.menuIcon}>
              ✏️
            </AppText>
          </View>
          <View style={styles.menuContent}>
            <AppText weight="semibold" style={styles.menuTitle}>
              Edit Profile
            </AppText>
          </View>
          <AppText weight="regular" style={styles.menuArrow}>
            ›
          </AppText>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() =>
            Alert.alert("ประวัติการประมูล", "ฟีเจอร์นี้จะมาในเร็วๆนี้")
          }
        >
          <View style={styles.menuIconContainer}>
            <AppText weight="semibold" style={styles.menuIcon}>
              🏆
            </AppText>
          </View>
          <View style={styles.menuContent}>
            <AppText weight="semibold" style={styles.menuTitle}>
              Bid History
            </AppText>
          </View>
          <AppText weight="regular" style={styles.menuArrow}>
            ›
          </AppText>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.menuItem}
          onPress={() =>
            Alert.alert("ที่อยู่จัดส่ง", "ฟีเจอร์นี้จะมาในเร็วๆนี้")
          }
        >
          <View style={styles.menuIconContainer}>
            <AppText weight="semibold" style={styles.menuIcon}>
              📍
            </AppText>
          </View>
          <View style={styles.menuContent}>
            <AppText weight="semibold" style={styles.menuTitle}>
              Shipping Address
            </AppText>
          </View>
          <AppText weight="regular" style={styles.menuArrow}>
            ›
          </AppText>
        </TouchableOpacity>

        {/* About App */}
        <TouchableOpacity
          style={styles.menuItem}
          onPress={() =>
            Alert.alert(
              "เกี่ยวกับแอป",
              "BidKhong v1.0.0\n\nแอพพลิเคชั่นสำหรับการประมูลสินค้าออนไลน์",
            )
          }
        >
          <View style={styles.menuIconContainer}>
            <AppText weight="semibold" style={styles.menuIcon}>
              ℹ️
            </AppText>
          </View>
          <View style={styles.menuContent}>
            <AppText weight="semibold" style={styles.menuTitle}>
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
              <AppText weight="semibold" style={styles.logoutIcon}>
                🚪
              </AppText>
              <AppText weight="semibold" style={styles.logoutText}>
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
    height: 160,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
  },
  profileCard: {
    flex: 1,
    marginTop: 100,
    marginHorizontal: 20,
    marginBottom: 15,
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
  userName: {
    fontSize: 20,
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
    fontSize: 12,
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
    fontSize: 14,
    color: "#00112E",
  },
  menuArrow: {
    fontSize: 20,
    color: "#999",
  },
  logoutButtonWrapper: {
    width: "100%",
    marginTop: 20,
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
  additionalSection: {
    width: "100%",
    marginTop: 30,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
});

export default ProfilePage;
