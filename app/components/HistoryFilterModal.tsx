import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useState } from "react";
import {
  Animated,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useLanguage } from "../../contexts/LanguageContext";
import { AppText } from "./appText";

interface HistoryFilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply?: (month: number | null, year: number, type: string | null) => void;
  onReset?: () => void;
}

export function HistoryFilterModal({
  visible,
  onClose,
  onApply,
  onReset,
}: HistoryFilterModalProps) {
  const currentDate = new Date();
  const { t } = useLanguage();
  const [selectedMonth, setSelectedMonth] = useState<number | null>(
    currentDate.getMonth() + 1,
  );
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [selectedType, setSelectedType] = useState<string | null>(null);

  const transactionTypes = [
    { id: null, label: t("txTypeAll"), emoji: "📋" },
    { id: "deposit", label: t("txTypeDeposit"), emoji: "💳" },
    { id: "withdraw", label: t("txTypeWithdraw"), emoji: "💸" },
    { id: "won", label: t("txTypeWon"), emoji: "🏆" },
    { id: "bid", label: t("txTypeBid"), emoji: "🔨" },
    { id: "refund", label: t("txTypeRefund"), emoji: "↩️" },
  ];
  const monthKeys = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ] as const;
  const months = monthKeys.map((k, i) => ({
    id: i + 1,
    name: t(`month${k}` as any),
    short: t(`month${k}S` as any),
  }));
  const [overlayOpacity] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(0));

  const years = Array.from({ length: 6 }, (_, i) => {
    const year = currentDate.getFullYear() - 2 + i;
    return year;
  });

  useEffect(() => {
    if (visible) {
      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }).start();
      Animated.spring(slideAnim, {
        toValue: 1,
        damping: 20,
        mass: 0.8,
        stiffness: 100,
        overshootClamping: false,
        restDisplacementThreshold: 0.01,
        restSpeedThreshold: 0.01,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.parallel([
        Animated.timing(overlayOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [visible]);

  const handleApply = () => {
    onApply?.(selectedMonth, selectedYear, selectedType);
    onClose();
  };

  const handleReset = () => {
    setSelectedMonth(null);
    setSelectedYear(currentDate.getFullYear());
    setSelectedType(null);
    onReset?.();
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <Animated.View
        style={[
          styles.overlay,
          {
            opacity: overlayOpacity,
          },
        ]}
      >
        <TouchableOpacity
          style={styles.backdropTouchable}
          activeOpacity={1}
          onPress={onClose}
        />
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.container}
        >
          <Animated.View
            style={[
              styles.modalContent,
              {
                transform: [
                  {
                    translateY: slideAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [500, 0],
                    }),
                  },
                ],
                opacity: slideAnim.interpolate({
                  inputRange: [0, 0.3, 1],
                  outputRange: [0, 1, 1],
                }),
              },
            ]}
          >
            {/* Handle Bar */}
            <View style={styles.handleBar} />

            {/* Header */}
            <View style={styles.header}>
              <AppText
                weight="bold"
                numberOfLines={1}
                style={styles.headerTitle}
              >
                {t("filterHistory")}
              </AppText>
              <AppText numberOfLines={1} style={styles.headerSubtitle}>
                {t("filterPeriodSubtitle")}
              </AppText>
            </View>

            {/* Content */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              {/* Year Selection */}
              <View style={styles.section}>
                <AppText
                  weight="semibold"
                  numberOfLines={1}
                  style={styles.sectionTitle}
                >
                  {t("yearLabel")}
                </AppText>
                <View style={styles.yearGrid}>
                  {years.map((year) => (
                    <TouchableOpacity
                      key={year}
                      onPress={() => setSelectedYear(year)}
                      style={[
                        styles.yearButton,
                        selectedYear === year && styles.yearButtonActive,
                      ]}
                      activeOpacity={0.7}
                    >
                      <AppText
                        weight={selectedYear === year ? "bold" : "medium"}
                        numberOfLines={1}
                        style={[
                          styles.yearButtonText,
                          selectedYear === year && styles.yearButtonTextActive,
                        ]}
                      >
                        {year}
                      </AppText>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Month Selection */}
              <View style={styles.section}>
                <AppText
                  weight="semibold"
                  numberOfLines={1}
                  style={styles.sectionTitle}
                >
                  {t("monthLabel")}
                </AppText>
                <View style={styles.monthGrid}>
                  {/* All months option */}
                  <TouchableOpacity
                    onPress={() => setSelectedMonth(null)}
                    style={[
                      styles.monthButton,
                      selectedMonth === null && styles.monthButtonActive,
                    ]}
                    activeOpacity={0.7}
                  >
                    <AppText
                      weight={selectedMonth === null ? "bold" : "medium"}
                      numberOfLines={1}
                      style={[
                        styles.monthButtonText,
                        selectedMonth === null && styles.monthButtonTextActive,
                      ]}
                    >
                      {t("allMonths")}
                    </AppText>
                  </TouchableOpacity>
                  {months.map((month) => (
                    <TouchableOpacity
                      key={month.id}
                      onPress={() => setSelectedMonth(month.id)}
                      style={[
                        styles.monthButton,
                        selectedMonth === month.id && styles.monthButtonActive,
                      ]}
                      activeOpacity={0.7}
                    >
                      <AppText
                        weight={selectedMonth === month.id ? "bold" : "medium"}
                        numberOfLines={1}
                        style={[
                          styles.monthButtonText,
                          selectedMonth === month.id &&
                            styles.monthButtonTextActive,
                        ]}
                      >
                        {month.short}
                      </AppText>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Selected Display */}
              <View style={styles.selectedBox}>
                <View style={styles.selectedIcon}>
                  <AppText style={styles.iconText}>📅</AppText>
                </View>
                <View style={styles.selectedTextContainer}>
                  <AppText
                    weight="medium"
                    numberOfLines={1}
                    style={styles.selectedLabel}
                  >
                    {t("selectedFilter")}
                  </AppText>
                  <AppText
                    weight="bold"
                    numberOfLines={1}
                    style={styles.selectedValue}
                  >
                    {selectedMonth
                      ? `${months.find((m) => m.id === selectedMonth)?.name} ${selectedYear}`
                      : `${t("allYearPrefix")} ${selectedYear}`}
                    {selectedType
                      ? ` · ${transactionTypes.find((t) => t.id === selectedType)?.label}`
                      : ""}
                  </AppText>
                </View>
              </View>
            </ScrollView>

            {/* Bottom Actions */}
            <View style={styles.bottomActions}>
              <TouchableOpacity
                onPress={handleReset}
                style={styles.resetButton}
                activeOpacity={0.7}
              >
                <AppText
                  weight="semibold"
                  numberOfLines={1}
                  style={styles.resetButtonText}
                >
                  {t("clear")}
                </AppText>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleApply}
                style={styles.applyButtonWrapper}
                activeOpacity={0.9}
              >
                <LinearGradient
                  colors={["#001A3D", "#003366"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.applyButton}
                >
                  <AppText
                    weight="bold"
                    numberOfLines={1}
                    style={styles.applyButtonText}
                  >
                    {t("applyFilter")}
                  </AppText>
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </KeyboardAvoidingView>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  backdropTouchable: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  container: {
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: 8,
    paddingBottom: Platform.OS === "ios" ? 34 : 20,
    maxHeight: "90%",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 20,
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: "#D1D5DB",
    borderRadius: 2,
    alignSelf: "center",
    marginBottom: 16,
  },
  header: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  headerTitle: {
    fontSize: 24,
    color: "#111827",
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "#6B7280",
  },
  scrollContent: {
    paddingHorizontal: 24,
    paddingBottom: 20,
  },
  section: {
    marginBottom: 28,
  },
  sectionTitle: {
    fontSize: 12,
    color: "#6B7280",
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  yearGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  yearButton: {
    flex: 1,
    minWidth: "30%",
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  yearButtonActive: {
    backgroundColor: "#D4ECFF",
    borderColor: "#0087F5",
    transform: [{ scale: 1.02 }],
  },
  yearButtonText: {
    fontSize: 16,
    color: "#374151",
  },
  yearButtonTextActive: {
    color: "#0087F5",
    fontWeight: 600,
  },
  monthGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  monthButton: {
    width: "22%",
    aspectRatio: 1.5,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 14,
    backgroundColor: "#F3F4F6",
    borderWidth: 2,
    borderColor: "transparent",
  },
  monthButtonActive: {
    backgroundColor: "#D4ECFF",
    borderColor: "#0087F5",
    transform: [{ scale: 1.05 }],
  },
  monthButtonText: {
    fontSize: 13,
    color: "#374151",
  },
  monthButtonTextActive: {
    color: "#0087F5",
    fontWeight: 600,
  },
  typeGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  typeButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
    borderWidth: 2,
    borderColor: "transparent",
  },
  typeButtonActive: {
    backgroundColor: "#D4ECFF",
    borderColor: "#0087F5",
  },
  typeButtonText: {
    fontSize: 13,
    color: "#374151",
  },
  typeButtonTextActive: {
    color: "#0087F5",
  },
  selectedBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F9FF",
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  selectedIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#DBEAFE",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  iconText: {
    fontSize: 20,
  },
  selectedTextContainer: {
    flex: 1,
  },
  selectedLabel: {
    fontSize: 12,
    color: "#3B82F6",
    marginBottom: 2,
  },
  selectedValue: {
    fontSize: 18,
    color: "#001A3D",
  },
  bottomActions: {
    flexDirection: "row",
    paddingHorizontal: 24,
    paddingTop: 20,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
  },
  resetButton: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 16,
    backgroundColor: "#F3F4F6",
    alignItems: "center",
    justifyContent: "center",
  },
  resetButtonText: {
    fontSize: 16,
    color: "#374151",
  },
  applyButtonWrapper: {
    flex: 2,
    borderRadius: 16,
    overflow: "hidden",
  },
  applyButton: {
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  applyButtonText: {
    fontSize: 16,
    color: "#FFFFFF",
  },
});
