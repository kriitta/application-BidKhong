import React, { useState } from "react";
import { View, TouchableOpacity, Text, StyleSheet, Image } from "react-native";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { image } from "../../assets/images";
import { SafeAreaView } from "react-native-safe-area-context";
import { AppText } from "./appText";

export function CustomTabBar({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const middleRouteIndex = state.routes.findIndex((r) => r.name === "seller");
  const isMiddleFocused = state.index === middleRouteIndex;

  // ถ้าอยู่หน้า seller ให้ซ่อน TabBar
  const currentRoute = state.routes[state.index];
  if (currentRoute.name === "seller") {
    return null;
  }

  return (
    <>
      <View style={styles.tabBar}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const isFocused = state.index === index;
          const iconProps = (route.params as any)?.tabBarItemIcon || {};

          const onPress = () => {
            if (!isFocused) {
              navigation.navigate(route.name);
            }
          };

          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
                ? options.title
                : route.name;

          if (route.name === "seller") {
            return <View key="spacer" style={{ flex: 1 }} />;
          }

          // ดึง tabBarIcon จาก options
          const TabBarIcon = options.tabBarIcon;

          return (
            <TouchableOpacity
              key={route.key}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              onPress={onPress}
              style={[
                styles.tabButton,
                isFocused &&
                  route.name !== "seller" && {
                    borderTopWidth: 4,
                    borderTopColor: "#2555C0",
                    backgroundColor: "#F0F9FF",
                  },
              ]}
            >
              {/* แสดง Icon จาก tabBarIcon ก่อน (ถ้ามี) */}
              {TabBarIcon &&
                TabBarIcon({
                  focused: isFocused,
                  color: "",
                  size: 0,
                })}

              {/* ถ้าไม่มี tabBarIcon ให้ใช้ fallbackImage จาก initialParams */}
              {!TabBarIcon && iconProps?.fallbackImage && (
                <Image
                  source={iconProps.fallbackImage}
                  style={{ width: 24, height: 24 }}
                  resizeMode="contain"
                />
              )}

              <AppText
                weight={isFocused ? "semibold" : "regular"}
                style={[
                  { color: isFocused ? "#2555C0" : "#6B7280" },
                  styles.label,
                ]}
              >
                {typeof options.tabBarLabel === "string"
                  ? options.tabBarLabel
                  : (options.title ?? route.name)}
              </AppText>
            </TouchableOpacity>
          );
        })}

        <View style={styles.centerWrapper}>
          <TouchableOpacity
            onPress={() => {
              // Navigate ไปหน้า seller
              navigation.navigate("seller");
            }}
            style={{ alignItems: "center" }}
          >
            <View style={styles.shadowWrapper}>
              <View style={styles.centerCircle}>
                <Image
                  source={
                    isMiddleFocused ? image.seller_blue : image.seller_gray
                  }
                  style={{
                    width: 32,
                    height: 32,
                    overflow: "hidden",
                  }}
                  resizeMode="contain"
                />
              </View>
            </View>
            <AppText
              weight="regular"
              style={[
                styles.label,
                {
                  color: isMiddleFocused ? "#2555C0" : "#6B7280",
                  marginTop: 4,
                  textAlign: "center",
                },
              ]}
            >
              Seller
            </AppText>
          </TouchableOpacity>
        </View>
      </View>
      <SafeAreaView
        edges={["bottom"]}
        style={{ backgroundColor: "#FFF" }}
      ></SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    flexDirection: "row",
    height: 70,
    backgroundColor: "#fff",
    overflow: "visible",
    boxShadow: "0 -1px 10px -3px rgba(0, 0, 0, 0.25)",
  },
  tabButton: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    borderTopWidth: 4,
    borderTopColor: "transparent",
  },
  label: {
    fontSize: 14,
    marginTop: 4,
  },
  centerWrapper: {
    position: "absolute",
    bottom: 5,
    left: "52%",
    transform: [{ translateX: -39 }],
    alignItems: "center",
    zIndex: 1,
  },
  centerCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  shadowWrapper: {
    boxShadow: "0px 0px 10px 2px rgba(0, 0, 0, 0.2)",
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
  },
});

export default CustomTabBar;
