import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import LottieView from "lottie-react-native";
import React, { useState } from "react";
import {
  Alert,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from "react-native";
import { image } from "../../assets/images";
import { useAuth } from "../../contexts/AuthContext";
import { apiService } from "../../utils/api";
import { AppText } from "./appText";
import { AppTextInput } from "./appTextInput";

interface AuthModalProps {
  visible: boolean;
  onClose: () => void;
}

type AuthMode =
  | "login"
  | "pdpa"
  | "signup"
  | "forgot-password"
  | "reset-password";

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
  const [pdpaAccepted, setPdpaAccepted] = useState(false);

  // Forgot/Reset Password states
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setFullName("");
    setPhoneNumber("");
    setConfirmPassword("");
    setShowPassword(false);
    setShowConfirmPassword(false);
    setPdpaAccepted(false);
    setResetToken("");
    setNewPassword("");
    setShowNewPassword(false);
    setForgotEmail("");
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
    try {
      const { user } = await apiService.auth.login({ email, password });
      loginSuccess(user);
      Alert.alert("สำเร็จ", "เข้าสู่ระบบสำเร็จ");
      handleClose();
      if (user.role === "admin") {
        router.replace("/admin");
      } else {
        router.replace("/tabs/home");
      }
    } catch (error: any) {
      Alert.alert("ข้อผิดพลาด", error.message || "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
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
    try {
      const { user } = await apiService.auth.register({
        name: fullName,
        email,
        password,
        phone_number: phoneNumber,
      });
      loginSuccess(user);
      Alert.alert("สำเร็จ", "สร้างบัญชีสำเร็จ");
      handleClose();
      router.replace("/tabs/home");
    } catch (error: any) {
      Alert.alert("ข้อผิดพลาด", error.message || "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!forgotEmail) {
      Alert.alert("ข้อผิดพลาด", "กรุณากรอกอีเมล");
      return;
    }
    setLoading(true);
    try {
      const result = await apiService.auth.forgotPassword({
        email: forgotEmail,
      });
      Alert.alert(
        "สำเร็จ",
        result.message || "ส่งลิงก์รีเซ็ตรหัสผ่านไปยังอีเมลของคุณแล้ว",
      );
      // ย้ายไปหน้า reset-password พร้อมเก็บ email ไว้
      setEmail(forgotEmail);
      setMode("reset-password");
    } catch (error: any) {
      Alert.alert("ข้อผิดพลาด", error.message || "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!email || !resetToken || !newPassword) {
      Alert.alert("ข้อผิดพลาด", "กรุณากรอกข้อมูลทั้งหมด");
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert("ข้อผิดพลาด", "รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร");
      return;
    }
    setLoading(true);
    try {
      const result = await apiService.auth.resetPassword({
        email,
        token: resetToken,
        password: newPassword,
      });
      Alert.alert(
        "สำเร็จ",
        result.message || "เปลี่ยนรหัสผ่านสำเร็จ กรุณาเข้าสู่ระบบใหม่",
      );
      resetForm();
      setMode("login");
    } catch (error: any) {
      Alert.alert("ข้อผิดพลาด", error.message || "เกิดข้อผิดพลาด");
    } finally {
      setLoading(false);
    }
  };

  const getTitle = () => {
    switch (mode) {
      case "login":
        return "Log In";
      case "pdpa":
        return "Privacy Policy";
      case "signup":
        return "Sign Up";
      case "forgot-password":
        return "Forgot Password";
      case "reset-password":
        return "Reset Password";
    }
  };

  const getSubtitle = () => {
    switch (mode) {
      case "login":
        return "Sign in to place your bid and join the auction";
      case "pdpa":
        return "นโยบายคุ้มครองข้อมูลส่วนบุคคล (PDPA)";
      case "signup":
        return "Create your account to start bidding";
      case "forgot-password":
        return "Enter your email to receive a password reset token";
      case "reset-password":
        return "Enter the token from your email and set a new password";
    }
  };

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
              <AppText weight="semibold" numberOfLines={1} style={styles.title}>
                {getTitle()}
              </AppText>
              <AppText
                weight="regular"
                numberOfLines={3}
                style={styles.subtitle}
              >
                {getSubtitle()}
              </AppText>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              bounces={false}
              keyboardShouldPersistTaps="handled"
            >
              {/* ═══════════════════════════════════════════ */}
              {/* Login Form */}
              {/* ═══════════════════════════════════════════ */}
              {mode === "login" && (
                <View>
                  {/* Email */}
                  <View style={styles.inputGroup}>
                    <AppText
                      weight="medium"
                      numberOfLines={1}
                      style={styles.label}
                    >
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
                    <AppText
                      weight="medium"
                      numberOfLines={1}
                      style={styles.label}
                    >
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
                          source={
                            showPassword ? image.close_eye : image.show_eye
                          }
                          style={styles.eyeIconImage}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Forgot Password Link */}
                  <TouchableOpacity
                    onPress={() => {
                      setForgotEmail(email);
                      setMode("forgot-password");
                    }}
                    style={styles.forgotPasswordContainer}
                  >
                    <AppText
                      weight="medium"
                      numberOfLines={1}
                      style={styles.forgotPassword}
                    >
                      Forgot Password?
                    </AppText>
                  </TouchableOpacity>

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
                      <AppText
                        weight="semibold"
                        numberOfLines={1}
                        style={styles.primaryButtonText}
                      >
                        {loading ? "Logging in..." : "Log In"}
                      </AppText>
                    </LinearGradient>
                  </TouchableOpacity>

                  {/* Divider */}
                  <View style={styles.dividerContainer}>
                    <View style={styles.dividerLine} />
                    <AppText
                      weight="regular"
                      numberOfLines={1}
                      style={styles.dividerText}
                    >
                      Don't have an account?
                    </AppText>
                    <View style={styles.dividerLine} />
                  </View>

                  {/* Signup Link */}
                  <TouchableOpacity
                    onPress={() => {
                      resetForm();
                      setMode("pdpa");
                    }}
                    style={styles.signupLinkButton}
                  >
                    <AppText
                      weight="semibold"
                      numberOfLines={1}
                      style={styles.signupLinkText}
                    >
                      Sign Up
                    </AppText>
                  </TouchableOpacity>
                </View>
              )}

              {/* ═══════════════════════════════════════════ */}
              {/* PDPA Consent */}
              {/* ═══════════════════════════════════════════ */}
              {mode === "pdpa" && (
                <View>
                  {/* PDPA Content Box */}
                  <View style={styles.pdpaBox}>
                    <ScrollView
                      style={styles.pdpaScroll}
                      nestedScrollEnabled
                      showsVerticalScrollIndicator={true}
                    >
                      <AppText weight="bold" style={styles.pdpaSectionTitle}>
                        1. ข้อมูลส่วนบุคคลที่เราจัดเก็บ
                      </AppText>
                      <AppText weight="regular" style={styles.pdpaText}>
                        เมื่อท่านสมัครสมาชิกและใช้งานแอปพลิเคชัน BidKhong
                        ระบบจะจัดเก็บข้อมูลส่วนบุคคลดังต่อไปนี้:{"\n"}•
                        ชื่อ-นามสกุล (Full Name){"\n"}• อีเมล (Email Address)
                        {"\n"}• หมายเลขโทรศัพท์ (Phone Number){"\n"}• รหัสผ่าน
                        (Password) ในรูปแบบเข้ารหัส{"\n"}• รูปโปรไฟล์ (Profile
                        Picture)
                      </AppText>

                      <AppText weight="bold" style={styles.pdpaSectionTitle}>
                        2. วัตถุประสงค์ในการจัดเก็บข้อมูล
                      </AppText>
                      <AppText weight="regular" style={styles.pdpaText}>
                        • เพื่อยืนยันตัวตนและจัดการบัญชีผู้ใช้{"\n"}•
                        เพื่อดำเนินธุรกรรมการประมูลและซื้อขายสินค้า{"\n"}•
                        เพื่อการติดต่อสื่อสารระหว่างผู้ซื้อและผู้ขาย{"\n"}•
                        เพื่อจัดการกระเป๋าเงิน การเติมเงิน และการถอนเงิน{"\n"}•
                        เพื่อปรับปรุงและพัฒนาการให้บริการ
                      </AppText>

                      <AppText weight="bold" style={styles.pdpaSectionTitle}>
                        3. การเปิดเผยข้อมูล
                      </AppText>
                      <AppText weight="regular" style={styles.pdpaText}>
                        ข้อมูลส่วนบุคคลของท่านจะถูกเปิดเผยเฉพาะในกรณีดังต่อไปนี้:
                        {"\n"}• แสดงข้อมูลผู้ขายแก่ผู้ชนะการประมูล (ชื่อ,
                        เบอร์โทร, อีเมล){"\n"}• เปิดเผยต่อผู้ดูแลระบบ (Admin)
                        เพื่อตรวจสอบและแก้ไขปัญหา{"\n"}•
                        เปิดเผยตามที่กฎหมายกำหนด
                      </AppText>

                      <AppText weight="bold" style={styles.pdpaSectionTitle}>
                        4. สิทธิ์ของเจ้าของข้อมูล
                      </AppText>
                      <AppText weight="regular" style={styles.pdpaText}>
                        ท่านมีสิทธิ์ตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล พ.ศ. 2562
                        ดังนี้:{"\n"}• สิทธิ์ในการเข้าถึงและขอสำเนาข้อมูล{"\n"}•
                        สิทธิ์ในการแก้ไขข้อมูลให้ถูกต้อง{"\n"}•
                        สิทธิ์ในการขอลบข้อมูล{"\n"}•
                        สิทธิ์ในการเพิกถอนความยินยอม{"\n"}• สิทธิ์ในการร้องเรียน
                      </AppText>

                      <AppText weight="bold" style={styles.pdpaSectionTitle}>
                        5. การรักษาความปลอดภัย
                      </AppText>
                      <AppText weight="regular" style={styles.pdpaText}>
                        BidKhong ใช้มาตรการรักษาความปลอดภัยที่เหมาะสม
                        รวมถึงการเข้ารหัสรหัสผ่าน (Hashing) และการใช้ Token
                        สำหรับยืนยันตัวตน
                        เพื่อป้องกันการเข้าถึงข้อมูลโดยไม่ได้รับอนุญาต
                      </AppText>
                    </ScrollView>
                  </View>

                  {/* Checkbox */}
                  <TouchableOpacity
                    onPress={() => setPdpaAccepted(!pdpaAccepted)}
                    style={styles.pdpaCheckboxRow}
                    activeOpacity={0.7}
                  >
                    <View
                      style={[
                        styles.pdpaCheckbox,
                        pdpaAccepted && styles.pdpaCheckboxChecked,
                      ]}
                    >
                      {pdpaAccepted && (
                        <AppText weight="bold" style={styles.pdpaCheckmark}>
                          ✓
                        </AppText>
                      )}
                    </View>
                    <AppText weight="regular" style={styles.pdpaCheckboxLabel}>
                      ข้าพเจ้ายอมรับนโยบายคุ้มครองข้อมูลส่วนบุคคล
                      และยินยอมให้จัดเก็บ ใช้ และเปิดเผยข้อมูลตามที่ระบุข้างต้น
                    </AppText>
                  </TouchableOpacity>

                  {/* Accept Button */}
                  <TouchableOpacity
                    onPress={() => {
                      if (!pdpaAccepted) {
                        Alert.alert(
                          "กรุณายอมรับ PDPA",
                          "ท่านต้องยอมรับนโยบายคุ้มครองข้อมูลส่วนบุคคลก่อนสมัครสมาชิก",
                        );
                        return;
                      }
                      setMode("signup");
                    }}
                    style={[
                      styles.primaryButtonWrapper,
                      { opacity: pdpaAccepted ? 1 : 0.5 },
                    ]}
                  >
                    <LinearGradient
                      colors={
                        pdpaAccepted ? ["#00112E", "#003994"] : ["#999", "#BBB"]
                      }
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.primaryButton}
                    >
                      <AppText
                        weight="semibold"
                        numberOfLines={1}
                        style={styles.primaryButtonText}
                      >
                        ยอมรับและดำเนินการต่อ
                      </AppText>
                    </LinearGradient>
                  </TouchableOpacity>

                  {/* Divider */}
                  <View style={styles.dividerContainer}>
                    <View style={styles.dividerLine} />
                    <AppText
                      weight="regular"
                      numberOfLines={1}
                      style={styles.dividerText}
                    >
                      Already have an account?
                    </AppText>
                    <View style={styles.dividerLine} />
                  </View>

                  {/* Back to Login */}
                  <TouchableOpacity
                    onPress={() => {
                      setMode("login");
                      resetForm();
                    }}
                    style={styles.loginLinkButton}
                  >
                    <AppText
                      weight="semibold"
                      numberOfLines={1}
                      style={styles.loginLinkText}
                    >
                      Back to Log In
                    </AppText>
                  </TouchableOpacity>
                </View>
              )}

              {/* ═══════════════════════════════════════════ */}
              {/* Signup Form */}
              {/* ═══════════════════════════════════════════ */}
              {mode === "signup" && (
                <View>
                  {/* Full Name */}
                  <View style={styles.inputGroup}>
                    <AppText
                      weight="medium"
                      numberOfLines={1}
                      style={styles.label}
                    >
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
                    <AppText
                      weight="medium"
                      numberOfLines={1}
                      style={styles.label}
                    >
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
                    <AppText
                      weight="medium"
                      numberOfLines={1}
                      style={styles.label}
                    >
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
                    <AppText
                      weight="medium"
                      numberOfLines={1}
                      style={styles.label}
                    >
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
                          source={
                            showPassword ? image.show_eye : image.close_eye
                          }
                          style={styles.eyeIconImage}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Confirm Password */}
                  <View style={styles.inputGroup}>
                    <AppText
                      weight="medium"
                      numberOfLines={1}
                      style={styles.label}
                    >
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
                            showConfirmPassword
                              ? image.show_eye
                              : image.close_eye
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
                      <AppText
                        weight="semibold"
                        numberOfLines={1}
                        style={styles.primaryButtonText}
                      >
                        {loading ? "Creating Account..." : "Create Account"}
                      </AppText>
                    </LinearGradient>
                  </TouchableOpacity>

                  {/* Divider */}
                  <View style={styles.dividerContainer}>
                    <View style={styles.dividerLine} />
                    <AppText
                      weight="regular"
                      numberOfLines={1}
                      style={styles.dividerText}
                    >
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
                    <AppText
                      weight="semibold"
                      numberOfLines={1}
                      style={styles.loginLinkText}
                    >
                      Log In
                    </AppText>
                  </TouchableOpacity>
                </View>
              )}

              {/* ═══════════════════════════════════════════ */}
              {/* Forgot Password Form */}
              {/* ═══════════════════════════════════════════ */}
              {mode === "forgot-password" && (
                <View>
                  {/* Email */}
                  <View style={styles.inputGroup}>
                    <AppText
                      weight="medium"
                      numberOfLines={1}
                      style={styles.label}
                    >
                      Email Address
                    </AppText>
                    <View style={styles.inputWrapper}>
                      <Image source={image.mail} style={styles.inputIcon} />
                      <AppTextInput
                        placeholder="you@example.com"
                        value={forgotEmail}
                        onChangeText={setForgotEmail}
                        keyboardType="email-address"
                        editable={!loading}
                        style={styles.input}
                      />
                    </View>
                  </View>

                  {/* Send Reset Token Button */}
                  <TouchableOpacity
                    onPress={handleForgotPassword}
                    disabled={loading}
                    style={styles.primaryButtonWrapper}
                  >
                    <LinearGradient
                      colors={["#00112E", "#003994"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.primaryButton}
                    >
                      <AppText
                        weight="semibold"
                        numberOfLines={1}
                        style={styles.primaryButtonText}
                      >
                        {loading ? "Sending..." : "Send Reset Token"}
                      </AppText>
                    </LinearGradient>
                  </TouchableOpacity>

                  {/* Already have token? */}
                  <TouchableOpacity
                    onPress={() => {
                      setEmail(forgotEmail);
                      setMode("reset-password");
                    }}
                    style={styles.alreadyHaveTokenContainer}
                  >
                    <AppText
                      weight="medium"
                      numberOfLines={1}
                      adjustsFontSizeToFit
                      style={styles.alreadyHaveToken}
                    >
                      Already have a token? Reset Password
                    </AppText>
                  </TouchableOpacity>

                  {/* Divider */}
                  <View style={styles.dividerContainer}>
                    <View style={styles.dividerLine} />
                    <AppText
                      weight="regular"
                      numberOfLines={1}
                      style={styles.dividerText}
                    >
                      Remember your password?
                    </AppText>
                    <View style={styles.dividerLine} />
                  </View>

                  {/* Back to Login */}
                  <TouchableOpacity
                    onPress={() => {
                      setMode("login");
                      resetForm();
                    }}
                    style={styles.loginLinkButton}
                  >
                    <AppText
                      weight="semibold"
                      numberOfLines={1}
                      style={styles.loginLinkText}
                    >
                      Back to Log In
                    </AppText>
                  </TouchableOpacity>
                </View>
              )}

              {/* ═══════════════════════════════════════════ */}
              {/* Reset Password Form */}
              {/* ═══════════════════════════════════════════ */}
              {mode === "reset-password" && (
                <View>
                  {/* Email (pre-filled, editable) */}
                  <View style={styles.inputGroup}>
                    <AppText
                      weight="medium"
                      numberOfLines={1}
                      style={styles.label}
                    >
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

                  {/* Token */}
                  <View style={styles.inputGroup}>
                    <AppText
                      weight="medium"
                      numberOfLines={1}
                      style={styles.label}
                    >
                      Reset Token
                    </AppText>
                    <View style={styles.inputWrapper}>
                      <Image source={image.password} style={styles.inputIcon} />
                      <AppTextInput
                        placeholder="Paste token from email"
                        value={resetToken}
                        onChangeText={setResetToken}
                        editable={!loading}
                        style={styles.input}
                      />
                    </View>
                  </View>

                  {/* New Password */}
                  <View style={styles.inputGroup}>
                    <AppText
                      weight="medium"
                      numberOfLines={1}
                      style={styles.label}
                    >
                      New Password
                    </AppText>
                    <View style={styles.inputWrapper}>
                      <Image source={image.password} style={styles.inputIcon} />
                      <AppTextInput
                        placeholder="••••••••"
                        value={newPassword}
                        onChangeText={setNewPassword}
                        secureTextEntry={!showNewPassword}
                        editable={!loading}
                        style={styles.input}
                      />
                      <TouchableOpacity
                        onPress={() => setShowNewPassword(!showNewPassword)}
                        style={styles.eyeIcon}
                      >
                        <Image
                          source={
                            showNewPassword ? image.close_eye : image.show_eye
                          }
                          style={styles.eyeIconImage}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Reset Password Button */}
                  <TouchableOpacity
                    onPress={handleResetPassword}
                    disabled={loading}
                    style={styles.primaryButtonWrapper}
                  >
                    <LinearGradient
                      colors={["#00112E", "#003994"]}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 0 }}
                      style={styles.primaryButton}
                    >
                      <AppText
                        weight="semibold"
                        numberOfLines={1}
                        style={styles.primaryButtonText}
                      >
                        {loading ? "Resetting..." : "Reset Password"}
                      </AppText>
                    </LinearGradient>
                  </TouchableOpacity>

                  {/* Divider */}
                  <View style={styles.dividerContainer}>
                    <View style={styles.dividerLine} />
                    <AppText
                      weight="regular"
                      numberOfLines={1}
                      style={styles.dividerText}
                    >
                      Remember your password?
                    </AppText>
                    <View style={styles.dividerLine} />
                  </View>

                  {/* Back to Login */}
                  <TouchableOpacity
                    onPress={() => {
                      setMode("login");
                      resetForm();
                    }}
                    style={styles.loginLinkButton}
                  >
                    <AppText
                      weight="semibold"
                      numberOfLines={1}
                      style={styles.loginLinkText}
                    >
                      Back to Log In
                    </AppText>
                  </TouchableOpacity>
                </View>
              )}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>

      {/* Loading Overlay */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <View style={styles.loadingBox}>
            <LottieView
              source={require("../../assets/animations/loading.json")}
              autoPlay
              loop
              style={{ width: 100, height: 100 }}
            />
            <AppText weight="medium" style={styles.loadingOverlayText}>
              {mode === "login"
                ? "Logging in..."
                : mode === "signup"
                  ? "Creating account..."
                  : mode === "forgot-password"
                    ? "Sending..."
                    : mode === "reset-password"
                      ? "Resetting..."
                      : "Please wait..."}
            </AppText>
          </View>
        </View>
      )}
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
    marginBottom: 4,
    marginTop: -8,
  },
  forgotPassword: {
    fontSize: 12,
    color: "#0088FF",
  },
  alreadyHaveTokenContainer: {
    alignItems: "center",
    marginTop: 16,
  },
  alreadyHaveToken: {
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
  // PDPA Styles
  pdpaBox: {
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 12,
    backgroundColor: "#FAFAFA",
    padding: 16,
    marginBottom: 16,
    height: height * 0.35,
  },
  pdpaScroll: {
    flexGrow: 1,
  },
  pdpaSectionTitle: {
    fontSize: 13,
    color: "#001A3D",
    marginTop: 12,
    marginBottom: 6,
  },
  pdpaText: {
    fontSize: 12,
    color: "#555",
    lineHeight: 20,
  },
  pdpaCheckboxRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 4,
    gap: 10,
  },
  pdpaCheckbox: {
    width: 22,
    height: 22,
    borderWidth: 2,
    borderColor: "#CCC",
    borderRadius: 4,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 2,
    flexShrink: 0,
  },
  pdpaCheckboxChecked: {
    backgroundColor: "#003994",
    borderColor: "#003994",
  },
  pdpaCheckmark: {
    fontSize: 14,
    color: "#FFF",
    marginTop: -1,
  },
  pdpaCheckboxLabel: {
    fontSize: 12,
    color: "#555",
    flex: 1,
    lineHeight: 18,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
  loadingBox: {
    backgroundColor: "#FFF",
    borderRadius: 20,
    paddingHorizontal: 30,
    paddingTop: 20,
    paddingBottom: 16,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  loadingOverlayText: {
    fontSize: 14,
    color: "#374151",
    marginTop: 4,
  },
});
