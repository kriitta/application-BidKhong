import { Tabs } from "expo-router";
import React, { useEffect, useState } from "react";
import { Image } from "react-native";
import { image } from "../../assets/images";
import { useAuth } from "../../contexts/AuthContext";
import { useLanguage } from "../../contexts/LanguageContext";
import { useOutbidChecker } from "../../hooks/useOutbidChecker";
import { requestNotificationPermissions } from "../../utils/notificationService";
import { CustomTabBar } from "../components/customTabBar";

export default function TabLayout() {
  const [modalVisible, setModalVisible] = useState(false);
  const { t } = useLanguage();
  const { isLoggedIn } = useAuth();

  // Request notification permission once when user is logged in
  useEffect(() => {
    if (isLoggedIn) {
      requestNotificationPermissions().catch(() => {});
    }
  }, [isLoggedIn]);

  // Poll for outbid status changes and fire local notifications
  useOutbidChecker();

  return (
    <>
      <Tabs
        tabBar={(props) => <CustomTabBar {...props} />}
        screenOptions={{ headerShown: false }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: t("tabHome"),
            tabBarLabel: t("tabHome"),
            tabBarIcon: ({ focused }) => (
              <Image
                source={focused ? image.home_blue : image.home_gray}
                style={{ width: 24, height: 24 }}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="wallet"
          options={{
            title: t("tabWallet"),
            tabBarLabel: t("tabWallet"),
            tabBarIcon: ({ focused }) => (
              <Image
                source={focused ? image.wallet_blue : image.wallet_gray}
                style={{ width: 24, height: 24 }}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="seller"
          options={{
            title: "Seller",
            tabBarLabel: "",
          }}
        />

        <Tabs.Screen
          name="mybid"
          options={{
            title: t("tabBids"),
            tabBarLabel: t("tabBids"),
            tabBarIcon: ({ focused }) => (
              <Image
                source={focused ? image.bids_blue : image.bids_gray}
                style={{ width: 24, height: 24 }}
              />
            ),
          }}
        />

        <Tabs.Screen
          name="profile"
          options={{
            title: t("tabProfile"),
            tabBarLabel: t("tabProfile"),
            tabBarIcon: ({ focused }) => (
              <Image
                source={focused ? image.profile_blue : image.profile_gray}
                style={{ width: 24, height: 24 }}
              />
            ),
          }}
        />
      </Tabs>

      {/* <TimeAttendanceModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
      /> */}
    </>
  );
}
