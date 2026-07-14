import React from "react";
import { Pressable, Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

import { useAuth } from "@/hooks/useAuth";
import { useLessons } from "@/hooks/useLessons";
import { colors } from "@/theme";

/**
 * Top-nav notification bell. Shows a badge with the number of pending booking
 * requests and jumps to the Schedule (where they're approved) when tapped.
 */
export default function HeaderBell() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const { pending } = useLessons({ coachId: user?.id });
  const count = pending.length;

  return (
    <Pressable
      onPress={() => navigation.navigate("Players")}
      accessibilityRole="button"
      accessibilityLabel={`${count} pending request${count === 1 ? "" : "s"}`}
      className="mr-3 h-9 w-9 items-center justify-center"
      hitSlop={8}
    >
      <Ionicons name="notifications-outline" size={22} color={colors.ink[900]} />
      {count > 0 && (
        <View
          style={{ position: "absolute", top: 2, right: 2 }}
          className="h-4 min-w-[16px] items-center justify-center rounded-full bg-red-500 px-1"
        >
          <Text className="text-[10px] font-bold text-white">{count > 9 ? "9+" : count}</Text>
        </View>
      )}
    </Pressable>
  );
}
