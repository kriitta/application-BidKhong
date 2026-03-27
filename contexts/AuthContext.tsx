import AsyncStorage from "@react-native-async-storage/async-storage";
import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { authEvents, tokenManager } from "../utils/api/config";
import { User } from "../utils/api/types";

interface BanInfo {
  reason: string;
  banned_until: string | null;
}

interface AuthContextType {
  isGuest: boolean;
  isLoggedIn: boolean;
  user: User | null;
  userRole: "admin" | "user" | null;
  isBanned: boolean;
  banInfo: BanInfo | null;
  showLoginModal: boolean;
  setShowLoginModal: (visible: boolean) => void;
  enterAsGuest: () => void;
  loginSuccess: (user: User) => void;
  updateUser: (user: User) => void;
  updateWallet: (walletData: Partial<User["wallet"]>) => void;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  isGuest: false,
  isLoggedIn: false,
  user: null,
  userRole: null,
  isBanned: false,
  banInfo: null,
  showLoginModal: false,
  setShowLoginModal: () => {},
  enterAsGuest: () => {},
  loginSuccess: () => {},
  updateUser: () => {},
  updateWallet: () => {},
  refreshUser: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isGuest, setIsGuest] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<"admin" | "user" | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [isBanned, setIsBanned] = useState(false);
  const [banInfo, setBanInfo] = useState<BanInfo | null>(null);

  // Listen for ban events from API interceptor
  useEffect(() => {
    const handleBanned = (info: BanInfo) => {
      setIsBanned(true);
      setBanInfo(info);
    };
    authEvents.on("banned", handleBanned);
    return () => {
      authEvents.off("banned", handleBanned);
    };
  }, []);

  // หลัง login สำเร็จ → เช็ค ban status จาก API (เผื่อ login response ไม่มี ban fields)
  useEffect(() => {
    if (!isLoggedIn || isBanned) return;
    const checkBanStatus = async () => {
      try {
        const { apiService } = require("../utils/api");
        const freshUser = await apiService.auth.getMe();
        // เช็คจาก is_banned / banned_until โดยตรง
        if (
          freshUser.is_banned ||
          (freshUser.banned_until &&
            new Date(freshUser.banned_until) > new Date())
        ) {
          setIsBanned(true);
          setBanInfo({
            reason: freshUser.ban_reason || "บัญชีของคุณถูกระงับการใช้งาน",
            banned_until: freshUser.banned_until || null,
          });
          return;
        }
        // เช็คจาก strikes array (ถ้า backend ส่งมาพร้อม profile)
        if (freshUser.strikes?.length) {
          const activeStrike = (freshUser as any).strikes.find(
            (s: any) => new Date(s.banned_until) > new Date(),
          );
          if (activeStrike) {
            setIsBanned(true);
            setBanInfo({
              reason: activeStrike.reason || "บัญชีของคุณถูกระงับการใช้งาน",
              banned_until: activeStrike.banned_until,
            });
            return;
          }
        }
        // เช็คจาก active_strike object
        if ((freshUser as any).active_strike) {
          setIsBanned(true);
          setBanInfo({
            reason:
              (freshUser as any).active_strike.reason ||
              "บัญชีของคุณถูกระงับการใช้งาน",
            banned_until: (freshUser as any).active_strike.banned_until || null,
          });
        }
      } catch {
        // ถ้า 403 → interceptor จะ emit "banned" event จัดการแล้ว
        // ถ้า endpoint ไม่มี (404) → ข้ามไป
      }
    };
    checkBanStatus();
  }, [isLoggedIn, isBanned]);

  const enterAsGuest = useCallback(() => {
    setIsGuest(true);
    setIsLoggedIn(false);
    setUser(null);
    setUserRole(null);
  }, []);

  const loginSuccess = useCallback((loggedInUser: User) => {
    // Check if user is banned
    if (
      loggedInUser.is_banned ||
      (loggedInUser.banned_until &&
        new Date(loggedInUser.banned_until) > new Date())
    ) {
      setIsBanned(true);
      setBanInfo({
        reason: loggedInUser.ban_reason || "บัญชีของคุณถูกระงับการใช้งาน",
        banned_until: loggedInUser.banned_until || null,
      });
      setUser(loggedInUser);
      setIsLoggedIn(true);
      setIsGuest(false);
      return;
    }
    setIsBanned(false);
    setBanInfo(null);
    setIsGuest(false);
    setIsLoggedIn(true);
    setUser(loggedInUser);
    setUserRole(loggedInUser.role);
    setShowLoginModal(false);
  }, []);

  const updateUser = useCallback((updatedUser: User) => {
    setUser(updatedUser);
    setUserRole(updatedUser.role);
    AsyncStorage.setItem("userData", JSON.stringify(updatedUser));
  }, []);

  const updateWallet = useCallback((walletData: any) => {
    setUser((prev) => {
      if (!prev) return prev;
      const updatedWallet = { ...prev.wallet, ...walletData };
      const updatedUser = { ...prev, wallet: updatedWallet };
      AsyncStorage.setItem("userData", JSON.stringify(updatedUser));
      return updatedUser as User;
    });
  }, []);

  const refreshUser = useCallback(async () => {
    try {
      const { apiService } = require("../utils/api");
      const freshUser = await apiService.auth.getMe();
      // Check ban status
      if (
        freshUser.is_banned ||
        (freshUser.banned_until &&
          new Date(freshUser.banned_until) > new Date())
      ) {
        setIsBanned(true);
        setBanInfo({
          reason: freshUser.ban_reason || "บัญชีของคุณถูกระงับการใช้งาน",
          banned_until: freshUser.banned_until || null,
        });
        setUser(freshUser);
        await AsyncStorage.setItem("userData", JSON.stringify(freshUser));
        return;
      }
      setIsBanned(false);
      setBanInfo(null);
      setUser(freshUser);
      setUserRole(freshUser.role);
      await AsyncStorage.setItem("userData", JSON.stringify(freshUser));
    } catch {
      // getMe ไม่มีใน backend → ใช้ cached data จาก AsyncStorage
      const userData = await AsyncStorage.getItem("userData");
      if (userData) {
        const cachedUser: User = JSON.parse(userData);
        setUser(cachedUser);
        setUserRole(cachedUser.role);
      }
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      const { apiService } = require("../utils/api");
      await apiService.auth.logout();
    } catch {
      // ลบ token ฝั่ง client อยู่ดี แม้ API จะ fail
      await tokenManager.clearTokens();
    }
    await AsyncStorage.removeItem("userData");
    setIsGuest(false);
    setIsLoggedIn(false);
    setUser(null);
    setUserRole(null);
    setIsBanned(false);
    setBanInfo(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isGuest,
        isLoggedIn,
        user,
        userRole,
        isBanned,
        banInfo,
        showLoginModal,
        setShowLoginModal,
        enterAsGuest,
        loginSuccess,
        updateUser,
        updateWallet,
        refreshUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
