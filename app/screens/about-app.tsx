import { image } from "@/assets/images";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  Dimensions,
  Image,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { getPublicStats } from "../../utils/api";
import { AppText } from "../components/appText";

const { width } = Dimensions.get("window");

// ─── Tutorial Steps ─────────────────────────────────────────
const TUTORIAL_STEPS = [
  {
    id: 1,
    icon: "👤",
    title: "สมัครสมาชิก / เข้าสู่ระบบ",
    subtitle: "Account Registration & Login",
    steps: [
      'เปิดแอป BidKhong แล้วกด "Sign Up" เพื่อสมัครสมาชิก',
      "กรอกข้อมูล: ชื่อ, อีเมล, เบอร์โทร, รหัสผ่าน",
      'หรือกด "Sign In" หากมีบัญชีอยู่แล้ว',
      'สามารถเข้าใช้งานแบบ "ผู้เยี่ยมชม" ได้ แต่จะไม่สามารถประมูลได้',
    ],
    color: "#4A90D9",
    bgColor: "#EBF3FD",
  },
  {
    id: 2,
    icon: "🔍",
    title: "ค้นหาและเลือกดูสินค้า",
    subtitle: "Browse & Search Products",
    steps: [
      "เลื่อนดูสินค้าบนหน้าแรก (Home) ที่แบ่งเป็นหมวดหมู่",
      "ใช้ช่องค้นหาเพื่อค้นหาสินค้าที่ต้องการ",
      "กดเลือกหมวดหมู่เพื่อดู Subcategory ย่อย",
      'ดูสินค้าที่กำลัง "Hot 🔥" หรือ "Ending Soon ⏳"',
      'สินค้า "Incoming" คือสินค้าที่กำลังจะเปิดประมูลเร็วๆนี้',
    ],
    color: "#F5A623",
    bgColor: "#FFF8EB",
  },
  {
    id: 3,
    icon: "💰",
    title: "เติมเงินเข้ากระเป๋า",
    subtitle: "Top Up Wallet",
    steps: [
      'ไปที่แท็บ "Wallet" ที่เมนูด้านล่าง',
      'กดปุ่ม "Deposit" เพื่อเติมเงินเข้ากระเป๋า',
      "เลือกช่องทางชำระเงิน: QR Code หรือ Mobile Banking",
      "ระบุจำนวนเงินที่ต้องการเติม",
      "ยืนยันการเติมเงิน — ยอดเงินจะอัปเดตทันที",
    ],
    color: "#7ED321",
    bgColor: "#F0FAE8",
  },
  {
    id: 4,
    icon: "🏷️",
    title: "วางราคาประมูล (Place Bid)",
    subtitle: "Place a Bid on Products",
    steps: [
      "กดเข้าไปดูรายละเอียดสินค้าที่ต้องการ",
      'ดูราคาปัจจุบัน (Current Bid) และ "Minimum Bid Increment"',
      'กดปุ่ม "Place Bid" แล้วระบุราคาที่ต้องการเสนอ',
      "ราคาต้องมากกว่าราคาปัจจุบัน + Minimum Increment",
      'หรือกด "Buy Now" เพื่อซื้อทันทีในราคาที่กำหนด',
      "⚠️ ต้องเข้าสู่ระบบก่อนจึงจะสามารถประมูลได้",
    ],
    color: "#D0021B",
    bgColor: "#FDECEE",
  },
  {
    id: 5,
    icon: "⏱️",
    title: "ติดตามการประมูล",
    subtitle: "Track Your Bids",
    steps: [
      'ไปที่แท็บ "My Bid" เพื่อดูรายการประมูลทั้งหมดของคุณ',
      '"Bidding" — สินค้าที่คุณกำลังประมูลอยู่',
      '"Won" — สินค้าที่คุณชนะการประมูล 🎉',
      '"Lost" — สินค้าที่คุณไม่ได้ชนะ',
      "ดูเวลาที่เหลือของการประมูลแต่ละรายการ",
    ],
    color: "#9013FE",
    bgColor: "#F3ECFE",
  },
  {
    id: 6,
    icon: "✅",
    title: "ยืนยันรับสินค้า (Verify Product)",
    subtitle: "Verify & Receive Won Products",
    steps: [
      'เมื่อชนะประมูล สินค้าจะอยู่ในสถานะ "Won"',
      "⏰ คุณมีเวลา 24 ชั่วโมง ในการยืนยันสินค้า",
      'กด "Verify" เพื่อยืนยันว่าต้องการรับสินค้า',
      'สถานะจะเปลี่ยนเป็น "Verified" — รอรับสินค้า',
      'เมื่อได้รับสินค้าแล้ว กด "Received" เพื่อยืนยัน',
      "❌ หากไม่ยืนยันภายใน 24 ชม. สินค้าจะถูกยกเลิกอัตโนมัติ",
    ],
    color: "#417505",
    bgColor: "#EDF7E0",
  },
  {
    id: 7,
    icon: "📦",
    title: "ขายสินค้า (Seller)",
    subtitle: "List Your Products for Auction",
    steps: [
      'ไปที่แท็บ "Seller" ที่เมนูด้านล่าง',
      'กด "Create Auction" เพื่อลงประกาศขาย',
      "อัปโหลดรูปสินค้า (สูงสุด 5 รูป)",
      "กรอกรายละเอียด: ชื่อ, คำอธิบาย, หมวดหมู่",
      "ตั้งราคาเริ่มต้น (Starting Bid) และราคาซื้อทันที (Buy Now)",
      "กำหนดวันเวลาเริ่ม-สิ้นสุดการประมูล",
      'กด "Publish" เพื่อเผยแพร่',
    ],
    color: "#E67E22",
    bgColor: "#FDF2E6",
  },
  {
    id: 8,
    icon: "💸",
    title: "ถอนเงิน (Withdraw)",
    subtitle: "Withdraw Funds from Wallet",
    steps: [
      'ไปที่แท็บ "Wallet"',
      'กดปุ่ม "Withdraw"',
      "ระบุจำนวนเงินที่ต้องการถอน",
      "ใส่ข้อมูลบัญชีธนาคารปลายทาง",
      "ยืนยันการถอนเงิน",
      "เงินจะโอนเข้าบัญชีภายใน 1-3 วันทำการ",
    ],
    color: "#BD10E0",
    bgColor: "#F8E8FD",
  },
];

// ─── FAQ ─────────────────────────────────────────────────────
const FAQ_ITEMS = [
  {
    q: "ถ้าชนะประมูลแล้วไม่ยืนยันจะเกิดอะไรขึ้น?",
    a: "หากไม่ยืนยันภายใน 24 ชั่วโมง สินค้าจะถูกยกเลิกอัตโนมัติ (Expired) และอาจถูกระงับสิทธิ์การประมูลในอนาคต",
  },
  {
    q: "ผู้เยี่ยมชม (Guest) ทำอะไรได้บ้าง?",
    a: "ผู้เยี่ยมชมสามารถเลือกดูสินค้า, ค้นหา, ดูหมวดหมู่ได้ แต่ไม่สามารถประมูล, ซื้อ, หรือใช้ Wallet ได้",
  },
  {
    q: "Buy Now ต่างจาก Place Bid อย่างไร?",
    a: "Place Bid คือการเสนอราคาประมูลแข่งกับคนอื่น ส่วน Buy Now คือซื้อทันทีในราคาที่ผู้ขายกำหนดไว้โดยไม่ต้องรอ",
  },
  {
    q: "Minimum Bid Increment คืออะไร?",
    a: "คือจำนวนเงินขั้นต่ำที่ต้องเสนอเพิ่มจากราคาปัจจุบัน เช่น หากราคาปัจจุบัน ฿1,000 และ min increment ฿100 ต้องเสนอ ฿1,100 ขึ้นไป",
  },
  {
    q: "สินค้า Incoming คืออะไร?",
    a: "คือสินค้าที่กำลังจะเปิดประมูลเร็วๆนี้ คุณสามารถดูรายละเอียดล่วงหน้าได้แต่ยังไม่สามารถประมูลได้จนกว่าจะถึงเวลา",
  },
  {
    q: "จะเปลี่ยนรหัสผ่านได้อย่างไร?",
    a: "ไปที่ Profile > Edit Profile เพื่อเปลี่ยนรหัสผ่านและข้อมูลส่วนตัว (ฟีเจอร์นี้จะมาในเร็วๆนี้)",
  },
];

// ─── Component ───────────────────────────────────────────────
const AboutAppPage = () => {
  const router = useRouter();
  const scrollY = useRef(new Animated.Value(0)).current;
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const [totalUsers, setTotalUsers] = useState<number | null>(null);
  const [totalProducts, setTotalProducts] = useState<number | null>(null);

  useEffect(() => {
    getPublicStats()
      .then((stats) => {
        setTotalUsers(stats.total_users);
        setTotalProducts(stats.total_products);
      })
      .catch(() => {});
  }, []);

  const toggleFaq = (index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
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
            About BidKhong
          </AppText>
          <View style={{ width: 40 }} />
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { y: scrollY } } }],
          { useNativeDriver: false },
        )}
        scrollEventThrottle={16}
      >
        {/* ─── App Logo & Info ─────────────────────────── */}
        <View style={styles.appInfoSection}>
          <View style={styles.logoContainer}>
            <Image
              source={image.logo}
              style={styles.appLogo}
              resizeMode="contain"
            />
          </View>
          <AppText weight="bold" style={styles.appName} numberOfLines={1}>
            BidKhong
          </AppText>
          <AppText weight="regular" style={styles.appVersion} numberOfLines={1}>
            Version 1.0.0
          </AppText>
          <View style={styles.appDescContainer}>
            <AppText weight="regular" style={styles.appDesc}>
              แพลตฟอร์มประมูลสินค้าออนไลน์ที่ให้คุณซื้อขายสินค้าได้ง่าย สะดวก
              ปลอดภัย พร้อมระบบ Wallet และการยืนยันสินค้าอัตโนมัติ
            </AppText>
          </View>

          {/* Stats Row */}
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <AppText
                weight="bold"
                style={styles.statNumber}
                numberOfLines={1}
              >
                {totalUsers ?? "—"}
              </AppText>
              <AppText
                weight="regular"
                style={styles.statLabel}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                ผู้ใช้งาน
              </AppText>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <AppText
                weight="bold"
                style={styles.statNumber}
                numberOfLines={1}
              >
                {totalProducts ?? "—"}
              </AppText>
              <AppText
                weight="regular"
                style={styles.statLabel}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                สินค้า
              </AppText>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <AppText
                weight="bold"
                style={styles.statNumber}
                numberOfLines={1}
              >
                99%
              </AppText>
              <AppText
                weight="regular"
                style={styles.statLabel}
                numberOfLines={1}
                adjustsFontSizeToFit
              >
                ปลอดภัย
              </AppText>
            </View>
          </View>
        </View>

        {/* ─── How To Use Section ─────────────────────── */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <AppText
              weight="bold"
              style={styles.sectionTitle}
              numberOfLines={1}
            >
              📖 วิธีใช้งาน BidKhong
            </AppText>
            <AppText
              weight="regular"
              style={styles.sectionSubtitle}
              numberOfLines={1}
            >
              ขั้นตอนการใช้งานทั้งหมด
            </AppText>
          </View>

          {TUTORIAL_STEPS.map((step, index) => (
            <View key={step.id} style={styles.stepCard}>
              {/* Step Number Badge */}
              <View style={styles.stepNumberRow}>
                <LinearGradient
                  colors={[step.color, step.color + "CC"]}
                  style={styles.stepBadge}
                >
                  <AppText weight="bold" style={styles.stepBadgeText}>
                    {step.id}
                  </AppText>
                </LinearGradient>
                {index < TUTORIAL_STEPS.length - 1 && (
                  <View
                    style={[
                      styles.stepLine,
                      { backgroundColor: step.color + "40" },
                    ]}
                  />
                )}
              </View>

              {/* Step Content */}
              <View style={styles.stepContent}>
                <View
                  style={[styles.stepIconBg, { backgroundColor: step.bgColor }]}
                >
                  <AppText style={styles.stepIcon}>{step.icon}</AppText>
                </View>

                <AppText
                  weight="bold"
                  style={styles.stepTitle}
                  numberOfLines={1}
                >
                  {step.title}
                </AppText>
                <AppText
                  weight="regular"
                  style={styles.stepSubtitle}
                  numberOfLines={2}
                >
                  {step.subtitle}
                </AppText>

                <View
                  style={[
                    styles.stepsList,
                    { borderLeftColor: step.color + "30" },
                  ]}
                >
                  {step.steps.map((s, i) => (
                    <View key={i} style={styles.stepItem}>
                      <View
                        style={[
                          styles.stepDot,
                          { backgroundColor: step.color },
                        ]}
                      />
                      <AppText weight="regular" style={styles.stepText}>
                        {s}
                      </AppText>
                    </View>
                  ))}
                </View>
              </View>
            </View>
          ))}
        </View>

        {/* ─── Features Highlight ─────────────────────── */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <AppText
              weight="bold"
              style={styles.sectionTitle}
              numberOfLines={1}
            >
              ⭐ ฟีเจอร์เด่น
            </AppText>
          </View>

          <View style={styles.featuresGrid}>
            {[
              { icon: "🔐", title: "ปลอดภัย", desc: "ระบบล็อกอินปลอดภัย" },
              {
                icon: "⏰",
                title: "Real-time",
                desc: "นับถอยหลังแบบเรียลไทม์",
              },
              { icon: "💳", title: "Wallet", desc: "กระเป๋าเงินในตัว" },
              { icon: "📱", title: "ง่ายต่อการใช้", desc: "UI สวยงาม ใช้ง่าย" },
              { icon: "🔔", title: "แจ้งเตือน", desc: "แจ้งเมื่อชนะประมูล" },
              { icon: "🏪", title: "ขายง่าย", desc: "ลงขายได้ในไม่กี่ขั้นตอน" },
            ].map((feat, i) => (
              <View key={i} style={styles.featureCard}>
                <AppText style={styles.featureIcon}>{feat.icon}</AppText>
                <AppText
                  weight="semibold"
                  numberOfLines={1}
                  style={styles.featureTitle}
                >
                  {feat.title}
                </AppText>
                <AppText
                  weight="regular"
                  numberOfLines={2}
                  style={styles.featureDesc}
                >
                  {feat.desc}
                </AppText>
              </View>
            ))}
          </View>
        </View>

        {/* ─── FAQ Section ────────────────────────────── */}
        <View style={styles.sectionContainer}>
          <View style={styles.sectionHeader}>
            <AppText
              weight="bold"
              style={styles.sectionTitle}
              numberOfLines={1}
            >
              ❓ คำถามที่พบบ่อย (FAQ)
            </AppText>
          </View>

          {FAQ_ITEMS.map((faq, index) => (
            <TouchableOpacity
              key={index}
              style={styles.faqCard}
              onPress={() => toggleFaq(index)}
              activeOpacity={0.7}
            >
              <View style={styles.faqHeader}>
                <View style={styles.faqQBadge}>
                  <AppText weight="bold" style={styles.faqQBadgeText}>
                    Q
                  </AppText>
                </View>
                <AppText
                  weight="semibold"
                  style={styles.faqQuestion}
                  numberOfLines={2}
                >
                  {faq.q}
                </AppText>
                <AppText
                  weight="regular"
                  style={styles.faqArrow}
                  numberOfLines={1}
                >
                  {expandedFaq === index ? "▲" : "▼"}
                </AppText>
              </View>
              {expandedFaq === index && (
                <View style={styles.faqAnswer}>
                  <View style={styles.faqABadge}>
                    <AppText weight="bold" style={styles.faqABadgeText}>
                      A
                    </AppText>
                  </View>
                  <AppText weight="regular" style={styles.faqAnswerText}>
                    {faq.a}
                  </AppText>
                </View>
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* ─── Contact & Footer ───────────────────────── */}
        <View style={styles.footerSection}>
          <LinearGradient
            colors={["#00112E", "#003994"]}
            style={styles.footerGradient}
          >
            <AppText weight="bold" style={styles.footerTitle} numberOfLines={1}>
              ต้องการความช่วยเหลือ?
            </AppText>
            <AppText
              weight="regular"
              style={styles.footerDesc}
              numberOfLines={1}
            >
              ติดต่อทีมสนับสนุนของเราได้ตลอด 24 ชั่วโมง
            </AppText>

            <View style={styles.contactCards}>
              <View style={styles.contactCard}>
                <AppText style={styles.contactCardIcon}>📧</AppText>
                <AppText
                  weight="regular"
                  style={styles.contactCardText}
                  numberOfLines={1}
                >
                  support@bidkhong.com
                </AppText>
              </View>
              <View style={styles.contactCard}>
                <AppText style={styles.contactCardIcon}>📞</AppText>
                <AppText
                  weight="regular"
                  style={styles.contactCardText}
                  numberOfLines={1}
                >
                  02-XXX-XXXX
                </AppText>
              </View>
              <View style={styles.contactCard}>
                <AppText style={styles.contactCardIcon}>💬</AppText>
                <AppText
                  weight="regular"
                  style={styles.contactCardText}
                  numberOfLines={1}
                >
                  Line: @bidkhong
                </AppText>
              </View>
            </View>

            <View style={styles.footerDivider} />

            <AppText
              weight="regular"
              style={styles.footerCopyright}
              numberOfLines={1}
            >
              © 2024 BidKhong. All rights reserved.
            </AppText>
            <AppText
              weight="regular"
              style={styles.footerMadeWith}
              numberOfLines={1}
            >
              Made with ❤️ in Thailand 🇹🇭
            </AppText>
          </LinearGradient>
        </View>
      </ScrollView>
    </View>
  );
};

// ─── Styles ──────────────────────────────────────────────────
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
  scrollContent: {
    paddingBottom: 30,
  },

  // ─── App Info ────────────────────────
  appInfoSection: {
    alignItems: "center",
    paddingVertical: 30,
    paddingHorizontal: 20,
    backgroundColor: "#FFF",
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  logoContainer: {
    width: 90,
    height: 90,
    borderRadius: 22,
    backgroundColor: "#001A3D",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 16,
    shadowColor: "#003994",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  appLogo: {
    width: 60,
    height: 60,
  },
  appName: {
    fontSize: 22,
    color: "#00112E",
    letterSpacing: 1,
  },
  appVersion: {
    fontSize: 13,
    color: "#999",
    marginTop: 4,
    marginBottom: 16,
  },
  appDescContainer: {
    paddingHorizontal: 10,
    marginBottom: 20,
  },
  appDesc: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
    lineHeight: 22,
  },
  statsRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: "#F0F0F0",
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 20,
    color: "#003994",
  },
  statLabel: {
    fontSize: 11,
    color: "#999",
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 35,
    backgroundColor: "#E8E8E8",
  },

  // ─── Section ─────────────────────────
  sectionContainer: {
    marginTop: 16,
    marginHorizontal: 16,
    backgroundColor: "#FFF",
    borderRadius: 20,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionHeader: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    color: "#00112E",
    marginBottom: 4,
  },
  sectionSubtitle: {
    fontSize: 13,
    color: "#999",
  },

  // ─── Tutorial Steps ──────────────────
  stepCard: {
    flexDirection: "row",
    marginBottom: 8,
  },
  stepNumberRow: {
    alignItems: "center",
    width: 40,
    marginRight: 12,
  },
  stepBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  stepBadgeText: {
    fontSize: 14,
    color: "#FFF",
  },
  stepLine: {
    width: 2,
    flex: 1,
    marginTop: 6,
    borderRadius: 1,
  },
  stepContent: {
    flex: 1,
    paddingBottom: 20,
  },
  stepIconBg: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 10,
  },
  stepIcon: {
    fontSize: 24,
  },
  stepTitle: {
    fontSize: 14,
    color: "#00112E",
    marginBottom: 2,
  },
  stepSubtitle: {
    fontSize: 12,
    color: "#999",
    marginBottom: 12,
  },
  stepsList: {
    borderLeftWidth: 2,
    paddingLeft: 14,
    marginLeft: 4,
  },
  stepItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  stepDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginTop: 6,
    marginRight: 10,
  },
  stepText: {
    fontSize: 13,
    color: "#444",
    lineHeight: 20,
    flex: 1,
  },

  // ─── Features Grid ───────────────────
  featuresGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  featureCard: {
    width: (width - 80) / 3,
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 6,
    backgroundColor: "#F8F9FC",
    borderRadius: 14,
    marginBottom: 10,
  },
  featureIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  featureTitle: {
    fontSize: 11,
    color: "#00112E",
    marginBottom: 2,
    textAlign: "center",
  },
  featureDesc: {
    fontSize: 9,
    color: "#999",
    textAlign: "center",
  },

  // ─── FAQ ─────────────────────────────
  faqCard: {
    backgroundColor: "#F8F9FC",
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
  },
  faqHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  faqQBadge: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: "#003994",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  faqQBadgeText: {
    fontSize: 13,
    color: "#FFF",
  },
  faqQuestion: {
    flex: 1,
    fontSize: 13,
    color: "#00112E",
    lineHeight: 20,
  },
  faqArrow: {
    fontSize: 10,
    color: "#999",
    marginLeft: 8,
  },
  faqAnswer: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#E8E8E8",
  },
  faqABadge: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: "#7ED321",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  faqABadgeText: {
    fontSize: 13,
    color: "#FFF",
  },
  faqAnswerText: {
    flex: 1,
    fontSize: 13,
    color: "#555",
    lineHeight: 20,
  },

  // ─── Footer ──────────────────────────
  footerSection: {
    marginTop: 16,
    marginHorizontal: 16,
    borderRadius: 20,
    overflow: "hidden",
  },
  footerGradient: {
    padding: 24,
    alignItems: "center",
  },
  footerTitle: {
    fontSize: 16,
    color: "#FFF",
    marginBottom: 6,
  },
  footerDesc: {
    fontSize: 13,
    color: "rgba(255,255,255,0.7)",
    marginBottom: 20,
  },
  contactCards: {
    width: "100%",
  },
  contactCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  contactCardIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  contactCardText: {
    fontSize: 13,
    color: "rgba(255,255,255,0.9)",
  },
  footerDivider: {
    width: "80%",
    height: 1,
    backgroundColor: "rgba(255,255,255,0.15)",
    marginVertical: 20,
  },
  footerCopyright: {
    fontSize: 12,
    color: "rgba(255,255,255,0.5)",
    marginBottom: 4,
  },
  footerMadeWith: {
    fontSize: 12,
    color: "rgba(255,255,255,0.5)",
  },
});

export default AboutAppPage;
