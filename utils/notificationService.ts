// expo-notifications is not supported in Expo Go on Android (SDK 53+).
// All calls are wrapped in try-catch so the app never crashes in Expo Go;
// notifications will work correctly in a real development/production build.
import { Platform } from "react-native";

let Notifications: typeof import("expo-notifications") | null = null;
try {
  Notifications = require("expo-notifications");
  Notifications!.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldShowBanner: true,
      shouldShowList: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
    }),
  });
} catch {
  // Running in Expo Go on Android — notifications unavailable, app continues normally
}

// ────────────────────────────────────────────────────────────
// Request permission + set up Android channels (call once on login)
// ────────────────────────────────────────────────────────────
export async function requestNotificationPermissions(): Promise<boolean> {
  if (!Notifications) return false;
  try {
    if (Platform.OS === "android") {
      await Promise.all([
        Notifications.setNotificationChannelAsync("outbid", {
          name: "ถูกตัดหน้า",
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#FF6B35",
        }),
        Notifications.setNotificationChannelAsync("won", {
          name: "ชนะประมูล",
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#22C55E",
        }),
        Notifications.setNotificationChannelAsync("new_bid", {
          name: "มีคนประมูลสินค้าของฉัน",
          importance: Notifications.AndroidImportance.DEFAULT,
          lightColor: "#3B82F6",
        }),
        Notifications.setNotificationChannelAsync("wallet", {
          name: "กระเป๋าเงิน",
          importance: Notifications.AndroidImportance.DEFAULT,
          lightColor: "#8B5CF6",
        }),
        Notifications.setNotificationChannelAsync("ending_soon", {
          name: "ใกล้หมดเวลา",
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#EF4444",
        }),
        Notifications.setNotificationChannelAsync("product_status", {
          name: "สถานะสินค้า",
          importance: Notifications.AndroidImportance.DEFAULT,
          lightColor: "#F59E0B",
        }),
        Notifications.setNotificationChannelAsync("order_status", {
          name: "ความคืบหน้าคำสั่งซื้อ",
          importance: Notifications.AndroidImportance.HIGH,
          vibrationPattern: [0, 250, 250, 250],
          lightColor: "#6366F1",
        }),
        Notifications.setNotificationChannelAsync("report_status", {
          name: "สถานะการแจ้งปัญหา",
          importance: Notifications.AndroidImportance.DEFAULT,
          lightColor: "#0EA5E9",
        }),
      ]);
    }
    const { status: existing } = await Notifications.getPermissionsAsync();
    if (existing === "granted") return true;
    const { status } = await Notifications.requestPermissionsAsync();
    return status === "granted";
  } catch {
    return false;
  }
}

const schedule = async (content: object, channelId: string) => {
  if (!Notifications) return;
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        sound: true,
        ...(Platform.OS === "android" && { channelId }),
        ...content,
      },
      trigger: null,
    });
  } catch {
    // Ignore — Expo Go or permission not granted
  }
};

// ── 1. ถูกตัดหน้า ─────────────────────────────────────────────
export const sendOutbidNotification = (productTitle: string) =>
  schedule(
    {
      title: "ถูกตัดหน้าแล้ว! ⚡",
      body: `"${productTitle}" โดนตัดหน้า กดเพื่อเสนอราคาใหม่`,
      data: { type: "outbid", productTitle },
    },
    "outbid",
  );

// ── 2. ชนะประมูล ──────────────────────────────────────────────
export const sendWonNotification = (productTitle: string) =>
  schedule(
    {
      title: "ยินดีด้วย! คุณชนะประมูล 🏆",
      body: `"${productTitle}" เป็นของคุณแล้ว กดเพื่อดูรายละเอียด`,
      data: { type: "won", productTitle },
    },
    "won",
  );

// ── 3. มีคนประมูลสินค้าของเรา (ผู้ขาย) ───────────────────────
export const sendNewBidOnMyProductNotification = (
  productTitle: string,
  bidAmount: string,
) =>
  schedule(
    {
      title: "มีคนประมูลสินค้าของคุณ 🔔",
      body: `"${productTitle}" มีราคาล่าสุด ฿${bidAmount}`,
      data: { type: "new_bid", productTitle, bidAmount },
    },
    "new_bid",
  );

// ── 4. ฝากเงินสำเร็จ ──────────────────────────────────────────
export const sendDepositNotification = (amount: string) =>
  schedule(
    {
      title: "เติมเงินสำเร็จ ✅",
      body: `เติมเงิน ฿${amount} เข้ากระเป๋าแล้ว`,
      data: { type: "deposit", amount },
    },
    "wallet",
  );

// ── 5. ถอนเงินสำเร็จ ──────────────────────────────────────────
export const sendWithdrawNotification = (amount: string) =>
  schedule(
    {
      title: "ถอนเงินสำเร็จ ✅",
      body: `ถอนเงิน ฿${amount} ออกจากกระเป๋าแล้ว`,
      data: { type: "withdraw", amount },
    },
    "wallet",
  );

// ── 6. สินค้าใกล้หมดเวลา ──────────────────────────────────────
export const sendEndingSoonNotification = (
  productTitle: string,
  timeLeft: string,
) =>
  schedule(
    {
      title: "ใกล้หมดเวลาแล้ว! ⏰",
      body: `"${productTitle}" เหลือเวลาอีก ${timeLeft} รีบเสนอราคา!`,
      data: { type: "ending_soon", productTitle },
    },
    "ending_soon",
  );

// ── 7. Admin อนุมัติสินค้า ─────────────────────────────────────
export const sendProductApprovedNotification = (productTitle: string) =>
  schedule(
    {
      title: "สินค้าได้รับการอนุมัติ ✅",
      body: `"${productTitle}" ผ่านการตรวจสอบและพร้อมประมูลแล้ว`,
      data: { type: "product_approved", productTitle },
    },
    "product_status",
  );

// ── 8. Admin ปฏิเสธสินค้า ─────────────────────────────────────
export const sendProductRejectedNotification = (
  productTitle: string,
  reason?: string,
) =>
  schedule(
    {
      title: "สินค้าไม่ผ่านการอนุมัติ ❌",
      body: reason
        ? `"${productTitle}" — ${reason}`
        : `"${productTitle}" ไม่ผ่านการตรวจสอบ กรุณาแก้ไขและส่งใหม่`,
      data: { type: "product_rejected", productTitle, reason },
    },
    "product_status",
  );

// ── 9. ผู้ซื้อยืนยันการติดต่อแล้ว (แจ้งไปหาผู้ขาย) ────────────
export const sendOrderBuyerConfirmedNotification = (productTitle: string) =>
  schedule(
    {
      title: "ผู้ซื้อยืนยันการติดต่อแล้ว ✅",
      body: `"${productTitle}" ผู้ซื้อยืนยันการติดต่อเรียบร้อย รอการจัดส่งสินค้า`,
      data: { type: "order_buyer_confirmed", productTitle },
    },
    "order_status",
  );

// ── 10. ผู้ขายจัดส่งสินค้าแล้ว (แจ้งไปหาผู้ซื้อ) ────────────────
export const sendOrderSellerShippedNotification = (productTitle: string) =>
  schedule(
    {
      title: "สินค้าถูกจัดส่งแล้ว 📦",
      body: `"${productTitle}" ผู้ขายจัดส่งสินค้าแล้ว กรุณารอรับสินค้า`,
      data: { type: "order_seller_shipped", productTitle },
    },
    "order_status",
  );

// ── 11. ผู้ซื้อยืนยันรับสินค้าแล้ว (แจ้งไปหาผู้ขาย) ─────────────
export const sendOrderCompletedNotification = (productTitle: string) =>
  schedule(
    {
      title: "คำสั่งซื้อเสร็จสมบูรณ์ 🎉",
      body: `"${productTitle}" ผู้ซื้อยืนยันรับสินค้าแล้ว การขายเสร็จสิ้น`,
      data: { type: "order_completed", productTitle },
    },
    "order_status",
  );

// ── 12. Admin รับเรื่องรายงาน (รอดำเนินการ) ─────────────────────
export const sendReportPendingNotification = () =>
  schedule(
    {
      title: "รับเรื่องการแจ้งปัญหาแล้ว ⏳",
      body: "รายงานของคุณอยู่ระหว่างรอดำเนินการ ทีมงานจะตรวจสอบโดยเร็ว",
      data: { type: "report_pending" },
    },
    "report_status",
  );

// ── 13. Admin กำลังตรวจสอบรายงาน ────────────────────────────────
export const sendReportReviewingNotification = () =>
  schedule(
    {
      title: "กำลังตรวจสอบรายงานของคุณ 🔄",
      body: "ทีมงานกำลังตรวจสอบรายงานของคุณอยู่ โปรดรอสักครู่",
      data: { type: "report_reviewing" },
    },
    "report_status",
  );

// ── 14. Admin แก้ไขเรื่องรายงานเรียบร้อยแล้ว ───────────────────
export const sendReportResolvedNotification = () =>
  schedule(
    {
      title: "แก้ไขปัญหาเรียบร้อยแล้ว ✅",
      body: "รายงานของคุณได้รับการดำเนินการเสร็จสิ้นแล้ว ขอบคุณที่แจ้งปัญหา",
      data: { type: "report_resolved" },
    },
    "report_status",
  );
