// ============================================================
// 🔌 BidKhong API — Central Export
// ============================================================
//
// วิธีใช้งาน:
//
//   import { apiService } from "@/utils/api";
//
//   // Login
//   const { user, tokens } = await apiService.auth.login({ email, password });
//
//   // Get auctions
//   const hotAuctions = await apiService.auction.getAuctions({ type: "hot" });
//
//   // Place bid
//   await apiService.bid.placeBid({ auctionId: "xxx", amount: 5000 });
//
// ============================================================

export { default as apiService } from "./apiService";

// Config & Helpers
export {
    ENDPOINTS,
    default as apiClient,
    getFullImageUrl,
    handleApiError,
    tokenManager
} from "./config";
export type { ApiError, ApiResponse, PaginatedResponse } from "./config";

// Shared Types
export type {
    ActiveBid,
    AdminIncomingProduct,
    AdminReplyRequest,
    AdminReport,
    AdminReportPriority,
    AdminStats,
    AdminUpdateReportStatusRequest,
    Auction,
    AuctionDetail,
    AuctionListType,
    AuctionStatus,
    AuthTokens,
    BidHistoryEntry,
    BidStats,
    BidStatus,
    BuyNowRequest,
    Category,
    CategoryProduct,
    ChangePasswordRequest,
    CreateAuctionRequest,
    DisputeOrderRequest,
    EvidenceImage,
    FAQ,
    ForgotPasswordRequest,
    HistoryBid,
    HistoryStats,
    LoginRequest,
    LoginResponse,
    MyOrdersResponse,
    MyReportsResponse,
    Order,
    OrderBuyer,
    OrderDetailResponse,
    OrderProduct,
    OrderSeller,
    OrderStatus,
    PlaceBidRequest,
    Product,
    ProductImage,
    ProductPaginatedResponse,
    ProductStatus,
    ProductTag,
    RegisterRequest,
    ReportStatus,
    ReportTimeline,
    ReportType,
    ResetPasswordRequest,
    SearchResult,
    Subcategory,
    SubmitReportRequest,
    TopUpRequest,
    Transaction,
    TransactionFilter,
    TransactionStatus,
    TransactionType,
    TrendingTag,
    UpdateProfileRequest,
    UploadResponse,
    User,
    UserReport,
    UserWallet,
    WalletBalance,
    WithdrawRequest,
    WonProduct,
    WonProductStatus
} from "./types";

