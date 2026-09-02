import { useEffect, useRef } from "react";
import { AppState, AppStateStatus } from "react-native";
import { useAuth } from "../contexts/AuthContext";
import apiService from "../utils/api/apiService";
import { parseRemainingMs } from "../utils/helpers/bidTimeUtils";
import { classifyNotificationType } from "../utils/helpers/bidLogic";
import {
    sendAuctionLostNotification,
    sendBuyNowLostNotification,
    sendBuyNowSuccessNotification,
    sendDepositNotification,
    sendEndingSoonNotification,
    sendNewBidOnMyProductNotification,
    sendOrderBuyerConfirmedNotification,
    sendOrderCancelledNotification,
    sendOrderCompletedNotification,
    sendOrderDisputedNotification,
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
 * | lost / auction_lost  | แพ้ประมูล — ไม่ได้เป็นผู้เสนอราคาสูงสุดเมื่อหมดเวลา       |
 * | buynow_lost          | มีคนกด Buy Now สินค้าที่เราประมูลอยู่                       |
 * | buynow_purchased     | ซื้อสำเร็จผ่าน Buy Now                                      |
 * | new_bid / bid_placed | มีคนมาประมูลสินค้าที่เราลงขาย (ผู้ขาย)                     |
 * | deposit / top_up     | การเติมเงิน/ฝากเงินสำเร็จ                                   |
 * | withdraw / withdrawal| การถอนเงินสำเร็จ                                             |
 * | ending_soon (server) | server ส่ง ending_soon มา                                   |
 * | -(client-side)       | เหลือ ≤ 5 นาที — คำนวณเองจาก auction_end_time              |
 * | approved             | Admin อนุมัติสินค้าที่เราลงขาย                              |
 * | rejected             | Admin ปฏิเสธสินค้าที่เราลงขาย                               |
 * | disputed             | มีข้อพิพาทเกิดขึ้นในคำสั่งซื้อ                              |
 * | cancelled            | คำสั่งซื้อถูกยกเลิก                                         |
 */

// Foreground: poll every 5 s → near-real-time feel without hammering server
// Background: poll every 30 s → save battery
const POLL_FG_MS = 5_000;
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
  // Last time checkEndingSoon fetched data (throttle heavy API call)
  const lastEndingCheckRef = useRef(0);
  const ENDING_THROTTLE_MS = 120_000; // Don't re-fetch within 2 minutes

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
        const category = classifyNotificationType(n.type ?? "");
        const title = n.data?.product_title ?? n.title ?? "";
        const amount = n.data?.amount ?? "";
        const timeLeft = n.data?.time_left ?? "ไม่นาน";
        const reason = n.data?.reason ?? "";
        const productId = String(n.data?.product_id ?? n.data?.productId ?? "");

                // 1. ถูกตัดหน้า
        if (category === "outbid") {
          const bidderId = n.data?.bidder_id ?? n.data?.new_bidder_id ?? n.data?.bidder_user_id ?? n.data?.new_bid_user_id ?? null;
          if (bidderId !== null && Number(bidderId) === user?.id) {
            // เราบิดเพิ่มเองบน bid ของตัวเอง → ไม่ต้องแจ้งเตือน
          } else {
            sendOutbidNotification(title, productId).catch(() => {});
          }
        } else if (category === "won") {
          sendWonNotification(title, productId).catch(() => {});
        } else if (category === "lost") {
          sendAuctionLostNotification(title, productId).catch(() => {});
        } else if (category === "buynow_lost") {
          sendBuyNowLostNotification(title, productId).catch(() => {});
        } else if (category === "buynow_success") {
          sendBuyNowSuccessNotification(title, productId).catch(() => {});
        } else if (category === "new_bid") {
          sendNewBidOnMyProductNotification(title, amount, productId).catch(() => {});
        } else if (category === "deposit") {
          sendDepositNotification(amount || title).catch(() => {});
        } else if (category === "withdraw") {
          sendWithdrawNotification(amount || title).catch(() => {});
        } else if (category === "ending_soon") {
          sendEndingSoonNotification(title, timeLeft, productId).catch(() => {});
        } else if (category === "approved") {
          sendProductApprovedNotification(title, productId).catch(() => {});
        } else if (category === "rejected") {
          sendProductRejectedNotification(title, reason, productId).catch(() => {});
        } else if (category === "buyer_confirmed") {
          sendOrderBuyerConfirmedNotification(title, productId).catch(() => {});
        } else if (category === "seller_shipped") {
          sendOrderSellerShippedNotification(title, productId).catch(() => {});
        } else if (category === "order_completed") {
          sendOrderCompletedNotification(title, productId).catch(() => {});
        } else if (category === "disputed") {
          sendOrderDisputedNotification(title, productId).catch(() => {});
        } else if (category === "cancelled") {
          const cancelReason = n.data?.reason ?? "";
          sendOrderCancelledNotification(title, cancelReason, productId).catch(() => {});
        } else if (category === "report_pending") {
          sendReportPendingNotification().catch(() => {});
        } else if (category === "report_reviewing") {
          sendReportReviewingNotification().catch(() => {});
        } else if (category === "report_resolved") {
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
    // Throttle: skip if last check was < 2 minutes ago
    const now = Date.now();
    if (now - lastEndingCheckRef.current < ENDING_THROTTLE_MS) return;
    lastEndingCheckRef.current = now;
    try {
      const { activeBids } = await apiService.bid.getMyBidsConstructed(user.id);

      for (const bid of activeBids) {
        const tl = bid.timeLeft ?? "";

        // Parse remaining ms from "HH:MM:SS" or "Xd Yh Zm" format
        const remainingMs = parseRemainingMs(tl);

        const key = bid.auctionId;

        if (remainingMs <= ENDING_WARN_MS && remainingMs > 0) {
          if (!warnedEndingRef.current.has(key)) {
            warnedEndingRef.current.add(key);
            const mins = Math.ceil(remainingMs / 60_000);
            sendEndingSoonNotification(
              bid.title,
              `${mins} นาที`,
              bid.auctionId,
            ).catch(() => {});
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
