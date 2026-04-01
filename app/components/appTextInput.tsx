import React from "react";
import { StyleSheet, TextInput, TextInputProps } from "react-native";

type FontWeight = "light" | "regular" | "medium" | "semibold" | "bold";

interface AppTextInputProps extends TextInputProps {
  weight?: FontWeight;
}

const thaiMap: Record<FontWeight, string> = {
  light: "NotoSansThai_300Light",
  regular: "NotoSansThai_400Regular",
  medium: "NotoSansThai_500Medium",
  semibold: "NotoSansThai_600SemiBold",
  bold: "NotoSansThai_700Bold",
};

export function AppTextInput({
  weight = "regular",
  style,
  ...props
}: AppTextInputProps) {
  return (
    <TextInput
      {...props}
      style={[styles.input, { fontFamily: thaiMap[weight] }, style]}
      placeholderTextColor="#999"
    />
  );
}

const styles = StyleSheet.create({
  input: {
    fontSize: 14,
    color: "#000",
  },
});
