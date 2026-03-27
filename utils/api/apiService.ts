import axios from "axios";
import apiClient, {
    ApiResponse,
    BASE_URL,
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
    EvidenceImage,
    FAQ,
    ForgotPasswordRequest,
    HistoryBid,
    HistoryStats,
    LoginRequest,
    LoginResponse,
    Order,
    PlaceBidRequest,
    Product,
    ProductPaginatedResponse,
    RegisterRequest,
    ReportStatus,
    ResetPasswordRequest,
    SearchResult,
    Subcategory,
    SubmitReportRequest,
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

        const fullData = response.data as any;
        const { user, token } = fullData;

        // ถ้า backend ส่ง wallet มาแยกจาก user → merge เข้า user
        if (fullData.wallet && !user.wallet) {
          user.wallet = fullData.wallet;
        }

        // เก็บ token ถ้า API ส่งมา
        if (token) {
          await tokenManager.setToken(token);
        }

        // หลัง login สำเร็จ → เรียก /profile เพื่อตรวจสอบ ban status
        // (login response ไม่มี ban fields เพราะ backend เก็บใน user_strikes table)
        // /auth/me ไม่มี (404) → ใช้ /profile แทน
        try {
          const profileResponse = await apiClient.get(ENDPOINTS.AUTH.PROFILE);
          const profileData = profileResponse.data as any;
          const freshUser =
            profileData?.data || profileData?.user || profileData;
          if (freshUser) {
            // merge ban fields เข้า user object (ถ้า backend ส่งมา)
            if (freshUser.is_banned !== undefined)
              user.is_banned = freshUser.is_banned;
            if (freshUser.banned_until !== undefined)
              user.banned_until = freshUser.banned_until;
            if (freshUser.ban_reason !== undefined)
              user.ban_reason = freshUser.ban_reason;
            // บาง backend ส่ง strikes array มาใน profile
            if (freshUser.strikes?.length) {
              const activeStrike = freshUser.strikes.find(
                (s: any) => new Date(s.banned_until) > new Date(),
              );
              if (activeStrike) {
                user.is_banned = true;
                user.banned_until = activeStrike.banned_until;
                user.ban_reason = activeStrike.reason || "บัญชีของคุณถูกระงับ";
              }
            }
            // บาง backend ส่ง active_strike object เดี่ยว
            if (freshUser.active_strike) {
              user.is_banned = true;
              user.banned_until = freshUser.active_strike.banned_until;
              user.ban_reason =
                freshUser.active_strike.reason || "บัญชีของคุณถูกระงับ";
            }
          }
        } catch (profileError: any) {
          // ถ้า 403 → interceptor จะ emit "banned" event ให้ AuthContext จัดการแล้ว
          if (profileError?.response?.status === 403) {
            const errData = profileError.response?.data as any;
            user.is_banned = true;
            user.banned_until =
              errData?.banned_until || errData?.strike?.banned_until || null;
            user.ban_reason =
              errData?.reason ||
              errData?.ban_reason ||
              errData?.strike?.reason ||
              errData?.message ||
              "บัญชีของคุณถูกระงับ";
          }
          // ถ้า 404 = endpoint ไม่มี → ข้ามไป
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
        // ลอง /auth/me ก่อน
        const response = await apiClient.get<ApiResponse<User>>(
          ENDPOINTS.AUTH.ME,
        );
        return response.data.data;
      } catch {
        // ถ้า /auth/me ไม่มี (404) → ลอง /profile แทน
        try {
          const profileRes = await apiClient.get(ENDPOINTS.AUTH.PROFILE);
          const data = profileRes.data as any;
          return data?.data || data?.user || data;
        } catch (error) {
          throw new Error(handleApiError(error));
        }
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
    placeBid: async (data: PlaceBidRequest): Promise<any> => {
      try {
        const response = await apiClient.post(
          ENDPOINTS.BID.PLACE(data.productId),
          { price: data.price },
        );
        return response.data;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },

    buyNow: async (data: BuyNowRequest): Promise<any> => {
      try {
        const response = await apiClient.post(
          ENDPOINTS.BID.BUY_NOW(data.productId),
        );
        return response.data;
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

    /**
     * Construct "my bids" from GET /products + GET /products/:id/bids
     * since dedicated /bids/active and /bids/history endpoints don't exist.
     */
    getMyBidsConstructed: async (
      userId: number,
    ): Promise<{
      activeBids: ActiveBid[];
      historyBids: HistoryBid[];
      activeStats: BidStats;
      historyStats: HistoryStats;
    }> => {
      try {
        // 1. Fetch active products + completed products (BuyNow) in parallel
        const [activeRes, completedRes] = await Promise.all([
          apiClient.get<ProductPaginatedResponse>(ENDPOINTS.PRODUCT.LIST, {
            params: { per_page: 100 },
          }),
          apiClient
            .get<ProductPaginatedResponse>(ENDPOINTS.PRODUCT.LIST, {
              params: { per_page: 100, status: "completed" },
            })
            .catch(() => ({ data: { data: [] } as any })),
        ]);
        const activeProducts: Product[] = activeRes.data?.data ?? [];
        const completedProducts: Product[] = completedRes.data?.data ?? [];
        const products: Product[] = [...activeProducts, ...completedProducts];

        // 2. Filter products that have bids
        const productsWithBids = products.filter((p) => p.bids_count > 0);

        // 3. Fetch bids for each product in parallel
        const bidResults = await Promise.all(
          productsWithBids.map(async (product) => {
            try {
              const res = await apiClient.get(
                ENDPOINTS.PRODUCT.BIDS(product.id),
              );
              const data = res.data;
              const bids: any[] = Array.isArray(data)
                ? data
                : data?.data && Array.isArray(data.data)
                  ? data.data
                  : [];
              return { product, bids };
            } catch {
              return { product, bids: [] as any[] };
            }
          }),
        );

        // 4. Build ActiveBid[] and HistoryBid[]
        const activeBids: ActiveBid[] = [];
        const historyBids: HistoryBid[] = [];
        const now = new Date();

        for (const { product, bids } of bidResults) {
          // Filter bids belonging to this user
          const myBids = bids.filter((b: any) => Number(b.user_id) === userId);
          if (myBids.length === 0) continue;

          const highestMyBid = Math.max(
            ...myBids.map((b: any) => parseFloat(b.price)),
          );
          const currentPrice = parseFloat(product.current_price || "0");
          const auctionEnd = new Date(product.auction_end_time);
          const isEnded =
            auctionEnd < now ||
            product.status === "ended" ||
            product.status === "completed";
          const isWinning = highestMyBid >= currentPrice;

          const imageUrl =
            product.picture ||
            (product.images && product.images.length > 0
              ? product.images[0].image_url
              : "") ||
            "";

          if (isEnded) {
            historyBids.push({
              id: String(product.id),
              auctionId: String(product.id),
              title: product.name,
              image: imageUrl,
              finalPrice: currentPrice,
              myBid: highestMyBid,
              endDate: product.auction_end_time,
              totalBids: product.bids_count,
              status: isWinning ? "Won" : "Lost",
            });
          } else {
            activeBids.push({
              id: String(product.id),
              auctionId: String(product.id),
              title: product.name,
              image: imageUrl,
              currentBid: currentPrice,
              myBid: highestMyBid,
              timeLeft: product.auction_end_time,
              totalBids: product.bids_count,
              status: isWinning ? "Winning" : "Outbid",
              bidIncrement: parseFloat(product.bid_increment || "1"),
            });
          }
        }

        return {
          activeBids,
          historyBids,
          activeStats: {
            totalBids: activeBids.length,
            outbid: activeBids.filter((b) => b.status === "Outbid").length,
            winning: activeBids.filter((b) => b.status === "Winning").length,
          },
          historyStats: {
            total: historyBids.length,
            won: historyBids.filter((b) => b.status === "Won").length,
            lost: historyBids.filter((b) => b.status === "Lost").length,
          },
        };
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

    getTransactions: async (filter?: TransactionFilter): Promise<any[]> => {
      try {
        const response = await apiClient.get(ENDPOINTS.WALLET.TRANSACTIONS, {
          params: filter,
        });
        const data = response.data;
        if (Array.isArray(data)) return data;
        if (data?.data && Array.isArray(data.data)) return data.data;
        return [];
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },

    topUp: async (data: {
      amount: number;
      slipImageUri: string;
      slipMimeType?: string;
    }): Promise<{ transaction: Transaction; newBalance: WalletBalance }> => {
      try {
        const formData = new FormData();
        formData.append("amount", String(data.amount));
        const mimeType = data.slipMimeType || "image/jpeg";
        const ext = mimeType.split("/")[1] || "jpg";
        formData.append("slip_image", {
          uri: data.slipImageUri,
          type: mimeType,
          name: `slip.${ext}`,
        } as any);
        const response = await apiClient.post<
          ApiResponse<{ transaction: Transaction; newBalance: WalletBalance }>
        >(ENDPOINTS.WALLET.TOPUP, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
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

    /** GET /recommendations — AI แนะนำสินค้าเฉพาะ user */
    getRecommendations: async (limit: number = 10): Promise<Product[]> => {
      try {
        const response = await apiClient.get<{
          source: string;
          products: Product[];
        }>(ENDPOINTS.PRODUCT.RECOMMENDATIONS, { params: { limit } });
        return response.data?.products ?? [];
      } catch (error) {
        console.error(
          "Failed to fetch recommendations:",
          handleApiError(error),
        );
        return [];
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

    /** GET /products/:id/bids — ดึงประวัติการ bid */
    getProductBids: async (id: number): Promise<any[]> => {
      try {
        const response = await apiClient.get(ENDPOINTS.PRODUCT.BIDS(id));
        const data = response.data;
        if (Array.isArray(data)) return data;
        if (data?.data && Array.isArray(data.data)) return data.data;
        return [];
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },

    /** GET /my-products — ดึงสินค้าที่ผู้ใช้วางขาย */
    getMyProducts: async (): Promise<Product[]> => {
      try {
        const response = await apiClient.get<
          ProductPaginatedResponse | Product[]
        >(ENDPOINTS.PRODUCT.MY_PRODUCTS);
        // Handle both paginated and array responses
        if (Array.isArray(response.data)) {
          return response.data;
        }
        return (response.data as ProductPaginatedResponse).data || [];
      } catch (error) {
        console.warn("GET /my-products failed, will use fallback:", error);
        return [];
      }
    },

    /** ดึงสินค้าของผู้ขายรวมสินค้าที่ขายแล้ว (shipping/completed) */
    getMyProductsWithShipping: async (
      userId: number,
    ): Promise<{ allProducts: Product[]; shippingProducts: Product[] }> => {
      try {
        // Fetch from all sources in parallel (with fallbacks for each)
        const [myProducts, activeRes, pendingRes, completedRes, endedRes] =
          await Promise.all([
            apiService.product.getMyProducts(),
            apiClient
              .get<ProductPaginatedResponse>(ENDPOINTS.PRODUCT.LIST, {
                params: { per_page: 100, status: "active" },
              })
              .catch(() => ({ data: { data: [] } as any })),
            apiClient
              .get<ProductPaginatedResponse>(ENDPOINTS.PRODUCT.LIST, {
                params: { per_page: 100, status: "pending" },
              })
              .catch(() => ({ data: { data: [] } as any })),
            apiClient
              .get<ProductPaginatedResponse>(ENDPOINTS.PRODUCT.LIST, {
                params: { per_page: 100, status: "completed" },
              })
              .catch(() => ({ data: { data: [] } as any })),
            apiClient
              .get<ProductPaginatedResponse>(ENDPOINTS.PRODUCT.LIST, {
                params: { per_page: 100, status: "ended" },
              })
              .catch(() => ({ data: { data: [] } as any })),
          ]);

        // Filter products belonging to this seller from each status
        const activeProducts: Product[] = (activeRes.data?.data ?? []).filter(
          (p: Product) => p.user_id === userId,
        );
        const pendingProducts: Product[] = (pendingRes.data?.data ?? []).filter(
          (p: Product) => p.user_id === userId,
        );
        const completedProducts: Product[] = (
          completedRes.data?.data ?? []
        ).filter((p: Product) => p.user_id === userId);
        const endedProducts: Product[] = (endedRes.data?.data ?? []).filter(
          (p: Product) => p.user_id === userId,
        );

        // Build the complete product list, starting with /my-products result
        const existingIds = new Set<number>();
        const allProducts: Product[] = [];

        // Add /my-products results first
        for (const p of myProducts) {
          if (!existingIds.has(p.id)) {
            allProducts.push(p);
            existingIds.add(p.id);
          }
        }

        // Merge all fetched products (fallback for missing /my-products)
        for (const p of [
          ...activeProducts,
          ...pendingProducts,
          ...completedProducts,
          ...endedProducts,
        ]) {
          if (!existingIds.has(p.id)) {
            allProducts.push(p);
            existingIds.add(p.id);
          }
        }

        // Shipping = completed/ended products with bids (sold)
        const shippingCandidates = [
          ...completedProducts,
          ...endedProducts,
        ].filter((p) => p.bids_count > 0);
        const seenShipping = new Set<number>();
        const shippingProducts = shippingCandidates.filter((p) => {
          if (seenShipping.has(p.id)) return false;
          seenShipping.add(p.id);
          return true;
        });

        return { allProducts, shippingProducts };
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
      certificate?: string;
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

        // แนบใบ certificate (ถ้ามี)
        if (data.certificate) {
          const certUri = data.certificate;
          const certName = certUri.split("/").pop() || "certificate.jpg";
          const certType = certName.endsWith(".png")
            ? "image/png"
            : "image/jpeg";
          formData.append("certificate", {
            uri: certUri,
            name: certName,
            type: certType,
          } as any);
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

    getRecentSearches: async (): Promise<any[]> => {
      try {
        const response = await apiClient.get(ENDPOINTS.SEARCH.HISTORY);
        const data = response.data;
        return data.data ?? data.history ?? data ?? [];
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },

    deleteSearchHistoryItem: async (id: number): Promise<void> => {
      try {
        await apiClient.delete(ENDPOINTS.SEARCH.HISTORY_DELETE(id));
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },

    clearRecentSearches: async (): Promise<void> => {
      try {
        await apiClient.delete(ENDPOINTS.SEARCH.HISTORY);
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },

    saveSearchKeyword: async (keyword: string): Promise<void> => {
      try {
        await apiClient.post(ENDPOINTS.SEARCH.HISTORY, { keyword });
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

    submitReport: async (
      data: SubmitReportRequest,
      evidenceImages?: EvidenceImage[],
    ): Promise<UserReport> => {
      try {
        const formData = new FormData();
        formData.append("reported_user_id", data.reported_user_id);
        if (data.reported_product_id) {
          formData.append("reported_product_id", data.reported_product_id);
        }
        formData.append("type", data.type);
        formData.append("description", data.description);

        if (evidenceImages && evidenceImages.length > 0) {
          evidenceImages.forEach((img) => {
            formData.append("evidence_images[]", {
              uri: img.uri,
              name: img.name,
              type: img.type,
            } as any);
          });
        }

        const response = await apiClient.post<ApiResponse<UserReport>>(
          ENDPOINTS.REPORT.SUBMIT,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
            },
          },
        );
        return response.data.data;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },

    getMyReports: async (): Promise<UserReport[]> => {
      try {
        const response = await apiClient.get(ENDPOINTS.REPORT.MINE);
        // API returns { summary: {...}, reports: [...] }
        const data = response.data as any;
        if (data?.reports && Array.isArray(data.reports)) {
          return data.reports;
        }
        if (data?.data?.reports && Array.isArray(data.data.reports)) {
          return data.data.reports;
        }
        if (Array.isArray(data?.data)) {
          return data.data;
        }
        return [];
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
        const response = await apiClient.get(ENDPOINTS.ADMIN.STATS);
        // API returns the stats object directly (not wrapped in { data })
        const data = response.data;
        if (data?.data) return data.data;
        return data;
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

    // ─── Pending Products (new API) ───
    getPendingProducts: async (
      status: string = "pending",
    ): Promise<Product[]> => {
      try {
        const response = await apiClient.get(ENDPOINTS.ADMIN.PENDING_PRODUCTS, {
          params: { status },
        });
        const data = response.data;
        if (Array.isArray(data)) return data;
        if (data?.data && Array.isArray(data.data)) return data.data;
        return [];
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },

    approveProductById: async (productId: number): Promise<void> => {
      try {
        await apiClient.patch(ENDPOINTS.ADMIN.APPROVE_PRODUCT(productId));
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },

    rejectProductById: async (
      productId: number,
      adminNote: string,
    ): Promise<void> => {
      try {
        await apiClient.patch(ENDPOINTS.ADMIN.REJECT_PRODUCT(productId), {
          admin_note: adminNote,
        });
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },

    getCertificateUrl: (certificateId: number): string => {
      // Returns the full URL for viewing/downloading the certificate file
      return `${apiClient.defaults.baseURL}${ENDPOINTS.ADMIN.CERTIFICATE_VIEW(certificateId)}`;
    },

    verifyCertificate: async (
      certificateId: number,
      status: "approved" | "rejected",
      adminNote?: string,
    ): Promise<void> => {
      try {
        await apiClient.patch(
          ENDPOINTS.ADMIN.CERTIFICATE_VERIFY(certificateId),
          {
            status,
            ...(adminNote ? { admin_note: adminNote } : {}),
          },
        );
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
        const body: { status: string; admin_note?: string } = {
          status: data.status,
        };
        if (data.admin_note) {
          body.admin_note = data.admin_note;
        }
        const response = await apiClient.patch<ApiResponse<AdminReport>>(
          ENDPOINTS.ADMIN.REPORT_STATUS(data.reportId),
          body,
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

    getUsers: async (params?: { page?: number }): Promise<any> => {
      try {
        const response = await apiClient.get(ENDPOINTS.ADMIN.USERS, { params });
        return response.data;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },

    getUserDetail: async (userId: number): Promise<any> => {
      try {
        const response = await apiClient.get(
          ENDPOINTS.ADMIN.USER_DETAIL(userId),
        );
        return response.data;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },

    banUser: async (
      userId: number,
      reason: string,
      durationDays: number,
    ): Promise<any> => {
      try {
        const response = await apiClient.post(
          ENDPOINTS.ADMIN.USER_BAN(userId),
          {
            reason,
            ban_days: durationDays,
          },
        );
        return response.data;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },

    unbanUser: async (userId: number): Promise<any> => {
      try {
        const response = await apiClient.post(
          ENDPOINTS.ADMIN.USER_UNBAN(userId),
        );
        return response.data;
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

  // ════════════════════════════════════════════════════════
  // 📋 Order (Post-Auction / Escrow)
  // ════════════════════════════════════════════════════════
  order: {
    getMyOrders: async (): Promise<Order[]> => {
      try {
        const response = await apiClient.get(ENDPOINTS.ORDER.MY_ORDERS);
        const data = response.data;
        // Handle all possible response shapes from the backend
        if (Array.isArray(data)) return data;
        if (Array.isArray(data?.orders)) return data.orders;
        if (Array.isArray(data?.data)) return data.data;
        if (Array.isArray(data?.data?.orders)) return data.data.orders;
        return [];
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },

    /**
     * Construct orders from completed/ended products where user is the winner.
     * Fallback when GET /orders endpoint doesn't exist.
     */
    getMyOrdersConstructed: async (userId: number): Promise<Order[]> => {
      try {
        // Fetch products across all statuses that might have ended
        const [completedRes, endedRes, activeRes] = await Promise.all([
          apiClient
            .get<ProductPaginatedResponse>(ENDPOINTS.PRODUCT.LIST, {
              params: { per_page: 100, status: "completed" },
            })
            .catch(() => ({ data: { data: [] } as any })),
          apiClient
            .get<ProductPaginatedResponse>(ENDPOINTS.PRODUCT.LIST, {
              params: { per_page: 100, status: "ended" },
            })
            .catch(() => ({ data: { data: [] } as any })),
          // Also include active products whose auction_end_time has already passed
          apiClient
            .get<ProductPaginatedResponse>(ENDPOINTS.PRODUCT.LIST, {
              params: { per_page: 100, tag: "ending" },
            })
            .catch(() => ({ data: { data: [] } as any })),
        ]);
        const completedProducts: Product[] = completedRes.data?.data ?? [];
        const endedProducts: Product[] = endedRes.data?.data ?? [];
        const activeEndedProducts: Product[] = (
          activeRes.data?.data ?? []
        ).filter((p: Product) => new Date(p.auction_end_time) < new Date());

        // Combine and deduplicate
        const allProducts = [
          ...completedProducts,
          ...endedProducts,
          ...activeEndedProducts,
        ];
        const seen = new Set<number>();
        const uniqueProducts = allProducts.filter((p) => {
          if (seen.has(p.id)) return false;
          seen.add(p.id);
          return true;
        });

        // Only process products that have bids
        const productsWithBids = uniqueProducts.filter((p) => p.bids_count > 0);

        // Fetch bids for each product
        const results = await Promise.all(
          productsWithBids.map(async (product) => {
            try {
              const res = await apiClient.get(
                ENDPOINTS.PRODUCT.BIDS(product.id),
              );
              const data = res.data;
              const bids: any[] = Array.isArray(data)
                ? data
                : data?.data && Array.isArray(data.data)
                  ? data.data
                  : [];
              return { product, bids };
            } catch {
              return { product, bids: [] as any[] };
            }
          }),
        );

        // Build Order[] for products the user won
        const orders: Order[] = [];
        for (const { product, bids } of results) {
          const myBids = bids.filter((b: any) => Number(b.user_id) === userId);
          if (myBids.length === 0) continue;

          const highestMyBid = Math.max(
            ...myBids.map((b: any) => parseFloat(b.price)),
          );
          const currentPrice = parseFloat(product.current_price || "0");
          const isWinner = highestMyBid >= currentPrice;
          if (!isWinner) continue;

          // Build a deadline 24h from when auction ended
          const endedAt = product.updated_at || product.auction_end_time;
          const deadline = new Date(
            new Date(endedAt).getTime() + 24 * 60 * 60 * 1000,
          );
          const isExpired = deadline < new Date();

          orders.push({
            id: product.id,
            product_id: product.id,
            auction_id: product.id,
            buyer_id: userId,
            seller_id: product.user_id,
            final_price: String(currentPrice),
            status: isExpired ? "expired" : ("pending_confirmation" as any),
            confirmed_at: null,
            shipped_at: null,
            completed_at:
              product.status === "completed" ? product.updated_at : null,
            disputed_at: null,
            cancelled_at: null,
            expired_at: isExpired ? deadline.toISOString() : null,
            deadline_at: deadline.toISOString(),
            dispute_reason: null,
            dispute_evidence_images: null,
            created_at: product.updated_at || product.created_at,
            updated_at: product.updated_at,
            product: {
              id: product.id,
              name: product.name,
              description: product.description,
              picture: product.picture,
              image_url: product.image_url,
              images: product.images,
            },
            seller: product.user
              ? {
                  id: product.user.id,
                  name: product.user.name,
                  email: product.user.email || "",
                  phone_number: product.user.phone_number || null,
                  profile_image: product.user.profile_image || null,
                }
              : undefined,
          } as Order);
        }

        return orders;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },

    /**
     * Construct orders from the perspective of the SELLER.
     * Used when /users/me/orders only returns buyer-side orders.
     * Fetches the seller's own completed/ended products that have a winning bidder.
     */
    getMySellerOrdersConstructed: async (userId: number): Promise<Order[]> => {
      try {
        const [completedRes, endedRes] = await Promise.all([
          apiClient
            .get<ProductPaginatedResponse>(ENDPOINTS.PRODUCT.LIST, {
              params: { per_page: 100, status: "completed" },
            })
            .catch(() => ({ data: { data: [] } as any })),
          apiClient
            .get<ProductPaginatedResponse>(ENDPOINTS.PRODUCT.LIST, {
              params: { per_page: 100, status: "ended" },
            })
            .catch(() => ({ data: { data: [] } as any })),
        ]);

        const allProducts: Product[] = [
          ...(completedRes.data?.data ?? []),
          ...(endedRes.data?.data ?? []),
        ];

        // Keep only THIS user's products that have at least one bid
        const seen = new Set<number>();
        const myProducts = allProducts.filter((p: Product) => {
          if (seen.has(p.id)) return false;
          seen.add(p.id);
          return p.user_id === userId && p.bids_count > 0;
        });

        // Fetch bids for each product to find the winner (highest bidder)
        const results = await Promise.all(
          myProducts.map(async (product: Product) => {
            try {
              const res = await apiClient.get(
                ENDPOINTS.PRODUCT.BIDS(product.id),
              );
              const data = res.data;
              const bids: any[] = Array.isArray(data)
                ? data
                : Array.isArray(data?.data)
                  ? data.data
                  : [];
              return { product, bids };
            } catch {
              return { product, bids: [] as any[] };
            }
          }),
        );

        const orders: Order[] = [];
        for (const { product, bids } of results) {
          if (bids.length === 0) continue;

          // Highest bid = winner
          const sorted = [...bids].sort(
            (a, b) => parseFloat(b.price) - parseFloat(a.price),
          );
          const winnerBid = sorted[0];
          if (!winnerBid) continue;

          const endedAt = product.updated_at || product.auction_end_time;
          const deadline = new Date(
            new Date(endedAt).getTime() + 24 * 60 * 60 * 1000,
          );
          const isExpired = deadline < new Date();

          orders.push({
            id: product.id,
            product_id: product.id,
            auction_id: product.id,
            buyer_id: Number(winnerBid.user_id),
            seller_id: userId,
            my_role: "seller",
            final_price: String(parseFloat(winnerBid.price)),
            status: isExpired ? "expired" : ("pending_confirmation" as any),
            confirmed_at: null,
            shipped_at: null,
            completed_at:
              product.status === "completed" ? product.updated_at : null,
            disputed_at: null,
            cancelled_at: null,
            expired_at: isExpired ? deadline.toISOString() : null,
            deadline_at: deadline.toISOString(),
            dispute_reason: null,
            dispute_evidence_images: null,
            created_at: product.updated_at || product.created_at,
            updated_at: product.updated_at,
            product: {
              id: product.id,
              name: product.name,
              description: product.description,
              picture: product.picture,
              image_url: product.image_url,
              images: product.images,
            },
            seller: {
              id: userId,
              name: "",
              email: "",
              phone_number: null,
              profile_image: null,
            },
          } as Order);
        }

        return orders;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },

    /**
     * Discover real seller orders with actual status from backend.
     * Tries multiple strategies since /users/me/orders only returns buyer orders.
     */
    getSellerOrdersForProducts: async (
      userId: number,
      productIds: number[],
    ): Promise<Order[]> => {
      if (productIds.length === 0) return [];
      const pidSet = new Set(productIds);

      // Strategy 1: Check if /users/me/orders returns seller orders too
      try {
        const res = await apiClient.get(ENDPOINTS.ORDER.MY_ORDERS);
        const data = res.data;
        const all: Order[] = Array.isArray(data)
          ? data
          : (data?.orders ?? data?.data ?? []);
        const sellerOrders = all.filter(
          (o) => o.seller_id === userId || pidSet.has(o.product_id),
        );
        // Only use if we found orders matching seller's products
        if (sellerOrders.some((o) => pidSet.has(o.product_id))) {
          return sellerOrders
            .filter((o) => pidSet.has(o.product_id))
            .map((o) => ({ ...o, my_role: "seller" as const }));
        }
      } catch {}

      // Strategy 2: Try with role=seller query param
      try {
        const res = await apiClient.get(ENDPOINTS.ORDER.MY_ORDERS, {
          params: { role: "seller" },
        });
        const data = res.data;
        const all: Order[] = Array.isArray(data)
          ? data
          : (data?.orders ?? data?.data ?? []);
        if (all.length > 0) {
          const matched = all
            .filter((o) => pidSet.has(o.product_id))
            .map((o) => ({ ...o, my_role: "seller" as const }));
          if (matched.length > 0) return matched;
        }
      } catch {}

      // Strategy 3: Scan recent order IDs to discover seller orders
      try {
        // Get max known order ID from buyer orders
        const buyerRes = await apiClient.get(ENDPOINTS.ORDER.MY_ORDERS);
        const buyerData = buyerRes.data;
        const buyerOrders: Order[] = Array.isArray(buyerData)
          ? buyerData
          : (buyerData?.orders ?? buyerData?.data ?? []);
        const maxId =
          buyerOrders.length > 0
            ? Math.max(...buyerOrders.map((o) => o.id))
            : 0;

        // Scan IDs from 1 to maxId + 10, skipping known buyer order IDs
        const knownIds = new Set(buyerOrders.map((o) => o.id));
        const scanMax = Math.max(maxId + 10, 15);
        const idsToTry = Array.from(
          { length: scanMax },
          (_, i) => i + 1,
        ).filter((id) => !knownIds.has(id));

        const found: Order[] = [];
        // Scan in small parallel batches to avoid flooding
        for (let i = 0; i < idsToTry.length; i += 5) {
          const batch = idsToTry.slice(i, i + 5);
          const results = await Promise.allSettled(
            batch.map((id) =>
              apiClient
                .get(ENDPOINTS.ORDER.DETAIL(id))
                .then((r) => r.data?.order ?? r.data?.data ?? r.data),
            ),
          );
          for (const r of results) {
            if (r.status === "fulfilled" && r.value) {
              const order = r.value as Order;
              if (
                pidSet.has(order.product_id) &&
                (order.seller_id === userId || !order.seller_id)
              ) {
                found.push({ ...order, my_role: "seller" as const });
              }
            }
          }
          // Stop early if we found all products
          if (found.length >= productIds.length) break;
        }
        return found;
      } catch {}

      return [];
    },

    getOrderDetail: async (orderId: number): Promise<Order> => {
      try {
        const response = await apiClient.get(ENDPOINTS.ORDER.DETAIL(orderId));
        const data = response.data;
        return data.order ?? data.data;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },

    confirmOrder: async (orderId: number): Promise<Order> => {
      try {
        const response = await apiClient.post(ENDPOINTS.ORDER.CONFIRM(orderId));
        const data = response.data;
        return data.order ?? data.data;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },

    shipOrder: async (orderId: number): Promise<Order> => {
      try {
        const response = await apiClient.post(ENDPOINTS.ORDER.SHIP(orderId));
        const data = response.data;
        return data.order ?? data.data;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },

    receiveOrder: async (orderId: number): Promise<Order> => {
      try {
        const response = await apiClient.post(ENDPOINTS.ORDER.RECEIVE(orderId));
        const data = response.data;
        return data.order ?? data.data;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },

    getSellerRatings: async (
      sellerId: number,
    ): Promise<{
      summary: {
        average_rating: number;
        total_reviews: number;
        rating_breakdown: Record<string, number>;
      };
      ratings: any;
    }> => {
      try {
        const response = await apiClient.get(
          ENDPOINTS.ORDER.SELLER_RATINGS(sellerId),
        );
        return response.data;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },

    rateSeller: async (
      sellerId: number,
      orderId: number,
      rating: number,
    ): Promise<{
      review: any;
      seller_rating: number;
      seller_total_reviews: number;
    }> => {
      try {
        const response = await apiClient.post(
          ENDPOINTS.ORDER.RATE_SELLER(sellerId),
          { rating, order_id: orderId },
        );
        return response.data;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },

    disputeOrder: async (
      orderId: number,
      reason: string,
      evidenceImages?: EvidenceImage[],
    ): Promise<Order> => {
      try {
        const formData = new FormData();
        formData.append("reason", reason);

        if (evidenceImages && evidenceImages.length > 0) {
          evidenceImages.forEach((img) => {
            const file = {
              uri: img.uri,
              name: img.name,
              type: img.type,
            } as unknown as Blob;
            formData.append("evidence_images[]", file);
          });
        }

        const response = await apiClient.post(
          ENDPOINTS.ORDER.DISPUTE(orderId),
          formData,
          { headers: { "Content-Type": "multipart/form-data" } },
        );
        const data = response.data;
        return data.order ?? data.data;
      } catch (error) {
        throw new Error(handleApiError(error));
      }
    },
  },
};

/**
 * Fetch public stats (total_users, total_products).
 * Calls the public /api/public/stats endpoint (no auth required).
 * Falls back to admin endpoint or cache if public endpoint is unavailable.
 */
const STATS_CACHE_KEY = "publicStatsCache";

const cacheStats = async (stats: {
  total_users: number;
  total_products: number;
}) => {
  try {
    const AsyncStorage =
      require("@react-native-async-storage/async-storage").default;
    await AsyncStorage.setItem(STATS_CACHE_KEY, JSON.stringify(stats));
  } catch {
    // ignore
  }
};

const getCachedStats = async (): Promise<{
  total_users: number;
  total_products: number;
} | null> => {
  try {
    const AsyncStorage =
      require("@react-native-async-storage/async-storage").default;
    const cached = await AsyncStorage.getItem(STATS_CACHE_KEY);
    if (cached) return JSON.parse(cached);
  } catch {
    // ignore
  }
  return null;
};

export const getPublicStats = async (): Promise<{
  total_users: number;
  total_products: number;
}> => {
  // 1) Try public stats endpoint (no auth required)
  try {
    const res = await axios.get(`${BASE_URL}${ENDPOINTS.PUBLIC.STATS}`, {
      timeout: 8000,
    });
    const data = res.data?.data ?? res.data;
    if (
      typeof data?.total_users === "number" &&
      typeof data?.total_products === "number"
    ) {
      const result = {
        total_users: data.total_users,
        total_products: data.total_products,
      };
      await cacheStats(result);
      return result;
    }
  } catch {
    // public endpoint not available — fall through
  }

  // 2) Try admin dashboard with auth token
  try {
    const stats = await apiService.admin.getStats();
    const result = {
      total_users: stats.total_users,
      total_products: stats.total_products,
    };
    await cacheStats(result);
    return result;
  } catch {
    // no token or not admin — fall through
  }

  // 3) Fallback: use cached stats + fresh product count
  const cached = await getCachedStats();
  let totalProducts = cached?.total_products ?? 0;
  try {
    const productsRes = await apiClient.get<ProductPaginatedResponse>(
      ENDPOINTS.PRODUCT.LIST,
      { params: { per_page: 1 } },
    );
    totalProducts = productsRes?.data?.total ?? totalProducts;
  } catch {
    // ignore
  }

  return {
    total_users: cached?.total_users ?? 0,
    total_products: totalProducts,
  };
};

export default apiService;
