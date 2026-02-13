import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { authService, User } from "../utils/authService";
import { AppText } from "./components/appText";

const AdminScreen = () => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await authService.getCurrentUser();
      if (currentUser?.role !== "admin") {
        router.replace("/login");
        return;
      }
      setUser(currentUser);
      setLoading(false);
    };
    loadUser();
  }, []);

  const handleLogout = async () => {
    await authService.logout();
    router.replace("/login");
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#0088FF" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <LinearGradient colors={["#00112E", "#003994"]} style={styles.header}>
        <AppText weight="bold" style={styles.headerTitle}>
          Admin Panel
        </AppText>
        <AppText weight="regular" style={styles.headerSubtitle}>
          ยินดีต้อนรับ, {user?.fullName}
        </AppText>
      </LinearGradient>

      {/* User Info Card */}
      <View style={styles.infoCard}>
        <AppText weight="semibold" style={styles.sectionTitle}>
          ข้อมูลผู้ใช้
        </AppText>
        <View style={styles.infoRow}>
          <AppText weight="regular" style={styles.label}>
            ชื่อ:
          </AppText>
          <AppText weight="medium" style={styles.value}>
            {user?.fullName}
          </AppText>
        </View>
        <View style={styles.infoRow}>
          <AppText weight="regular" style={styles.label}>
            อีเมล:
          </AppText>
          <AppText weight="medium" style={styles.value}>
            {user?.email}
          </AppText>
        </View>
        <View style={styles.infoRow}>
          <AppText weight="regular" style={styles.label}>
            เบอร์โทร:
          </AppText>
          <AppText weight="medium" style={styles.value}>
            {user?.phoneNumber}
          </AppText>
        </View>
        <View style={styles.infoRow}>
          <AppText weight="regular" style={styles.label}>
            บทบาท:
          </AppText>
          <AppText weight="medium" style={[styles.value, styles.adminBadge]}>
            {user?.role === "admin" ? "ผู้ดูแล" : "ผู้ใช้ปกติ"}
          </AppText>
        </View>
      </View>

      {/* Admin Features */}
      <View style={styles.featuresCard}>
        <AppText weight="semibold" style={styles.sectionTitle}>
          ฟีเจอร์ผู้ดูแล
        </AppText>

        <TouchableOpacity style={styles.featureButton}>
          <View style={styles.featureContent}>
            <AppText weight="semibold" style={styles.featureTitle}>
              จัดการการประมูล
            </AppText>
            <AppText weight="regular" style={styles.featureDesc}>
              ดูและจัดการการประมูลทั้งหมด
            </AppText>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.featureButton}>
          <View style={styles.featureContent}>
            <AppText weight="semibold" style={styles.featureTitle}>
              จัดการผู้ใช้
            </AppText>
            <AppText weight="regular" style={styles.featureDesc}>
              ดูรายชื่อผู้ใช้ทั้งหมดและสถิติ
            </AppText>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.featureButton}>
          <View style={styles.featureContent}>
            <AppText weight="semibold" style={styles.featureTitle}>
              รายงาน
            </AppText>
            <AppText weight="regular" style={styles.featureDesc}>
              ดูรายงานยอดขายและการปฏิบัติการ
            </AppText>
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.featureButton}>
          <View style={styles.featureContent}>
            <AppText weight="semibold" style={styles.featureTitle}>
              การตั้งค่า
            </AppText>
            <AppText weight="regular" style={styles.featureDesc}>
              ปรับแต่งการตั้งค่าระบบ
            </AppText>
          </View>
        </TouchableOpacity>
      </View>

      {/* Statistics */}
      <View style={styles.statsCard}>
        <AppText weight="semibold" style={styles.sectionTitle}>
          สถิติ
        </AppText>
        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <AppText weight="bold" style={styles.statNumber}>
              42
            </AppText>
            <AppText weight="regular" style={styles.statLabel}>
              การประมูล
            </AppText>
          </View>
          <View style={styles.statBox}>
            <AppText weight="bold" style={styles.statNumber}>
              156
            </AppText>
            <AppText weight="regular" style={styles.statLabel}>
              ผู้ใช้
            </AppText>
          </View>
          <View style={styles.statBox}>
            <AppText weight="bold" style={styles.statNumber}>
              ฿98.5K
            </AppText>
            <AppText weight="regular" style={styles.statLabel}>
              ยอดขาย
            </AppText>
          </View>
        </View>
      </View>

      {/* Logout Button */}
      <TouchableOpacity
        onPress={handleLogout}
        style={styles.logoutButtonWrapper}
      >
        <LinearGradient
          colors={["#FF4444", "#CC0000"]}
          style={styles.logoutButton}
        >
          <AppText weight="semibold" style={styles.logoutButtonText}>
            ออกจากระบบ
          </AppText>
        </LinearGradient>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F5F5F5",
  },
  content: {
    paddingBottom: 40,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 50,
    paddingBottom: 30,
  },
  headerTitle: {
    fontSize: 28,
    color: "#FFF",
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#B0C4FF",
  },
  infoCard: {
    margin: 15,
    padding: 20,
    backgroundColor: "#FFF",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 16,
    color: "#00112E",
    marginBottom: 15,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  label: {
    fontSize: 14,
    color: "#666",
  },
  value: {
    fontSize: 14,
    color: "#00112E",
  },
  adminBadge: {
    backgroundColor: "#E8F5FF",
    color: "#0066FF",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    overflow: "hidden",
  },
  featuresCard: {
    margin: 15,
    padding: 20,
    backgroundColor: "#FFF",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featureButton: {
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F0F0",
  },
  featureContent: {
    flexDirection: "column",
  },
  featureTitle: {
    fontSize: 14,
    color: "#00112E",
    marginBottom: 4,
  },
  featureDesc: {
    fontSize: 12,
    color: "#999",
  },
  statsCard: {
    margin: 15,
    padding: 20,
    backgroundColor: "#FFF",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statBox: {
    alignItems: "center",
    flex: 1,
  },
  statNumber: {
    fontSize: 20,
    color: "#0088FF",
    marginBottom: 5,
  },
  statLabel: {
    fontSize: 12,
    color: "#999",
  },
  logoutButtonWrapper: {
    marginHorizontal: 15,
    marginTop: 20,
    borderRadius: 8,
    overflow: "hidden",
  },
  logoutButton: {
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  logoutButtonText: {
    fontSize: 16,
    color: "#FFF",
  },
});

export default AdminScreen;
