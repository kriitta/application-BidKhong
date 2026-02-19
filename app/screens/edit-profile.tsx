import { image } from "@/assets/images";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as ImagePicker from "expo-image-picker";
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
import { useAuth } from "../../contexts/AuthContext";
import { apiService, getFullImageUrl } from "../../utils/api";
import { User } from "../../utils/api/types";
import { AppText } from "../components/appText";

const EditProfilePage = () => {
  const router = useRouter();
  const { updateUser } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Form fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");

  // Reset Password (via token)
  const [showResetSection, setShowResetSection] = useState(false);
  const [resetToken, setResetToken] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [sendingToken, setSendingToken] = useState(false);
  const [tokenSent, setTokenSent] = useState(false);
  const [resettingPassword, setResettingPassword] = useState(false);
  const [cooldown, setCooldown] = useState(0);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [profileImageUri, setProfileImageUri] = useState<string | null>(null);

  // Track changes
  const [hasChanges, setHasChanges] = useState(false);

  // Animation
  const successAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loadUser = async () => {
      const userData = await AsyncStorage.getItem("userData");
      if (userData) {
        const currentUser: User = JSON.parse(userData);
        setUser(currentUser);
        setFullName(currentUser.name);
        setEmail(currentUser.email);
        setPhoneNumber(currentUser.phone_number || "");
        setProfileImageUri(getFullImageUrl(currentUser.profile_image));
      }
      setLoading(false);
    };
    loadUser();
  }, []);

  useEffect(() => {
    if (!user) return;
    const changed =
      fullName !== user.name || phoneNumber !== (user.phone_number || "");
    setHasChanges(changed);
  }, [fullName, phoneNumber, user]);

  // Cooldown timer for resend token
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

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
      Alert.alert("Error", "Please enter your full name");
      return;
    }
    if (!email.trim()) {
      Alert.alert("Error", "Please enter your email");
      return;
    }
    if (!email.includes("@")) {
      Alert.alert("Error", "Please enter a valid email address");
      return;
    }
    if (!phoneNumber.trim()) {
      Alert.alert("Error", "Please enter your phone number");
      return;
    }

    setSaving(true);
    try {
      const updatedUser = await apiService.auth.updateProfile({
        name: fullName.trim(),
        phone_number: phoneNumber.trim(),
      });
      await AsyncStorage.setItem("userData", JSON.stringify(updatedUser));
      setUser(updatedUser);
      updateUser(updatedUser);
      setHasChanges(false);
      showSuccess();
    } catch (error: any) {
      Alert.alert("Error", error.message || "An error occurred while saving profile");
    } finally {
      setSaving(false);
    }
  };

  const handleSendToken = async () => {
    Keyboard.dismiss();
    if (!email) {
      Alert.alert("Error", "Email not found");
      return;
    }

    setSendingToken(true);
    try {
      const res = await apiService.auth.forgotPassword({ email });
      setTokenSent(true);
      setCooldown(60);
      Alert.alert(
        "Token Sent Successfully",
        `We have sent a token to ${email}\nPlease check your email and enter the token to reset your password.`,
      );
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to send token");
    } finally {
      setSendingToken(false);
    }
  };

  const handleResetPassword = async () => {
    Keyboard.dismiss();

    if (!resetToken.trim()) {
      Alert.alert("Error", "Please enter the token sent to your email");
      return;
    }
    if (!newPassword.trim()) {
      Alert.alert("Error", "Please enter your new password");
      return;
    }
    if (newPassword.length < 6) {
      Alert.alert("Error", "New password must be at least 6 characters");
      return;
    }
    if (newPassword !== confirmPassword) {
      Alert.alert("Error", "New passwords do not match");
      return;
    }

    setResettingPassword(true);
    try {
      await apiService.auth.resetPassword({
        email,
        token: resetToken.trim(),
        password: newPassword,
      });
      setResetToken("");
      setNewPassword("");
      setConfirmPassword("");
      setTokenSent(false);
      setShowResetSection(false);
      setCooldown(0);
      Alert.alert("Success", "Password changed successfully");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to change password");
    } finally {
      setResettingPassword(false);
    }
  };

  const handleChangePhoto = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert(
        "Permission Required",
        "Please allow access to your photo library to upload a profile picture",
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (result.canceled || !result.assets?.length) return;

    const selectedImage = result.assets[0];
    setUploadingImage(true);
    try {
      const profileImagePath = await apiService.auth.uploadProfileImage(
        selectedImage.uri,
      );
      // อัปเดต user object กับ profile_image ใหม่
      if (user) {
        const updatedUser = { ...user, profile_image: profileImagePath };
        setUser(updatedUser);
        updateUser(updatedUser);
      }
      setProfileImageUri(getFullImageUrl(profileImagePath));
      Alert.alert("Success", "Profile picture uploaded successfully");
    } catch (error: any) {
      Alert.alert("Error", error.message || "Failed to upload profile picture");
    } finally {
      setUploadingImage(false);
    }
  };

  const handleGoBack = () => {
    if (hasChanges) {
      Alert.alert(
        "Unsaved Changes",
        "You have unsaved changes. Do you want to discard them?",
        [
          { text: "Stay" },
          {
            text: "Discard",

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
            <Image source={image.back} style={{ width: 32, height: 32 }} />
          </TouchableOpacity>
          <AppText weight="bold" numberOfLines={1} style={styles.headerTitle}>
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
              <AppText
                weight="semibold"
                numberOfLines={1}
                style={styles.saveBtnText}
              >
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
        <AppText
          weight="semibold"
          numberOfLines={1}
          adjustsFontSizeToFit
          style={styles.successToastText}
        >
          ✅ Profile updated successfully
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
            <TouchableOpacity
              style={styles.avatarContainer}
              onPress={handleChangePhoto}
              disabled={uploadingImage}
              activeOpacity={0.7}
            >
              {profileImageUri ? (
                <Image
                  source={{ uri: profileImageUri }}
                  style={styles.avatarImage}
                />
              ) : (
                <View style={[styles.avatarImage, styles.defaultAvatar]}>
                  <AppText weight="bold" style={styles.defaultAvatarText}>
                    {user?.name?.charAt(0).toUpperCase() || "U"}
                  </AppText>
                </View>
              )}
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleChangePhoto}
              disabled={uploadingImage}
            >
              <AppText
                weight="medium"
                numberOfLines={1}
                style={styles.changePhotoText}
              >
                Change photo
              </AppText>
            </TouchableOpacity>
          </View>

          {/* Personal Info Section */}
          <View style={styles.section}>
            <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}> 
              <AppText
                weight="semibold"
                numberOfLines={1}
                style={styles.sectionTitle}
              >
                Personal Information
              </AppText>
            </View>

            <View style={styles.inputGroup}>
              <AppText
                weight="medium"
                numberOfLines={1}
                style={styles.inputLabel}
              >
                Full Name
              </AppText>
              <View style={styles.inputWrapper}>
                <Image
                  source={image.person}
                  style={[styles.inputIcon, { height: 16, width: 12 }]}
                />
                <TextInput
                  style={styles.textInput}
                  value={fullName}
                  onChangeText={setFullName}
                  placeholder="Enter your full name"
                  placeholderTextColor="#C0C0C0"
                  autoCorrect={false}
                />
                {fullName !== user?.name && fullName.trim() !== "" && (
                  <View style={styles.changedDot} />
                )}
              </View>
            </View>

            <View style={styles.inputGroup}>
              <AppText
                weight="medium"
                numberOfLines={1}
                style={styles.inputLabel}
              >
                Email
              </AppText>
              <View style={[styles.inputWrapper, styles.inputDisabled]}>
                <Image
                  source={image.mail}
                  style={[styles.inputIcon, { width: 18, height: 14 }]}
                />
                <AppText weight="regular" style={styles.disabledText}>
                  {email}
                </AppText>
              </View>
            </View>

            <View style={styles.inputGroup}>
              <AppText
                weight="medium"
                numberOfLines={1}
                style={styles.inputLabel}
              >
                Phone Number
              </AppText>
              <View style={styles.inputWrapper}>
                <Image
                  source={image.phone}
                  style={[styles.inputIcon, { width: 15, height: 15 }]}
                />
                <TextInput
                  style={styles.textInput}
                  value={phoneNumber}
                  onChangeText={setPhoneNumber}
                  placeholder="Enter your phone number"
                  placeholderTextColor="#C0C0C0"
                  keyboardType="phone-pad"
                />
                {phoneNumber !== (user?.phone_number || "") &&
                  phoneNumber.trim() !== "" && (
                    <View style={styles.changedDot} />
                  )}
              </View>
            </View>
          </View>

          {/* Reset Password Section */}
          <View style={styles.section}>
            <TouchableOpacity
              style={styles.sectionHeaderBtn}
              onPress={() => {
                setShowResetSection(!showResetSection);
                if (showResetSection) {
                  setTokenSent(false);
                  setResetToken("");
                  setNewPassword("");
                  setConfirmPassword("");
                  setCooldown(0);
                }
              }}
              activeOpacity={0.7}
            >
              <AppText
                weight="semibold"
                numberOfLines={1}
                style={styles.sectionTitle}
              >
                Reset Password
              </AppText>
              <AppText style={styles.expandArrow}>
                {showResetSection ? "▲" : "▼"}
              </AppText>
            </TouchableOpacity>

            {showResetSection && (
              <View style={styles.resetFields}>
                {/* Info text */}
                <AppText weight="regular" style={styles.resetInfoText}>
                  We will send a token to your email{"\n"}
                  <AppText
                    weight="semibold"
                    style={{ color: "#3B82F6", fontSize: 13 }}
                  >
                    {email}
                  </AppText>
                  {"\n"}to use for resetting your password
                </AppText>

                {/* Send Token Button */}
                <TouchableOpacity
                  style={[
                    styles.sendTokenBtn,
                    (sendingToken || cooldown > 0) && { opacity: 0.5 },
                  ]}
                  onPress={handleSendToken}
                  disabled={sendingToken || cooldown > 0}
                  activeOpacity={0.7}
                >
                  <LinearGradient
                    colors={
                      tokenSent
                        ? ["#10B981", "#059669"]
                        : ["#3B82F6", "#2563EB"]
                    }
                    style={styles.sendTokenGradient}
                  >
                    {sendingToken ? (
                      <ActivityIndicator size="small" color="#FFF" />
                    ) : (
                      <AppText
                        weight="semibold"
                        numberOfLines={1}
                        style={styles.sendTokenText}
                      >
                        {tokenSent
                          ? cooldown > 0
                            ? `Resend in ${cooldown} seconds`
                            : "Resend Token"
                          : "Sent Token to Email"}
                      </AppText>
                    )}
                  </LinearGradient>
                </TouchableOpacity>

                {tokenSent && (
                  <>
                    {/* Token Input */}
                    <View style={styles.inputGroup}>
                      <AppText
                        weight="medium"
                        numberOfLines={1}
                        style={styles.inputLabel}
                      >
                        Token
                      </AppText>
                      <View style={styles.inputWrapper}>
                        <Image source={image.key} style={{ marginRight: 8, width: 18, height: 10 }} />
                        <TextInput
                          style={styles.textInput}
                          value={resetToken}
                          onChangeText={setResetToken}
                          placeholder="Enter the token received via email"
                          placeholderTextColor="#C0C0C0"
                          autoCapitalize="none"
                          autoCorrect={false}
                        />
                      </View>
                    </View>

                    {/* New Password */}
                    <View style={styles.inputGroup}>
                      <AppText
                        weight="medium"
                        numberOfLines={1}
                        style={styles.inputLabel}
                      >
                        New Password
                      </AppText>
                      <View style={styles.inputWrapper}>
                        <Image
                          source={image.password}
                          style={{ marginRight: 10, width: 12, height: 16 }}
                        />
                        <TextInput
                          style={[styles.textInput, { flex: 1 }]}
                          value={newPassword}
                          onChangeText={setNewPassword}
                          placeholder="Enter your new password (at least 6 characters)"
                          placeholderTextColor="#C0C0C0"
                          secureTextEntry={!showNewPw}
                          autoCapitalize="none"
                          autoCorrect={false}
                        />
                        <TouchableOpacity
                          onPress={() => setShowNewPw(!showNewPw)}
                        >
                          <Image
                            source={
                              showNewPw ? image.close_eye : image.show_eye
                            }
                            style={{
                              width: 16,
                              height: 16,
                              resizeMode: "contain",
                              tintColor: "#999",
                            }}
                          />
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Confirm Password */}
                    <View style={styles.inputGroup}>
                      <AppText
                        weight="medium"
                        numberOfLines={1}
                        style={styles.inputLabel}
                      >
                        Confirm New Password
                      </AppText>
                      <View style={styles.inputWrapper}>
                        <Image
                          source={image.password}
                          style={{ marginRight: 10, width: 12, height: 16 }}
                        />
                        <TextInput
                          style={[styles.textInput, { flex: 1 }]}
                          value={confirmPassword}
                          onChangeText={setConfirmPassword}
                          placeholder="Re-enter your new password"
                          placeholderTextColor="#C0C0C0"
                          secureTextEntry={!showConfirmPw}
                          autoCapitalize="none"
                          autoCorrect={false}
                        />
                        <TouchableOpacity
                          onPress={() => setShowConfirmPw(!showConfirmPw)}
                        >
                          <Image
                            source={
                              showConfirmPw ? image.close_eye : image.show_eye
                            }
                            style={{
                              width: 16,
                              height: 16,
                              resizeMode: "contain",
                              tintColor: "#999",
                            }}
                          />
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Reset Password Button */}
                    <TouchableOpacity
                      style={[
                        styles.changePasswordBtn,
                        resettingPassword && { opacity: 0.5 },
                      ]}
                      onPress={handleResetPassword}
                      disabled={resettingPassword}
                      activeOpacity={0.7}
                    >
                      <LinearGradient
                        colors={["#EF4444", "#DC2626"]}
                        style={styles.changePasswordGradient}
                      >
                        {resettingPassword ? (
                          <ActivityIndicator size="small" color="#FFF" />
                        ) : (
                          <AppText
                            weight="semibold"
                            numberOfLines={1}
                            style={styles.changePasswordText}
                          >
                            Change Password
                          </AppText>
                        )}
                      </LinearGradient>
                    </TouchableOpacity>
                  </>
                )}
              </View>
            )}
          </View>

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
    fontSize: 16,
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
    fontSize: 13,
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
  avatarEditOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 50,
    backgroundColor: "rgba(0,0,0,0.25)",
    justifyContent: "center",
    alignItems: "center",
  },
  changePhotoText: {
    fontSize: 13,
    color: "#3B82F6",
  },
  defaultAvatar: {
    backgroundColor: "#003994",
    justifyContent: "center",
    alignItems: "center",
  },
  defaultAvatarText: {
    fontSize: 36,
    color: "#FFF",
  },
  uploadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 50,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
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
  resetFields: {
    marginTop: 12,
  },
  resetInfoText: {
    fontSize: 13,
    color: "#6B7280",
    lineHeight: 20,
    marginBottom: 14,
    textAlign: "center",
  },
  sendTokenBtn: {
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
  },
  sendTokenGradient: {
    paddingVertical: 13,
    alignItems: "center",
    borderRadius: 12,
  },
  sendTokenText: {
    fontSize: 14,
    color: "#FFF",
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
