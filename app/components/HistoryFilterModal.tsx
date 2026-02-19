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
import { AppText } from "./appText";

interface HistoryFilterModalProps {
  visible: boolean;
  onClose: () => void;
  onApply?: (month: number, year: number) => void;
}

export function HistoryFilterModal({
  visible,
  onClose,
  onApply,
}: HistoryFilterModalProps) {
  const currentDate = new Date();
  const [selectedMonth, setSelectedMonth] = useState(
    currentDate.getMonth() + 1,
  );
  const [selectedYear, setSelectedYear] = useState(currentDate.getFullYear());
  const [overlayOpacity] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      // Background fades in instantly
      Animated.timing(overlayOpacity, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      }).start();

      // Bottom sheet slides up with smooth spring
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
      // Reset animations when closing
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

  const months = [
    { id: 1, name: "January", short: "Jan" },
    { id: 2, name: "February", short: "Feb" },
    { id: 3, name: "March", short: "Mar" },
    { id: 4, name: "April", short: "Apr" },
    { id: 5, name: "May", short: "May" },
    { id: 6, name: "June", short: "Jun" },
    { id: 7, name: "July", short: "Jul" },
    { id: 8, name: "August", short: "Aug" },
    { id: 9, name: "September", short: "Sep" },
    { id: 10, name: "October", short: "Oct" },
    { id: 11, name: "November", short: "Nov" },
    { id: 12, name: "December", short: "Dec" },
  ];

  const years = Array.from({ length: 6 }, (_, i) => {
    const year = currentDate.getFullYear() - 2 + i;
    return year;
  });

  const handleApply = () => {
    onApply?.(selectedMonth, selectedYear);
    onClose();
  };

  const handleReset = () => {
    setSelectedMonth(currentDate.getMonth() + 1);
    setSelectedYear(currentDate.getFullYear());
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
                Filter History
              </AppText>
              <AppText numberOfLines={1} style={styles.headerSubtitle}>
                Select period to view
              </AppText>
            </View>

            {/* Content */}
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              {/* Year Selection - Moved to top for better flow */}
              <View style={styles.section}>
                <AppText
                  weight="semibold"
                  numberOfLines={1}
                  style={styles.sectionTitle}
                >
                  YEAR
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

              {/* Month Selection - Grid layout for better visibility */}
              <View style={styles.section}>
                <AppText
                  weight="semibold"
                  numberOfLines={1}
                  style={styles.sectionTitle}
                >
                  MONTH
                </AppText>
                <View style={styles.monthGrid}>
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

              {/* Selected Display - Simplified */}
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
                    Selected Period
                  </AppText>
                  <AppText
                    weight="bold"
                    numberOfLines={1}
                    style={styles.selectedValue}
                  >
                    {months.find((m) => m.id === selectedMonth)?.name}{" "}
                    {selectedYear}
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
                  Reset
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
                    Apply Filter
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
