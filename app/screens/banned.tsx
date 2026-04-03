import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { StyleSheet, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useAuth } from "../../contexts/AuthContext";
import { useLanguage } from "../../contexts/LanguageContext";
import { AppText } from "../components/appText";

export default function BannedScreen() {
  const insets = useSafeAreaInsets();
  const { banInfo, logout } = useAuth();
  const { t, lang } = useLanguage();

  const formatDate = (dateStr: string | null) => {
    if (!dateStr) return t("bannedUnknown");
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString(lang === "th" ? "th-TH" : "en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <LinearGradient
      colors={["#1a0a0a", "#2d0000", "#1a0a0a"]}
      style={styles.container}
    >
      <View
        style={[
          styles.content,
          { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 20 },
        ]}
      >
        {/* Icon */}
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name="ban" size={64} color="#FF4444" />
          </View>
        </View>

        {/* Title */}
        <AppText style={styles.title}>{t("bannedTitle")}</AppText>
        <AppText style={styles.subtitle}>{t("bannedSubtitle")}</AppText>

        {/* Info Card */}
        <View style={styles.card}>
          {/* Reason */}
          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons name="alert-circle" size={20} color="#FF6B6B" />
            </View>
            <View style={styles.infoContent}>
              <AppText style={styles.infoLabel}>{t("bannedReason")}</AppText>
              <AppText style={styles.infoValue}>
                {banInfo?.reason || t("bannedHelp")}
              </AppText>
            </View>
          </View>

          {/* Divider */}
          <View style={styles.divider} />

          {/* Duration */}
          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Ionicons name="time" size={20} color="#FF6B6B" />
            </View>
            <View style={styles.infoContent}>
              <AppText style={styles.infoLabel}>{t("bannedUntil")}</AppText>
              <AppText style={styles.infoValue}>
                {formatDate(banInfo?.banned_until ?? null)}
              </AppText>
            </View>
          </View>
        </View>

        {/* Help text */}
        <AppText style={styles.helpText}>{t("bannedHelp")}</AppText>

        {/* Spacer */}
        <View style={{ flex: 1 }} />

        {/* Logout Button */}
        <TouchableOpacity
          style={styles.logoutButton}
          onPress={logout}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={["#FF4444", "#CC0000"]}
            style={styles.logoutGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Ionicons
              name="log-out-outline"
              size={22}
              color="#fff"
              style={{ marginRight: 8 }}
            />
            <AppText style={styles.logoutText}>{t("logout")}</AppText>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  iconContainer: {
    marginBottom: 24,
  },
  iconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(255, 68, 68, 0.15)",
    borderWidth: 2,
    borderColor: "rgba(255, 68, 68, 0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 26,
    fontFamily: "Poppins_700Bold",
    color: "#FF4444",
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: "Poppins_400Regular",
    color: "rgba(255, 255, 255, 0.6)",
    textAlign: "center",
    marginBottom: 32,
  },
  card: {
    width: "100%",
    backgroundColor: "rgba(255, 255, 255, 0.06)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255, 68, 68, 0.2)",
    padding: 20,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  infoIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(255, 68, 68, 0.1)",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    marginTop: 2,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    fontFamily: "Poppins_500Medium",
    color: "rgba(255, 255, 255, 0.4)",
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  infoValue: {
    fontSize: 15,
    fontFamily: "Poppins_500Medium",
    color: "#fff",
    lineHeight: 22,
  },
  divider: {
    height: 1,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    marginVertical: 16,
  },
  helpText: {
    fontSize: 13,
    fontFamily: "Poppins_400Regular",
    color: "rgba(255, 255, 255, 0.4)",
    textAlign: "center",
    marginTop: 24,
    lineHeight: 20,
  },
  logoutButton: {
    width: "100%",
    borderRadius: 14,
    overflow: "hidden",
  },
  logoutGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
  },
  logoutText: {
    fontSize: 16,
    fontFamily: "Poppins_600SemiBold",
    color: "#fff",
  },
});
