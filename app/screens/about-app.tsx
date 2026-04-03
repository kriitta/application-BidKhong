import { image } from "@/assets/images";
import { Ionicons } from "@expo/vector-icons";
import { Image } from "expo-image";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useLanguage } from "../../contexts/LanguageContext";
import { getPublicStats } from "../../utils/api";
import { AppText } from "../components/appText";

const { width } = Dimensions.get("window");

// ─── Tutorial Steps ─────────────────────────────────────────
const TUTORIAL_STEPS_TH = [
  {
    id: 1,
    icon: "person-outline",
    title: "สมัครสมาชิก / เข้าสู่ระบบ",
    subtitle: "Account Registration & Login",
    steps: [
      'เปิดแอป BidKhong แล้วกด "Sign Up" เพื่อสมัครสมาชิก',
      "กรอกข้อมูล: ชื่อ, อีเมล, เบอร์โทร, รหัสผ่าน",
      'หรือกด "Sign In" หากมีบัญชีอยู่แล้ว',
      'เข้าใช้แบบ "ผู้เยี่ยมชม" ได้ แต่จะไม่สามารถประมูลได้',
    ],
    color: "#4A90D9",
    bgColor: "#EBF3FD",
  },
  {
    id: 2,
    icon: "search-outline",
    title: "ค้นหาและเลือกดูสินค้า",
    subtitle: "Browse & Search Products",
    steps: [
      "เลื่อนดูสินค้าบนหน้าแรกที่แบ่งเป็นหมวดหมู่",
      "ใช้ช่องค้นหาเพื่อค้นหาสินค้าที่ต้องการ",
      "กดเลือกหมวดหมู่เพื่อดู Subcategory ย่อย",
      'ดูสินค้าที่กำลัง "Hot" หรือ "Ending Soon"',
    ],
    color: "#F5A623",
    bgColor: "#FFF8EB",
  },
  {
    id: 3,
    icon: "wallet-outline",
    title: "เติมเงินเข้ากระเป๋า",
    subtitle: "Top Up Wallet",
    steps: [
      'ไปที่แท็บ "Wallet" ที่เมนูด้านล่าง',
      'กดปุ่ม "เติมเงิน" เพื่อเพิ่มยอดเงิน',
      "เลือกช่องทางชำระเงิน: QR Code หรือ Mobile Banking",
      "ยืนยันการเติมเงิน — ยอดจะอัปเดตทันที",
    ],
    color: "#7ED321",
    bgColor: "#F0FAE8",
  },
  {
    id: 4,
    icon: "pricetag-outline",
    title: "วางราคาประมูล",
    subtitle: "Place a Bid on Products",
    steps: [
      "กดเข้าไปดูรายละเอียดสินค้าที่ต้องการ",
      'ดูราคาปัจจุบัน (Current Bid) และ "Minimum Bid Increment"',
      'กดปุ่ม "Place Bid" แล้วระบุราคาที่ต้องการเสนอ',
      "ราคาต้องมากกว่าราคาปัจจุบัน + Minimum Increment",
      "ต้องเข้าสู่ระบบก่อนจึงจะประมูลได้",
    ],
    color: "#D0021B",
    bgColor: "#FDECEE",
  },
  {
    id: 5,
    icon: "time-outline",
    title: "ติดตามการประมูล",
    subtitle: "Track Your Bids",
    steps: [
      'ไปที่แท็บ "My Bid" เพื่อดูรายการประมูลทั้งหมด',
      '"Bidding" — สินค้าที่คุณกำลังประมูล',
      '"Won" — สินค้าที่คุณชนะ',
      '"Lost" — สินค้าที่คุณไม่ได้ชนะ',
    ],
    color: "#9013FE",
    bgColor: "#F3ECFE",
  },
  {
    id: 6,
    icon: "checkmark-circle-outline",
    title: "ยืนยันรับสินค้า",
    subtitle: "Verify & Receive Won Products",
    steps: [
      'เมื่อชนะประมูล สินค้าจะอยู่ในสถานะ "Won"',
      "คุณมีเวลา 24 ชั่วโมง ในการยืนยันสินค้า",
      'กด "Verify" เพื่อยืนยันว่าต้องการรับสินค้า',
      "หากไม่ยืนยันภายใน 24 ชม. สินค้าจะถูกยกเลิกอัตโนมัติ",
    ],
    color: "#417505",
    bgColor: "#EDF7E0",
  },
  {
    id: 7,
    icon: "cube-outline",
    title: "ขายสินค้า",
    subtitle: "List Your Products for Auction",
    steps: [
      'ไปที่แท็บ "Seller" ที่เมนูด้านล่าง',
      'กด "Create Auction" เพื่อลงประกาศขาย',
      "อัปโหลดรูปสินค้า (สูงสุด 8 รูป)",
      "กรอกรายละเอียด: ชื่อ, คำอธิบาย, หมวดหมู่",
      "ตั้งราคาเริ่มต้น (Starting Bid) และราคาซื้อทันที (Buy Now)",
      "กำหนดวันเวลาเริ่ม-สิ้นสุดการประมูล",
    ],
    color: "#E67E22",
    bgColor: "#FDF2E6",
  },
  {
    id: 8,
    icon: "cash-outline",
    title: "ถอนเงิน",
    subtitle: "Withdraw Funds from Wallet",
    steps: [
      'ไปที่แท็บ "Wallet"',
      'กดปุ่ม "ถอนเงิน"',
      "ระบุจำนวนเงินที่ต้องการถอน",
      "ใส่ข้อมูลบัญชีธนาคารปลายทาง",
      "เงินจะโอนเข้าบัญชีภายใน 1-3 วันทำการ",
    ],
    color: "#BD10E0",
    bgColor: "#F8E8FD",
  },
  {
    id: 9,
    icon: "cart-outline",
    title: "ซื้อทันที (Buy Now)",
    subtitle: "Buy Now — Instant Purchase",
    steps: [
      "เปิดหน้ารายละเอียดสินค้าที่มีราคา Buy Now",
      'กดปุ่ม "Buy Now" เพื่อซื้อทันทีในราคาที่ผู้ขายกำหนด',
      "ยืนยันการซื้อ — ระบบจะหักเงินจาก Wallet ทันที",
      "ไม่ต้องรอให้การประมูลจบ ได้สินค้าเลย",
    ],
    color: "#E91E63",
    bgColor: "#FDE8EF",
  },
  {
    id: 10,
    icon: "create-outline",
    title: "แก้ไขโปรไฟล์",
    subtitle: "Edit Your Profile",
    steps: [
      'ไปที่แท็บ "โปรไฟล์" แล้วกด "แก้ไขโปรไฟล์"',
      "เปลี่ยนชื่อ เบอร์โทร และรูปโปรไฟล์ได้",
      'รีเซ็ตรหัสผ่านได้โดยกด "ส่งรหัสยืนยัน" ไปที่อีเมล',
      "กรอกรหัสยืนยัน + รหัสผ่านใหม่ (อย่างน้อย 6 ตัวอักษร)",
    ],
    color: "#00BCD4",
    bgColor: "#E0F7FA",
  },
  {
    id: 11,
    icon: "receipt-outline",
    title: "จัดการสินค้าของฉัน",
    subtitle: "Manage My Products & Orders",
    steps: [
      'ไปที่ "โปรไฟล์" > "สินค้าของฉัน" เพื่อดูสินค้าที่ลงขาย',
      "ดูสถานะ: กำลังจะเปิด, กำลังประมูล, ปิดแล้ว, กำลังจัดส่ง",
      'เมื่อมีผู้ชนะประมูล กด "จัดส่งแล้ว" เพื่ออัปเดต',
      'ผู้ซื้อสามารถยืนยันรับสินค้าได้ที่ "ยืนยันสินค้า"',
    ],
    color: "#FF9800",
    bgColor: "#FFF3E0",
  },
  {
    id: 12,
    icon: "alert-circle-outline",
    title: "แจ้งปัญหา",
    subtitle: "Report Issues & Get Support",
    steps: [
      'ไปที่ "โปรไฟล์" > "ช่วยเหลือ & สนับสนุน"',
      'เลือกแท็บ "รายงาน" แล้วเลือกประเภทปัญหา',
      "กรอก User ID / Product ID ที่ต้องการรายงาน",
      "อธิบายรายละเอียดและแนบหลักฐาน (ถ้ามี)",
      'ติดตามสถานะได้ที่แท็บ "สถานะ"',
    ],
    color: "#F44336",
    bgColor: "#FFEBEE",
  },
];

const TUTORIAL_STEPS_EN = [
  {
    id: 1,
    icon: "person-outline",
    title: "Register / Sign In",
    subtitle: "Account Registration & Login",
    steps: [
      'Open BidKhong and tap "Sign Up" to create an account',
      "Fill in: name, email, phone, password",
      'Or tap "Sign In" if you already have an account',
      'You can browse as a "Guest" but cannot bid',
    ],
    color: "#4A90D9",
    bgColor: "#EBF3FD",
  },
  {
    id: 2,
    icon: "search-outline",
    title: "Browse & Search",
    subtitle: "Browse & Search Products",
    steps: [
      "Scroll through products on the Home tab by category",
      "Use the search bar to find what you want",
      "Tap a category to browse subcategories",
      'See "Hot" and "Ending Soon" items',
    ],
    color: "#F5A623",
    bgColor: "#FFF8EB",
  },
  {
    id: 3,
    icon: "wallet-outline",
    title: "Top Up Wallet",
    subtitle: "Top Up Your Wallet",
    steps: [
      'Go to the "Wallet" tab',
      'Tap "Top Up" to add funds',
      "Choose a payment method: QR Code or Mobile Banking",
      "Confirm — your balance updates instantly",
    ],
    color: "#7ED321",
    bgColor: "#F0FAE8",
  },
  {
    id: 4,
    icon: "pricetag-outline",
    title: "Place a Bid",
    subtitle: "Place a Bid on Products",
    steps: [
      "Open the product you want to bid on",
      'Check the Current Bid and "Minimum Bid Increment"',
      'Tap "Place Bid" and enter your price',
      "Your bid must exceed current bid + increment",
      "You must be signed in to bid",
    ],
    color: "#D0021B",
    bgColor: "#FDECEE",
  },
  {
    id: 5,
    icon: "time-outline",
    title: "Track Your Bids",
    subtitle: "Track Your Bids",
    steps: [
      'Go to the "My Bid" tab to view all bids',
      '"Bidding" — items you are currently bidding on',
      '"Won" — items you have won',
      '"Lost" — items you did not win',
    ],
    color: "#9013FE",
    bgColor: "#F3ECFE",
  },
  {
    id: 6,
    icon: "checkmark-circle-outline",
    title: "Verify Receipt",
    subtitle: "Verify & Receive Won Products",
    steps: [
      'When you win, the item status becomes "Won"',
      "You have 24 hours to verify the item",
      'Tap "Verify" to confirm you want to receive it',
      "If not verified within 24 hrs, the order is auto-cancelled",
    ],
    color: "#417505",
    bgColor: "#EDF7E0",
  },
  {
    id: 7,
    icon: "cube-outline",
    title: "Sell a Product",
    subtitle: "List Your Products for Auction",
    steps: [
      'Go to the "Seller" tab',
      'Tap "Create Auction" to list a product',
      "Upload product photos (up to 8)",
      "Fill in: title, description, category",
      "Set a starting bid and optional Buy Now price",
      "Set start & end date/time for the auction",
    ],
    color: "#E67E22",
    bgColor: "#FDF2E6",
  },
  {
    id: 8,
    icon: "cash-outline",
    title: "Withdraw Funds",
    subtitle: "Withdraw Funds from Wallet",
    steps: [
      'Go to the "Wallet" tab',
      'Tap "Withdraw"',
      "Enter the amount to withdraw",
      "Enter your bank account details",
      "Funds transferred within 1–3 business days",
    ],
    color: "#BD10E0",
    bgColor: "#F8E8FD",
  },
  {
    id: 9,
    icon: "cart-outline",
    title: "Buy Now",
    subtitle: "Buy Now — Instant Purchase",
    steps: [
      "Open a product that has a Buy Now price",
      'Tap "Buy Now" to purchase at the seller\'s fixed price',
      "Confirm — funds are deducted from your Wallet instantly",
      "No need to wait for the auction to end",
    ],
    color: "#E91E63",
    bgColor: "#FDE8EF",
  },
  {
    id: 10,
    icon: "create-outline",
    title: "Edit Profile",
    subtitle: "Edit Your Profile",
    steps: [
      'Go to the "Profile" tab and tap "Edit Profile"',
      "Change your name, phone number, and profile picture",
      'Reset your password by tapping "Send Verification Code"',
      "Enter the code + new password (at least 6 characters)",
    ],
    color: "#00BCD4",
    bgColor: "#E0F7FA",
  },
  {
    id: 11,
    icon: "receipt-outline",
    title: "Manage My Products",
    subtitle: "Manage My Products & Orders",
    steps: [
      'Go to "Profile" > "My Products" to view your listings',
      "See statuses: Incoming, Active, Ended, Shipping",
      'When a buyer wins, tap "Mark as Shipped" to update',
      'Buyers can verify receipt via "Verify Product"',
    ],
    color: "#FF9800",
    bgColor: "#FFF3E0",
  },
  {
    id: 12,
    icon: "alert-circle-outline",
    title: "Report Issues",
    subtitle: "Report Issues & Get Support",
    steps: [
      'Go to "Profile" > "Help & Support"',
      'Select the "Report" tab and choose the issue type',
      "Enter the User ID / Product ID to report",
      "Describe the issue and attach evidence (if any)",
      'Track your report status in the "Status" tab',
    ],
    color: "#F44336",
    bgColor: "#FFEBEE",
  },
];

// ─── FAQ ─────────────────────────────────────────────────────
const FAQ_ITEMS_TH = [
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
    a: "Place Bid คือการเสนอราคาแข่งกับคนอื่น ส่วน Buy Now คือซื้อทันทีในราคาที่ผู้ขายกำหนดไว้โดยไม่ต้องรอ",
  },
  {
    q: "Minimum Bid Increment คืออะไร?",
    a: "คือจำนวนเงินขั้นต่ำที่ต้องเสนอเพิ่มจากราคาปัจจุบัน เช่น หากราคาปัจจุบัน ฿1,000 และ min increment ฿100 ต้องเสนอ ฿1,100 ขึ้นไป",
  },
  {
    q: "สินค้า Incoming คืออะไร?",
    a: "คือสินค้าที่กำลังจะเปิดประมูลเร็วๆนี้ คุณสามารถดูรายละเอียดล่วงหน้าได้แต่ยังประมูลไม่ได้จนกว่าจะถึงเวลา",
  },
  {
    q: "จะเปลี่ยนรหัสผ่านได้อย่างไร?",
    a: "ไปที่ Profile > Edit Profile เพื่อเปลี่ยนรหัสผ่านและข้อมูลส่วนตัว",
  },
  {
    q: "Hot และ Ending Soon คืออะไร?",
    a: '"Hot" คือสินค้ายอดนิยมที่มีคนประมูลเยอะ ส่วน "Ending Soon" คือสินค้าที่ใกล้จะปิดการประมูล ต้องรีบเสนอราคาก่อนหมดเวลา',
  },
  {
    q: "AI Pick / แนะนำสำหรับคุณ คืออะไร?",
    a: "ระบบ AI จะวิเคราะห์พฤติกรรมการใช้งานของคุณ เช่น สินค้าที่เคยดู หมวดหมู่ที่สนใจ แล้วแนะนำสินค้าที่น่าจะตรงกับความสนใจ ต้องล็อกอินถึงจะเห็นส่วนนี้",
  },
  {
    q: "ลืมรหัสผ่านทำอย่างไร?",
    a: 'กดปุ่ม "ลืมรหัสผ่าน" ที่หน้า Login กรอกอีเมลที่ลงทะเบียนไว้ ระบบจะส่งรหัสยืนยันไปทางอีเมล นำรหัสมากรอกพร้อมรหัสผ่านใหม่ (อย่างน้อย 6 ตัวอักษร)',
  },
  {
    q: "วิธีเปลี่ยนภาษาในแอป?",
    a: 'ไปที่แท็บ "โปรไฟล์" จะมีปุ่มสลับภาษา ไทย/EN ระบบจะจำการตั้งค่าภาษาไว้ให้โดยอัตโนมัติ',
  },
  {
    q: "วิธีดูประวัติธุรกรรม Wallet?",
    a: 'ไปที่แท็บ "Wallet" จะเห็นรายการธุรกรรมด้านล่าง สามารถกรองตามประเภท (เติมเงิน, ถอนเงิน, ชนะประมูล, วางประมูล, คืนเงิน, รายได้) หรือตามเดือนและปีได้',
  },
  {
    q: "วิธีแจ้งปัญหาหรือรายงานผู้ใช้?",
    a: 'ไปที่ "โปรไฟล์" > "ช่วยเหลือ & สนับสนุน" เลือกแท็บ "รายงาน" เลือกประเภทปัญหา กรอก ID และรายละเอียด แนบหลักฐานแล้วส่ง ติดตามสถานะได้ที่แท็บ "สถานะ"',
  },
];

const FAQ_ITEMS_EN = [
  {
    q: "What happens if I win but don't verify?",
    a: "If you don't verify within 24 hours, the order is automatically cancelled (Expired) and your bidding privileges may be suspended.",
  },
  {
    q: "What can a Guest user do?",
    a: "Guests can browse products, search, and view categories, but cannot bid, buy, or use the Wallet.",
  },
  {
    q: "What is the difference between Buy Now and Place Bid?",
    a: "Place Bid enters you into a competitive auction. Buy Now lets you purchase the item immediately at the seller's fixed price.",
  },
  {
    q: "What is Minimum Bid Increment?",
    a: "It's the minimum amount you must add to the current bid. E.g., if current bid is ฿1,000 and increment is ฿100, you must bid at least ฿1,100.",
  },
  {
    q: "What are Incoming products?",
    a: "These are products whose auction hasn't started yet. You can view details but cannot bid until the auction opens.",
  },
  {
    q: "How do I change my password?",
    a: "Go to Profile > Edit Profile to update your password and personal information.",
  },
  {
    q: "What are Hot and Ending Soon?",
    a: '"Hot" products are trending with many bidders. "Ending Soon" are auctions about to close — bid quickly before time runs out!',
  },
  {
    q: "What is AI Pick / Recommended for You?",
    a: "The AI analyzes your browsing behavior — products you've viewed and categories you're interested in — to suggest items you might like. You must be logged in to see recommendations.",
  },
  {
    q: "I forgot my password — what do I do?",
    a: 'Tap "Forgot Password" on the login screen, enter your email, and a verification code will be sent. Enter the code with your new password (at least 6 characters).',
  },
  {
    q: "How do I change the app language?",
    a: 'Go to the "Profile" tab where you\'ll find a language toggle (Thai/EN). Your preference is saved automatically.',
  },
  {
    q: "How do I view my Wallet transaction history?",
    a: 'Go to the "Wallet" tab to see all transactions below your balance. Use the filter to sort by type (deposit, withdraw, won auction, bid placed, refund, earnings) or by month and year.',
  },
  {
    q: "How do I report a problem or user?",
    a: 'Go to "Profile" > "Help & Support", select the "Report" tab, choose the issue type, fill in details and attach evidence. Track your report in the "Status" tab.',
  },
];

// ─── Component ───────────────────────────────────────────────
const AboutAppPage = () => {
  const router = useRouter();
  const { t, lang } = useLanguage();
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);
  const tutorialSteps = lang === "th" ? TUTORIAL_STEPS_TH : TUTORIAL_STEPS_EN;
  const faqItems = lang === "th" ? FAQ_ITEMS_TH : FAQ_ITEMS_EN;
  const features =
    lang === "th"
      ? [
          {
            icon: "lock-closed-outline",
            title: "ปลอดภัย",
            desc: "ระบบล็อกอินปลอดภัย",
          },
          {
            icon: "alarm-outline",
            title: "Real-time",
            desc: "นับถอยหลังแบบเรียลไทม์",
          },
          { icon: "card-outline", title: "Wallet", desc: "กระเป๋าเงินในตัว" },
          {
            icon: "phone-portrait-outline",
            title: "ง่ายต่อการใช้",
            desc: "UI สวยงาม ใช้ง่าย",
          },
          {
            icon: "notifications-outline",
            title: "แจ้งเตือน",
            desc: "แจ้งเมื่อชนะประมูล",
          },
          {
            icon: "storefront-outline",
            title: "ขายง่าย",
            desc: "ลงขายได้ในไม่กี่ขั้นตอน",
          },
        ]
      : [
          {
            icon: "lock-closed-outline",
            title: "Secure",
            desc: "Safe login system",
          },
          {
            icon: "alarm-outline",
            title: "Real-time",
            desc: "Live countdown timers",
          },
          { icon: "card-outline", title: "Wallet", desc: "Built-in wallet" },
          {
            icon: "phone-portrait-outline",
            title: "Easy to Use",
            desc: "Beautiful, intuitive UI",
          },
          {
            icon: "notifications-outline",
            title: "Notifications",
            desc: "Alerts when you win",
          },
          {
            icon: "storefront-outline",
            title: "Sell Easily",
            desc: "List in just a few steps",
          },
        ];
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
            {t("aboutTitle")}
          </AppText>
          <View style={{ width: 40 }} />
        </SafeAreaView>
      </LinearGradient>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        scrollEventThrottle={16}
      >
        {/* ─── App Logo & Info ─────────────────────────── */}
        <View style={styles.appInfoSection}>
          <View style={styles.logoContainer}>
            <Image
              source={image.logo}
              style={styles.appLogo}
              contentFit="contain"
            />
          </View>
          <AppText weight="bold" style={styles.appName} numberOfLines={1}>
            BidKhong
          </AppText>
          <AppText weight="regular" style={styles.appVersion} numberOfLines={1}>
            {t("aboutVersion")}
          </AppText>
          <View style={styles.appDescContainer}>
            <AppText weight="regular" style={styles.appDesc}>
              {t("aboutAppDesc")}
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
                {t("aboutStatUsers")}
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
                {t("aboutStatProducts")}
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
                {t("aboutStatSafe")}
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
              {t("aboutHowToUse")}
            </AppText>
            <AppText
              weight="regular"
              style={styles.sectionSubtitle}
              numberOfLines={1}
            >
              {t("aboutHowToUseSub")}
            </AppText>
          </View>

          {tutorialSteps.map((step, index) => (
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
                {index < tutorialSteps.length - 1 && (
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
                  <Ionicons
                    name={step.icon as any}
                    size={24}
                    color={step.color}
                  />
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
              {t("aboutFeatureTitle")}
            </AppText>
          </View>

          <View style={styles.featuresGrid}>
            {features.map((feat, i) => (
              <View key={i} style={styles.featureCard}>
                <Ionicons
                  name={feat.icon as any}
                  size={28}
                  color="#003994"
                  style={{ marginBottom: 8 }}
                />
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
              {t("aboutFaqSection")}
            </AppText>
          </View>

          {faqItems.map((faq, index) => (
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
              {t("needHelp")}
            </AppText>
            <AppText
              weight="regular"
              style={styles.footerDesc}
              numberOfLines={1}
            >
              {t("contactSupportDesc")}
            </AppText>

            <View style={styles.contactCards}>
              <View style={styles.contactCard}>
                <Ionicons
                  name="mail-outline"
                  size={18}
                  color="rgba(255,255,255,0.9)"
                  style={{ marginRight: 12 }}
                />
                <AppText
                  weight="regular"
                  style={styles.contactCardText}
                  numberOfLines={1}
                >
                  support@bidkhong.com
                </AppText>
              </View>
              <View style={styles.contactCard}>
                <Ionicons
                  name="call-outline"
                  size={18}
                  color="rgba(255,255,255,0.9)"
                  style={{ marginRight: 12 }}
                />
                <AppText
                  weight="regular"
                  style={styles.contactCardText}
                  numberOfLines={1}
                >
                  02-XXX-XXXX
                </AppText>
              </View>
              <View style={styles.contactCard}>
                <Ionicons
                  name="chatbubble-outline"
                  size={18}
                  color="rgba(255,255,255,0.9)"
                  style={{ marginRight: 12 }}
                />
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
