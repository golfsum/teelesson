import React from "react";
import { ScrollView, View, type ScrollViewProps } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

interface ScreenContainerProps extends ScrollViewProps {
  children: React.ReactNode;
  /** When true, content is NOT scrollable (use for full-height layouts). */
  fixed?: boolean;
  /** Constrain + center content on wide web screens. */
  maxWidth?: number;
  padded?: boolean;
}

/**
 * Standard screen wrapper. Centers and width-limits content on web/tablet so
 * the coach dashboard and forms don't stretch edge-to-edge on large displays.
 */
export function ScreenContainer({
  children,
  fixed = false,
  maxWidth = 1100,
  padded = true,
  contentContainerStyle,
  ...rest
}: ScreenContainerProps) {
  const insets = useSafeAreaInsets();
  const inner = (
    <View
      className={`w-full self-center ${padded ? "px-4 py-5" : ""}`}
      style={{ maxWidth }}
    >
      {children}
    </View>
  );

  if (fixed) {
    return (
      <View style={{ flex: 1, backgroundColor: "#f6faf8", paddingBottom: insets.bottom }}>
        {inner}
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: "#f6faf8" }}
      contentInsetAdjustmentBehavior="automatic"
      contentContainerStyle={[{ paddingBottom: insets.bottom + 24 }, contentContainerStyle]}
      keyboardShouldPersistTaps="handled"
      {...rest}
    >
      {inner}
    </ScrollView>
  );
}

export default ScreenContainer;
