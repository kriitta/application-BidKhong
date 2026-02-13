import AsyncStorage from "@react-native-async-storage/async-storage";

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: "admin" | "user";
  phoneNumber?: string;
}

interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
  token?: string;
}

// Mock user database
const mockUsers: Array<{ email: string; password: string; user: User }> = [
  {
    email: "admin@bidkhong.com",
    password: "admin123",
    user: {
      id: "admin_001",
      email: "admin@bidkhong.com",
      fullName: "Admin BidKhong",
      role: "admin",
      phoneNumber: "0900000000",
    },
  },
  {
    email: "user@bidkhong.com",
    password: "user123",
    user: {
      id: "user_001",
      email: "user@bidkhong.com",
      fullName: "Test User",
      role: "user",
      phoneNumber: "0812345678",
    },
  },
];

export const authService = {
  // Login function
  async login(email: string, password: string): Promise<AuthResponse> {
    try {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 1000));

      const foundUser = mockUsers.find((u) => u.email === email);

      if (!foundUser) {
        return {
          success: false,
          message: "ไม่พบบัญชีผู้ใช้นี้",
        };
      }

      if (foundUser.password !== password) {
        return {
          success: false,
          message: "รหัสผ่านไม่ถูกต้อง",
        };
      }

      // Store user data
      const token = `token_${foundUser.user.id}_${Date.now()}`;
      await AsyncStorage.setItem("userToken", token);
      await AsyncStorage.setItem("userData", JSON.stringify(foundUser.user));

      return {
        success: true,
        message: "เข้าสู่ระบบสำเร็จ",
        user: foundUser.user,
        token,
      };
    } catch (error) {
      return {
        success: false,
        message: "เกิดข้อผิดพลาด",
      };
    }
  },

  // Signup function
  async signup(
    email: string,
    password: string,
    fullName: string,
    phoneNumber: string,
  ): Promise<AuthResponse> {
    try {
      // Simulate network delay
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const userExists = mockUsers.some((u) => u.email === email);

      if (userExists) {
        return {
          success: false,
          message: "อีเมลนี้ถูกใช้งานแล้ว",
        };
      }

      const newUser: User = {
        id: `user_${Date.now()}`,
        email,
        fullName,
        role: "user",
        phoneNumber,
      };

      // Add to mock database
      mockUsers.push({
        email,
        password,
        user: newUser,
      });

      const token = `token_${newUser.id}_${Date.now()}`;
      await AsyncStorage.setItem("userToken", token);
      await AsyncStorage.setItem("userData", JSON.stringify(newUser));

      return {
        success: true,
        message: "สร้างบัญชีสำเร็จ",
        user: newUser,
        token,
      };
    } catch (error) {
      return {
        success: false,
        message: "เกิดข้อผิดพลาด",
      };
    }
  },

  // Get current user
  async getCurrentUser(): Promise<User | null> {
    try {
      const userData = await AsyncStorage.getItem("userData");
      return userData ? JSON.parse(userData) : null;
    } catch {
      return null;
    }
  },

  // Check if user is logged in
  async isAuthenticated(): Promise<boolean> {
    const token = await AsyncStorage.getItem("userToken");
    return !!token;
  },

  // Logout
  async logout(): Promise<void> {
    await AsyncStorage.removeItem("userToken");
    await AsyncStorage.removeItem("userData");
  },
};
