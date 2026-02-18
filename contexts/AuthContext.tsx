import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useState } from "react";
import { tokenManager } from "../utils/api/config";
import { User } from "../utils/api/types";

interface AuthContextType {
  isGuest: boolean;
  isLoggedIn: boolean;
  user: User | null;
  userRole: "admin" | "user" | null;
  showLoginModal: boolean;
  setShowLoginModal: (visible: boolean) => void;
  enterAsGuest: () => void;
  loginSuccess: (user: User) => void;
  updateUser: (user: User) => void;
  refreshUser: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  isGuest: false,
  isLoggedIn: false,
  user: null,
  userRole: null,
  showLoginModal: false,
  setShowLoginModal: () => {},
  enterAsGuest: () => {},
  loginSuccess: () => {},
  updateUser: () => {},
  refreshUser: async () => {},
  logout: async () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isGuest, setIsGuest] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [userRole, setUserRole] = useState<"admin" | "user" | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  const enterAsGuest = useCallback(() => {
    setIsGuest(true);
    setIsLoggedIn(false);
    setUser(null);
    setUserRole(null);
  }, []);

  const loginSuccess = useCallback((loggedInUser: User) => {
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

  const refreshUser = useCallback(async () => {
    try {
      const { apiService } = require("../utils/api");
      const freshUser = await apiService.auth.getMe();
      setUser(freshUser);
      setUserRole(freshUser.role);
      await AsyncStorage.setItem("userData", JSON.stringify(freshUser));
    } catch {
      // fallback จาก AsyncStorage
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
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isGuest,
        isLoggedIn,
        user,
        userRole,
        showLoginModal,
        setShowLoginModal,
        enterAsGuest,
        loginSuccess,
        updateUser,
        refreshUser,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
