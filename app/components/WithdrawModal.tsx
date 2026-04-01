import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import React, { useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { image } from "../../assets/images";
import { useLanguage } from "../../contexts/LanguageContext";
import { apiService } from "../../utils/api";
import { AppText } from "./appText";
import { AppTextInput } from "./appTextInput";

interface WithdrawModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: (result: any) => void;
}

const BANKS = [
  {
    id: "kbank",
    nameTh: "กสิกรไทย",
    nameEn: "KBank",
    color: "#138F2D",
    logo: image.kbank,
  },
  {
    id: "scb",
    nameTh: "ไทยพาณิชย์",
    nameEn: "SCB",
    color: "#4E2E7F",
    abbr: "SCB",
  },
  {
    id: "bbl",
    nameTh: "กรุงเทพ",
    nameEn: "Bangkok Bank",
    color: "#1E3A6E",
    abbr: "BBL",
  },
  {
    id: "ktb",
    nameTh: "กรุงไทย",
    nameEn: "Krungthai",
    color: "#4BAECD",
    abbr: "KTB",
  },
  {
    id: "bay",
    nameTh: "กรุงศรี",
    nameEn: "Krungsri",
    color: "#F5A623",
    abbr: "BAY",
  },
  {
    id: "ttb",
    nameTh: "ทหารไทยธนชาต",
    nameEn: "TTB",
    color: "#0066B3",
    abbr: "TTB",
  },
  {
    id: "promptpay",
    nameTh: "พร้อมเพย์",
    nameEn: "PromptPay",
    color: "#003794",
    logo: image.promptpay,
  },
] as const;

export function WithdrawModal({
  visible,
  onClose,
  onSuccess,
}: WithdrawModalProps) {
  const { t } = useLanguage();
  const [amount, setAmount] = useState("");
  const [selectedBank, setSelectedBank] = useState("kbank");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountName, setAccountName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const toastOpacity = useRef(new Animated.Value(0)).current;
  const toastTranslateY = useRef(new Animated.Value(20)).current;

  const quickAmounts = [
    { label: "฿500", value: 500 },
    { label: "฿1,000", value: 1000 },
    { label: "฿2,000", value: 2000 },
    { label: "฿5,000", value: 5000 },
    { label: "฿10,000", value: 10000 },
    { label: "฿20,000", value: 20000 },
  ];

  const isPromptPay = selectedBank === "promptpay";

  const handleQuickAmount = (value: number) => {
    setAmount(value.toString());
    setError("");
  };

  const handleCustomAmount = (text: string) => {
    const stripped = text.replace(/[^0-9]/g, "").replace(/^0+/, "");
    setAmount(stripped);
    setError("");
  };

  const handleReset = () => {
    setAmount("");
    setAccountNumber("");
    setAccountName("");
    setSelectedBank("kbank");
    setError("");
  };

  const showToast = (onFinish: () => void) => {
    toastOpacity.setValue(0);
    toastTranslateY.setValue(20);
    Animated.sequence([
      Animated.parallel([
        Animated.timing(toastOpacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(toastTranslateY, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(2800),
      Animated.parallel([
        Animated.timing(toastOpacity, {
          toValue: 0,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(toastTranslateY, {
          toValue: -10,
          duration: 400,
          useNativeDriver: true,
        }),
      ]),
    ]).start(onFinish);
  };

  const handleConfirm = async () => {
    const numAmount = parseInt(amount) || 0;
    if (numAmount < 100) {
      setError(t("errMinWithdraw"));
      return;
    }
    const accNum = accountNumber.trim();
    if (accNum.length < 10 || accNum.length > 15) {
      setError(
        isPromptPay ? t("errPromptPayFormat") : t("errBankAccountFormat"),
      );
      return;
    }
    if (!accountName.trim()) {
      setError(t("errAccountHolderName"));
      return;
    }

    setLoading(true);
    setError("");
    try {
      const result = await (apiService.wallet.withdraw as any)({
        amount: numAmount,
        bank_code: selectedBank,
        account_number: accNum,
        account_name: accountName.trim(),
      });
      setLoading(false);
      showToast(() => {
        onSuccess?.(result);
        handleReset();
        onClose();
      });
    } catch (err: any) {
      setLoading(false);
      setError(err?.message || t("genericRetryError"));
    }
  };

  const insets = useSafeAreaInsets();
  const screenH = Dimensions.get("window").height;

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
          style={[styles.modalShell, { maxHeight: screenH - insets.top - 20 }]}
        >
          {/* ── Fixed Header ── */}
          <View style={styles.headerBar}>
            <AppText
              weight="semibold"
              numberOfLines={1}
              style={styles.headerTitle}
            >
              {t("withdraw")}
            </AppText>
            <TouchableOpacity onPress={onClose} disabled={loading}>
              <AppText weight="bold" style={styles.closeButton}>
                ✕
              </AppText>
            </TouchableOpacity>
          </View>

          {/* ── Scrollable Body ── */}
          <ScrollView
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.bodyContent}
            bounces
          >
            {/* Quick Amounts */}
            <View style={styles.section}>
              <AppText
                weight="medium"
                numberOfLines={1}
                style={styles.sectionTitle}
              >
                {t("selectAmount")}
              </AppText>
              <View style={styles.amountsGrid}>
                {quickAmounts.map((qa, idx) => {
                  const isActive = amount === qa.value.toString();
                  return isActive ? (
                    <TouchableOpacity
                      key={idx}
                      onPress={() => handleQuickAmount(qa.value)}
                      style={styles.amountBtnWrap}
                    >
                      <LinearGradient
                        colors={["#00112E", "#003994"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 1 }}
                        style={styles.amountBtnActive}
                      >
                        <AppText
                          weight="medium"
                          numberOfLines={1}
                          style={styles.amountTextActive}
                        >
                          {qa.label}
                        </AppText>
                      </LinearGradient>
                    </TouchableOpacity>
                  ) : (
                    <TouchableOpacity
                      key={idx}
                      onPress={() => handleQuickAmount(qa.value)}
                      style={[styles.amountBtnWrap, styles.amountBtn]}
                    >
                      <AppText
                        weight="medium"
                        numberOfLines={1}
                        style={styles.amountText}
                      >
                        {qa.label}
                      </AppText>
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
                {t("enterAmountMin100")}
              </AppText>
              <View style={styles.inputWrapper}>
                <AppText style={styles.currencySymbol}>฿</AppText>
                <AppTextInput
                  placeholder="0"
                  value={amount}
                  onChangeText={handleCustomAmount}
                  keyboardType="number-pad"
                  editable={!loading}
                  style={styles.input}
                />
              </View>
            </View>

            {/* Select Bank — horizontal scroll chips */}
            <View style={styles.section}>
              <AppText
                weight="medium"
                numberOfLines={1}
                style={styles.sectionTitle}
              >
                {t("selectBank")}
              </AppText>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.bankChipsRow}
              >
                {BANKS.map((bank) => {
                  const active = selectedBank === bank.id;
                  return (
                    <TouchableOpacity
                      key={bank.id}
                      onPress={() => {
                        setSelectedBank(bank.id);
                        setError("");
                      }}
                      style={[styles.bankChip, active && styles.bankChipActive]}
                    >
                      <View
                        style={[
                          styles.bankIconBg,
                          { backgroundColor: bank.color },
                        ]}
                      >
                        {"logo" in bank ? (
                          <Image
                            source={bank.logo}
                            style={styles.bankLogo}
                            contentFit="contain"
                          />
                        ) : (
                          <AppText weight="bold" style={styles.bankAbbr}>
                            {"abbr" in bank ? bank.abbr : ""}
                          </AppText>
                        )}
                      </View>
                      <AppText
                        weight={active ? "semibold" : "medium"}
                        numberOfLines={1}
                        style={[
                          styles.bankChipText,
                          active && styles.bankChipTextActive,
                        ]}
                      >
                        {bank.nameTh}
                      </AppText>
                      {active && <AppText style={styles.checkmark}>✓</AppText>}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>

            {/* Account Number */}
            <View style={styles.section}>
              <AppText
                weight="medium"
                numberOfLines={1}
                style={styles.sectionTitle}
              >
                {isPromptPay
                  ? t("promptPayNumberLabel")
                  : t("bankAccountNumberLabel")}
              </AppText>
              <View style={styles.inputWrapper}>
                <AppTextInput
                  placeholder={
                    isPromptPay
                      ? t("phoneNumberPlaceholder")
                      : t("bankAccountPlaceholder")
                  }
                  value={accountNumber}
                  onChangeText={(t) => {
                    setAccountNumber(t.replace(/[^0-9]/g, ""));
                    setError("");
                  }}
                  keyboardType="number-pad"
                  editable={!loading}
                  style={styles.input}
                />
              </View>
            </View>

            {/* Account Name */}
            <View style={styles.section}>
              <AppText
                weight="medium"
                numberOfLines={1}
                style={styles.sectionTitle}
              >
                {t("accountHolderName")}
              </AppText>
              <View style={styles.inputWrapper}>
                <AppTextInput
                  placeholder={t("accountHolderPlaceholder")}
                  value={accountName}
                  onChangeText={(t) => {
                    setAccountName(t);
                    setError("");
                  }}
                  editable={!loading}
                  style={styles.input}
                />
              </View>
            </View>

            {/* Error */}
            {!!error && (
              <View style={styles.errorBox}>
                <AppText weight="medium" style={styles.errorText}>
                  {error}
                </AppText>
              </View>
            )}
          </ScrollView>

          {/* ── Fixed Confirm Button ── */}
          <View
            style={[
              styles.footer,
              { paddingBottom: Math.max(insets.bottom, 16) },
            ]}
          >
            <TouchableOpacity
              onPress={handleConfirm}
              disabled={loading}
              style={styles.confirmBtnWrap}
            >
              <LinearGradient
                colors={loading ? ["#666", "#888"] : ["#00112E", "#003994"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.confirmBtn}
              >
                <AppText
                  weight="semibold"
                  numberOfLines={1}
                  adjustsFontSizeToFit
                  style={styles.confirmBtnText}
                >
                  {loading
                    ? t("processing")
                    : `${t("confirmWithdraw")}${amount ? ` ฿${parseInt(amount).toLocaleString()}` : ""}`}
                </AppText>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>

        {/* Toast */}
        <Animated.View
          style={[
            styles.toast,
            {
              opacity: toastOpacity,
              transform: [{ translateY: toastTranslateY }],
            },
          ]}
          pointerEvents="none"
        >
          <AppText weight="semibold" style={styles.toastTitle}>
            {t("withdrawSuccess")}
          </AppText>
          <AppText weight="regular" style={styles.toastSub}>
            {t("withdrawPendingNote")}
          </AppText>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalShell: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: "hidden",
  },

  /* ── Header ── */
  headerBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#001A3D",
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: { fontSize: 18, color: "#FFF" },
  closeButton: { fontSize: 24, color: "#FFF" },

  /* ── Scrollable body ── */
  bodyContent: {
    paddingHorizontal: 20,
    paddingTop: 18,
    paddingBottom: 8,
  },

  section: { marginBottom: 16 },
  sectionTitle: {
    fontSize: 13,
    color: "#333",
    marginBottom: 8,
    fontWeight: "600",
  },

  /* ── Amount Grid ── */
  amountsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  amountBtnWrap: {
    width: "31%",
    borderRadius: 10,
    overflow: "hidden",
  },
  amountBtn: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    backgroundColor: "#F5F5F5",
    paddingVertical: 10,
    alignItems: "center",
  },
  amountBtnActive: {
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  amountText: { fontSize: 12, color: "#666", fontWeight: "600" },
  amountTextActive: { fontSize: 12, color: "#FFF", fontWeight: "600" },

  /* ── Input ── */
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
  currencySymbol: {
    fontSize: 14,
    color: "#333",
    marginRight: 6,
    fontWeight: "600",
  },
  input: { flex: 1, fontSize: 14, color: "#333", padding: 0 },

  /* ── Bank horizontal chips ── */
  bankChipsRow: {
    gap: 8,
    paddingRight: 4,
  },
  bankChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 10,
    backgroundColor: "#F5F5F5",
  },
  bankChipActive: {
    backgroundColor: "#EEF4FF",
    borderColor: "#003994",
  },
  bankIconBg: {
    width: 28,
    height: 28,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
    overflow: "hidden",
  },
  bankLogo: { width: 22, height: 22 },
  bankAbbr: { fontSize: 8, color: "#FFF", fontWeight: "700" },
  bankChipText: {
    fontSize: 12,
    color: "#444",
  },
  bankChipTextActive: {
    color: "#003994",
    fontWeight: "600",
  },
  checkmark: {
    fontSize: 14,
    color: "#003994",
    fontWeight: "bold",
    marginLeft: 6,
  },

  /* ── Error ── */
  errorBox: {
    backgroundColor: "#FFF0F0",
    borderWidth: 1,
    borderColor: "#FFCCCC",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 8,
  },
  errorText: { fontSize: 12, color: "#CC0000" },

  /* ── Footer (fixed confirm button) ── */
  footer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#E8E8E8",
    backgroundColor: "#FFF",
  },
  confirmBtnWrap: {
    borderRadius: 10,
    overflow: "hidden",
  },
  confirmBtn: {
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  confirmBtnText: {
    fontSize: 15,
    color: "#FFF",
    fontWeight: "600",
  },

  /* ── Toast ── */
  toast: {
    position: "absolute",
    bottom: 50,
    left: 20,
    right: 20,
    backgroundColor: "#003994",
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 18,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  toastTitle: { fontSize: 14, color: "#FFF", fontWeight: "600" },
  toastSub: { fontSize: 12, color: "rgba(255,255,255,0.85)", marginTop: 3 },
});
