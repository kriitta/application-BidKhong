import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { image } from "../../assets/images";
import { useAuth } from "../../contexts/AuthContext";
import { authService } from "../../utils/authService";
import { AppText } from "./appText";
import { AppTextInput } from "./appTextInput";

interface AuthModalProps {
  visible: boolean;
  onClose: () => void;
}

type AuthMode = "login" | "signup";

const { height, width } = Dimensions.get("window");

export function AuthModal({ visible, onClose }: AuthModalProps) {
  const router = useRouter();
  const { loginSuccess } = useAuth();
  const [mode, setMode] = useState<AuthMode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setFullName("");
    setPhoneNumber("");
    setConfirmPassword("");
    setShowPassword(false);
    setShowConfirmPassword(false);
  };

  const handleClose = () => {
    resetForm();
    setMode("login");
    onClose();
  };

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("ข้อผิดพลาด", "กรุณากรอกอีเมลและรหัสผ่าน");
      return;
    }
    setLoading(true);
    const result = await authService.login(email, password);
    setLoading(false);

    if (result.success && result.user) {
      loginSuccess(result.user);
      Alert.alert("สำเร็จ", result.message);
      handleClose();
      // Route based on user role
      if (result.user.role === "admin") {
        router.replace("/admin");
      } else {
        router.replace("/tabs/home");
      }
    } else {
      Alert.alert("ข้อผิดพลาด", result.message);
    }
  };

  const handleSignup = async () => {
    if (!fullName || !email || !phoneNumber || !password || !confirmPassword) {
      Alert.alert("ข้อผิดพลาด", "กรุณากรอกข้อมูลทั้งหมด");
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert("ข้อผิดพลาด", "รหัสผ่านไม่ตรงกัน");
      return;
    }
    if (password.length < 6) {
      Alert.alert("ข้อผิดพลาด", "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");
      return;
    }
    setLoading(true);
    const result = await authService.signup(
      email,
      password,
      fullName,
      phoneNumber,
    );
    setLoading(false);

    if (result.success && result.user) {
      loginSuccess(result.user);
      Alert.alert("สำเร็จ", result.message);
      handleClose();
      router.replace("/tabs/home");
    } else {
      Alert.alert("ข้อผิดพลาด", result.message);
    }
  };

  const isLoginMode = mode === "login";

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.container}
        >
          <View style={styles.modalContent}>
            {/* Close Button */}
            <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
              <AppText weight="bold" style={styles.closeButtonText}>
                ✕
              </AppText>
            </TouchableOpacity>

            {/* Modal Header */}
            <View style={styles.header}>
              <AppText weight="semibold" style={styles.title}>
                {isLoginMode ? "Log In" : "Sign Up"}
              </AppText>
              <AppText weight="regular" style={styles.subtitle}>
                {isLoginMode
                  ? "Sign in to place your bid and join the auction"
                  : "Create your account to start bidding"}
              </AppText>
            </View>

            {/* Login Form */}
            {isLoginMode && (
              <View style={{}}>
                {/* Email */}
                <View style={styles.inputGroup}>
                  <AppText weight="medium" style={styles.label}>
                    Email Address
                  </AppText>
                  <View style={styles.inputWrapper}>
                    <Image source={image.mail} style={styles.inputIcon} />
                    <AppTextInput
                      placeholder="you@example.com"
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      editable={!loading}
                      style={styles.input}
                    />
                  </View>
                </View>

                {/* Password */}
                <View style={styles.inputGroup}>
                  <AppText weight="medium" style={styles.label}>
                    Password
                  </AppText>
                  <View style={styles.inputWrapper}>
                    <Image source={image.password} style={styles.inputIcon} />
                    <AppTextInput
                      placeholder="••••••••"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                      editable={!loading}
                      style={styles.input}
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      style={styles.eyeIcon}
                    >
                      <Image
                        source={showPassword ? image.close_eye : image.show_eye}
                        style={styles.eyeIconImage}
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Forgot Password Link */}
                {/* <TouchableOpacity style={styles.forgotPasswordContainer}>
                  <AppText weight="medium" style={styles.forgotPassword}>
                    Forgot Password?
                  </AppText>
                </TouchableOpacity> */}

                {/* Login Button */}
                <TouchableOpacity
                  onPress={handleLogin}
                  disabled={loading}
                  style={styles.primaryButtonWrapper}
                >
                  <LinearGradient
                    colors={["#00112E", "#003994"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.primaryButton}
                  >
                    <AppText weight="semibold" style={styles.primaryButtonText}>
                      {loading ? "Logging in..." : "Log In"}
                    </AppText>
                  </LinearGradient>
                </TouchableOpacity>

                {/* Divider */}
                <View style={styles.dividerContainer}>
                  <View style={styles.dividerLine} />
                  <AppText weight="regular" style={styles.dividerText}>
                    Don't have an account?
                  </AppText>
                  <View style={styles.dividerLine} />
                </View>

                {/* Signup Link */}
                <TouchableOpacity
                  onPress={() => {
                    setMode("signup");
                    resetForm();
                  }}
                  style={styles.signupLinkButton}
                >
                  <AppText weight="semibold" style={styles.signupLinkText}>
                    Sign Up
                  </AppText>
                </TouchableOpacity>
              </View>
            )}

            {/* Signup Form */}
            {!isLoginMode && (
              <View style={{}}>
                {/* Full Name */}
                <View style={styles.inputGroup}>
                  <AppText weight="medium" style={styles.label}>
                    Full Name
                  </AppText>
                  <View style={styles.inputWrapper}>
                    <Image source={image.person} style={styles.inputIcon} />
                    <AppTextInput
                      placeholder="John Doe"
                      value={fullName}
                      onChangeText={setFullName}
                      editable={!loading}
                      style={styles.input}
                    />
                  </View>
                </View>

                {/* Email */}
                <View style={styles.inputGroup}>
                  <AppText weight="medium" style={styles.label}>
                    Email Address
                  </AppText>
                  <View style={styles.inputWrapper}>
                    <Image source={image.mail} style={styles.inputIcon} />
                    <AppTextInput
                      placeholder="you@example.com"
                      value={email}
                      onChangeText={setEmail}
                      keyboardType="email-address"
                      editable={!loading}
                      style={styles.input}
                    />
                  </View>
                </View>

                {/* Phone Number */}
                <View style={styles.inputGroup}>
                  <AppText weight="medium" style={styles.label}>
                    Phone Number
                  </AppText>
                  <View style={styles.inputWrapper}>
                    <Image source={image.phone} style={styles.inputIcon} />
                    <AppTextInput
                      placeholder="08X-XXX-XXXX"
                      value={phoneNumber}
                      onChangeText={setPhoneNumber}
                      keyboardType="phone-pad"
                      editable={!loading}
                      style={styles.input}
                    />
                  </View>
                </View>

                {/* Password */}
                <View style={styles.inputGroup}>
                  <AppText weight="medium" style={styles.label}>
                    Password
                  </AppText>
                  <View style={styles.inputWrapper}>
                    <Image source={image.password} style={styles.inputIcon} />
                    <AppTextInput
                      placeholder="••••••••"
                      value={password}
                      onChangeText={setPassword}
                      secureTextEntry={!showPassword}
                      editable={!loading}
                      style={styles.input}
                    />
                    <TouchableOpacity
                      onPress={() => setShowPassword(!showPassword)}
                      style={styles.eyeIcon}
                    >
                      <Image
                        source={showPassword ? image.show_eye : image.close_eye}
                        style={styles.eyeIconImage}
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Confirm Password */}
                <View style={styles.inputGroup}>
                  <AppText weight="medium" style={styles.label}>
                    Confirm Password
                  </AppText>
                  <View style={styles.inputWrapper}>
                    <Image source={image.password} style={styles.inputIcon} />
                    <AppTextInput
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      secureTextEntry={!showConfirmPassword}
                      editable={!loading}
                      style={styles.input}
                    />
                    <TouchableOpacity
                      onPress={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      style={styles.eyeIcon}
                    >
                      <Image
                        source={
                          showConfirmPassword ? image.show_eye : image.close_eye
                        }
                        style={styles.eyeIconImage}
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Signup Button */}
                <TouchableOpacity
                  onPress={handleSignup}
                  disabled={loading}
                  style={styles.primaryButtonWrapper}
                >
                  <LinearGradient
                    colors={["#00112E", "#003994"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.primaryButton}
                  >
                    <AppText weight="semibold" style={styles.primaryButtonText}>
                      {loading ? "Creating Account..." : "Create Account"}
                    </AppText>
                  </LinearGradient>
                </TouchableOpacity>

                {/* Divider */}
                <View style={styles.dividerContainer}>
                  <View style={styles.dividerLine} />
                  <AppText weight="regular" style={styles.dividerText}>
                    Already have an account?
                  </AppText>
                  <View style={styles.dividerLine} />
                </View>

                {/* Login Link */}
                <TouchableOpacity
                  onPress={() => {
                    setMode("login");
                    resetForm();
                  }}
                  style={styles.loginLinkButton}
                >
                  <AppText weight="semibold" style={styles.loginLinkText}>
                    Log In
                  </AppText>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.6)",
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 8,
  },
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  modalContent: {
    backgroundColor: "#FFF",
    borderRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 30,
    maxHeight: height * 0.9,
    width: "90%",
    elevation: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
  },
  closeButton: {
    position: "absolute",
    top: 15,
    right: 20,
    width: 40,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  closeButtonText: {
    fontSize: 24,
    color: "#666",
  },
  header: {
    marginBottom: 30,
    marginTop: 10,
  },
  title: {
    fontSize: 24,
    color: "#001A3D",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 13,
    color: "#666",
    lineHeight: 20,
  },
  inputGroup: {
    marginBottom: 18,
  },
  label: {
    fontSize: 12,
    color: "#333",
    marginBottom: 8,
    fontWeight: "600",
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    paddingHorizontal: 12,
    backgroundColor: "#FAFAFA",
    height: 50,
  },
  inputIcon: {
    width: 20,
    height: 20,
    resizeMode: "contain",
    marginRight: 10,
    tintColor: "#999",
  },
  input: {
    flex: 1,
    fontSize: 14,
    color: "#333",
    padding: 0,
  },
  eyeIcon: {
    padding: 8,
    marginLeft: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  eyeIconImage: {
    width: 20,
    height: 20,
    resizeMode: "contain",
    tintColor: "#999",
  },
  eyeIconText: {
    fontSize: 18,
  },
  forgotPasswordContainer: {
    alignItems: "flex-end",
    marginBottom: 20,
  },
  forgotPassword: {
    fontSize: 12,
    color: "#0088FF",
  },
  primaryButtonWrapper: {
    borderRadius: 12,
    overflow: "hidden",
    marginTop: 30,
  },
  primaryButton: {
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryButtonText: {
    fontSize: 16,
    color: "#FFF",
    fontWeight: "600",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: "#E0E0E0",
  },
  dividerText: {
    fontSize: 12,
    color: "#999",
    marginHorizontal: 12,
    fontWeight: "500",
  },
  signupLinkButton: {
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    backgroundColor: "#F5F5F5",
  },
  signupLinkText: {
    fontSize: 14,
    color: "#003994",
    fontWeight: "600",
  },
  loginLinkButton: {
    paddingVertical: 14,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    backgroundColor: "#F5F5F5",
  },
  loginLinkText: {
    fontSize: 14,
    color: "#003994",
    fontWeight: "600",
  },
});
