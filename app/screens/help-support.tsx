import { image } from "@/assets/images";
import { apiService } from "@/utils/api";
import { getFullImageUrl } from "@/utils/api/config";
import type { EvidenceImage, ReportType, UserReport } from "@/utils/api/types";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import * as ImagePicker from "expo-image-picker";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import LottieView from "lottie-react-native";
import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLanguage } from "../../contexts/LanguageContext";
import { AppText } from "../components/appText";

// FAQ Data (Thai)
const FAQ_DATA_TH = [
  {
    id: 1,
    question: "วิธีการประมูลสินค้าทำอย่างไร?",
    answer:
      "เลือกสินค้าที่ต้องการประมูล กดปุ่ม 'ประมูล' กรอกราคาที่ต้องการ (ต้องมากกว่าราคาปัจจุบันตาม Min Bid Increment) แล้วกดยืนยัน ระบบจะแจ้งเตือนหากคุณถูกเสนอราคาสูงกว่า",
  },
  {
    id: 2,
    question: "ฉันชนะการประมูลแล้วต้องทำอย่างไรต่อ?",
    answer:
      'ไปที่หน้า "My Bid" เลือกรายการที่ชนะ กดปุ่ม "ยืนยันรับสินค้า" เพื่อเข้าสู่ขั้นตอนการตรวจสอบ คุณมีเวลา 24 ชั่วโมงในการยืนยัน หากไม่ยืนยันภายในเวลา รายการจะถูกยกเลิกอัตโนมัติ',
  },
  {
    id: 3,
    question: "วิธีการเติมเงินเข้า Wallet ทำอย่างไร?",
    answer:
      'ไปที่หน้า Wallet กดปุ่ม "เติมเงิน" เลือกจำนวนเงินที่ต้องการเติม แล้วทำรายการผ่านช่องทางที่รองรับ (PromptPay, บัตรเครดิต/เดบิต) เงินจะเข้าบัญชีภายใน 1-5 นาที',
  },
  {
    id: 4,
    question: "ฉันสามารถถอนเงินจาก Wallet ได้อย่างไร?",
    answer:
      'ไปที่หน้า Wallet กดปุ่ม "ถอนเงิน" กรอกจำนวนเงินและบัญชีปลายทาง เงินจะโอนภายใน 1-3 วันทำการ (ขั้นต่ำ 100 บาท)',
  },
  {
    id: 5,
    question: "หากสินค้าที่ได้รับไม่ตรงกับรายละเอียดทำอย่างไร?",
    answer:
      'กดปุ่ม "แจ้งปัญหา" ในหน้ารายละเอียดสินค้า หรือติดต่อฝ่ายสนับสนุนผ่านช่องทางด้านล่าง ทีมงานจะตรวจสอบและดำเนินการภายใน 24-48 ชั่วโมง',
  },
  {
    id: 6,
    question: "ฉันสามารถยกเลิกการประมูลได้ไหม?",
    answer:
      "การประมูลไม่สามารถยกเลิกได้หลังจากกดยืนยันแล้ว กรุณาตรวจสอบราคาและรายละเอียดให้ดีก่อนทำการประมูล",
  },
  {
    id: 7,
    question: "ฉันต้องการเป็นผู้ขาย (Seller) ทำอย่างไร?",
    answer:
      'ไปที่หน้า "Seller" แล้วกดปุ่ม "ลงขายสินค้า" กรอกรายละเอียดสินค้า ถ่ายรูป ตั้งราคาเริ่มต้นและระยะเวลาประมูล สินค้าจะต้องผ่านการอนุมัติจากแอดมินก่อนเปิดประมูล',
  },
  {
    id: 8,
    question: "Buy Now (ซื้อทันที) คืออะไร?",
    answer:
      "Buy Now คือราคาซื้อทันทีที่ผู้ขายกำหนดไว้ คุณสามารถกดซื้อได้เลยโดยไม่ต้องรอให้การประมูลจบ ซึ่งต่างจาก Place Bid ที่ต้องเสนอราคาแข่งกับคนอื่น",
  },
  {
    id: 9,
    question: "ผู้เยี่ยมชม (Guest) สามารถทำอะไรได้บ้าง?",
    answer:
      "ผู้เยี่ยมชมสามารถเลือกดูสินค้า ค้นหา และดูหมวดหมู่ได้ แต่ไม่สามารถประมูล ซื้อสินค้า ใช้ Wallet หรือลงขายสินค้าได้ ต้องสมัครสมาชิกก่อนจึงจะใช้ฟีเจอร์เหล่านี้ได้",
  },
  {
    id: 10,
    question: "วิธีดูประวัติธุรกรรมใน Wallet?",
    answer:
      'ไปที่แท็บ "Wallet" จะเห็นรายการธุรกรรมทั้งหมดด้านล่าง สามารถกดไอคอนกรองเพื่อเลือกแสดงตามประเภท (เติมเงิน, ถอนเงิน, ชนะประมูล, วางประมูล, คืนเงิน, รายได้) หรือกรองตามเดือนและปีได้',
  },
  {
    id: 11,
    question: "ลืมรหัสผ่านทำอย่างไร?",
    answer:
      'กดปุ่ม "ลืมรหัสผ่าน" ที่หน้า Login กรอกอีเมลที่ลงทะเบียนไว้ ระบบจะส่งรหัสยืนยันไปทางอีเมล นำรหัสมากรอกพร้อมรหัสผ่านใหม่ (อย่างน้อย 6 ตัวอักษร) เพื่อตั้งค่ารหัสผ่านใหม่',
  },
  {
    id: 12,
    question: "สินค้า Incoming, Hot, Ending Soon คืออะไร?",
    answer:
      '"Incoming" คือสินค้าที่กำลังจะเปิดประมูลเร็วๆ นี้ ยังประมูลไม่ได้จนกว่าจะถึงเวลา, "Hot" คือสินค้ายอดนิยมที่มีคนประมูลเยอะ, "Ending Soon" คือสินค้าที่ใกล้จะปิดการประมูล ต้องรีบเสนอราคา',
  },
  {
    id: 13,
    question: "AI Pick / แนะนำสำหรับคุณ คืออะไร?",
    answer:
      "ระบบ AI จะวิเคราะห์พฤติกรรมการใช้งานของคุณ เช่น สินค้าที่เคยดู หมวดหมู่ที่สนใจ แล้วแนะนำสินค้าที่น่าจะตรงกับความสนใจของคุณ ต้องล็อกอินถึงจะเห็นส่วนนี้",
  },
  {
    id: 14,
    question: "วิธีแก้ไขข้อมูลโปรไฟล์?",
    answer:
      'ไปที่แท็บ "โปรไฟล์" แล้วกด "แก้ไขโปรไฟล์" สามารถเปลี่ยนชื่อ เบอร์โทร รูปโปรไฟล์ และรีเซ็ตรหัสผ่านได้ อีเมลไม่สามารถเปลี่ยนได้',
  },
  {
    id: 15,
    question: "วิธีเปลี่ยนภาษาในแอป?",
    answer:
      'ไปที่แท็บ "โปรไฟล์" จะมีปุ่มสลับภาษา ไทย/EN ระบบจะจำการตั้งค่าภาษาไว้ให้โดยอัตโนมัติ',
  },
  {
    id: 16,
    question: "Minimum Bid Increment คืออะไร?",
    answer:
      "คือจำนวนเงินขั้นต่ำที่ต้องเสนอเพิ่มจากราคาปัจจุบัน เช่น หากราคาปัจจุบัน ฿1,000 และ min increment ฿100 คุณต้องเสนอ ฿1,100 ขึ้นไป",
  },
  {
    id: 17,
    question: "วิธีจัดการสินค้าที่ลงขาย?",
    answer:
      'ไปที่แท็บ "โปรไฟล์" แล้วกด "สินค้าของฉัน" จะเห็นสินค้าทั้งหมดที่ลงขาย แบ่งตามสถานะ: กำลังจะเปิด, กำลังประมูล, ปิดประมูลแล้ว และกำลังจัดส่ง เมื่อมีผู้ชนะประมูล สามารถกด "จัดส่งแล้ว" เพื่ออัปเดตสถานะได้',
  },
  {
    id: 18,
    question: "วิธียืนยันรับสินค้าหลังชนะประมูล?",
    answer:
      'ไปที่แท็บ "โปรไฟล์" แล้วกด "ยืนยันสินค้า" เลือกรายการที่ชนะแล้วกดยืนยัน คุณมีเวลา 24 ชั่วโมงในการยืนยัน หากไม่ยืนยันภายในเวลา รายการจะถูกยกเลิกอัตโนมัติ',
  },
];

const FAQ_DATA_EN = [
  {
    id: 1,
    question: "How do I bid on a product?",
    answer:
      "Select the product you want to bid on, tap 'Bid', enter your price (must exceed current price by Min Bid Increment), then confirm. You\'ll be notified if someone outbids you.",
  },
  {
    id: 2,
    question: "I won an auction — what's next?",
    answer:
      'Go to "My Bid", select the winning item, tap "Confirm Receipt" to start verification. You have 24 hours to confirm. If not confirmed in time, the order is automatically cancelled.',
  },
  {
    id: 3,
    question: "How do I top up my Wallet?",
    answer:
      'Go to the Wallet page, tap "Top Up", select the amount and pay via a supported method (PromptPay, credit/debit card). Funds arrive within 1–5 minutes.',
  },
  {
    id: 4,
    question: "How do I withdraw from my Wallet?",
    answer:
      'Go to the Wallet page, tap "Withdraw", enter the amount and destination bank account. Funds transfer within 1–3 business days (minimum ฿100).',
  },
  {
    id: 5,
    question: "What if the item I received doesn't match the description?",
    answer:
      'Tap "Report Issue" on the product detail page, or contact support via the channels below. The team will review and respond within 24–48 hours.',
  },
  {
    id: 6,
    question: "Can I cancel a bid?",
    answer:
      "Bids cannot be cancelled after confirmation. Please review the price and details carefully before bidding.",
  },
  {
    id: 7,
    question: "How do I become a seller?",
    answer:
      'Go to the "Seller" page and tap "List Product", fill in product details, upload photos, set a starting price and duration. The product must be approved by an admin before the auction opens.',
  },
  {
    id: 8,
    question: "What is Buy Now?",
    answer:
      "Buy Now is a fixed price set by the seller that lets you purchase the item immediately without waiting for the auction to end. This is different from Place Bid, where you compete with other bidders.",
  },
  {
    id: 9,
    question: "What can a Guest user do?",
    answer:
      "Guests can browse products, search, and view categories, but cannot bid, buy items, use the Wallet, or list products for sale. You must create an account to access these features.",
  },
  {
    id: 10,
    question: "How do I view my transaction history?",
    answer:
      'Go to the "Wallet" tab to see all transactions listed below your balance. Tap the filter icon to filter by type (deposit, withdraw, won auction, bid placed, refund, earnings) or by month and year.',
  },
  {
    id: 11,
    question: "I forgot my password — what do I do?",
    answer:
      'Tap "Forgot Password" on the login screen, enter your registered email, and a verification code will be sent. Enter the code along with your new password (at least 6 characters) to reset it.',
  },
  {
    id: 12,
    question: "What are Incoming, Hot, and Ending Soon products?",
    answer:
      '"Incoming" are products whose auction hasn\'t started yet. "Hot" are trending products with many bidders. "Ending Soon" are auctions about to close — bid quickly!',
  },
  {
    id: 13,
    question: "What is AI Pick / Recommended for You?",
    answer:
      "The AI analyzes your browsing behavior — products you've viewed and categories you're interested in — to suggest items you might like. You must be logged in to see recommendations.",
  },
  {
    id: 14,
    question: "How do I edit my profile?",
    answer:
      'Go to the "Profile" tab and tap "Edit Profile". You can change your name, phone number, profile picture, and reset your password. Email cannot be changed.',
  },
  {
    id: 15,
    question: "How do I change the app language?",
    answer:
      'Go to the "Profile" tab where you\'ll find a language toggle (Thai/EN). The app will remember your language preference automatically.',
  },
  {
    id: 16,
    question: "What is Minimum Bid Increment?",
    answer:
      "It's the minimum amount you must add on top of the current bid. For example, if the current bid is ฿1,000 and the increment is ฿100, you must bid at least ฿1,100.",
  },
  {
    id: 17,
    question: "How do I manage my listed products?",
    answer:
      'Go to the "Profile" tab and tap "My Products". You\'ll see all your listings by status: Incoming, Active, Ended, and Shipping. When a buyer wins, you can tap "Mark as Shipped" to update the status.',
  },
  {
    id: 18,
    question: "How do I verify a product after winning?",
    answer:
      'Go to the "Profile" tab and tap "Verify Product". Select the won item and confirm receipt. You have 24 hours to verify. If not verified in time, the order is automatically cancelled.',
  },
];

// Report types (matching API ReportType)

const HelpSupportPage = () => {
  const router = useRouter();
  const { t, lang } = useLanguage();
  const faqData = lang === "th" ? FAQ_DATA_TH : FAQ_DATA_EN;
  const reportTypes: { id: ReportType; label: string; color: string }[] = [
    { id: "scam", label: t("reportTypeScam"), color: "#EF4444" },
    { id: "fake_product", label: t("reportTypeFakeProduct"), color: "#F59E0B" },
    { id: "harassment", label: t("reportTypeHarassment"), color: "#EC4899" },
    {
      id: "inappropriate_content",
      label: t("reportTypeInappropriate"),
      color: "#3B82F6",
    },
    { id: "other", label: t("reportTypeOther"), color: "#6B7280" },
  ];
  const getReportTypeInfo = (type: ReportType) => {
    const found = reportTypes.find((rt) => rt.id === type);
    return {
      label: found?.label || t("reportTypeOther"),
      color: found?.color || "#6B7280",
    };
  };
  const [activeTab, setActiveTab] = useState<"faq" | "report" | "status">(
    "faq",
  );
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  // Report form
  const [selectedType, setSelectedType] = useState<ReportType | null>(null);
  const [reportedUserId, setReportedUserId] = useState("");
  const [reportedProductId, setReportedProductId] = useState("");
  const [reportDescription, setReportDescription] = useState("");
  const [evidenceImages, setEvidenceImages] = useState<EvidenceImage[]>([]);
  const [submitting, setSubmitting] = useState(false);

  // Report status (from API)
  const [reports, setReports] = useState<UserReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<UserReport | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [loadingReports, setLoadingReports] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Animation
  const successAnim = useRef(new Animated.Value(0)).current;

  // ── Fetch reports from API ──
  const fetchReports = useCallback(async () => {
    try {
      setLoadingReports(true);
      const data = await apiService.report.getMyReports();
      setReports(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.log("Failed to fetch reports:", error.message);
    } finally {
      setLoadingReports(false);
    }
  }, []);

  const onRefreshReports = useCallback(async () => {
    setRefreshing(true);
    try {
      const data = await apiService.report.getMyReports();
      setReports(Array.isArray(data) ? data : []);
    } catch (error: any) {
      console.log("Failed to refresh reports:", error.message);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (activeTab === "status") {
      fetchReports();
    }
  }, [activeTab, fetchReports]);

  // ── Image picker for evidence ──
  const pickEvidenceImage = async () => {
    if (evidenceImages.length >= 5) {
      Alert.alert(t("maxEvidenceTitle"), t("maxEvidenceMsg"));
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      selectionLimit: 5 - evidenceImages.length,
      quality: 0.8,
    });
    if (!result.canceled && result.assets) {
      const newImages: EvidenceImage[] = result.assets.map((asset) => ({
        uri: asset.uri,
        name: asset.fileName || `evidence_${Date.now()}.jpg`,
        type: asset.mimeType || "image/jpeg",
      }));
      setEvidenceImages((prev) => [...prev, ...newImages].slice(0, 5));
    }
  };

  const removeEvidenceImage = (index: number) => {
    setEvidenceImages((prev) => prev.filter((_, i) => i !== index));
  };

  const showSuccess = () => {
    successAnim.setValue(0);
    Animated.sequence([
      Animated.timing(successAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(2000),
      Animated.timing(successAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleSubmitReport = async () => {
    Keyboard.dismiss();

    if (!selectedType) {
      Alert.alert(t("error"), t("errSelectReportType"));
      return;
    }
    if (!reportedUserId.trim()) {
      Alert.alert(t("error"), t("errEnterReportedUser"));
      return;
    }
    if (!reportDescription.trim()) {
      Alert.alert(t("error"), t("errEnterReportDesc"));
      return;
    }

    setSubmitting(true);
    try {
      await apiService.report.submitReport(
        {
          reported_user_id: reportedUserId.trim(),
          reported_product_id: reportedProductId.trim() || undefined,
          type: selectedType,
          description: reportDescription.trim(),
        },
        evidenceImages.length > 0 ? evidenceImages : undefined,
      );
      // Reset form
      setSelectedType(null);
      setReportedUserId("");
      setReportedProductId("");
      setReportDescription("");
      setEvidenceImages([]);
      showSuccess();
      // Switch to status tab after a short delay
      setTimeout(() => {
        setActiveTab("status");
        fetchReports();
      }, 2500);
    } catch (error: any) {
      Alert.alert(t("error"), error.message || t("reportSubmitFailed"));
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusConfig = (status: UserReport["status"]) => {
    switch (status) {
      case "pending":
        return {
          label: t("reportPending"),
          color: "#F59E0B",
          bg: "#FEF3C7",
          icon: "hourglass-outline",
        };
      case "reviewing":
        return {
          label: t("reportReviewing"),
          color: "#3B82F6",
          bg: "#EFF6FF",
          icon: "sync-outline",
        };
      case "resolved":
        return {
          label: t("reportResolved"),
          color: "#22C55E",
          bg: "#F0FDF4",
          icon: "checkmark-circle-outline",
        };
      default:
        return {
          label: t("reportUnknown"),
          color: "#9CA3AF",
          bg: "#F3F4F6",
          icon: "help-circle-outline",
        };
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleString("th-TH", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateStr;
    }
  };

  const tabs = [
    { key: "faq" as const, label: t("tabFaq") },
    { key: "report" as const, label: t("tabReport") },
    { key: "status" as const, label: t("tabStatus") },
  ];

  const renderFAQTab = () => (
    <View>
      <View style={styles.sectionHeader}>
        <AppText
          weight="semibold"
          style={styles.sectionTitle}
          numberOfLines={1}
        >
          {t("faqTitle")}
        </AppText>
        <AppText
          weight="regular"
          style={styles.sectionSubtitle}
          numberOfLines={1}
        >
          {t("faqSubtitle")}
        </AppText>
      </View>

      {faqData.map((item) => (
        <TouchableOpacity
          key={item.id}
          style={[
            styles.faqCard,
            expandedFAQ === item.id && styles.faqCardExpanded,
          ]}
          onPress={() =>
            setExpandedFAQ(expandedFAQ === item.id ? null : item.id)
          }
          activeOpacity={0.7}
        >
          <View style={styles.faqQuestion}>
            <View style={styles.faqQIcon}>
              <AppText weight="bold" style={styles.faqQIconText}>
                Q
              </AppText>
            </View>
            <AppText
              weight="semibold"
              style={styles.faqQuestionText}
              numberOfLines={2}
            >
              {item.question}
            </AppText>
            <AppText weight="regular" style={styles.faqArrow} numberOfLines={1}>
              {expandedFAQ === item.id ? "▲" : "▼"}
            </AppText>
          </View>
          {expandedFAQ === item.id && (
            <View style={styles.faqAnswer}>
              <View style={styles.faqAIcon}>
                <AppText weight="bold" style={styles.faqAIconText}>
                  A
                </AppText>
              </View>
              <AppText weight="regular" style={styles.faqAnswerText}>
                {item.answer}
              </AppText>
            </View>
          )}
        </TouchableOpacity>
      ))}
    </View>
  );

  const renderReportTab = () => (
    <View>
      <View style={styles.sectionHeader}>
        <AppText
          weight="semibold"
          style={styles.sectionTitle}
          numberOfLines={1}
        >
          {t("reportSectionTitle")}
        </AppText>
        <AppText
          weight="regular"
          style={styles.sectionSubtitle}
          numberOfLines={1}
        >
          {t("reportResponseTime")}
        </AppText>
      </View>

      {/* Report Type Selection */}
      <View style={styles.reportCard}>
        <AppText weight="medium" style={styles.reportLabel} numberOfLines={1}>
          ประเภทปัญหา
        </AppText>
        <View style={styles.reportTypes}>
          {reportTypes.map((type) => (
            <TouchableOpacity
              key={type.id}
              style={[
                styles.reportTypeChip,
                selectedType === type.id && {
                  backgroundColor: type.color + "18",
                  borderColor: type.color,
                },
              ]}
              onPress={() => setSelectedType(type.id)}
            >
              <AppText
                weight={selectedType === type.id ? "semibold" : "regular"}
                style={[
                  styles.reportTypeText,
                  selectedType === type.id && { color: type.color },
                ]}
              >
                {type.label}
              </AppText>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Report Form */}
      <View style={styles.reportCard}>
        <AppText weight="medium" style={styles.reportLabel} numberOfLines={1}>
          {t("reportedUserIdLabel")}
        </AppText>
        <TextInput
          style={styles.reportInput}
          value={reportedUserId}
          onChangeText={setReportedUserId}
          placeholder={t("enterReportedUserId")}
          placeholderTextColor="#C0C0C0"
          keyboardType="number-pad"
        />

        <AppText
          weight="medium"
          style={[styles.reportLabel, { marginTop: 16 }]}
          numberOfLines={1}
        >
          {t("reportProductIdLabel")}
        </AppText>
        <TextInput
          style={styles.reportInput}
          value={reportedProductId}
          onChangeText={setReportedProductId}
          placeholder={t("enterReportedProductId")}
          placeholderTextColor="#C0C0C0"
          keyboardType="number-pad"
        />

        <AppText
          weight="medium"
          style={[styles.reportLabel, { marginTop: 16 }]}
        >
          {t("reportDescLabel")}
        </AppText>
        <TextInput
          style={[styles.reportInput, styles.reportTextArea]}
          value={reportDescription}
          onChangeText={setReportDescription}
          placeholder={t("reportDescPlaceholder")}
          placeholderTextColor="#C0C0C0"
          multiline
          numberOfLines={5}
          textAlignVertical="top"
          maxLength={1000}
        />
        <AppText weight="regular" style={styles.charCount} numberOfLines={1}>
          {reportDescription.length}/1000
        </AppText>

        {/* Evidence Images */}
        <AppText
          weight="medium"
          style={[styles.reportLabel, { marginTop: 16 }]}
        >
          รูปหลักฐาน ({evidenceImages.length}/5)
        </AppText>
        <View style={styles.evidenceRow}>
          {evidenceImages.map((img, idx) => (
            <View key={idx} style={styles.evidenceThumb}>
              <Image source={{ uri: img.uri }} style={styles.evidenceImg} />
              <TouchableOpacity
                style={styles.evidenceRemove}
                onPress={() => removeEvidenceImage(idx)}
              >
                <AppText weight="bold" style={styles.evidenceRemoveText}>
                  ✕
                </AppText>
              </TouchableOpacity>
            </View>
          ))}
          {evidenceImages.length < 5 && (
            <TouchableOpacity
              style={styles.evidenceAddBtn}
              onPress={pickEvidenceImage}
            >
              <AppText style={{ fontSize: 24, color: "#9CA3AF" }}>📷</AppText>
              <AppText
                weight="regular"
                style={{ fontSize: 10, color: "#9CA3AF", marginTop: 2 }}
              >
                เพิ่มรูป
              </AppText>
            </TouchableOpacity>
          )}
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitBtn, submitting && { opacity: 0.6 }]}
          onPress={handleSubmitReport}
          disabled={submitting}
        >
          <LinearGradient
            colors={["#3B82F6", "#2563EB"]}
            style={styles.submitGradient}
          >
            {submitting ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <AppText
                weight="semibold"
                style={styles.submitText}
                numberOfLines={1}
              >
                📤 ส่งรายงาน
              </AppText>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );

  const renderStatusTab = () => (
    <View>
      <View style={styles.sectionHeader}>
        <AppText
          weight="semibold"
          style={styles.sectionTitle}
          numberOfLines={1}
        >
          {t("reportStatusTitle")}
        </AppText>
        <AppText
          weight="regular"
          style={styles.sectionSubtitle}
          numberOfLines={1}
        >
          {t("reportStatusSub")}
        </AppText>
      </View>

      {/* Status Summary */}
      <View style={styles.statusSummaryRow}>
        {(["pending", "reviewing", "resolved"] as const).map((s) => {
          const config = getStatusConfig(s);
          const count = (reports ?? []).filter((r) => r.status === s).length;
          return (
            <View
              key={s}
              style={[styles.statusSummaryCard, { borderColor: config.color }]}
            >
              <Ionicons
                name={config.icon as any}
                size={22}
                color={config.color}
              />
              <AppText
                weight="bold"
                style={[styles.statusSummaryCount, { color: config.color }]}
              >
                {count}
              </AppText>
              <AppText
                weight="regular"
                style={styles.statusSummaryLabel}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                {config.label}
              </AppText>
            </View>
          );
        })}
      </View>

      {/* Loading State */}
      {loadingReports ? (
        <View style={styles.emptyStatus}>
          <LottieView
            source={require("@/assets/animations/loading.json")}
            autoPlay
            loop
            style={{ width: 120, height: 120 }}
          />
          <AppText weight="regular" style={styles.emptyStatusSub}>
            กำลังโหลดรายงาน...
          </AppText>
        </View>
      ) : reports.length === 0 ? (
        <View style={styles.emptyStatus}>
          <LottieView
            source={require("@/assets/animations/empty.json")}
            autoPlay
            loop
            style={{ width: 140, height: 140 }}
          />
          <AppText
            weight="semibold"
            style={styles.emptyStatusTitle}
            numberOfLines={1}
          >
            ยังไม่มีรายงาน
          </AppText>
          <AppText
            weight="regular"
            style={styles.emptyStatusSub}
            numberOfLines={2}
          >
            เมื่อคุณแจ้งปัญหา รายงานจะแสดงที่นี่
          </AppText>
        </View>
      ) : (
        reports.map((report) => {
          const statusConfig = getStatusConfig(report.status);
          const typeInfo = getReportTypeInfo(report.type);
          return (
            <TouchableOpacity
              key={report.id}
              style={styles.statusCard}
              activeOpacity={0.7}
              onPress={() => {
                setSelectedReport(report);
                setShowDetailModal(true);
              }}
            >
              {/* Header row */}
              <View style={styles.statusCardHeader}>
                <View
                  style={[
                    styles.statusTypeBadge,
                    { backgroundColor: typeInfo.color + "18" },
                  ]}
                >
                  <AppText
                    weight="semibold"
                    style={[styles.statusTypeText, { color: typeInfo.color }]}
                  >
                    {typeInfo.label}
                  </AppText>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: statusConfig.bg },
                  ]}
                >
                  <Ionicons
                    name={statusConfig.icon as any}
                    size={11}
                    color={statusConfig.color}
                    style={{ marginRight: 3 }}
                  />
                  <AppText
                    weight="semibold"
                    style={[
                      styles.statusBadgeText,
                      { color: statusConfig.color },
                    ]}
                  >
                    {statusConfig.label}
                  </AppText>
                </View>
              </View>

              {/* Description preview */}
              <AppText
                weight="semibold"
                style={styles.statusCardTitle}
                numberOfLines={2}
              >
                {report.description}
              </AppText>

              {/* ID & Date */}
              <View style={styles.statusCardMeta}>
                <AppText
                  weight="regular"
                  style={styles.statusCardId}
                  numberOfLines={1}
                >
                  RPT-{report.report_code || report.id}
                </AppText>
                <AppText
                  weight="regular"
                  style={styles.statusCardDate}
                  numberOfLines={1}
                >
                  <Ionicons name="calendar-outline" size={12} color="#9CA3AF" />{" "}
                  {formatDate(report.created_at)}
                </AppText>
              </View>

              {/* Admin Note Preview */}
              {report.admin_note && (
                <View style={styles.replyPreview}>
                  <AppText style={{ fontSize: 13, marginRight: 6 }}>
                    <Ionicons name="create-outline" size={13} color="#3B82F6" />
                  </AppText>
                  <AppText
                    weight="regular"
                    style={styles.replyPreviewText}
                    numberOfLines={1}
                  >
                    {report.admin_note}
                  </AppText>
                </View>
              )}

              {/* Admin Reply Preview */}
              {report.admin_reply && (
                <View style={styles.replyPreview}>
                  <Ionicons
                    name="chatbubble-outline"
                    size={13}
                    color="#3B82F6"
                    style={{ marginRight: 6 }}
                  />
                  <AppText
                    weight="regular"
                    style={styles.replyPreviewText}
                    numberOfLines={1}
                  >
                    {report.admin_reply}
                  </AppText>
                </View>
              )}

              {/* Tap hint */}
              <View style={styles.tapHint}>
                <AppText
                  weight="regular"
                  style={styles.tapHintText}
                  numberOfLines={1}
                >
                  {t("tapForDetails")}
                </AppText>
              </View>
            </TouchableOpacity>
          );
        })
      )}
    </View>
  );

  const renderDetailModal = () => {
    if (!selectedReport) return null;
    const statusConfig = getStatusConfig(selectedReport.status);
    const typeInfo = getReportTypeInfo(selectedReport.type);

    return (
      <Modal
        visible={showDetailModal}
        animationType="fade"
        transparent
        onRequestClose={() => setShowDetailModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View>
                <AppText weight="bold" style={styles.modalHeaderTitle}>
                  {t("reportDetailTitle")}
                </AppText>
                <AppText weight="regular" style={styles.modalHeaderId}>
                  {selectedReport.report_code || `RPT-${selectedReport.id}`}
                </AppText>
              </View>
              <TouchableOpacity
                onPress={() => setShowDetailModal(false)}
                style={styles.modalCloseBtn}
              >
                <AppText weight="bold" style={styles.modalCloseBtnText}>
                  ✕
                </AppText>
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              style={{ flex: 1 }}
              contentContainerStyle={{ paddingBottom: 30 }}
              nestedScrollEnabled={true}
            >
              {/* Status */}
              <View
                style={[
                  styles.modalStatusBar,
                  { backgroundColor: statusConfig.bg },
                ]}
              >
                <Ionicons
                  name={statusConfig.icon as any}
                  size={18}
                  color={statusConfig.color}
                  style={{ marginRight: 8 }}
                />
                <View style={{ flex: 1 }}>
                  <AppText
                    weight="semibold"
                    style={[
                      styles.modalStatusLabel,
                      { color: statusConfig.color },
                    ]}
                  >
                    {statusConfig.label}
                  </AppText>
                </View>
                <View
                  style={[
                    styles.statusTypeBadge,
                    { backgroundColor: typeInfo.color + "18" },
                  ]}
                >
                  <AppText
                    weight="semibold"
                    style={[
                      styles.statusTypeText,
                      { color: typeInfo.color, fontSize: 11 },
                    ]}
                  >
                    {typeInfo.label}
                  </AppText>
                </View>
              </View>

              {/* Report Info */}
              <View style={styles.modalSection}>
                <AppText weight="semibold" style={styles.modalSectionTitle}>
                  <Ionicons
                    name="clipboard-outline"
                    size={14}
                    color="#1E293B"
                  />{" "}
                  ปัญหาที่แจ้ง
                </AppText>
                <AppText weight="regular" style={styles.modalReportDesc}>
                  {selectedReport.description}
                </AppText>
                {selectedReport.reported_user && (
                  <AppText
                    weight="regular"
                    style={[styles.modalReportDate, { marginTop: 6 }]}
                  >
                    ผู้ถูกรายงาน: {selectedReport.reported_user.name}
                  </AppText>
                )}
                {selectedReport.reported_product && (
                  <AppText
                    weight="regular"
                    style={[styles.modalReportDate, { marginTop: 4 }]}
                  >
                    สินค้าที่เกี่ยวข้อง: {selectedReport.reported_product.name}
                  </AppText>
                )}
                <AppText
                  weight="regular"
                  style={[styles.modalReportDate, { marginTop: 6 }]}
                >
                  ส่งเมื่อ: {formatDate(selectedReport.created_at)}
                </AppText>
              </View>

              {/* Evidence Images */}
              {selectedReport.evidence_images &&
                selectedReport.evidence_images.length > 0 && (
                  <View style={styles.modalSection}>
                    <AppText weight="semibold" style={styles.modalSectionTitle}>
                      📸 รูปหลักฐาน
                    </AppText>
                    <ScrollView
                      horizontal
                      showsHorizontalScrollIndicator={false}
                    >
                      {selectedReport.evidence_images.map((img, idx) => {
                        const imgUrl = getFullImageUrl(img);
                        return imgUrl ? (
                          <Image
                            key={idx}
                            source={{ uri: imgUrl }}
                            style={{
                              width: 120,
                              height: 120,
                              borderRadius: 12,
                              marginRight: 10,
                              backgroundColor: "#F3F4F6",
                            }}
                            contentFit="cover"
                          />
                        ) : null;
                      })}
                    </ScrollView>
                  </View>
                )}

              {/* Timeline */}
              <View style={styles.modalSection}>
                <AppText weight="semibold" style={styles.modalSectionTitle}>
                  📊 ไทม์ไลน์
                </AppText>

                {selectedReport.timeline &&
                selectedReport.timeline.length > 0 ? (
                  selectedReport.timeline.map((item, idx) => {
                    const isLast =
                      idx === (selectedReport.timeline?.length ?? 0) - 1;
                    return (
                      <View key={idx} style={styles.timelineItem}>
                        <View
                          style={[
                            styles.timelineDot,
                            { backgroundColor: "#22C55E" },
                          ]}
                        />
                        {!isLast && <View style={styles.timelineLine} />}
                        <View style={styles.timelineContent}>
                          <AppText
                            weight="semibold"
                            style={styles.timelineTitle}
                          >
                            {item.label}
                          </AppText>
                          <AppText weight="regular" style={styles.timelineDate}>
                            {formatDate(item.date)}
                          </AppText>
                        </View>
                      </View>
                    );
                  })
                ) : (
                  /* Fallback: static timeline based on status */
                  <>
                    <View style={styles.timelineItem}>
                      <View
                        style={[
                          styles.timelineDot,
                          { backgroundColor: "#22C55E" },
                        ]}
                      />
                      <View style={styles.timelineLine} />
                      <View style={styles.timelineContent}>
                        <AppText weight="semibold" style={styles.timelineTitle}>
                          ส่งรายงานแล้ว
                        </AppText>
                        <AppText weight="regular" style={styles.timelineDate}>
                          {formatDate(selectedReport.created_at)}
                        </AppText>
                      </View>
                    </View>
                    <View style={styles.timelineItem}>
                      <View
                        style={[
                          styles.timelineDot,
                          {
                            backgroundColor:
                              selectedReport.status !== "pending"
                                ? "#22C55E"
                                : "#D1D5DB",
                          },
                        ]}
                      />
                      <View style={styles.timelineLine} />
                      <View style={styles.timelineContent}>
                        <AppText
                          weight="semibold"
                          style={[
                            styles.timelineTitle,
                            {
                              color:
                                selectedReport.status !== "pending"
                                  ? "#111827"
                                  : "#9CA3AF",
                            },
                          ]}
                        >
                          กำลังตรวจสอบ
                        </AppText>
                        <AppText weight="regular" style={styles.timelineDate}>
                          {selectedReport.status !== "pending"
                            ? selectedReport.reviewing_at
                              ? formatDate(selectedReport.reviewing_at)
                              : "แอดมินรับเรื่องแล้ว"
                            : "รอดำเนินการ"}
                        </AppText>
                      </View>
                    </View>
                    <View style={styles.timelineItem}>
                      <View
                        style={[
                          styles.timelineDot,
                          {
                            backgroundColor:
                              selectedReport.status === "resolved"
                                ? "#22C55E"
                                : "#D1D5DB",
                          },
                        ]}
                      />
                      <View style={styles.timelineContent}>
                        <AppText
                          weight="semibold"
                          style={[
                            styles.timelineTitle,
                            {
                              color:
                                selectedReport.status === "resolved"
                                  ? "#111827"
                                  : "#9CA3AF",
                            },
                          ]}
                        >
                          แก้ไขเสร็จสิ้น
                        </AppText>
                        <AppText weight="regular" style={styles.timelineDate}>
                          {selectedReport.status === "resolved"
                            ? selectedReport.resolved_at
                              ? formatDate(selectedReport.resolved_at)
                              : "ดำเนินการเสร็จแล้ว"
                            : "รอดำเนินการ"}
                        </AppText>
                      </View>
                    </View>
                  </>
                )}
              </View>

              {/* Admin Note */}
              {selectedReport.admin_note && (
                <View style={styles.modalSection}>
                  <AppText weight="semibold" style={styles.modalSectionTitle}>
                    <Ionicons name="create-outline" size={14} color="#1E293B" />{" "}
                    หมายเหตุจากแอดมิน
                  </AppText>
                  <View style={styles.adminReplyCard}>
                    <View style={styles.adminReplyHeader}>
                      <View
                        style={[
                          styles.adminAvatar,
                          { backgroundColor: "#FEF3C7" },
                        ]}
                      >
                        <AppText
                          weight="bold"
                          style={[styles.adminAvatarText, { color: "#D97706" }]}
                        >
                          A
                        </AppText>
                      </View>
                      <View style={{ flex: 1 }}>
                        <AppText weight="semibold" style={styles.adminName}>
                          {t("adminName")}
                        </AppText>
                      </View>
                    </View>
                    <AppText weight="regular" style={styles.adminReplyText}>
                      {selectedReport.admin_note}
                    </AppText>
                  </View>
                </View>
              )}
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={["#00112E", "#003994"]} style={styles.header}>
        <SafeAreaView edges={["top"]} style={styles.headerInner}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backBtn}
          >
            <Image source={image.back} style={{ width: 32, height: 32 }} />
          </TouchableOpacity>
          <AppText
            weight="bold"
            style={styles.headerTitle}
            numberOfLines={1}
            adjustsFontSizeToFit
          >
            {t("helpSupportTitle")}
          </AppText>
          <View style={{ width: 40 }} />
        </SafeAreaView>
      </LinearGradient>

      {/* Tab Bar */}
      <View style={styles.tabBar}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tab, activeTab === tab.key && styles.tabActive]}
            onPress={() => setActiveTab(tab.key)}
          >
            <AppText
              weight={activeTab === tab.key ? "semibold" : "regular"}
              style={[
                styles.tabText,
                activeTab === tab.key && styles.tabTextActive,
              ]}
              numberOfLines={1}
              adjustsFontSizeToFit
            >
              {tab.label}
            </AppText>
          </TouchableOpacity>
        ))}
      </View>

      {/* Success Toast */}
      <Animated.View
        style={[
          styles.successToast,
          {
            opacity: successAnim,
            transform: [
              {
                translateY: successAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-50, 0],
                }),
              },
            ],
          },
        ]}
        pointerEvents="none"
      >
        <AppText weight="semibold" style={styles.successToastText}>
          <Ionicons name="checkmark-circle-outline" size={14} color="#FFF" />{" "}
          ส่งรายงานเรียบร้อยแล้ว ทีมงานจะติดต่อกลับเร็วๆนี้
        </AppText>
      </Animated.View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            activeTab === "status" ? (
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefreshReports}
                tintColor="#3B82F6"
              />
            ) : undefined
          }
        >
          {activeTab === "faq" && renderFAQTab()}
          {activeTab === "report" && renderReportTab()}
          {activeTab === "status" && renderStatusTab()}
          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Report Detail Modal */}
      {renderDetailModal()}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F4F7",
  },
  header: {
    paddingBottom: 15,
  },
  headerInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 16,
    color: "#FFF",
  },

  // Tab Bar
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#FFF",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E7EB",
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: 10,
    marginHorizontal: 4,
  },
  tabActive: {
    backgroundColor: "#EFF6FF",
  },
  tabText: {
    fontSize: 13,
    color: "#9CA3AF",
  },
  tabTextActive: {
    color: "#3B82F6",
  },

  // Success Toast
  successToast: {
    position: "absolute",
    top: 160,
    left: 20,
    right: 20,
    backgroundColor: "#22C55E",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: "center",
    zIndex: 100,
    shadowColor: "#22C55E",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  successToastText: {
    fontSize: 14,
    color: "#FFF",
    textAlign: "center",
  },

  scrollContent: {
    paddingTop: 16,
    paddingHorizontal: 16,
  },

  // Section Header
  sectionHeader: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    color: "#111827",
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: "#9CA3AF",
  },

  // FAQ
  faqCard: {
    backgroundColor: "#FFF",
    borderRadius: 14,
    padding: 16,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  faqCardExpanded: {
    borderColor: "#3B82F6",
    borderWidth: 1.5,
    backgroundColor: "#FAFBFF",
  },
  faqQuestion: {
    flexDirection: "row",
    alignItems: "center",
  },
  faqQIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "#3B82F6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  faqQIconText: {
    fontSize: 13,
    color: "#FFF",
  },
  faqQuestionText: {
    flex: 1,
    fontSize: 14,
    color: "#1F2937",
    lineHeight: 20,
  },
  faqArrow: {
    fontSize: 10,
    color: "#9CA3AF",
    marginLeft: 8,
  },
  faqAnswer: {
    flexDirection: "row",
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: "#E5E7EB",
  },
  faqAIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: "#22C55E",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    marginTop: 2,
  },
  faqAIconText: {
    fontSize: 13,
    color: "#FFF",
  },
  faqAnswerText: {
    flex: 1,
    fontSize: 13,
    color: "#4B5563",
    lineHeight: 20,
  },

  // Report
  reportCard: {
    backgroundColor: "#FFF",
    borderRadius: 14,
    padding: 18,
    marginBottom: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  reportLabel: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 10,
  },
  reportTypes: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  reportTypeChip: {
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: "#F9FAFB",
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
  },
  reportTypeText: {
    fontSize: 13,
    color: "#6B7280",
  },
  reportInput: {
    backgroundColor: "#F8F9FC",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 15,
    color: "#111827",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    fontFamily: "NotoSansThai_400Regular",
  },
  reportTextArea: {
    height: 130,
    paddingTop: 14,
  },
  charCount: {
    fontSize: 11,
    color: "#9CA3AF",
    textAlign: "right",
    marginTop: 4,
  },
  submitBtn: {
    borderRadius: 12,
    overflow: "hidden",
    marginTop: 16,
  },
  submitGradient: {
    paddingVertical: 14,
    alignItems: "center",
    borderRadius: 12,
  },
  submitText: {
    fontSize: 15,
    color: "#FFF",
  },

  // Evidence Images
  evidenceRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  evidenceThumb: {
    width: 72,
    height: 72,
    borderRadius: 12,
    position: "relative",
  },
  evidenceImg: {
    width: 72,
    height: 72,
    borderRadius: 12,
    backgroundColor: "#F3F4F6",
  },
  evidenceRemove: {
    position: "absolute",
    top: -6,
    right: -6,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: "#EF4444",
    justifyContent: "center",
    alignItems: "center",
  },
  evidenceRemoveText: {
    fontSize: 10,
    color: "#FFF",
  },
  evidenceAddBtn: {
    width: 72,
    height: 72,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: "#E5E7EB",
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#FAFBFC",
  },

  // Status Tab
  statusSummaryRow: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 16,
  },
  statusSummaryCard: {
    flex: 1,
    backgroundColor: "#FFF",
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
    borderWidth: 1.5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  statusSummaryCount: {
    fontSize: 20,
    marginVertical: 4,
  },
  statusSummaryLabel: {
    fontSize: 10,
    color: "#6B7280",
    textAlign: "center",
  },
  statusCard: {
    backgroundColor: "#FFF",
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 2,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  statusCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  statusTypeBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusTypeText: {
    fontSize: 12,
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
  },
  statusBadgeText: {
    fontSize: 11,
  },
  statusCardTitle: {
    fontSize: 15,
    color: "#111827",
    marginBottom: 8,
    lineHeight: 21,
  },
  statusCardMeta: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  statusCardId: {
    fontSize: 12,
    color: "#9CA3AF",
  },
  statusCardDate: {
    fontSize: 11,
    color: "#9CA3AF",
  },
  replyPreview: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F0F9FF",
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginTop: 4,
  },
  replyPreviewText: {
    flex: 1,
    fontSize: 12,
    color: "#3B82F6",
  },
  tapHint: {
    alignItems: "flex-end",
    marginTop: 8,
  },
  tapHintText: {
    fontSize: 11,
    color: "#C0C0C0",
  },
  emptyStatus: {
    alignItems: "center",
    paddingVertical: 50,
  },
  emptyStatusTitle: {
    fontSize: 16,
    color: "#374151",
    marginBottom: 6,
  },
  emptyStatusSub: {
    fontSize: 13,
    color: "#9CA3AF",
  },

  // Detail Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#FFF",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: "88%",
    minHeight: "60%",
    paddingBottom: 30,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#F3F4F6",
  },
  modalHeaderTitle: {
    fontSize: 18,
    color: "#111827",
  },
  modalHeaderId: {
    fontSize: 12,
    color: "#9CA3AF",
    marginTop: 2,
  },
  modalCloseBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#F3F4F6",
    justifyContent: "center",
    alignItems: "center",
  },
  modalCloseBtnText: {
    fontSize: 16,
    color: "#6B7280",
  },
  modalStatusBar: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 20,
    marginTop: 16,
    padding: 14,
    borderRadius: 14,
  },
  modalStatusLabel: {
    fontSize: 15,
  },
  modalSection: {
    marginHorizontal: 20,
    marginTop: 20,
  },
  modalSectionTitle: {
    fontSize: 15,
    color: "#111827",
    marginBottom: 12,
  },
  modalReportTitle: {
    fontSize: 16,
    color: "#111827",
    marginBottom: 8,
  },
  modalReportDesc: {
    fontSize: 14,
    color: "#4B5563",
    lineHeight: 21,
    marginBottom: 10,
  },
  modalReportDate: {
    fontSize: 12,
    color: "#9CA3AF",
  },

  // Timeline
  timelineItem: {
    flexDirection: "row",
    marginBottom: 16,
    position: "relative",
  },
  timelineDot: {
    width: 14,
    height: 14,
    borderRadius: 7,
    marginRight: 14,
    marginTop: 3,
    zIndex: 2,
  },
  timelineLine: {
    position: "absolute",
    left: 6,
    top: 17,
    bottom: -16,
    width: 2,
    backgroundColor: "#E5E7EB",
    zIndex: 1,
  },
  timelineContent: {
    flex: 1,
  },
  timelineTitle: {
    fontSize: 14,
    color: "#111827",
    marginBottom: 2,
  },
  timelineDate: {
    fontSize: 12,
    color: "#9CA3AF",
  },

  // Admin Reply
  adminReplyCard: {
    backgroundColor: "#F8FAFF",
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E0EAFF",
  },
  adminReplyHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  adminAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#3B82F6",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  adminAvatarText: {
    fontSize: 16,
    color: "#FFF",
  },
  adminName: {
    fontSize: 14,
    color: "#111827",
  },
  adminReplyDate: {
    fontSize: 11,
    color: "#9CA3AF",
  },
  adminReplyText: {
    fontSize: 14,
    color: "#374151",
    lineHeight: 21,
  },
  noReplyCard: {
    alignItems: "center",
    paddingVertical: 30,
    backgroundColor: "#FAFBFC",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#F3F4F6",
  },
  noReplyTitle: {
    fontSize: 15,
    color: "#374151",
    marginBottom: 4,
  },
  noReplyText: {
    fontSize: 13,
    color: "#9CA3AF",
  },
});

export default HelpSupportPage;
