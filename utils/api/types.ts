// ============================================================
// 📋 Shared Types — ใช้ร่วมกันทั้ง App
// ============================================================

// ─── Auth ─────────────────────────────────────────────────────

export interface UserWallet {
  id: number;
  user_id: number;
  balance_available: string;
  balance_total: string;
  balance_pending: string;
  withdraw: string;
  deposit: string;
  w_time: string | null;
  created_at: string;
  updated_at: string;
}

export interface User {
  id: number;
  name: string;
  email: string;
  phone_number: string | null;
  email_verified_at: string | null;
  join_date: string;
  role: "admin" | "user";
  profile_image: string | null;
  created_at: string;
  updated_at: string;
  wallet?: UserWallet;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken?: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token?: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  phone_number: string;
}

export interface UpdateProfileRequest {
  name?: string;
  email?: string;
  phone_number?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  token: string;
  password: string;
}

// ─── Product (จาก API /products) ─────────────────────────────

export type ProductTag = "hot" | "ending" | "incoming" | "default";
export type ProductStatus = "active" | "ended" | "pending";

export interface ProductImage {
  id: number;
  product_id: number;
  image_url: string;
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: number;
  user_id: number;
  category_id: number;
  subcategory_id: number;
  name: string;
  description: string;
  location: string;
  picture: string | null;
  starting_price: string;
  min_price: string;
  bid_increment: string;
  buyout_price: string;
  current_price: string;
  auction_start_time: string;
  auction_end_time: string;
  image_url: string | null;
  status: ProductStatus;
  created_at: string;
  updated_at: string;
  bids_count: number;
  tag: ProductTag;
  images: ProductImage[];
  // Relations (populated when included)
  category?: import("./types").Category;
  subcategory?: import("./types").Subcategory;
  user?: import("./types").User;
}

export interface ProductPaginatedResponse {
  current_page: number;
  data: Product[];
  first_page_url: string;
  from: number | null;
  last_page: number;
  last_page_url: string;
  next_page_url: string | null;
  path: string;
  per_page: number;
  prev_page_url: string | null;
  to: number | null;
  total: number;
}

// ─── Auction / Product (legacy) ──────────────────────────────

export type AuctionStatus = "incoming" | "active" | "ending" | "ended";
export type AuctionListType = "hot" | "ending" | "incoming";

export interface Auction {
  id: string;
  title: string;
  description: string;
  images: string[];
  categoryId: string;
  subcategoryId?: string;
  sellerId: string;
  sellerName: string;
  sellerAvatar?: string;
  startingBid: number;
  currentBid: number;
  buyNowPrice?: number;
  minBidIncrement: number;
  totalBids: number;
  startTime: string;
  endTime: string;
  timeRemaining?: string;
  location?: string;
  tags?: string[];
  status: AuctionStatus;
  isIncoming?: boolean;
  createdAt: string;
}

export interface AuctionDetail extends Auction {
  biddingHistory: BidHistoryEntry[];
  auctionInfo: {
    ends: string;
    timeRemaining: string;
    startingBid: number;
    location: string;
  };
}

export interface CreateAuctionRequest {
  title: string;
  description: string;
  categoryId: string;
  subcategoryId?: string;
  startingBid: number;
  buyNowPrice?: number;
  minBidIncrement: number;
  duration: number; // in days
  location?: string;
  images: string[]; // uploaded image URLs
}

// ─── Bid ─────────────────────────────────────────────────────

export type BidStatus = "Winning" | "Outbid" | "Won" | "Lost";

export interface BidHistoryEntry {
  id: string;
  bidderId: string;
  bidderName: string;
  bidderAvatar?: string;
  amount: number;
  timestamp: string;
}

export interface ActiveBid {
  id: string;
  auctionId: string;
  title: string;
  image: string;
  currentBid: number;
  myBid: number;
  timeLeft: string;
  totalBids: number;
  status: "Winning" | "Outbid";
}

export interface HistoryBid {
  id: string;
  auctionId: string;
  title: string;
  image: string;
  finalPrice: number;
  myBid: number;
  endDate: string;
  totalBids: number;
  status: "Won" | "Lost";
}

export interface BidStats {
  totalBids: number;
  outbid: number;
  winning: number;
}

export interface HistoryStats {
  total: number;
  won: number;
  lost: number;
}

export interface PlaceBidRequest {
  auctionId: string;
  amount: number;
}

export interface BuyNowRequest {
  auctionId: string;
}

// ─── Won Product / Verification ──────────────────────────────

export type WonProductStatus = "won" | "verified" | "received";

export interface WonProduct {
  id: string;
  auctionId: string;
  title: string;
  image: string;
  finalPrice: number;
  wonAt: string;
  seller: {
    name: string;
    phone?: string;
    email?: string;
  };
  status: WonProductStatus;
  verifiedAt?: string;
  receivedAt?: string;
  expiresAt?: string; // 24hr deadline for verification
}

// ─── Wallet ──────────────────────────────────────────────────

export interface WalletBalance {
  total: number;
  available: number;
  pending: number;
}

export type TransactionType = "deposit" | "withdraw" | "bid" | "won" | "refund";
export type TransactionStatus = "completed" | "pending" | "failed";

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  description: string;
  status: TransactionStatus;
  date: string;
  reference?: string;
}

export interface TopUpRequest {
  amount: number;
  method: "promptpay" | "card" | "mobile_banking";
}

export interface WithdrawRequest {
  amount: number;
  bankCode: string;
  accountNumber: string;
  accountName: string;
}

export interface TransactionFilter {
  type?: TransactionType;
  status?: TransactionStatus;
  month?: number;
  year?: number;
  page?: number;
  limit?: number;
}

// ─── Category ────────────────────────────────────────────────

export interface Category {
  id: number;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  subcategories?: Subcategory[];
}

export interface Subcategory {
  id: number;
  category_id: number;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  category?: Category;
}

export interface CategoryProduct {
  id: string;
  title: string;
  image: string;
  currentBid: number;
  totalBids: number;
  timeLeft?: string;
  subcategoryId: string;
}

// ─── Search ──────────────────────────────────────────────────

export interface SearchResult {
  id: string;
  title: string;
  image: string;
  currentBid: number;
  totalBids: number;
  timeLeft?: string;
  status: AuctionStatus;
}

export interface TrendingTag {
  id: string;
  label: string;
  count?: number;
}

// ─── Report / Support ────────────────────────────────────────

export type ReportType =
  | "scam"
  | "fake_product"
  | "harassment"
  | "fraud"
  | "inappropriate_content"
  | "other";

export type ReportStatus = "pending" | "reviewing" | "resolved";

export interface FAQ {
  id: string;
  question: string;
  answer: string;
  order?: number;
}

export interface SubmitReportRequest {
  reported_user_id: string;
  reported_product_id?: string;
  type: ReportType;
  description: string;
}

export interface EvidenceImage {
  uri: string;
  name: string;
  type: string;
}

export interface ReportTimeline {
  status: string;
  label: string;
  date: string;
}

export interface UserReport {
  id: number;
  reporter_id: number;
  reported_user_id: number;
  reported_product_id?: number | null;
  order_id?: number | null;
  type: ReportType;
  description: string;
  status: ReportStatus;
  report_code: string;
  admin_note?: string | null;
  admin_reply?: string | null;
  admin_reply_at?: string | null;
  admin_reply_by?: number | null;
  resolved_at?: string | null;
  reviewing_at?: string | null;
  evidence_images?: string[] | null;
  timeline?: ReportTimeline[];
  reported_user?: { id: number; name: string };
  reported_product?: {
    id: number;
    name: string;
    tag?: string;
    is_certified?: boolean;
    certificate?: string | null;
  };
  replied_by?: any;
  created_at: string;
  updated_at: string;
}

export interface MyReportsResponse {
  summary: { pending: number; reviewing: number; resolved: number };
  reports: UserReport[];
}

// ─── Order (Post-Auction / Escrow) ───────────────────────────

export type OrderStatus =
  | "pending_confirmation"
  | "confirmed"
  | "shipped"
  | "completed"
  | "disputed"
  | "cancelled"
  | "expired";

export interface OrderSeller {
  id: number;
  name: string;
  email: string;
  phone_number: string | null;
  profile_image: string | null;
}

export interface OrderBuyer {
  id: number;
  name: string;
  email: string;
  phone_number: string | null;
  profile_image: string | null;
}

export interface OrderProduct {
  id: number;
  name: string;
  description?: string;
  picture: string | null;
  image_url?: string | null;
  images?: ProductImage[];
}

export interface Order {
  id: number;
  product_id: number;
  auction_id: number;
  buyer_id: number;
  seller_id: number;
  final_price: string;
  status: OrderStatus;
  confirmed_at: string | null;
  shipped_at: string | null;
  completed_at: string | null;
  disputed_at: string | null;
  cancelled_at: string | null;
  expired_at: string | null;
  deadline_at: string | null;
  dispute_reason: string | null;
  dispute_evidence_images: string[] | null;
  created_at: string;
  updated_at: string;
  product?: OrderProduct;
  seller?: OrderSeller;
  buyer?: OrderBuyer;
}

export interface OrderDetailResponse {
  order: Order;
}

export interface MyOrdersResponse {
  orders: Order[];
}

export interface DisputeOrderRequest {
  reason: string;
  evidence_images?: EvidenceImage[];
}

// ─── Admin ───────────────────────────────────────────────────

export interface AdminStats {
  totalUsers: number;
  totalRevenue: number;
  totalAuctions: number;
  pendingProducts: number;
  pendingReports: number;
}

export type AdminReportPriority = "low" | "medium" | "high" | "critical";

export interface AdminIncomingProduct {
  id: string;
  title: string;
  image: string;
  category: string;
  seller: string;
  sellerAvatar?: string;
  price: number;
  description: string;
  condition: string;
  submittedAt: string;
}

export interface AdminReport {
  id: string;
  userId: string;
  userName: string;
  userAvatar?: string;
  type: ReportType;
  title: string;
  description: string;
  priority: AdminReportPriority;
  status: ReportStatus;
  submittedAt: string;
  adminReply?: string;
  repliedAt?: string;
}

export interface AdminReplyRequest {
  reportId: string;
  reply: string;
}

export interface AdminUpdateReportStatusRequest {
  reportId: string;
  status: ReportStatus;
}

// ─── Upload ──────────────────────────────────────────────────

export interface UploadResponse {
  url: string;
  filename: string;
  size: number;
}
