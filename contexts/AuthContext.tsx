import React, { createContext, useCallback, useContext, useState } from "react";
import { authService, User } from "../utils/authService";

interface AuthContextType {
  isGuest: boolean;
  isLoggedIn: boolean;
  user: User | null;
  userRole: "admin" | "user" | null;
  showLoginModal: boolean;
  setShowLoginModal: (visible: boolean) => void;
  enterAsGuest: () => void;
  loginSuccess: (user: User) => void;
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

  const logout = useCallback(async () => {
    await authService.logout();
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
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
