// ════════════════════════════════════════════════════════
// Bid Winner Logic
// ════════════════════════════════════════════════════════
import React from "react";
export interface BidLike {
  price: string;
  user_id?: number;
}

/** เช็คว่าราคาที่เราเสนอสูงสุด ยังเป็นราคานำอยู่หรือไม่ */
export function isBidWinning(
  myHighestBid: number,
  currentPrice: number,
): boolean {
  return myHighestBid >= currentPrice;
}

/** หา bid ที่ราคาสูงสุดจากรายการ bid ทั้งหมด (ใครคือผู้ชนะตอนนี้) */
export function getHighestBid<T extends BidLike>(bids: T[]): T | null {
  if (bids.length === 0) return null;
  return [...bids].sort((a, b) => parseFloat(b.price) - parseFloat(a.price))[0];
}

/** หาว่า "เรา" (userId) เคย bid สูงสุดเท่าไรในรายการนี้ */
export function getMyHighestBidAmount(bids: BidLike[], userId: number): number {
  const myBids = bids.filter((b) => Number(b.user_id) === userId);
  if (myBids.length === 0) return 0;
  return Math.max(...myBids.map((b) => parseFloat(b.price)));
}

// ════════════════════════════════════════════════════════
// Order Deadline Logic
// ════════════════════════════════════════════════════════

/** คำนวณ deadline การติดต่อ/ชำระเงินหลังประมูลจบ (default 24 ชม.) */
export function calculateOrderDeadline(
  endedAt: string,
  hoursToRespond: number = 24,
): Date {
  return new Date(
    new Date(endedAt).getTime() + hoursToRespond * 60 * 60 * 1000,
  );
}

/** เช็คว่าเลย deadline มาแล้วหรือยัง (รับ now เข้ามาได้เพื่อให้เทสต์ deterministic) */
export function isOrderExpired(
  deadline: Date,
  now: Date = new Date(),
): boolean {
  return deadline < now;
}

// ════════════════════════════════════════════════════════
// Notification Type Classifier
// ════════════════════════════════════════════════════════

export type NotificationCategory =
  | "outbid"
  | "won"
  | "lost"
  | "buynow_lost"
  | "buynow_success"
  | "new_bid"
  | "deposit"
  | "withdraw"
  | "ending_soon"
  | "approved"
  | "rejected"
  | "buyer_confirmed"
  | "seller_shipped"
  | "order_completed"
  | "disputed"
  | "cancelled"
  | "report_pending"
  | "report_reviewing"
  | "report_resolved";

const CATEGORY_RULES: [NotificationCategory, string[]][] = [
  ["outbid", ["outbid", "out_bid", "overbid"]],
  ["won", ["won", "auction_won", "bid_won"]],
  ["buynow_lost", ["buynow_lost", "buy_now_lost", "bought_now"]],
  ["lost", ["auction_lost", "bid_lost", "lost"]],
  ["buynow_success", ["buynow_purchased", "buy_now_success", "buynow_success"]],
  ["new_bid", ["new_bid", "bid_placed", "bid_received"]],
  ["deposit", ["deposit", "top_up", "topup"]],
  ["withdraw", ["withdraw", "withdrawal"]],
  ["ending_soon", ["ending_soon", "ending", "time_warning"]],
  ["approved", ["approved", "product_approved"]],
  ["rejected", ["rejected", "product_rejected"]],
  [
    "buyer_confirmed",
    ["buyer_confirmed", "order_confirmed", "confirmed_contact"],
  ],
  ["seller_shipped", ["seller_shipped", "order_shipped", "shipped"]],
  [
    "order_completed",
    ["order_completed", "buyer_received", "received", "completed"],
  ],
  ["disputed", ["order_disputed", "disputed", "dispute"]],
  ["cancelled", ["order_cancelled", "cancelled", "order_timeout"]],
  ["report_pending", ["report_pending", "report_submitted"]],
  ["report_reviewing", ["report_reviewing", "report_under_review"]],
  ["report_resolved", ["report_resolved", "report_closed"]],
];

/** จำแนกว่า notification type string ตรงกับ category ไหน (คงลำดับการเช็คเดิมจาก useOutbidChecker) */
export function classifyNotificationType(
  type: string,
): NotificationCategory | null {
  const t = (type ?? "").toLowerCase();
  for (const [category, keywords] of CATEGORY_RULES) {
    if (keywords.some((k) => t.includes(k))) return category;
  }
  return null;
}

// ════════════════════════════════════════════════════════
// Text/Font Helpers
// ════════════════════════════════════════════════════════

/** ตรวจว่า React node มีตัวอักษรไทยปนอยู่หรือไม่ (Unicode block U+0E00–U+0E7F) ใช้เลือกฟอนต์ */
export function containsThai(children: React.ReactNode): boolean {
  const extract = (node: React.ReactNode): string => {
    if (typeof node === "string" || typeof node === "number")
      return String(node);
    if (Array.isArray(node)) return node.map(extract).join("");
    if (React.isValidElement(node) && (node.props as any)?.children) {
      return extract((node.props as any).children);
    }
    return "";
  };
  return /[\u0E00-\u0E7F]/.test(extract(children));
}
