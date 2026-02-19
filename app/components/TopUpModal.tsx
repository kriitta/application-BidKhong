import { image } from "@/assets/images";
import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { AppText } from "./appText";
import { AppTextInput } from "./appTextInput";

interface TopUpModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm?: (amount: number, method: string) => void;
}

export function TopUpModal({ visible, onClose, onConfirm }: TopUpModalProps) {
  const [amount, setAmount] = useState("0");
  const [selectedMethod, setSelectedMethod] = useState("mobilebanking");
  const [loading, setLoading] = useState(false);

  const quickAmounts = [
    { label: "฿500", value: 500 },
    { label: "฿1,000", value: 1000 },
    { label: "฿2,000", value: 2000 },
    { label: "฿5,000", value: 5000 },
    { label: "฿10,000", value: 10000 },
    { label: "฿20,000", value: 20000 },
  ];

  const paymentMethods = [
    {
      id: "qrcode",
      name: "QR Code",
      icon: image.qr,
      width: 21,
      height: 21,
      bg: "#2185FF",
    },
    {
      id: "mobilebanking",
      name: "Mobile Banking",
      icon: image.mobile_banking,
      width: 13,
      height: 23,
      bg: "#3BCF00",
    },
  ];

  const handleQuickAmount = (value: number) => {
    setAmount(value.toString());
  };

  const handleCustomAmount = (text: string) => {
    // Remove non-numeric characters
    const numericOnly = text.replace(/[^0-9]/g, "");
    setAmount(numericOnly || "0");
  };

  const handleConfirm = () => {
    const numAmount = parseInt(amount) || 0;
    if (numAmount <= 0) {
      alert("กรุณาเลือกหรือกรอกจำนวนเงินที่ต้องการเติม");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const methodName = paymentMethods.find(
        (m) => m.id === selectedMethod,
      )?.name;
      onConfirm?.(numAmount, methodName || "");
      setAmount("0");
      setSelectedMethod("mobilebanking");
      onClose();
    }, 1500);
  };

  // Check if form is valid
  const isFormValid = () => {
    const numAmount = parseInt(amount) || 0;
    return numAmount > 0;
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.container}
        >
          <ScrollView
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
          >
            <View style={styles.modalContent}>
              {/* Header with close button */}
              <View style={styles.headerBar}>
                <AppText
                  weight="semibold"
                  numberOfLines={1}
                  style={styles.headerTitle}
                >
                  Top Up Wallet
                </AppText>
                <TouchableOpacity onPress={onClose}>
                  <AppText weight="bold" style={styles.closeButton}>
                    ✕
                  </AppText>
                </TouchableOpacity>
              </View>

              {/* Select Amount */}
              <View style={styles.section}>
                <AppText
                  weight="medium"
                  numberOfLines={1}
                  style={styles.sectionTitle}
                >
                  Select Amount
                </AppText>
                <View style={styles.amountsGrid}>
                  {quickAmounts.map((qa, idx) => {
                    const isActive = amount === qa.value.toString();
                    return (
                      <TouchableOpacity
                        key={idx}
                        onPress={() => handleQuickAmount(qa.value)}
                      >
                        {isActive ? (
                          <LinearGradient
                            colors={["#00112E", "#003994"]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.amountButtonActive}
                          >
                            <AppText
                              weight="medium"
                              numberOfLines={1}
                              style={styles.amountButtonTextActive}
                            >
                              {qa.label}
                            </AppText>
                          </LinearGradient>
                        ) : (
                          <View style={styles.amountButton}>
                            <AppText
                              weight="medium"
                              numberOfLines={1}
                              style={styles.amountButtonText}
                            >
                              {qa.label}
                            </AppText>
                          </View>
                        )}
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              {/* Custom Amount */}
              <View style={styles.section}>
                <AppText
                  weight="medium"
                  numberOfLines={1}
                  style={styles.sectionTitle}
                >
                  Or Enter Custom Amount
                </AppText>
                <View style={styles.customAmountWrapper}>
                  <AppText style={styles.currencySymbol}>฿</AppText>
                  <AppTextInput
                    placeholder="0"
                    value={amount}
                    onChangeText={handleCustomAmount}
                    keyboardType="number-pad"
                    editable={!loading}
                    style={styles.customAmountInput}
                  />
                </View>
              </View>

              {/* Payment Method */}
              <View style={styles.section}>
                <AppText
                  weight="medium"
                  numberOfLines={1}
                  style={styles.sectionTitle}
                >
                  Payment Method
                </AppText>
                <View style={styles.methodsContainer}>
                  {paymentMethods.map((method) => (
                    <TouchableOpacity
                      key={method.id}
                      onPress={() => setSelectedMethod(method.id)}
                      style={[
                        styles.methodCard,
                        selectedMethod === method.id && styles.methodCardActive,
                      ]}
                    >
                      <View style={styles.methodContent}>
                        <View
                          style={[
                            styles.methodIconContainer,
                            method.bg && { backgroundColor: method.bg },
                          ]}
                        >
                          <Image
                            source={method.icon}
                            style={{
                              width: method.width,
                              height: method.height,
                            }}
                          />
                        </View>
                        <AppText
                          weight="medium"
                          numberOfLines={1}
                          style={[
                            styles.methodName,
                            selectedMethod === method.id &&
                              styles.methodNameActive,
                          ]}
                        >
                          {method.name}
                        </AppText>
                      </View>
                      {selectedMethod === method.id && (
                        <AppText style={styles.checkmark}>✓</AppText>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Confirm Button */}
              <TouchableOpacity
                onPress={handleConfirm}
                disabled={loading || !isFormValid()}
                style={styles.confirmButtonWrapper}
              >
                {isFormValid() ? (
                  <LinearGradient
                    colors={["#00112E", "#003994"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.confirmButton}
                  >
                    <AppText
                      weight="semibold"
                      numberOfLines={1}
                      adjustsFontSizeToFit
                      style={styles.confirmButtonText}
                    >
                      {loading ? "Processing..." : `Confirm Top Up ฿${amount}`}
                    </AppText>
                  </LinearGradient>
                ) : (
                  <View style={styles.confirmButtonDisabled}>
                    <AppText
                      weight="semibold"
                      numberOfLines={1}
                      adjustsFontSizeToFit
                      style={styles.confirmButtonTextDisabled}
                    >
                      Select Amount & Payment Method
                    </AppText>
                  </View>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "flex-end",
  },
  container: {
    flex: 1,
    justifyContent: "flex-end",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 0,
    paddingBottom: 30,
    maxHeight: "90%",
  },
  headerBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#001A3D",
    marginHorizontal: -20,
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 18,
    color: "#FFF",
  },
  closeButton: {
    fontSize: 24,
    color: "#FFF",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 13,
    color: "#333",
    marginBottom: 12,
    fontWeight: "600",
  },
  amountsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  amountButton: {
    flex: 1,
    minWidth: "30%",
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
  },
  amountButtonActive: {
    flex: 1,
    minWidth: "30%",
    paddingVertical: 12,
    paddingHorizontal: 10,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  amountButtonText: {
    fontSize: 13,
    color: "#666",
    fontWeight: "600",
  },
  amountButtonTextActive: {
    color: "#FFF",
  },
  customAmountWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    paddingHorizontal: 14,
    backgroundColor: "#FAFAFA",
    height: 50,
  },
  currencySymbol: {
    fontSize: 16,
    color: "#333",
    marginRight: 8,
    fontWeight: "600",
  },
  customAmountInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    padding: 0,
  },
  methodsContainer: {
    gap: 10,
  },
  methodCard: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    backgroundColor: "#F5F5F5",
  },
  methodCardActive: {
    backgroundColor: "#E3F2FD",
    borderColor: "#0088FF",
  },
  methodContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  methodIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E0E0E0",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  methodIconContainerActive: {
    backgroundColor: "#4CAF50",
  },

  methodName: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  methodNameActive: {
    color: "#0088FF",
    fontWeight: "600",
  },
  checkmark: {
    fontSize: 18,
    color: "#0088FF",
    fontWeight: "bold",
  },
  confirmButtonWrapper: {
    borderRadius: 12,
    overflow: "hidden",
    marginTop: 10,
  },
  confirmButton: {
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmButtonText: {
    fontSize: 16,
    color: "#FFF",
    fontWeight: "600",
  },
  confirmButtonDisabled: {
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E0E0E0",
    borderRadius: 12,
  },
  confirmButtonTextDisabled: {
    fontSize: 16,
    color: "#999",
    fontWeight: "600",
  },
});
