import { useEffect, useRef } from "react";
import { AppState, AppStateStatus } from "react-native";
import { useAuth } from "../contexts/AuthContext";
import apiService from "../utils/api/apiService";
import {
    sendDepositNotification,
    sendEndingSoonNotification,
    sendNewBidOnMyProductNotification,
    sendOrderBuyerConfirmedNotification,
    sendOrderCompletedNotification,
    sendOrderSellerShippedNotification,
    sendOutbidNotification,
    sendProductApprovedNotification,
    sendProductRejectedNotification,
    sendReportPendingNotification,
    sendReportResolvedNotification,
    sendReportReviewingNotification,
    sendWithdrawNotification,
    sendWonNotification,
} from "../utils/notificationService";

/**
 * Polls GET /notifications every 30 seconds.
 * Also checks active bid end-times every 60 seconds and fires a local
 * "5 minutes left" notification when a product the user bid on is ending soon.
 *
 * Supported notification types (matched by server `type` field):
 *
 * | type keyword         | เงื่อนไขการแจ้งเตือน                                        |
 * |----------------------|--------------------------------------------------------------|
 * | outbid / overbid     | มีคนมาประมูลแซงราคาเรา                                      |
 * | won / auction_won    | ประมูลชนะ — เราเป็นผู้เสนอราคาสูงสุดเมื่อหมดเวลา           |
 * | new_bid / bid_placed | มีคนมาประมูลสินค้าที่เราลงขาย (ผู้ขาย)                     |
 * | deposit / top_up     | การเติมเงิน/ฝากเงินสำเร็จ                                   |
 * | withdraw / withdrawal| การถอนเงินสำเร็จ                                             |
 * | ending_soon (server) | server ส่ง ending_soon มา                                   |
 * | -(client-side)       | เหลือ ≤ 5 นาที — คำนวณเองจาก auction_end_time              |
 * | approved             | Admin อนุมัติสินค้าที่เราลงขาย                              |
 * | rejected             | Admin ปฏิเสธสินค้าที่เราลงขาย                               |
 */

// Foreground: poll every 3 s → near-real-time feel
// Background: poll every 30 s → save battery
const POLL_FG_MS = 3_000;
const POLL_BG_MS = 30_000;
const ENDING_CHECK_MS = 60_000; // active-bid end-time check interval
const ENDING_WARN_MS = 5 * 60 * 1000; // 5 minutes in ms

export function useOutbidChecker() {
  const { isLoggedIn, isGuest, user } = useAuth();

  const seenIdsRef = useRef<Set<number>>(new Set());
  const initializedRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const endingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const appStateRef = useRef<AppStateStatus>(AppState.currentState);

  // Track which auction IDs we have already fired the "5 min" warning for
  // so we only fire once per auction (reset when the auction ends)
  const warnedEndingRef = useRef<Set<string>>(new Set());

  // ── Poll /notifications and fire device notifications ────────
  const check = async () => {
    if (!isLoggedIn || isGuest) return;
    try {
      const notifications = await apiService.notification.getAll();

      if (!initializedRef.current) {
        // First load — mark everything as seen to avoid spam on app open
        notifications.forEach((n) => seenIdsRef.current.add(n.id));
        initializedRef.current = true;
        return;
      }

      for (const n of notifications) {
        if (seenIdsRef.current.has(n.id)) continue;
        seenIdsRef.current.add(n.id);

        const type = n.type?.toLowerCase() ?? "";
        const title = n.data?.product_title ?? n.title ?? "";
        const amount = n.data?.amount ?? "";
        const timeLeft = n.data?.time_left ?? "ไม่นาน";
        const reason = n.data?.reason ?? "";

        // 1. ถูกตัดหน้า
        if (["outbid", "out_bid", "overbid"].some((k) => type.includes(k))) {
          sendOutbidNotification(title).catch(() => {});

          // 2. ชนะประมูล
        } else if (
          ["won", "auction_won", "bid_won"].some((k) => type.includes(k))
        ) {
          sendWonNotification(title).catch(() => {});

          // 3. มีคนประมูลสินค้าเรา (ผู้ขาย)
        } else if (
          ["new_bid", "bid_placed", "bid_received"].some((k) =>
            type.includes(k),
          )
        ) {
          sendNewBidOnMyProductNotification(title, amount).catch(() => {});

          // 4. เติมเงินสำเร็จ
        } else if (
          ["deposit", "top_up", "topup"].some((k) => type.includes(k))
        ) {
          sendDepositNotification(amount || title).catch(() => {});

          // 5. ถอนเงินสำเร็จ
        } else if (["withdraw", "withdrawal"].some((k) => type.includes(k))) {
          sendWithdrawNotification(amount || title).catch(() => {});

          // 6. ใกล้หมดเวลา (server-sent)
        } else if (
          ["ending_soon", "ending", "time_warning"].some((k) =>
            type.includes(k),
          )
        ) {
          sendEndingSoonNotification(title, timeLeft).catch(() => {});

          // 7. Admin อนุมัติสินค้า
        } else if (
          ["approved", "product_approved"].some((k) => type.includes(k))
        ) {
          sendProductApprovedNotification(title).catch(() => {});

          // 8. Admin ปฏิเสธสินค้า
        } else if (
          ["rejected", "product_rejected"].some((k) => type.includes(k))
        ) {
          sendProductRejectedNotification(title, reason).catch(() => {});

          // 9. ผู้ซื้อยืนยันการติดต่อ (แจ้งผู้ขาย)
        } else if (
          ["buyer_confirmed", "order_confirmed", "confirmed_contact"].some(
            (k) => type.includes(k),
          )
        ) {
          sendOrderBuyerConfirmedNotification(title).catch(() => {});

          // 10. ผู้ขายจัดส่งสินค้าแล้ว (แจ้งผู้ซื้อ)
        } else if (
          ["seller_shipped", "order_shipped", "shipped"].some((k) =>
            type.includes(k),
          )
        ) {
          sendOrderSellerShippedNotification(title).catch(() => {});

          // 11. คำสั่งซื้อเสร็จ (แจ้งผู้ขาย)
        } else if (
          ["order_completed", "buyer_received", "received", "completed"].some(
            (k) => type.includes(k),
          )
        ) {
          sendOrderCompletedNotification(title).catch(() => {});

          // 12. Report รอดำเนินการ
        } else if (
          ["report_pending", "report_submitted"].some((k) => type.includes(k))
        ) {
          sendReportPendingNotification().catch(() => {});

          // 13. Report กำลังตรวจสอบ
        } else if (
          ["report_reviewing", "report_under_review"].some((k) =>
            type.includes(k),
          )
        ) {
          sendReportReviewingNotification().catch(() => {});

          // 14. Report แก้ไขเรียบร้อย
        } else if (
          ["report_resolved", "report_closed"].some((k) => type.includes(k))
        ) {
          sendReportResolvedNotification().catch(() => {});
        }
      }
    } catch {
      // Ignore network errors silently
    }
  };

  // ── Client-side 5-minute ending-soon check ───────────────────
  const checkEndingSoon = async () => {
    if (!isLoggedIn || isGuest || !user?.id) return;
    try {
      const { activeBids } = await apiService.bid.getMyBidsConstructed(user.id);

      for (const bid of activeBids) {
        const tl = bid.timeLeft ?? "";

        // Parse remaining ms from "HH:MM:SS" or "Xd Yh Zm" format
        let remainingMs = Infinity;
        const hhmmss = tl.match(/^(\d+):(\d+):(\d+)$/);
        if (hhmmss) {
          remainingMs =
            parseInt(hhmmss[1]) * 3600_000 +
            parseInt(hhmmss[2]) * 60_000 +
            parseInt(hhmmss[3]) * 1000;
        }
        const dmh = tl.match(/(\d+)d\s+(\d+)h\s+(\d+)m/);
        if (dmh) {
          remainingMs =
            parseInt(dmh[1]) * 86400_000 +
            parseInt(dmh[2]) * 3600_000 +
            parseInt(dmh[3]) * 60_000;
        }

        const key = bid.auctionId;

        if (remainingMs <= ENDING_WARN_MS && remainingMs > 0) {
          if (!warnedEndingRef.current.has(key)) {
            warnedEndingRef.current.add(key);
            const mins = Math.ceil(remainingMs / 60_000);
            sendEndingSoonNotification(bid.title, `${mins} นาที`).catch(
              () => {},
            );
          }
        } else if (remainingMs <= 0) {
          // Auction ended — reset so re-listed products can warn again
          warnedEndingRef.current.delete(key);
        }
      }
    } catch {
      // Ignore silently
    }
  };

  useEffect(() => {
    if (!isLoggedIn || isGuest) return;

    // ── Helper: (re)start the notification poll at the given interval ──
    const startPoll = (ms: number) => {
      if (timerRef.current) clearInterval(timerRef.current);
      timerRef.current = setInterval(check, ms);
    };

    // Initial run + start foreground interval
    check();
    checkEndingSoon();
    startPoll(POLL_FG_MS);
    endingTimerRef.current = setInterval(checkEndingSoon, ENDING_CHECK_MS);

    // Adjust poll speed based on app visibility
    const sub = AppState.addEventListener("change", (next: AppStateStatus) => {
      const prev = appStateRef.current;
      appStateRef.current = next;

      if (next === "active") {
        // Came back to foreground — fire immediately then switch to fast poll
        check();
        checkEndingSoon();
        startPoll(POLL_FG_MS);
      } else {
        // Going to background/inactive — switch to slow poll
        startPoll(POLL_BG_MS);
      }
    });

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      if (endingTimerRef.current) clearInterval(endingTimerRef.current);
      sub.remove();
    };
  }, [isLoggedIn, isGuest, user?.id]);
}
