import React from "react";
import { StyleSheet, Text, TextProps } from "react-native";

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

// Detect Thai Unicode block (U+0E00–U+0E7F)
function containsThai(children: React.ReactNode): boolean {
  const extract = (node: React.ReactNode): string => {
    if (typeof node === "string" || typeof node === "number")
      return String(node);
    if (Array.isArray(node)) return node.map(extract).join("");
    if (React.isValidElement(node) && (node.props as any)?.children) {
      return extract((node.props as any).children);
    }
    return "";
  };
  return /[\u0E00-\u0E7F]/.test(extract(children));
}

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
