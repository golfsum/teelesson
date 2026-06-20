import React from "react";
import { Image, Text, View } from "react-native";

import { initials } from "@/utils/format";

interface AvatarProps {
  name?: string;
  uri?: string;
  size?: number;
  className?: string;
}

/** Circular avatar — shows the photo if available, else colored initials. */
export function Avatar({ name, uri, size = 44, className = "" }: AvatarProps) {
  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={{ width: size, height: size, borderRadius: size / 2 }}
        className={className}
      />
    );
  }
  return (
    <View
      className={`items-center justify-center rounded-full bg-fairway-100 ${className}`}
      style={{ width: size, height: size, borderRadius: size / 2 }}
    >
      <Text
        className="font-bold text-fairway-700"
        style={{ fontSize: size * 0.38 }}
      >
        {initials(name)}
      </Text>
    </View>
  );
}

export default Avatar;
