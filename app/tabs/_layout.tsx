import { Tabs } from "expo-router";
import React, { useState } from "react";
import { View } from "react-native";
import { image } from "../../assets/images";
import { CustomTabBar } from "../components/customTabBar";
import { Image } from "react-native";

export default function TabLayout() {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <>
      <Tabs
        tabBar={(props) => (
          <CustomTabBar {...props} />
        )}
        screenOptions={{ headerShown: false }}
      >
        <Tabs.Screen
          name="home"
          options={{
            title: "Home",
            tabBarLabel: "Home",
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
            title: "My Wallet",
            tabBarLabel: "My Wallet",
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
            title: "My Bids",
            tabBarLabel: "My Bids",
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
            title: "Profile",
            tabBarLabel: "Profile",
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
