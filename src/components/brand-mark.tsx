import React from "react";
import { Text, View } from "react-native";
import Svg, { Circle, Defs, Ellipse, G, LinearGradient, Path, Stop } from "react-native-svg";

import { colors } from "@/theme";

export default function BrandMark({ compact = false, tagline = false }: { compact?: boolean; tagline?: boolean }) {
  const size = compact ? 40 : 46;
  return (
    <View style={{ flexDirection: "row", alignItems: "center", gap: compact ? 8 : 9 }}>
      <Svg width={size} height={size} viewBox="0 0 64 64">
        <Defs>
          <LinearGradient id="brandDisc" x1="14" y1="10" x2="50" y2="56">
            <Stop offset="0" stopColor="#b8f35a" />
            <Stop offset="0.42" stopColor="#65c832" />
            <Stop offset="1" stopColor="#174f24" />
          </LinearGradient>
          <LinearGradient id="brandFlag" x1="30" y1="13" x2="50" y2="27">
            <Stop offset="0" stopColor="#ffd94b" />
            <Stop offset="0.45" stopColor="#8be43d" />
            <Stop offset="1" stopColor="#2f9b22" />
          </LinearGradient>
          <LinearGradient id="brandBall" x1="38" y1="32" x2="53" y2="49">
            <Stop offset="0" stopColor="#ffffff" />
            <Stop offset="0.62" stopColor="#d8eee5" />
            <Stop offset="1" stopColor="#9fb9ac" />
          </LinearGradient>
        </Defs>
        <Circle cx="32" cy="32" r="27" fill="url(#brandDisc)" stroke="#092713" strokeWidth="3.2" />
        <Circle cx="32" cy="32" r="22.4" fill="none" stroke="#a6f15c" strokeWidth="1.8" opacity="0.95" />
        <Path d="M12 40c11-6 28-6 40 0" fill="none" stroke="#102817" strokeWidth="2.2" strokeLinecap="round" />
        <Path d="M31 13v35" stroke="#f4fff8" strokeWidth="3.6" strokeLinecap="round" />
        <Path d="M34 15c7 1.6 9.7 6.1 18 5.5-2 6.7-9.2 11.5-18 9.5V15Z" fill="url(#brandFlag)" stroke="#092713" strokeWidth="1.8" strokeLinejoin="round" />
        <Ellipse cx="31" cy="48" rx="9" ry="3.3" fill="none" stroke="#092713" strokeWidth="2" />
        <G>
          <Circle cx="44" cy="42" r="9.4" fill="url(#brandBall)" stroke="#092713" strokeWidth="2.4" />
          <Circle cx="40.5" cy="38.5" r="1" fill="#c5d8d0" opacity="0.9" />
          <Circle cx="45" cy="38" r="1" fill="#c5d8d0" opacity="0.8" />
          <Circle cx="41.8" cy="43" r="1" fill="#b6cbc2" opacity="0.75" />
          <Circle cx="46.3" cy="43.2" r="1" fill="#b6cbc2" opacity="0.7" />
          <Circle cx="43.8" cy="46.5" r="1" fill="#9fb9ac" opacity="0.65" />
        </G>
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
