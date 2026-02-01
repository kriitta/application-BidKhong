import React from "react";
import { Text, TextProps, StyleSheet } from "react-native";

type FontWeight = "light" | "regular" | "medium" | "semibold" | "bold";

interface AppTextProps extends TextProps {
  weight?: FontWeight;
}

const fontMap: Record<FontWeight, string> = {
  light: "Poppins_300Light",
  regular: "Poppins_400Regular",
  medium: "Poppins_500Medium",
  semibold: "Poppins_600SemiBold",
  bold: "Poppins_700Bold",
};

export function AppText({ weight = "regular", style, ...props }: AppTextProps) {
  return (
    <Text
      {...props}
      style={[styles.text, { fontFamily: fontMap[weight] }, style]}
    />
  );
}

const styles = StyleSheet.create({
  text: {
    fontSize: 14,
    color: "#000",
  },
});
