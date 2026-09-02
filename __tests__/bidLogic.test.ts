import {
  isBidWinning,
  getHighestBid,
  getMyHighestBidAmount,
  calculateOrderDeadline,
  isOrderExpired,
  classifyNotificationType,
} from "../utils/helpers/bidLogic";

describe("isBidWinning", () => {
  test("ราคาเราเท่ากับราคาปัจจุบัน ถือว่ากำลังนำอยู่", () => {
    expect(isBidWinning(1000, 1000)).toBe(true);
  });
  test("ราคาเราสูงกว่าราคาปัจจุบัน ถือว่านำอยู่", () => {
    expect(isBidWinning(1500, 1000)).toBe(true);
  });
  test("ราคาเราต่ำกว่าราคาปัจจุบัน ถือว่าไม่ได้นำ", () => {
    expect(isBidWinning(900, 1000)).toBe(false);
  });
});

describe("getHighestBid", () => {
  test("รายการว่าง ต้องคืนค่า null", () => {
    expect(getHighestBid([])).toBeNull();
  });
  test("มี bid เดียว ต้องคืน bid นั้น", () => {
    const bids = [{ price: "500", user_id: 1 }];
    expect(getHighestBid(bids)).toEqual(bids[0]);
  });
  test("หลาย bid ต้องเลือกตัวที่ราคาสูงสุด", () => {
    const bids = [
      { price: "500", user_id: 1 },
      { price: "1200", user_id: 2 },
      { price: "900", user_id: 3 },
    ];
    expect(getHighestBid(bids)?.price).toBe("1200");
  });
  test("ราคาเท่ากันเป๊ะ (tie) ต้องเลือกตัวแรกที่เจอ", () => {
    const bids = [
      { price: "1000", user_id: 1 },
      { price: "1000", user_id: 2 },
    ];
    expect(getHighestBid(bids)?.user_id).toBe(1);
  });
});

describe("getMyHighestBidAmount", () => {
  const bids = [
    { price: "500", user_id: 1 },
    { price: "1200", user_id: 2 },
    { price: "800", user_id: 1 },
  ];
  test("ไม่มี bid ของ user นี้เลย ต้องได้ 0", () => {
    expect(getMyHighestBidAmount(bids, 99)).toBe(0);
  });
  test("มีหลาย bid ของเรา ต้องเลือกตัวสูงสุด", () => {
    expect(getMyHighestBidAmount(bids, 1)).toBe(800);
  });
  test("ต้องกรองเฉพาะ bid ของ user ที่ระบุ ไม่ปนของคนอื่น", () => {
    expect(getMyHighestBidAmount(bids, 2)).toBe(1200);
  });
});

describe("calculateOrderDeadline", () => {
  test("default ต้องบวก 24 ชั่วโมงจากเวลาที่ประมูลจบ", () => {
    const ended = "2026-01-01T10:00:00.000Z";
    const deadline = calculateOrderDeadline(ended);
    expect(deadline.toISOString()).toBe("2026-01-02T10:00:00.000Z");
  });
  test("ปรับจำนวนชั่วโมงเองได้ผ่าน parameter", () => {
    const ended = "2026-01-01T10:00:00.000Z";
    const deadline = calculateOrderDeadline(ended, 48);
    expect(deadline.toISOString()).toBe("2026-01-03T10:00:00.000Z");
  });
});

describe("isOrderExpired", () => {
  const now = new Date("2026-01-05T00:00:00.000Z");
  test("deadline ผ่านมาแล้ว ต้องถือว่าหมดเวลา", () => {
    const deadline = new Date("2026-01-01T00:00:00.000Z");
    expect(isOrderExpired(deadline, now)).toBe(true);
  });
  test("deadline ยังไม่ถึง ต้องถือว่ายังไม่หมดเวลา", () => {
    const deadline = new Date("2026-01-10T00:00:00.000Z");
    expect(isOrderExpired(deadline, now)).toBe(false);
  });
  test("deadline เท่ากับเวลาปัจจุบันเป๊ะ ต้องถือว่ายังไม่หมดเวลา (ไม่ใช้ <=)", () => {
    expect(isOrderExpired(now, now)).toBe(false);
  });
});

describe("classifyNotificationType", () => {
  const cases: [string, string | null][] = [
    ["outbid", "outbid"],
    ["out_bid", "outbid"],
    ["overbid", "outbid"],
    ["won", "won"],
    ["auction_won", "won"],
    ["auction_lost", "lost"],
    ["buynow_lost", "buynow_lost"],
    ["buynow_purchased", "buynow_success"],
    ["new_bid", "new_bid"],
    ["bid_placed", "new_bid"],
    ["deposit", "deposit"],
    ["top_up", "deposit"],
    ["withdraw", "withdraw"],
    ["ending_soon", "ending_soon"],
    ["approved", "approved"],
    ["product_rejected", "rejected"],
    ["order_confirmed", "buyer_confirmed"],
    ["order_shipped", "seller_shipped"],
    ["order_completed", "order_completed"],
    ["order_disputed", "disputed"],
    ["order_cancelled", "cancelled"],
    ["report_submitted", "report_pending"],
    ["report_under_review", "report_reviewing"],
    ["report_closed", "report_resolved"],
  ];

  test.each(cases)("type '%s' ต้องจำแนกเป็น '%s'", (input, expected) => {
    expect(classifyNotificationType(input)).toBe(expected);
  });

  test("type ที่ไม่รู้จักเลย ต้องคืนค่า null", () => {
    expect(classifyNotificationType("some_random_unknown_type")).toBeNull();
  });

  test("string ว่าง ต้องคืนค่า null", () => {
    expect(classifyNotificationType("")).toBeNull();
  });

  test("ต้องไม่สนตัวพิมพ์เล็ก-ใหญ่ (case-insensitive)", () => {
    expect(classifyNotificationType("OUTBID")).toBe("outbid");
  });
});
