import React from "react";
import { Pressable, View } from "react-native";

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  className?: string;
}

/** A layered technical workspace surface derived from the supplied reference. */
export function Card({ children, onPress, className = "" }: CardProps) {
  const classes = `rounded-2xl border border-ink-200 bg-white p-4 ${className}`;
  const surfaceStyle = {
    borderCurve: "continuous" as const,
    boxShadow: "0 1px 2px rgba(3, 29, 24, 0.04), 0 10px 28px rgba(3, 29, 24, 0.035)",
  };
  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        className={`${classes} active:opacity-90`}
        style={surfaceStyle}
      >
        {children}
      </Pressable>
    );
  }
  return (
    <View
      className={classes}
      style={surfaceStyle}
    >
      {children}
    </View>
  );
}

export default Card;
