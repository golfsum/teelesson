import React from "react";
import { Image, Text, View } from "react-native";

import { colors } from "@/theme";

export default function BrandMark({ compact = false, tagline = false }: { compact?: boolean; tagline?: boolean }) {
  const size = compact ? 40 : 46;
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: compact ? 8 : 9 }}>
      <Image
        source={require("../../assets/teelesson-logo.png")}
        accessibilityLabel="TeeLesson logo"
        resizeMode="contain"
        style={{ width: size, height: size, borderRadius: compact ? 9 : 10 }}
      />
      <View>
        <Text
          style={{
            color: colors.white,
            fontSize: compact ? 19 : 22,
            fontWeight: "800",
            letterSpacing: -0.75,
          }}
        >
          TeeLesson
        </Text>
        {tagline ? <Text style={{ color: "#8ea09b", fontSize: 8.5, marginTop: 1 }}>Coach. Manage. Grow.</Text> : null}
      </View>
    </View>
  );
}
