import { LinearGradient } from "expo-linear-gradient";
import React, { useState } from "react";
import {
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

interface WithdrawModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm?: (
    amount: number,
    bank: string,
    accountNumber: string,
    accountName: string,
  ) => void;
}

export function WithdrawModal({
  visible,
  onClose,
  onConfirm,
}: WithdrawModalProps) {
  const [amount, setAmount] = useState("0");
  const [selectedBank, setSelectedBank] = useState("kbank");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [loading, setLoading] = useState(false);

  const quickAmounts = [
    { label: "฿500", value: 500 },
    { label: "฿1,000", value: 1000 },
    { label: "฿2,000", value: 2000 },
    { label: "฿5,000", value: 5000 },
    { label: "฿10,000", value: 10000 },
    { label: "฿20,000", value: 20000, disabled: true },
  ];

  const banks = [
    {
      id: "scb",
      name: "SCB - Siam Commercial Bank",
      icon: "🏦",
      color: "#9B59B6",
    },
    {
      id: "kbank",
      name: "KBANK - Kasikorn Bank",
      icon: "🏦",
      color: "#E74C3C",
    },
  ];

  const handleQuickAmount = (value: number) => {
    setAmount(value.toString());
  };

  const handleCustomAmount = (text: string) => {
    const numericOnly = text.replace(/[^0-9]/g, "");
    setAmount(numericOnly || "0");
  };

  const handleConfirm = () => {
    const numAmount = parseInt(amount) || 0;
    if (numAmount <= 0) {
      alert("Please select or enter a valid amount");
      return;
    }
    if (!accountNumber.trim()) {
      alert("Please enter account number");
      return;
    }
    if (!accountName.trim()) {
      alert("Please enter account holder name");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      const bankName = banks.find((b) => b.id === selectedBank)?.name || "";
      onConfirm?.(numAmount, bankName, accountNumber, accountName);
      setAmount("0");
      setAccountNumber("");
      setAccountName("");
      setSelectedBank("kbank");
      onClose();
    }, 1500);
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
                <AppText weight="semibold" style={styles.headerTitle}>
                  Withdraw Wallet
                </AppText>
                <TouchableOpacity onPress={onClose}>
                  <AppText weight="bold" style={styles.closeButton}>
                    ✕
                  </AppText>
                </TouchableOpacity>
              </View>

              {/* Select Amount */}
              <View style={styles.section}>
                <AppText weight="medium" style={styles.sectionTitle}>
                  Select Amount
                </AppText>
                <View style={styles.amountsGrid}>
                  {quickAmounts.map((qa, idx) => {
                    const isActive = amount === qa.value.toString();
                    return (
                      <TouchableOpacity
                        key={idx}
                        onPress={() =>
                          !qa.disabled && handleQuickAmount(qa.value)
                        }
                        disabled={qa.disabled}
                      >
                        {isActive && !qa.disabled ? (
                          <LinearGradient
                            colors={["#00112E", "#003994"]}
                            start={{ x: 0, y: 0 }}
                            end={{ x: 1, y: 1 }}
                            style={styles.amountButtonActive}
                          >
                            <AppText
                              weight="medium"
                              style={styles.amountButtonTextActive}
                            >
                              {qa.label}
                            </AppText>
                          </LinearGradient>
                        ) : (
                          <View
                            style={[
                              styles.amountButton,
                              qa.disabled && styles.amountButtonDisabled,
                            ]}
                          >
                            <AppText
                              weight="medium"
                              style={[
                                styles.amountButtonText,
                                qa.disabled && styles.amountButtonTextDisabled,
                              ]}
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
                <AppText weight="medium" style={styles.sectionTitle}>
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

              {/* Select Bank */}
              <View style={styles.section}>
                <AppText weight="medium" style={styles.sectionTitle}>
                  Select Bank
                </AppText>
                <View style={styles.banksContainer}>
                  {banks.map((bank) => (
                    <TouchableOpacity
                      key={bank.id}
                      onPress={() => setSelectedBank(bank.id)}
                      style={[
                        styles.bankCard,
                        selectedBank === bank.id && styles.bankCardActive,
                      ]}
                    >
                      <View
                        style={[
                          styles.bankIconContainer,
                          selectedBank === bank.id && {
                            backgroundColor: bank.color,
                          },
                        ]}
                      >
                        <View
                          style={[
                            styles.bankIconBg,
                            { backgroundColor: bank.color },
                          ]}
                        >
                          <AppText style={styles.bankIcon}>{bank.icon}</AppText>
                        </View>
                      </View>
                      <AppText
                        weight="medium"
                        style={[
                          styles.bankName,
                          selectedBank === bank.id && styles.bankNameActive,
                        ]}
                      >
                        {bank.name}
                      </AppText>
                      {selectedBank === bank.id && (
                        <AppText style={styles.checkmark}>✓</AppText>
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              {/* Account Number */}
              <View style={styles.section}>
                <AppText weight="medium" style={styles.sectionTitle}>
                  Account Number
                </AppText>
                <View style={styles.inputWrapper}>
                  <AppTextInput
                    placeholder="Enter your account number"
                    value={accountNumber}
                    onChangeText={setAccountNumber}
                    keyboardType="number-pad"
                    editable={!loading}
                    style={styles.input}
                  />
                </View>
              </View>

              {/* Account Name */}
              <View style={styles.section}>
                <AppText weight="medium" style={styles.sectionTitle}>
                  Account Name
                </AppText>
                <View style={styles.inputWrapper}>
                  <AppTextInput
                    placeholder="Enter account holder name"
                    value={accountName}
                    onChangeText={setAccountName}
                    editable={!loading}
                    style={styles.input}
                  />
                </View>
              </View>

              {/* Confirm Button */}
              <TouchableOpacity
                onPress={handleConfirm}
                disabled={loading}
                style={styles.confirmButtonWrapper}
              >
                <LinearGradient
                  colors={["#00112E", "#003994"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.confirmButton}
                >
                  <AppText weight="semibold" style={styles.confirmButtonText}>
                    {loading ? "Processing..." : `Confirm Withdraw ฿${amount}`}
                  </AppText>
                </LinearGradient>
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
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 13,
    color: "#333",
    marginBottom: 10,
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
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 10,
    backgroundColor: "#F5F5F5",
    alignItems: "center",
  },
  amountButtonDisabled: {
    opacity: 0.5,
  },
  amountButtonActive: {
    flex: 1,
    minWidth: "30%",
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  amountButtonText: {
    fontSize: 12,
    color: "#666",
    fontWeight: "600",
  },
  amountButtonTextDisabled: {
    color: "#CCC",
  },
  amountButtonTextActive: {
    color: "#FFF",
  },
  customAmountWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: "#FAFAFA",
    height: 46,
  },
  currencySymbol: {
    fontSize: 14,
    color: "#333",
    marginRight: 6,
    fontWeight: "600",
  },
  customAmountInput: {
    flex: 1,
    fontSize: 14,
    color: "#333",
    padding: 0,
  },
  banksContainer: {
    gap: 10,
  },
  bankCard: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 10,
    backgroundColor: "#F5F5F5",
  },
  bankCardActive: {
    backgroundColor: "#E3F2FD",
    borderColor: "#0088FF",
  },
  bankIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  bankIconBg: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  bankIcon: {
    fontSize: 18,
  },
  bankName: {
    fontSize: 12,
    color: "#333",
    fontWeight: "500",
    flex: 1,
  },
  bankNameActive: {
    color: "#0088FF",
    fontWeight: "600",
  },
  checkmark: {
    fontSize: 18,
    color: "#0088FF",
    fontWeight: "bold",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 10,
    paddingHorizontal: 12,
    backgroundColor: "#FAFAFA",
    height: 46,
  },
  input: {
    flex: 1,
    fontSize: 13,
    color: "#333",
    padding: 0,
  },
  confirmButtonWrapper: {
    borderRadius: 10,
    overflow: "hidden",
    marginTop: 16,
  },
  confirmButton: {
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmButtonText: {
    fontSize: 15,
    color: "#FFF",
    fontWeight: "600",
  },
});
