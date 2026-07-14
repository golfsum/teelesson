import React from "react";
import { Text, TextInput, View, type TextInputProps } from "react-native";

import { colors } from "@/theme";

interface InputProps extends TextInputProps {
  label?: string;
  error?: string;
  /** Render as a taller multi-line text area. */
  multiline?: boolean;
  containerClassName?: string;
}

export function Input({
  label,
  error,
  multiline,
  containerClassName = "",
  className = "",
  ...rest
}: InputProps) {
  return (
    <View className={`gap-1.5 ${containerClassName}`}>
      {label ? (
        <Text className="text-sm font-semibold text-ink-700">{label}</Text>
      ) : null}
      <TextInput
        placeholderTextColor={colors.ink[400]}
        multiline={multiline}
        className={`rounded-xl border bg-white px-3.5 py-3 text-sm text-ink-900 ${
          error ? "border-red-400" : "border-ink-300"
        } ${multiline ? "h-24" : ""} ${className}`}
        style={{
          borderCurve: "continuous",
          boxShadow: "inset 0 1px 2px rgba(3, 29, 24, 0.025)",
          ...(multiline ? { textAlignVertical: "top" as const } : {}),
        }}
        {...rest}
      />
      {error ? <Text className="text-xs text-red-600">{error}</Text> : null}
    </View>
  );
}

export default Input;
