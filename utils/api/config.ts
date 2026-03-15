import AsyncStorage from "@react-native-async-storage/async-storage";
import axios, {
    AxiosError,
    AxiosInstance,
    AxiosResponse,
    InternalAxiosRequestConfig,
} from "axios";

// ============================================================
// 🔧 Configuration
// ============================================================

// เปลี่ยน BASE_URL ตรงนี้ให้ตรงกับ Backend ของคุณ
// - Development (iOS Simulator): http://localhost:3000/api
// - Development (Android Emulator): http://10.0.2.2:3000/api
// - Development (Physical Device): http://<YOUR_LOCAL_IP>:3000/api
// - Production: https://api.bidkhong.com/api
// const BASE_URL = "https://anja-floriferous-tanja.ngrok-free.dev/api";
const BASE_URL = "http://127.0.0.1:8000/api";
const SERVER_URL = "http://127.0.0.1:8000";

// ============================================================
// 🖼️ Image URL Helper — แปลง relative path เป็น full URL
// ============================================================

export const getFullImageUrl = (
  path: string | null | undefined,
): string | null => {
  if (!path) return null;
  // ถ้าเป็น full URL อยู่แล้ว ส่งคืนเลย
  if (path.startsWith("http://") || path.startsWith("https://")) return path;
  // ต่อ SERVER_URL/storage/ เข้าไปข้างหน้า (Laravel storage)
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${SERVER_URL}/storage${cleanPath}`;
};

// ============================================================
// 📌 API Endpoints — เปลี่ยน path ตรงนี้ที่เดียว
// ============================================================

export const ENDPOINTS = {
  // 🔐 Auth
  AUTH: {
    LOGIN: "/login",
    REGISTER: "/register",
    ME: "/auth/me",
    VERIFY: "/auth/verify",
    LOGOUT: "/logout",
    PROFILE: "/profile",
    CHANGE_PASSWORD: "/auth/change-password",
    REFRESH: "/auth/refresh",
    FORGOT_PASSWORD: "/forgot-password",
    RESET_PASSWORD: "/reset-password",
    PROFILE_IMAGE: "/profile/image",
  },

  // 📦 Product
  PRODUCT: {
    LIST: "/products",
    CREATE: "/products",
    DETAIL: (id: number) => `/products/${id}`,
    MY_PRODUCTS: "/my-products",
  },

  // 🏷️ Auction
  AUCTION: {
    LIST: "/auctions",
    DETAIL: (id: string) => `/auctions/${id}`,
    CREATE: "/auctions",
    BID_HISTORY: (id: string) => `/auctions/${id}/bids`,
  },

  // 💰 Bid
  BID: {
    PLACE: "/bids",
    BUY_NOW: "/bids/buy-now",
    ACTIVE: "/bids/active",
    HISTORY: "/bids/history",
    STATS: "/bids/stats",
    WON: "/bids/won",
    VERIFY: (id: string) => `/bids/won/${id}/verify`,
    RECEIVED: (id: string) => `/bids/won/${id}/received`,
  },

  // 💳 Wallet
  WALLET: {
    BALANCE: "/wallet/balance",
    TRANSACTIONS: "/wallet/transactions",
    TOPUP: "/wallet/topup",
    WITHDRAW: "/wallet/withdraw",
  },

  // 📂 Category
  CATEGORY: {
    LIST: "/categories",
    DETAIL: (id: number) => `/categories/${id}`,
    ALL_SUBCATEGORIES: "/subcategories",
    SUBCATEGORIES: (id: string) => `/categories/${id}/subcategories`,
    PRODUCTS: (id: string) => `/categories/${id}/products`,
  },

  // 🔍 Search
  SEARCH: {
    QUERY: "/search",
    RECENT: "/search/recent",
    TRENDING: "/search/trending",
  },

  // 🛟 Report
  REPORT: {
    FAQ: "/faq",
    SUBMIT: "/reports",
    MINE: "/reports",
    DETAIL: (id: string) => `/reports/${id}`,
  },

  // � Order (Post-Auction / Escrow)
  ORDER: {
    MY_ORDERS: "/orders",
    DETAIL: (id: number) => `/orders/${id}/detail`,
    CONFIRM: (id: number) => `/orders/${id}/confirm`,
    SHIP: (id: number) => `/orders/${id}/ship`,
    RECEIVE: (id: number) => `/orders/${id}/receive`,
    DISPUTE: (id: number) => `/orders/${id}/dispute`,
  },

  // �🛡️ Admin
  ADMIN: {
    STATS: "/admin/stats",
    INCOMING: "/admin/incoming",
    APPROVE: (id: string) => `/admin/incoming/${id}/approve`,
    REJECT: (id: string) => `/admin/incoming/${id}`,
    REPORTS: "/admin/reports",
    REPORT_STATUS: (id: string) => `/admin/reports/${id}/status`,
    REPORT_REPLY: (id: string) => `/admin/reports/${id}/reply`,
  },

  // 📸 Upload
  UPLOAD: {
    IMAGE: "/upload/image",
    IMAGES: "/upload/images",
  },
} as const;

// Storage keys
const TOKEN_KEY = "userToken";
const REFRESH_TOKEN_KEY = "refreshToken";

// ============================================================
// 🌐 Axios Instance
// ============================================================

const apiClient: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// ============================================================
// 🔑 Token Management
// ============================================================

export const tokenManager = {
  getToken: async (): Promise<string | null> => {
    return AsyncStorage.getItem(TOKEN_KEY);
  },

  setToken: async (token: string): Promise<void> => {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  },

  getRefreshToken: async (): Promise<string | null> => {
    return AsyncStorage.getItem(REFRESH_TOKEN_KEY);
  },

  setRefreshToken: async (token: string): Promise<void> => {
    await AsyncStorage.setItem(REFRESH_TOKEN_KEY, token);
  },

  clearTokens: async (): Promise<void> => {
    await AsyncStorage.multiRemove([TOKEN_KEY, REFRESH_TOKEN_KEY]);
  },

  setTokens: async (
    accessToken: string,
    refreshToken?: string,
  ): Promise<void> => {
    await AsyncStorage.setItem(TOKEN_KEY, accessToken);
    if (refreshToken) {
      await AsyncStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    }
  },
};

// ============================================================
// 📡 Request Interceptor — แนบ Token ทุก Request
// ============================================================

apiClient.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const token = await tokenManager.getToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  },
);

// ============================================================
// 📡 Response Interceptor — จัดการ Error & Refresh Token
// ============================================================

let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: unknown) => void;
  reject: (reason?: unknown) => void;
}> = [];

const processQueue = (
  error: AxiosError | null,
  token: string | null = null,
) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

apiClient.interceptors.response.use(
  (response: AxiosResponse) => response,
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & {
      _retry?: boolean;
    };

    // ถ้า 401 Unauthorized → ลอง Refresh Token
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${token}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = await tokenManager.getRefreshToken();
        if (!refreshToken) {
          throw new Error("No refresh token");
        }

        const response = await axios.post(
          `${BASE_URL}${ENDPOINTS.AUTH.REFRESH}`,
          {
            refreshToken,
          },
        );

        const { accessToken, refreshToken: newRefreshToken } = response.data;
        await tokenManager.setTokens(accessToken, newRefreshToken);

        processQueue(null, accessToken);

        if (originalRequest.headers) {
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        }
        return apiClient(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError as AxiosError, null);
        await tokenManager.clearTokens();
        // ถ้า refresh ไม่สำเร็จ ให้ logout — จะถูก handle ที่ AuthContext
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  },
);

// ============================================================
// 🛠️ API Response Types
// ============================================================

/** Standard API response wrapper */
export interface ApiResponse<T = unknown> {
  success: boolean;
  data: T;
  message?: string;
}

/** Paginated response */
export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/** Error response */
export interface ApiError {
  success: false;
  message: string;
  errors?: Record<string, string[]>;
}

// ============================================================
// 🧰 Helper Functions
// ============================================================

/**
 * จัดการ error จาก API ให้เป็น message ที่อ่านได้
 */
export const handleApiError = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiError>;

    // Network error
    if (!axiosError.response) {
      return "ไม่สามารถเชื่อมต่อกับเซิร์ฟเวอร์ได้ กรุณาตรวจสอบอินเทอร์เน็ต";
    }

    // Server error with message
    if (axiosError.response.data?.message) {
      return axiosError.response.data.message;
    }

    // HTTP status-based messages
    switch (axiosError.response.status) {
      case 400:
        return "ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง";
      case 401:
        return "กรุณาเข้าสู่ระบบอีกครั้ง";
      case 403:
        return "คุณไม่มีสิทธิ์เข้าถึงส่วนนี้";
      case 404:
        return "ไม่พบข้อมูลที่ต้องการ";
      case 409:
        return "ข้อมูลซ้ำ กรุณาตรวจสอบ";
      case 422:
        return "ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบอีกครั้ง";
      case 429:
        return "คำขอมากเกินไป กรุณารอสักครู่แล้วลองใหม่";
      case 500:
        return "เกิดข้อผิดพลาดจากเซิร์ฟเวอร์ กรุณาลองใหม่ภายหลัง";
      default:
        return "เกิดข้อผิดพลาด กรุณาลองใหม่";
    }
  }

  return "เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ";
};

export { BASE_URL };
export default apiClient;
