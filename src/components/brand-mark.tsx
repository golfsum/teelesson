import React from "react";
import { Text, View } from "react-native";
import Svg, { Circle, Path } from "react-native-svg";

import { colors } from "@/theme";

export default function BrandMark({ compact = false, tagline = false }: { compact?: boolean; tagline?: boolean }) {
  const size = compact ? 38 : 42;
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: 7 }}>
      <Svg width={size} height={size} viewBox="0 0 44 44">
        <Path d="M19 35V7" stroke={colors.fairway[400]} strokeWidth="2.2" strokeLinecap="round" />
        <Path d="M20 8c6 1 10 3 14 7-5 2-9 2-14 1V8Z" fill={colors.orange} stroke={colors.fairway[300]} strokeWidth="1.2" strokeLinejoin="round" />
        <Path d="M7 36c7-5 17-5 25 0-8 3-17 3-25 0Z" fill="none" stroke={colors.fairway[400]} strokeWidth="2.2" strokeLinejoin="round" />
        <Circle cx="26" cy="31" r="2.2" fill={colors.white} />
      </Svg>
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
