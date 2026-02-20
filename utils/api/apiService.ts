import apiClient, {
    ApiResponse,
    ENDPOINTS,
    PaginatedResponse,
    handleApiError,
    tokenManager,
} from "./config";
import {
    ActiveBid,
    AdminIncomingProduct,
    AdminReplyRequest,
    AdminReport,
    AdminStats,
    AdminUpdateReportStatusRequest,
    Auction,
    AuctionDetail,
    AuctionListType,
    BidHistoryEntry,
    BidStats,
    BuyNowRequest,
    Category,
    CategoryProduct,
    ChangePasswordRequest,
    CreateAuctionRequest,
    FAQ,
    ForgotPasswordRequest,
    HistoryBid,
    HistoryStats,
    LoginRequest,
    LoginResponse,
    PlaceBidRequest,
    Product,
    ProductPaginatedResponse,
    RegisterRequest,
    ReportStatus,
    ResetPasswordRequest,
    SearchResult,
    Subcategory,
    SubmitReportRequest,
    TopUpRequest,
    Transaction,
    TransactionFilter,
    TrendingTag,
    UpdateProfileRequest,
    UploadResponse,
    User,
    UserReport,
    WalletBalance,
    WithdrawRequest,
    WonProduct,
} from "./types";

// ============================================================
// 🔌 BidKhong API Service — รวมทุก API ไว้ในไฟล์เดียว
// ============================================================
//
// วิธีใช้งาน:
//   import { apiService } from "@/utils/api";
//
//   const { user } = await apiService.auth.login({ email, password });
//   const auctions = await apiService.auction.getAuctions({ type: "hot" });
//   await apiService.bid.placeBid({ auctionId: "xxx", amount: 5000 });
//
// ============================================================

const apiService = {
  // ════════════════════════════════════════════════════════
  // 🔐 Auth
  // ════════════════════════════════════════════════════════
  auth: {
    login: async (data: LoginRequest): Promise<LoginResponse> => {
      try {
        const response = await apiClient.post<LoginResponse>(
          ENDPOINTS.AUTH.LOGIN,
          data,
        );

        const { user, token } = response.data;

        // เก็บ token ถ้า API ส่งมา
        if (token) {
          await tokenManager.setToken(token);
        }

        // เก็บ user data ไว้ใน AsyncStorage
        const AsyncStorage =
          require("@react-native-async-storage/async-storage").default;
        await AsyncStorage.setItem("userData", JSON.stringify(user));

        return { user, token };
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },

    register: async (data: RegisterRequest): Promise<LoginResponse> => {
      try {
        // สมัครสมาชิก
        const response = await apiClient.post<{ user: User }>(
          ENDPOINTS.AUTH.REGISTER,
          data,
        );

        const { user } = response.data;

        // สมัครเสร็จ → login อัตโนมัติเพื่อรับ token
        const loginResult = await apiService.auth.login({
          email: data.email,
          password: data.password,
        });

        return loginResult;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },

    getMe: async (): Promise<User> => {
      try {
        const response = await apiClient.get<ApiResponse<User>>(
          ENDPOINTS.AUTH.ME,
        );
        return response.data.data;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },

    verifyToken: async (): Promise<boolean> => {
      try {
        const token = await tokenManager.getToken();
        if (!token) return false;
        await apiClient.get(ENDPOINTS.AUTH.VERIFY);
        return true;
      } catch {
        return false;
      }
    },

    logout: async (): Promise<void> => {
      try {
        await apiClient.post(ENDPOINTS.AUTH.LOGOUT);
      } catch {
        // ลบ token ฝั่ง client อยู่ดี
      } finally {
        await tokenManager.clearTokens();
      }
    },

    updateProfile: async (data: UpdateProfileRequest): Promise<User> => {
      try {
        const response = await apiClient.patch<{ user: User }>(
          ENDPOINTS.AUTH.PROFILE,
          data,
        );
        return response.data.user;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },

    changePassword: async (data: ChangePasswordRequest): Promise<void> => {
      try {
        await apiClient.put(ENDPOINTS.AUTH.CHANGE_PASSWORD, data);
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },

    forgotPassword: async (
      data: ForgotPasswordRequest,
    ): Promise<{ message: string }> => {
      try {
        const response = await apiClient.post<{ message: string }>(
          ENDPOINTS.AUTH.FORGOT_PASSWORD,
          data,
        );
        return response.data;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },

    resetPassword: async (
      data: ResetPasswordRequest,
    ): Promise<{ message: string }> => {
      try {
        const response = await apiClient.post<{ message: string }>(
          ENDPOINTS.AUTH.RESET_PASSWORD,
          data,
        );
        return response.data;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },

    uploadProfileImage: async (uri: string): Promise<string> => {
      try {
        const formData = new FormData();
        const fileExtension = uri.split(".").pop() || "jpg";
        const file = {
          uri,
          name: `profile_${Date.now()}.${fileExtension}`,
          type: `image/${fileExtension === "jpg" ? "jpeg" : fileExtension}`,
        } as unknown as Blob;

        formData.append("profile_image", file);

        const response = await apiClient.post<{
          message: string;
          profile_image: string;
        }>(ENDPOINTS.AUTH.PROFILE_IMAGE, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        return response.data.profile_image;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },
  },

  // ════════════════════════════════════════════════════════
  // 🏷️ Auction
  // ════════════════════════════════════════════════════════
  auction: {
    getAuctions: async (params: {
      type: AuctionListType;
      page?: number;
      limit?: number;
    }): Promise<PaginatedResponse<Auction>> => {
      try {
        const response = await apiClient.get<PaginatedResponse<Auction>>(
          ENDPOINTS.AUCTION.LIST,
          { params },
        );
        return response.data;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },

    getAuctionDetail: async (id: string): Promise<AuctionDetail> => {
      try {
        const response = await apiClient.get<ApiResponse<AuctionDetail>>(
          ENDPOINTS.AUCTION.DETAIL(id),
        );
        return response.data.data;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },

    createAuction: async (data: CreateAuctionRequest): Promise<Auction> => {
      try {
        const response = await apiClient.post<ApiResponse<Auction>>(
          ENDPOINTS.AUCTION.CREATE,
          data,
        );
        return response.data.data;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },

    getAuctionBidHistory: async (
      auctionId: string,
      params?: { page?: number; limit?: number },
    ): Promise<PaginatedResponse<BidHistoryEntry>> => {
      try {
        const response = await apiClient.get<
          PaginatedResponse<BidHistoryEntry>
        >(ENDPOINTS.AUCTION.BID_HISTORY(auctionId), { params });
        return response.data;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },
  },

  // ════════════════════════════════════════════════════════
  // 💰 Bid
  // ════════════════════════════════════════════════════════
  bid: {
    placeBid: async (
      data: PlaceBidRequest,
    ): Promise<{ success: boolean; currentBid: number }> => {
      try {
        const response = await apiClient.post<
          ApiResponse<{ success: boolean; currentBid: number }>
        >(ENDPOINTS.BID.PLACE, data);
        return response.data.data;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },

    buyNow: async (data: BuyNowRequest): Promise<{ success: boolean }> => {
      try {
        const response = await apiClient.post<
          ApiResponse<{ success: boolean }>
        >(ENDPOINTS.BID.BUY_NOW, data);
        return response.data.data;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },

    getActiveBids: async (): Promise<{
      bids: ActiveBid[];
      stats: BidStats;
    }> => {
      try {
        const response = await apiClient.get<
          ApiResponse<{ bids: ActiveBid[]; stats: BidStats }>
        >(ENDPOINTS.BID.ACTIVE);
        return response.data.data;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },

    getHistoryBids: async (): Promise<{
      bids: HistoryBid[];
      stats: HistoryStats;
    }> => {
      try {
        const response = await apiClient.get<
          ApiResponse<{ bids: HistoryBid[]; stats: HistoryStats }>
        >(ENDPOINTS.BID.HISTORY);
        return response.data.data;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },

    getBidStats: async (): Promise<BidStats & HistoryStats> => {
      try {
        const response = await apiClient.get<
          ApiResponse<BidStats & HistoryStats>
        >(ENDPOINTS.BID.STATS);
        return response.data.data;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },

    getWonProducts: async (): Promise<WonProduct[]> => {
      try {
        const response = await apiClient.get<ApiResponse<WonProduct[]>>(
          ENDPOINTS.BID.WON,
        );
        return response.data.data;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },

    verifyWonProduct: async (wonProductId: string): Promise<WonProduct> => {
      try {
        const response = await apiClient.put<ApiResponse<WonProduct>>(
          ENDPOINTS.BID.VERIFY(wonProductId),
        );
        return response.data.data;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },

    markAsReceived: async (wonProductId: string): Promise<WonProduct> => {
      try {
        const response = await apiClient.put<ApiResponse<WonProduct>>(
          ENDPOINTS.BID.RECEIVED(wonProductId),
        );
        return response.data.data;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },
  },

  // ════════════════════════════════════════════════════════
  // 💳 Wallet
  // ════════════════════════════════════════════════════════
  wallet: {
    getBalance: async (): Promise<WalletBalance> => {
      try {
        const response = await apiClient.get<ApiResponse<WalletBalance>>(
          ENDPOINTS.WALLET.BALANCE,
        );
        return response.data.data;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },

    getTransactions: async (
      filter?: TransactionFilter,
    ): Promise<PaginatedResponse<Transaction>> => {
      try {
        const response = await apiClient.get<PaginatedResponse<Transaction>>(
          ENDPOINTS.WALLET.TRANSACTIONS,
          { params: filter },
        );
        return response.data;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },

    topUp: async (
      data: TopUpRequest,
    ): Promise<{ transaction: Transaction; newBalance: WalletBalance }> => {
      try {
        const response = await apiClient.post<
          ApiResponse<{ transaction: Transaction; newBalance: WalletBalance }>
        >(ENDPOINTS.WALLET.TOPUP, data);
        return response.data.data;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },

    withdraw: async (
      data: WithdrawRequest,
    ): Promise<{ transaction: Transaction; newBalance: WalletBalance }> => {
      try {
        const response = await apiClient.post<
          ApiResponse<{ transaction: Transaction; newBalance: WalletBalance }>
        >(ENDPOINTS.WALLET.WITHDRAW, data);
        return response.data.data;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },
  },

  // ════════════════════════════════════════════════════════
  // � Product
  // ════════════════════════════════════════════════════════
  product: {
    /** GET /products — ดึงสินค้าทั้งหมด (รองรับ filter ด้วย tag, category_id, subcategory_id) */
    getProducts: async (params?: {
      tag?: string;
      category_id?: number;
      subcategory_id?: number;
      page?: number;
      per_page?: number;
      status?: string;
    }): Promise<ProductPaginatedResponse> => {
      try {
        const response = await apiClient.get<ProductPaginatedResponse>(
          ENDPOINTS.PRODUCT.LIST,
          { params },
        );
        return response.data;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },

    /** GET /products/:id — ดึงสินค้าชิ้นเดียว */
    getProduct: async (id: number): Promise<Product> => {
      try {
        const response = await apiClient.get<Product>(
          ENDPOINTS.PRODUCT.DETAIL(id),
        );
        return response.data;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },

    /** POST /products — สร้างสินค้าประมูลใหม่ (ส่งเป็น form-data เพราะมีไฟล์รูป) */
    createProduct: async (data: {
      name: string;
      description: string;
      starting_price: string;
      bid_increment: string;
      buyout_price: string;
      auction_start_time: string;
      auction_end_time: string;
      category_id: number;
      subcategory_id: number;
      location: string;
      picture?: string;
      images?: string[];
    }): Promise<Product> => {
      try {
        const formData = new FormData();
        formData.append("name", data.name);
        formData.append("description", data.description);
        formData.append("starting_price", data.starting_price);
        formData.append("bid_increment", data.bid_increment);
        formData.append("buyout_price", data.buyout_price);
        formData.append("auction_start_time", data.auction_start_time);
        formData.append("auction_end_time", data.auction_end_time);
        formData.append("category_id", data.category_id.toString());
        formData.append("subcategory_id", data.subcategory_id.toString());
        formData.append("location", data.location);

        // แนบรูปหลัก (picture)
        if (data.picture) {
          const picUri = data.picture;
          const picName = picUri.split("/").pop() || "picture.jpg";
          const picType = picName.endsWith(".png") ? "image/png" : "image/jpeg";
          formData.append("picture", {
            uri: picUri,
            name: picName,
            type: picType,
          } as any);
        }

        // แนบรูปเพิ่มเติม (images[])
        if (data.images && data.images.length > 0) {
          data.images.forEach((uri) => {
            const imgName = uri.split("/").pop() || "image.jpg";
            const imgType = imgName.endsWith(".png")
              ? "image/png"
              : "image/jpeg";
            formData.append("images[]", {
              uri,
              name: imgName,
              type: imgType,
            } as any);
          });
        }

        const response = await apiClient.post<Product>(
          ENDPOINTS.PRODUCT.CREATE,
          formData,
          {
            headers: { "Content-Type": "multipart/form-data" },
          },
        );
        return response.data;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },
  },

  // ════════════════════════════════════════════════════════
  // �📂 Category
  // ════════════════════════════════════════════════════════
  category: {
    /** GET /categories — ดึง category ทั้งหมดพร้อม subcategories */
    getCategories: async (): Promise<Category[]> => {
      try {
        const response = await apiClient.get<Category[]>(
          ENDPOINTS.CATEGORY.LIST,
        );
        return response.data;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },

    /** GET /categories/:id — ดึง category เดียวพร้อม subcategories */
    getCategory: async (id: number): Promise<Category> => {
      try {
        const response = await apiClient.get<Category>(
          ENDPOINTS.CATEGORY.DETAIL(id),
        );
        return response.data;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },

    /** GET /subcategories — ดึง subcategory ทั้งหมดพร้อม parent category */
    getAllSubcategories: async (): Promise<Subcategory[]> => {
      try {
        const response = await apiClient.get<Subcategory[]>(
          ENDPOINTS.CATEGORY.ALL_SUBCATEGORIES,
        );
        return response.data;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },

    getSubcategories: async (categoryId: string): Promise<Subcategory[]> => {
      try {
        const response = await apiClient.get<ApiResponse<Subcategory[]>>(
          ENDPOINTS.CATEGORY.SUBCATEGORIES(categoryId),
        );
        return response.data.data;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },

    getCategoryProducts: async (
      categoryId: string,
      params?: {
        subcategoryId?: string;
        page?: number;
        limit?: number;
        search?: string;
      },
    ): Promise<PaginatedResponse<CategoryProduct>> => {
      try {
        const response = await apiClient.get<
          PaginatedResponse<CategoryProduct>
        >(ENDPOINTS.CATEGORY.PRODUCTS(categoryId), {
          params: {
            sub: params?.subcategoryId,
            page: params?.page,
            limit: params?.limit,
            search: params?.search,
          },
        });
        return response.data;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },
  },

  // ════════════════════════════════════════════════════════
  // 🔍 Search
  // ════════════════════════════════════════════════════════
  search: {
    search: async (params: {
      q: string;
      page?: number;
      limit?: number;
      categoryId?: string;
      minPrice?: number;
      maxPrice?: number;
      sortBy?:
        | "relevance"
        | "price_asc"
        | "price_desc"
        | "ending_soon"
        | "newest";
    }): Promise<PaginatedResponse<SearchResult>> => {
      try {
        const response = await apiClient.get<PaginatedResponse<SearchResult>>(
          ENDPOINTS.SEARCH.QUERY,
          { params },
        );
        return response.data;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },

    getRecentSearches: async (): Promise<string[]> => {
      try {
        const response = await apiClient.get<ApiResponse<string[]>>(
          ENDPOINTS.SEARCH.RECENT,
        );
        return response.data.data;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },

    clearRecentSearches: async (): Promise<void> => {
      try {
        await apiClient.delete(ENDPOINTS.SEARCH.RECENT);
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },

    getTrendingTags: async (): Promise<TrendingTag[]> => {
      try {
        const response = await apiClient.get<ApiResponse<TrendingTag[]>>(
          ENDPOINTS.SEARCH.TRENDING,
        );
        return response.data.data;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },
  },

  // ════════════════════════════════════════════════════════
  // 🛟 Report / Support
  // ════════════════════════════════════════════════════════
  report: {
    getFAQs: async (): Promise<FAQ[]> => {
      try {
        const response = await apiClient.get<ApiResponse<FAQ[]>>(
          ENDPOINTS.REPORT.FAQ,
        );
        return response.data.data;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },

    submitReport: async (data: SubmitReportRequest): Promise<UserReport> => {
      try {
        const response = await apiClient.post<ApiResponse<UserReport>>(
          ENDPOINTS.REPORT.SUBMIT,
          data,
        );
        return response.data.data;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },

    getMyReports: async (): Promise<UserReport[]> => {
      try {
        const response = await apiClient.get<ApiResponse<UserReport[]>>(
          ENDPOINTS.REPORT.MINE,
        );
        return response.data.data;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },

    getReportDetail: async (reportId: string): Promise<UserReport> => {
      try {
        const response = await apiClient.get<ApiResponse<UserReport>>(
          ENDPOINTS.REPORT.DETAIL(reportId),
        );
        return response.data.data;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },
  },

  // ════════════════════════════════════════════════════════
  // 🛡️ Admin
  // ════════════════════════════════════════════════════════
  admin: {
    getStats: async (): Promise<AdminStats> => {
      try {
        const response = await apiClient.get<ApiResponse<AdminStats>>(
          ENDPOINTS.ADMIN.STATS,
        );
        return response.data.data;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },

    getIncomingProducts: async (params?: {
      page?: number;
      limit?: number;
    }): Promise<PaginatedResponse<AdminIncomingProduct>> => {
      try {
        const response = await apiClient.get<
          PaginatedResponse<AdminIncomingProduct>
        >(ENDPOINTS.ADMIN.INCOMING, { params });
        return response.data;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },

    approveProduct: async (productId: string): Promise<void> => {
      try {
        await apiClient.put(ENDPOINTS.ADMIN.APPROVE(productId));
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },

    rejectProduct: async (
      productId: string,
      reason?: string,
    ): Promise<void> => {
      try {
        await apiClient.delete(ENDPOINTS.ADMIN.REJECT(productId), {
          data: { reason },
        });
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },

    getReports: async (params?: {
      status?: ReportStatus;
      priority?: string;
      page?: number;
      limit?: number;
    }): Promise<PaginatedResponse<AdminReport>> => {
      try {
        const response = await apiClient.get<PaginatedResponse<AdminReport>>(
          ENDPOINTS.ADMIN.REPORTS,
          { params },
        );
        return response.data;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },

    updateReportStatus: async (
      data: AdminUpdateReportStatusRequest,
    ): Promise<AdminReport> => {
      try {
        const response = await apiClient.put<ApiResponse<AdminReport>>(
          ENDPOINTS.ADMIN.REPORT_STATUS(data.reportId),
          { status: data.status },
        );
        return response.data.data;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },

    replyToReport: async (data: AdminReplyRequest): Promise<AdminReport> => {
      try {
        const response = await apiClient.post<ApiResponse<AdminReport>>(
          ENDPOINTS.ADMIN.REPORT_REPLY(data.reportId),
          { reply: data.reply },
        );
        return response.data.data;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },
  },

  // ════════════════════════════════════════════════════════
  // 📸 Upload
  // ════════════════════════════════════════════════════════
  upload: {
    uploadImage: async (
      uri: string,
      filename?: string,
      type?: string,
    ): Promise<UploadResponse> => {
      try {
        const formData = new FormData();
        const fileExtension = uri.split(".").pop() || "jpg";
        const file = {
          uri,
          name: filename || `photo_${Date.now()}.${fileExtension}`,
          type:
            type || `image/${fileExtension === "jpg" ? "jpeg" : fileExtension}`,
        } as unknown as Blob;

        formData.append("image", file);

        const response = await apiClient.post<{
          success: boolean;
          data: UploadResponse;
        }>(ENDPOINTS.UPLOAD.IMAGE, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data.data;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },

    uploadMultipleImages: async (
      images: Array<{ uri: string; filename?: string; type?: string }>,
    ): Promise<UploadResponse[]> => {
      try {
        const formData = new FormData();
        images.forEach((img, index) => {
          const fileExtension = img.uri.split(".").pop() || "jpg";
          const file = {
            uri: img.uri,
            name:
              img.filename || `photo_${Date.now()}_${index}.${fileExtension}`,
            type:
              img.type ||
              `image/${fileExtension === "jpg" ? "jpeg" : fileExtension}`,
          } as unknown as Blob;
          formData.append("images", file);
        });

        const response = await apiClient.post<{
          success: boolean;
          data: UploadResponse[];
        }>(ENDPOINTS.UPLOAD.IMAGES, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        return response.data.data;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },
  },
};

export default apiService;
