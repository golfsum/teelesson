import React from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

import { colors } from "@/theme";

type Variant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type Size = "sm" | "md" | "lg";

interface ButtonProps {
  title: string;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  /** Optional leading icon node. */
  icon?: React.ReactNode;
  fullWidth?: boolean;
  className?: string;
}

const BASE =
  "flex-row items-center justify-center rounded-xl active:opacity-80";

const VARIANTS: Record<Variant, { container: string; text: string }> = {
  primary: { container: "bg-fairway-600", text: "text-white" },
  secondary: { container: "bg-fairway-100", text: "text-fairway-700" },
  outline: { container: "border border-ink-200 bg-white", text: "text-ink-900" },
  ghost: { container: "bg-transparent", text: "text-fairway-700" },
  danger: { container: "bg-red-600", text: "text-white" },
};

const SIZES: Record<Size, { container: string; text: string }> = {
  sm: { container: "px-3 py-2", text: "text-sm font-semibold" },
  md: { container: "px-4 py-3", text: "text-base font-semibold" },
  lg: { container: "px-5 py-4", text: "text-lg font-bold" },
};

export function Button({
  title,
  onPress,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  icon,
  fullWidth = false,
  className = "",
}: ButtonProps) {
  const v = VARIANTS[variant];
  const s = SIZES[size];
  const isDisabled = disabled || loading;
  return (
    <Pressable
      accessibilityRole="button"
      onPress={onPress}
      disabled={isDisabled}
      className={`${BASE} ${v.container} ${s.container} ${fullWidth ? "w-full" : ""} ${
        isDisabled ? "opacity-50" : ""
      } ${className}`}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === "primary" || variant === "danger" ? colors.white : colors.fairway[600]}
        />
      ) : (
        <View className="flex-row items-center gap-2">
          {icon}
          <Text className={`${v.text} ${s.text}`}>{title}</Text>
        </View>
      )}
    </Pressable>
  );
}

export default Button;
