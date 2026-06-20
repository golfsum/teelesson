import React from "react";
import { Pressable, View } from "react-native";

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  className?: string;
}

/** A white rounded surface with a subtle border + shadow. */
export function Card({ children, onPress, className = "" }: CardProps) {
  const classes = `rounded-2xl border border-ink-200 bg-white p-4 ${className}`;
  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        className={`${classes} active:opacity-90`}
        style={{
          shadowColor: "#0f172a",
          shadowOpacity: 0.04,
          shadowRadius: 8,
          shadowOffset: { width: 0, height: 2 },
        }}
      >
        {children}
      </Pressable>
    );
  }
  return (
    <View
      className={classes}
      style={{
        shadowColor: "#0f172a",
        shadowOpacity: 0.04,
        shadowRadius: 8,
        shadowOffset: { width: 0, height: 2 },
      }}
    >
      {children}
    </View>
  );
}

export default Card;
