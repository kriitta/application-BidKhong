import React from "react";
import { StyleSheet, Text, TextProps } from "react-native";
import { containsThai } from "../../utils/helpers/bidLogic";
type FontWeight = "light" | "regular" | "medium" | "semibold" | "bold";

interface AppTextProps extends TextProps {
  weight?: FontWeight;
  children?: React.ReactNode;
}

const fontMap: Record<FontWeight, string> = {
  light: "Poppins_300Light",
  regular: "Poppins_400Regular",
  medium: "Poppins_500Medium",
  semibold: "Poppins_600SemiBold",
  bold: "Poppins_700Bold",
};

const thaiMap: Record<FontWeight, string> = {
  light: "NotoSansThai_300Light",
  regular: "NotoSansThai_400Regular",
  medium: "NotoSansThai_500Medium",
  semibold: "NotoSansThai_600SemiBold",
  bold: "NotoSansThai_700Bold",
};

export function AppText({
  weight = "regular",
  style,
  children,
  ...props
}: AppTextProps) {
  const hasThai = containsThai(children);
  const fontFamily = hasThai ? thaiMap[weight] : fontMap[weight];
  return (
    <Text {...props} style={[styles.text, { fontFamily }, style]}>
      {children}
    </Text>
  );
}

const styles = StyleSheet.create({
  text: {
    fontSize: 14,
    color: "#000",
  },
});
