import React from "react";
import { TextInput, TextInputProps, StyleSheet } from "react-native";

type FontWeight = "light" | "regular" | "medium" | "semibold" | "bold";

interface AppTextInputProps extends TextInputProps {
  weight?: FontWeight;
}

const fontMap: Record<FontWeight, string> = {
  light: "Poppins_300Light",
  regular: "Poppins_400Regular",
  medium: "Poppins_500Medium",
  semibold: "Poppins_600SemiBold",
  bold: "Poppins_700Bold",
};

export function AppTextInput({
  weight = "regular",
  style,
  ...props
}: AppTextInputProps) {
  return (
    <TextInput
      {...props}
      style={[styles.input, { fontFamily: fontMap[weight] }, style]}
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
