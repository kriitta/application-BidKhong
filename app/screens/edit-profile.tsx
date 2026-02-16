import { image } from "@/assets/images";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Animated,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { authService, User } from "../../utils/authService";
import { AppText } from "../components/appText";

const EditProfilePage = () => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  // Password change
  const [showPasswordSection, setShowPasswordSection] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  // Track changes
  const [hasChanges, setHasChanges] = useState(false);

  // Animation
  const successAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loadUser = async () => {
      const currentUser = await authService.getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
        setFullName(currentUser.fullName);
        setEmail(currentUser.email);
        setPhoneNumber(currentUser.phoneNumber || "");
      }
      setLoading(false);
    };
    loadUser();
  }, []);

  useEffect(() => {
    if (!user) return;
    const changed =
      fullName !== user.fullName ||
      email !== user.email ||
      phoneNumber !== (user.phoneNumber || "");
    setHasChanges(changed);
  }, [fullName, email, phoneNumber, user]);

  const showSuccess = () => {
    successAnim.setValue(0);
    Animated.sequence([
      Animated.timing(successAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(1500),
      Animated.timing(successAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleSaveProfile = async () => {
    Keyboard.dismiss();

    if (!fullName.trim()) {
      Alert.alert("ข้อผิดพลาด", "กรุณากรอกชื่อ-นามสกุล");
      return;
    }
    if (!email.trim()) {
      Alert.alert("ข้อผิดพลาด", "กรุณากรอกอีเมล");
      return;
    }
    if (!email.includes("@")) {
      Alert.alert("ข้อผิดพลาด", "กรุณากรอกอีเมลให้ถูกต้อง");
      return;
    }
    if (!phoneNumber.trim()) {
      Alert.alert("ข้อผิดพลาด", "กรุณากรอกเบอร์โทรศัพท์");
      return;
    }

    setSaving(true);
    const result = await authService.updateProfile({
      fullName: fullName.trim(),
      email: email.trim(),
      phoneNumber: phoneNumber.trim(),
    });
    setSaving(false);

    if (result.success && result.user) {
      setUser(result.user);
      setHasChanges(false);
      showSuccess();
    } else {
      Alert.alert("ข้อผิดพลาด", result.message);
    }
  };

  const handleChangePassword = async () => {
    Keyboard.dismiss();

    if (!currentPassword.trim()) {
      Alert.alert("ข้อผิดพลาด", "กรุณากรอกรหัสผ่านปัจจุบัน");
      return;
    }
    if (!newPassword.trim()) {
      Alert.alert("ข้อผิดพลาด", "กรุณากรอกรหัสผ่านใหม่");
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert("ข้อผิดพลาด", "รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("ข้อผิดพลาด", "รหัสผ่านใหม่ไม่ตรงกัน");
      return;
    }

    setChangingPassword(true);
    const result = await authService.changePassword(
      currentPassword,
      newPassword,
    );
    setChangingPassword(false);

    if (result.success) {
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setShowPasswordSection(false);
      Alert.alert("สำเร็จ ✅", result.message);
    } else {
      Alert.alert("ข้อผิดพลาด", result.message);
    }
  };

  const handleGoBack = () => {
    if (hasChanges) {
      Alert.alert(
        "ยังไม่ได้บันทึก",
        "คุณมีการเปลี่ยนแปลงที่ยังไม่ได้บันทึก ต้องการออกหรือไม่?",
        [
          { text: "อยู่ต่อ" },
          {
            text: "ออกโดยไม่บันทึก",
            style: "destructive",
            onPress: () => router.back(),
          },
        ],
      );
    } else {
      router.back();
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0088FF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={["#00112E", "#003994"]} style={styles.header}>
        <SafeAreaView edges={["top"]} style={styles.headerInner}>
          <TouchableOpacity onPress={handleGoBack} style={styles.backBtn}>
            <Image
              source={image.back}
              style={{ width: 24, height: 24, tintColor: "#FFF" }}
            />
          </TouchableOpacity>
          <AppText weight="bold" style={styles.headerTitle}>
            Edit Profile
          </AppText>
          <TouchableOpacity
            onPress={handleSaveProfile}
            disabled={!hasChanges || saving}
            style={[
              styles.saveBtn,
              (!hasChanges || saving) && { opacity: 0.4 },
            ]}
          >
            {saving ? (
              <ActivityIndicator size="small" color="#FFF" />
            ) : (
              <AppText weight="semibold" style={styles.saveBtnText}>
                Save
              </AppText>
            )}
          </TouchableOpacity>
        </SafeAreaView>
      </LinearGradient>

      {/* Success Toast */}
      <Animated.View
        style={[
          styles.successToast,
          {
            opacity: successAnim,
            transform: [
              {
                translateY: successAnim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-50, 0],
                }),
              },
            ],
          },
        ]}
        pointerEvents="none"
      >
        <AppText weight="semibold" style={styles.successToastText}>
          ✅ บันทึกข้อมูลสำเร็จ
        </AppText>
      </Animated.View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Profile Picture Section */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarContainer}>
              <Image source={image.bang} style={styles.avatarImage} />
              <TouchableOpacity
                style={styles.cameraBtn}
                onPress={() =>
                  Alert.alert("เปลี่ยนรูปโปรไฟล์", "ฟีเจอร์นี้จะมาในเร็วๆนี้")
                }
              >
                <AppText style={{ fontSize: 14 }}>📷</AppText>
              </TouchableOpacity>
            </View>
            <TouchableOpacity
              onPress={() =>
                Alert.alert("เปลี่ยนรูปโปรไฟล์", "ฟีเจอร์นี้จะมาในเร็วๆนี้")
              }
            >
              <AppText weight="medium" style={styles.changePhotoText}>
                Change Photo
              </AppText>
            </TouchableOpacity>
          </View>

          {/* Personal Info Section */}
          <View style={styles.section}>
            <AppText weight="semibold" style={styles.sectionTitle}>
              📋 ข้อมูลส่วนตัว
            </AppText>

            <View style={styles.inputGroup}>
              <AppText weight="medium" style={styles.inputLabel}>
                ชื่อ-นามสกุล
              </AppText>
              <View style={styles.inputWrapper}>
                <Image source={image.person} style={styles.inputIcon} />
                <TextInput
                  style={styles.textInput}
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="กรอกชื่อ-นามสกุล"
                  placeholderTextColor="#C0C0C0"
                  autoCorrect={false}
                />
                {fullName !== user?.fullName && fullName.trim() !== "" && (
                  <View style={styles.changedDot} />
                )}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <AppText weight="medium" style={styles.inputLabel}>
                อีเมล
              </AppText>
              <View style={styles.inputWrapper}>
                <Image
                  source={image.mail}
                  style={[styles.inputIcon, { width: 20, height: 16 }]}
                />
                <TextInput
                  style={styles.textInput}
                  value={email}
                  onChangeText={setEmail}
                  placeholder="กรอกอีเมล"
                  placeholderTextColor="#C0C0C0"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                {email !== user?.email && email.trim() !== "" && (
                  <View style={styles.changedDot} />
                )}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <AppText weight="medium" style={styles.inputLabel}>
                เบอร์โทรศัพท์
              </AppText>
              <View style={styles.inputWrapper}>
                <Image
                  source={image.phone}
                  style={[styles.inputIcon, { width: 18, height: 18 }]}
                />
                <TextInput
                  style={styles.textInput}
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  placeholder="กรอกเบอร์โทรศัพท์"
                  placeholderTextColor="#C0C0C0"
                  keyboardType="phone-pad"
                />
                {phoneNumber !== (user?.phoneNumber || "") &&
                  phoneNumber.trim() !== "" && (
                    <View style={styles.changedDot} />
                  )}
              </View>
            </View>

            {/* User ID (read-only) */}
            <View style={styles.inputGroup}>
              <AppText weight="medium" style={styles.inputLabel}>
                User ID
              </AppText>
              <View style={[styles.inputWrapper, styles.inputDisabled]}>
                <AppText style={{ fontSize: 16, marginRight: 10 }}>🆔</AppText>
                <AppText weight="regular" style={styles.disabledText}>
                  {user?.id}
                </AppText>
              </View>
            </View>

            {/* Role (read-only) */}
            <View style={styles.inputGroup}>
              <AppText weight="medium" style={styles.inputLabel}>
                บทบาท
              </AppText>
              <View style={[styles.inputWrapper, styles.inputDisabled]}>
                <AppText style={{ fontSize: 16, marginRight: 10 }}>👤</AppText>
                <AppText weight="regular" style={styles.disabledText}>
                  {user?.role === "admin" ? "ผู้ดูแลระบบ" : "ผู้ใช้ทั่วไป"}
                </AppText>
                <View
                  style={[
                    styles.roleBadge,
                    {
                      backgroundColor:
                        user?.role === "admin" ? "#FEF3C7" : "#E8F0FF",
                    },
                  ]}
                >
                  <AppText
                    weight="semibold"
                    style={{
                      fontSize: 10,
                      color: user?.role === "admin" ? "#D97706" : "#3B82F6",
                    }}
                  >
                    {user?.role === "admin" ? "ADMIN" : "USER"}
                  </AppText>
                </View>
              </View>
            </View>
          </View>

          {/* Password Section */}
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.sectionHeaderBtn}
              onPress={() => setShowPasswordSection(!showPasswordSection)}
            >
              <AppText weight="semibold" style={styles.sectionTitle}>
                🔒 เปลี่ยนรหัสผ่าน
              </AppText>
              <AppText weight="regular" style={styles.expandArrow}>
                {showPasswordSection ? "▲" : "▼"}
              </AppText>
            </TouchableOpacity>

            {showPasswordSection && (
              <View style={styles.passwordFields}>
                <View style={styles.inputGroup}>
                  <AppText weight="medium" style={styles.inputLabel}>
                    รหัสผ่านปัจจุบัน
                  </AppText>
                  <View style={styles.inputWrapper}>
                    <Image
                      source={image.password}
                      style={[styles.inputIcon, { width: 18, height: 20 }]}
                    />
                    <TextInput
                      style={styles.textInput}
                      value={currentPassword}
                      onChangeText={setCurrentPassword}
                      placeholder="กรอกรหัสผ่านปัจจุบัน"
                      placeholderTextColor="#C0C0C0"
                      secureTextEntry={!showCurrentPw}
                      autoCorrect={false}
                    />
                    <TouchableOpacity
                      onPress={() => setShowCurrentPw(!showCurrentPw)}
                    >
                      <Image
                        source={
                          showCurrentPw ? image.show_eye : image.close_eye
                        }
                        style={{ width: 22, height: 18, opacity: 0.4 }}
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <AppText weight="medium" style={styles.inputLabel}>
                    รหัสผ่านใหม่
                  </AppText>
                  <View style={styles.inputWrapper}>
                    <Image
                      source={image.password}
                      style={[styles.inputIcon, { width: 18, height: 20 }]}
                    />
                    <TextInput
                      style={styles.textInput}
                      value={newPassword}
                      onChangeText={setNewPassword}
                      placeholder="กรอกรหัสผ่านใหม่ (อย่างน้อย 6 ตัว)"
                      placeholderTextColor="#C0C0C0"
                      secureTextEntry={!showNewPw}
                      autoCorrect={false}
                    />
                    <TouchableOpacity onPress={() => setShowNewPw(!showNewPw)}>
                      <Image
                        source={showNewPw ? image.show_eye : image.close_eye}
                        style={{ width: 22, height: 18, opacity: 0.4 }}
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.inputGroup}>
                  <AppText weight="medium" style={styles.inputLabel}>
                    ยืนยันรหัสผ่านใหม่
                  </AppText>
                  <View
                    style={[
                      styles.inputWrapper,
                      confirmPassword.length > 0 &&
                        confirmPassword !== newPassword && {
                          borderColor: "#EF4444",
                          borderWidth: 1.5,
                        },
                      confirmPassword.length > 0 &&
                        confirmPassword === newPassword && {
                          borderColor: "#22C55E",
                          borderWidth: 1.5,
                        },
                    ]}
                  >
                    <Image
                      source={image.password}
                      style={[styles.inputIcon, { width: 18, height: 20 }]}
                    />
                    <TextInput
                      style={styles.textInput}
                      value={confirmPassword}
                      onChangeText={setConfirmPassword}
                      placeholder="กรอกรหัสผ่านใหม่อีกครั้ง"
                      placeholderTextColor="#C0C0C0"
                      secureTextEntry={!showConfirmPw}
                      autoCorrect={false}
                    />
                    <TouchableOpacity
                      onPress={() => setShowConfirmPw(!showConfirmPw)}
                    >
                      <Image
                        source={
                          showConfirmPw ? image.show_eye : image.close_eye
                        }
                        style={{ width: 22, height: 18, opacity: 0.4 }}
                      />
                    </TouchableOpacity>
                  </View>
                  {confirmPassword.length > 0 &&
                    confirmPassword !== newPassword && (
                      <AppText weight="regular" style={styles.errorText}>
                        รหัสผ่านไม่ตรงกัน
                      </AppText>
                    )}
                </View>

                <TouchableOpacity
                  style={[
                    styles.changePasswordBtn,
                    changingPassword && { opacity: 0.6 },
                  ]}
                  onPress={handleChangePassword}
                  disabled={changingPassword}
                >
                  <LinearGradient
                    colors={["#3B82F6", "#2563EB"]}
                    style={styles.changePasswordGradient}
                  >
                    {changingPassword ? (
                      <ActivityIndicator size="small" color="#FFF" />
                    ) : (
                      <AppText
                        weight="semibold"
                        style={styles.changePasswordText}
                      >
                        🔑 เปลี่ยนรหัสผ่าน
                      </AppText>
                    )}
                  </LinearGradient>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Save Button (bottom) */}
          <TouchableOpacity
            style={[
              styles.saveBottomBtn,
              (!hasChanges || saving) && { opacity: 0.4 },
            ]}
            onPress={handleSaveProfile}
            disabled={!hasChanges || saving}
          >
            <LinearGradient
              colors={
                hasChanges ? ["#22C55E", "#16A34A"] : ["#9CA3AF", "#6B7280"]
              }
              style={styles.saveBottomGradient}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#FFF" />
              ) : (
                <AppText weight="semibold" style={styles.saveBottomText}>
                  💾 บันทึกการเปลี่ยนแปลง
                </AppText>
              )}
            </LinearGradient>
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F2F4F7",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F2F4F7",
  },
  header: {
    paddingBottom: 15,
  },
  headerInner: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingTop: 10,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 18,
    color: "#FFF",
  },
  saveBtn: {
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  saveBtnText: {
    fontSize: 14,
    color: "#FFF",
  },
  successToast: {
    position: "absolute",
    top: 110,
    left: 40,
    right: 40,
    backgroundColor: "#22C55E",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: "center",
    zIndex: 100,
    shadowColor: "#22C55E",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
  },
  successToastText: {
    fontSize: 15,
    color: "#FFF",
  },
  scrollContent: {
    paddingTop: 20,
    paddingHorizontal: 16,
  },

  // Avatar
  avatarSection: {
    alignItems: "center",
    marginBottom: 24,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 10,
  },
  avatarImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: "#FFF",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
  cameraBtn: {
    position: "absolute",
    bottom: 0,
    right: -4,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: "#3B82F6",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#FFF",
  },
  changePhotoText: {
    fontSize: 14,
    color: "#3B82F6",
  },

  // Section
  section: {
    backgroundColor: "#FFF",
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    color: "#111827",
    marginBottom: 16,
  },
  sectionHeaderBtn: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  expandArrow: {
    fontSize: 12,
    color: "#9CA3AF",
  },

  // Input
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FC",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  inputIcon: {
    width: 18,
    height: 18,
    opacity: 0.4,
    marginRight: 12,
  },
  textInput: {
    flex: 1,
    fontSize: 15,
    color: "#111827",
    padding: 0,
  },
  inputDisabled: {
    backgroundColor: "#F3F4F6",
    borderColor: "#E5E7EB",
  },
  disabledText: {
    flex: 1,
    fontSize: 15,
    color: "#9CA3AF",
  },
  changedDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#3B82F6",
    marginLeft: 6,
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginLeft: "auto",
  },

  // Password
  passwordFields: {
    marginTop: 16,
  },
  changePasswordBtn: {
    borderRadius: 12,
    overflow: "hidden",
    marginTop: 4,
  },
  changePasswordGradient: {
    paddingVertical: 14,
    alignItems: "center",
    borderRadius: 12,
  },
  changePasswordText: {
    fontSize: 15,
    color: "#FFF",
  },
  errorText: {
    fontSize: 12,
    color: "#EF4444",
    marginTop: 4,
    marginLeft: 4,
  },

  // Save Bottom
  saveBottomBtn: {
    borderRadius: 14,
    overflow: "hidden",
    marginTop: 8,
  },
  saveBottomGradient: {
    paddingVertical: 16,
    alignItems: "center",
    borderRadius: 14,
  },
  saveBottomText: {
    fontSize: 16,
    color: "#FFF",
  },
});

export default EditProfilePage;
