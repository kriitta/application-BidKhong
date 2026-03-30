import { image } from "@/assets/images";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import LottieView from "lottie-react-native";
import React, { useRef, useState } from "react";
import {
  Alert,
  Animated,
  Clipboard,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { useLanguage } from "../../contexts/LanguageContext";
import { apiService } from "../../utils/api";
import { AppText } from "./appText";
import { AppTextInput } from "./appTextInput";

const { height: SCREEN_HEIGHT } = Dimensions.get("window");

interface TopUpModalProps {
  visible: boolean;
  onClose: () => void;
  onConfirm?: (result: any) => void;
}

// ─── Bank accounts for mobile banking ───
const BANK_ACCOUNTS = [
  {
    id: "kbank",
    name: "ธนาคารกสิกรไทย",
    nameEn: "Kasikornbank",
    logo: image.kbank,
    accountNo: "083-2-72499-8",
    accountName: "ณัฐดนัย เอกสันติ",
    copyLabel: "เลขบัญชี",
    copyValue: "0832724998",
  },
  {
    id: "promptpay",
    name: "พร้อมเพย์",
    nameEn: "PromptPay",
    logo: image.promptpay,
    accountNo: "096-883-2228",
    accountName: "ณัฐดนัย เอกสันติ",
    copyLabel: "เลขพร้อมเพย์",
    copyValue: "0968832228",
  },
];

export function TopUpModal({ visible, onClose, onConfirm }: TopUpModalProps) {
  const { t } = useLanguage();
  const [amount, setAmount] = useState("");
  const [selectedMethod, setSelectedMethod] = useState("mobilebanking");
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);
  const [slipUri, setSlipUri] = useState<string | null>(null);
  const [slipMimeType, setSlipMimeType] = useState<string>("image/jpeg");
  const [submitting, setSubmitting] = useState(false);
  const [toastMsg, setToastMsg] = useState("");
  const toastOpacity = useRef(new Animated.Value(0)).current;

  const showToast = (msg: string) => {
    setToastMsg(msg);
    Animated.sequence([
      Animated.timing(toastOpacity, {
        toValue: 1,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.delay(1500),
      Animated.timing(toastOpacity, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();
  };

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
    const numericOnly = text.replace(/[^0-9]/g, "");
    // Remove leading zeros, allow empty string
    const cleaned = numericOnly.replace(/^0+/, "");
    setAmount(cleaned);
  };

  const handleProceedToPayment = () => {
    const numAmount = parseInt(amount) || 0;
    if (numAmount <= 0) {
      Alert.alert(t("error"), t("errEnterTopUpAmount"));
      return;
    }
    setStep(2);
  };

  const handlePickSlip = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(t("permissionRequired"), t("permissionPhotoMsg"));
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: false,
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.length) {
      setSlipUri(result.assets[0].uri);
      setSlipMimeType(result.assets[0].mimeType || "image/jpeg");
    }
  };

  const handleSubmitSlip = async () => {
    if (!slipUri) {
      Alert.alert("Error", "กรุณาอัปโหลดสลิปการโอนเงิน");
      return;
    }
    const numAmount = parseInt(amount) || 0;
    setSubmitting(true);
    try {
      const result = await apiService.wallet.topUp({
        amount: numAmount,
        slipImageUri: slipUri,
        slipMimeType,
      });
      onConfirm?.(result);
      handleReset();
      onClose();
    } catch (error: any) {
      Alert.alert(t("error"), error.message || t("slipSubmitFailed"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setAmount("");
    setSelectedMethod("mobilebanking");
    setStep(1);
    setSlipUri(null);
    setSlipMimeType("image/jpeg");
    setSubmitting(false);
  };

  const handleClose = () => {
    handleReset();
    onClose();
  };

  const handleBack = () => {
    setSlipUri(null);
    setStep(1);
  };

  const formatDisplayAmount = (val: string) => {
    const num = parseInt(val) || 0;
    return "฿" + num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const isFormValid = () => {
    const numAmount = parseInt(amount) || 0;
    return numAmount > 0;
  };

  // ─── STEP 2: Payment Details ───
  const renderPaymentStep = () => {
    if (selectedMethod === "qrcode") {
      return (
        <>
          {/* QR Code Display */}
          <View style={styles.paymentInfoCard}>
            <AppText weight="semibold" style={styles.paymentInfoTitle}>
              {t("scanQrToPay")}
            </AppText>
            <AppText weight="regular" style={styles.paymentInfoSub}>
              {t("scanQrSub")}
            </AppText>

            <View style={styles.qrContainer}>
              <View style={styles.qrBox}>
                <Image
                  source={image.qr_code}
                  style={styles.qrImage}
                  resizeMode="contain"
                />
              </View>
            </View>

            <View style={styles.paymentAmountRow}>
              <AppText weight="regular" style={styles.paymentAmountLabel}>
                {t("amountToPay")}
              </AppText>
              <AppText weight="bold" style={styles.paymentAmountValue}>
                {formatDisplayAmount(amount)}
              </AppText>
            </View>
          </View>

          {/* Upload Slip */}
          {renderSlipUpload()}
        </>
      );
    }

    // Mobile Banking
    return (
      <>
        <View style={styles.paymentInfoCard}>
          <AppText weight="semibold" style={styles.paymentInfoTitle}>
            {t("transferViaMobileBanking")}
          </AppText>
          <AppText weight="regular" style={styles.paymentInfoSub}>
            {t("transferViaMobileBankingSub")}
          </AppText>

          <View style={styles.paymentAmountRow}>
            <AppText weight="regular" style={styles.paymentAmountLabel}>
              {t("amountToPay")}
            </AppText>
            <AppText weight="bold" style={styles.paymentAmountValue}>
              {formatDisplayAmount(amount)}
            </AppText>
          </View>
        </View>

        {/* Bank accounts list */}
        <View style={styles.section}>
          <AppText weight="medium" style={styles.sectionTitle}>
            {t("selectBankToTransfer")}
          </AppText>
          {BANK_ACCOUNTS.map((bank) => (
            <View key={bank.id} style={styles.bankCard}>
              <View style={styles.bankHeader}>
                <Image
                  source={bank.logo}
                  style={styles.bankLogoImage}
                  resizeMode="contain"
                />
                <View style={styles.bankNameCol}>
                  <AppText weight="semibold" style={styles.bankName}>
                    {bank.name}
                  </AppText>
                  <AppText weight="regular" style={styles.bankNameEn}>
                    {bank.nameEn}
                  </AppText>
                </View>
              </View>

              <View style={styles.bankDetailsRow}>
                <View style={styles.bankDetailItem}>
                  <AppText weight="regular" style={styles.bankDetailLabel}>
                    {bank.copyLabel}
                  </AppText>
                  <TouchableOpacity
                    style={styles.copyRow}
                    onPress={() => {
                      Clipboard.setString(bank.copyValue);
                      showToast(`คัดลอกเลขเรียบร้อยแล้ว`);
                    }}
                    activeOpacity={0.7}
                  >
                    <AppText weight="bold" style={styles.bankDetailValue}>
                      {bank.accountNo}
                    </AppText>
                    <Ionicons
                      name="copy-outline"
                      size={16}
                      color="#3B82F6"
                      style={{ marginLeft: 6 }}
                    />
                  </TouchableOpacity>
                </View>
                <View style={styles.bankDetailItem}>
                  <AppText weight="regular" style={styles.bankDetailLabel}>
                    {t("accountNameLabel")}
                  </AppText>
                  <AppText weight="semibold" style={styles.bankDetailValue}>
                    {bank.accountName}
                  </AppText>
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* Upload Slip */}
        {renderSlipUpload()}
      </>
    );
  };

  // ─── Slip Upload Section ───
  const renderSlipUpload = () => (
    <View style={styles.section}>
      <AppText weight="medium" style={styles.sectionTitle}>
        {t("uploadPaymentSlip")}
      </AppText>

      {slipUri ? (
        <View style={styles.slipPreviewContainer}>
          <Image
            source={{ uri: slipUri }}
            style={styles.slipPreview}
            resizeMode="contain"
          />
          <TouchableOpacity
            style={styles.slipRemoveBtn}
            onPress={() => setSlipUri(null)}
          >
            <Ionicons name="close-circle" size={28} color="#EF4444" />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.slipChangeBtn}
            onPress={handlePickSlip}
          >
            <Ionicons name="camera-outline" size={16} color="#3B82F6" />
            <AppText weight="medium" style={styles.slipChangeBtnText}>
              {t("change")}
            </AppText>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity style={styles.slipUploadBox} onPress={handlePickSlip}>
          <View style={styles.slipUploadIconCircle}>
            <Ionicons name="cloud-upload-outline" size={28} color="#3B82F6" />
          </View>
          <AppText weight="semibold" style={styles.slipUploadText}>
            {t("tapToUploadSlip")}
          </AppText>
          <AppText weight="regular" style={styles.slipUploadSub}>
            {t("supportedFormats")}
          </AppText>
        </TouchableOpacity>
      )}
    </View>
  );

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.overlay}
      >
        {/* Tap backdrop to close */}
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={handleClose}
        />

        {/* Fixed modal container */}
        <View style={styles.modalContent}>
          {/* Header - fixed */}
          <View style={styles.headerBar}>
            {step === 2 ? (
              <TouchableOpacity onPress={handleBack} style={styles.backBtn}>
                <Ionicons name="arrow-back" size={22} color="#FFF" />
              </TouchableOpacity>
            ) : (
              <View style={{ width: 32 }} />
            )}
            <AppText
              weight="semibold"
              numberOfLines={1}
              style={styles.headerTitle}
            >
              {step === 1 ? t("topUpWallet") : t("paymentDetails")}
            </AppText>
            <TouchableOpacity onPress={handleClose}>
              <AppText weight="bold" style={styles.closeButton}>
                ✕
              </AppText>
            </TouchableOpacity>
          </View>

          {/* Scrollable content area */}
          <ScrollView
            style={styles.scrollArea}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            bounces={false}
          >
            {step === 1 ? (
              <>
                {/* Select Amount */}
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
                    {t("enterCustomAmount")}
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
                    {t("paymentMethod")}
                  </AppText>
                  <View style={styles.methodsContainer}>
                    {paymentMethods.map((method) => (
                      <TouchableOpacity
                        key={method.id}
                        onPress={() => setSelectedMethod(method.id)}
                        style={[
                          styles.methodCard,
                          selectedMethod === method.id &&
                            styles.methodCardActive,
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
              </>
            ) : (
              <>
                {/* Step 2: Payment Details */}
                {renderPaymentStep()}
              </>
            )}
          </ScrollView>

          {/* Bottom button - fixed */}
          <View style={styles.bottomButtonArea}>
            {step === 1 ? (
              <TouchableOpacity
                onPress={handleProceedToPayment}
                disabled={!isFormValid()}
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
                      Next - {formatDisplayAmount(amount)}
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
                      {t("selectAmountAndMethod")}
                    </AppText>
                  </View>
                )}
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={handleSubmitSlip}
                disabled={!slipUri || submitting}
                style={styles.confirmButtonWrapper}
              >
                {slipUri ? (
                  <LinearGradient
                    colors={["#22C55E", "#16A34A"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.confirmButton}
                  >
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <Ionicons
                        name="checkmark-circle"
                        size={20}
                        color="#FFF"
                      />
                      <AppText
                        weight="semibold"
                        numberOfLines={1}
                        style={styles.confirmButtonText}
                      >
                        {submitting ? t("processing") : t("confirmSubmitSlip")}
                      </AppText>
                    </View>
                  </LinearGradient>
                ) : (
                  <View style={styles.confirmButtonDisabled}>
                    <AppText
                      weight="semibold"
                      numberOfLines={1}
                      style={styles.confirmButtonTextDisabled}
                    >
                      {t("uploadSlipToContinue")}
                    </AppText>
                  </View>
                )}
              </TouchableOpacity>
            )}
          </View>
        </View>
      </KeyboardAvoidingView>

      {/* Submitting Overlay */}
      {submitting && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingBox}>
            <LottieView
              source={require("../../assets/animations/loading.json")}
              autoPlay
              loop
              style={{ width: 100, height: 100 }}
            />
            <AppText weight="medium" style={styles.loadingText}>
              {t("processing")}
            </AppText>
          </View>
        </View>
      )}

      {/* Copy Toast */}
      <Animated.View
        style={[styles.toast, { opacity: toastOpacity }]}
        pointerEvents="none"
      >
        <Ionicons name="checkmark-circle" size={16} color="#FFF" />
        <AppText weight="medium" style={styles.toastText}>
          {toastMsg}
        </AppText>
      </Animated.View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "flex-end",
  },
  backdrop: {
    flex: 1,
  },
  modalContent: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: SCREEN_HEIGHT * 0.88,
    overflow: "hidden",
  },
  headerBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#001A3D",
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  headerTitle: {
    fontSize: 18,
    color: "#FFF",
  },
  closeButton: {
    fontSize: 24,
    color: "#FFF",
  },
  scrollArea: {
    flexGrow: 0,
    flexShrink: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 6,
  },
  bottomButtonArea: {
    paddingHorizontal: 20,
    paddingTop: 6,
    paddingBottom: Platform.OS === "ios" ? 34 : 20,
    backgroundColor: "#FFF",
    borderTopWidth: 1,
    borderTopColor: "#F3F4F6",
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

  // ─── Step 2 Styles ───
  backBtn: {
    width: 32,
    height: 32,
    justifyContent: "center",
    alignItems: "center",
  },
  paymentInfoCard: {
    backgroundColor: "#F8FAFC",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
    marginBottom: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  paymentInfoTitle: {
    fontSize: 17,
    color: "#111827",
    marginBottom: 4,
  },
  paymentInfoSub: {
    fontSize: 12,
    color: "#9CA3AF",
    marginBottom: 16,
  },
  qrContainer: {
    alignItems: "center",
    marginBottom: 16,
  },
  qrBox: {
    width: 200,
    height: 200,
    backgroundColor: "#FFF",
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  qrImage: {
    width: 160,
    height: 160,
  },
  paymentAmountRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    width: "100%",
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  paymentAmountLabel: {
    fontSize: 14,
    color: "#6B7280",
  },
  paymentAmountValue: {
    fontSize: 20,
    color: "#111827",
  },

  // ─── Bank Card ───
  bankCard: {
    backgroundColor: "#FFF",
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 1,
  },
  bankHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  bankLogoImage: {
    width: 46,
    height: 46,
    borderRadius: 10,
    marginRight: 12,
    backgroundColor: "#F3F4F6",
  },
  bankNameCol: {
    flex: 1,
  },
  bankName: {
    fontSize: 14,
    color: "#111827",
  },
  bankNameEn: {
    fontSize: 11,
    color: "#9CA3AF",
    marginTop: 1,
  },
  bankDetailsRow: {
    backgroundColor: "#F8FAFC",
    borderRadius: 10,
    padding: 12,
    gap: 8,
  },
  bankDetailItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  bankDetailLabel: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  bankDetailValue: {
    fontSize: 13,
    color: "#111827",
  },
  copyRow: {
    flexDirection: "row",
    alignItems: "center",
  },

  // ─── Slip Upload ───
  slipUploadBox: {
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#CBD5E1",
    borderRadius: 16,
    paddingVertical: 30,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8FAFC",
  },
  slipUploadIconCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: "#EFF6FF",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  slipUploadText: {
    fontSize: 15,
    color: "#111827",
    marginBottom: 4,
  },
  slipUploadSub: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  slipPreviewContainer: {
    alignItems: "center",
    position: "relative",
  },
  slipPreview: {
    width: "100%",
    height: 260,
    borderRadius: 14,
    backgroundColor: "#F0F0F0",
  },
  slipRemoveBtn: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#FFF",
    borderRadius: 14,
  },
  slipChangeBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 10,
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: "#EFF6FF",
    borderRadius: 20,
  },
  slipChangeBtnText: {
    fontSize: 13,
    color: "#3B82F6",
  },

  // ─── Loading Overlay ───
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
  loadingBox: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 30,
    alignItems: "center",
  },
  loadingText: {
    fontSize: 14,
    color: "#333",
    marginTop: 8,
  },
  toast: {
    position: "absolute",
    bottom: 120,
    alignSelf: "center",
    backgroundColor: "rgba(30,30,30,0.88)",
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 24,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  toastText: {
    fontSize: 13,
    color: "#FFF",
  },
});
