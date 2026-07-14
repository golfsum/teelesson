import React from "react";
import { ScrollView, Text, View } from "react-native";

interface State {
  error: Error | null;
}

/**
 * Catches render-time crashes so a screen shows the error instead of a blank
 * page. Wrap the app (or a screen) with this.
 */
export default class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  State
> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: { componentStack: string }) {
    // Surface in the dev console / crash logs.
    console.error("Render error:", error, info.componentStack);
  }

  render() {
    const { error } = this.state;
    if (error) {
      return (
        <View style={{ flex: 1, backgroundColor: "#fff", padding: 24, justifyContent: "center" }}>
          <Text style={{ fontSize: 18, fontWeight: "700", color: "#0f172a", marginBottom: 8 }}>
            Something went wrong
          </Text>
          <Text style={{ color: "#64748b", marginBottom: 12 }}>
            This screen hit an error. Details below:
          </Text>
          <ScrollView style={{ maxHeight: 240 }}>
            <Text selectable style={{ color: "#b4533a", fontSize: 12 }}>
              {error.message}
              {"\n\n"}
              {error.stack}
            </Text>
          </ScrollView>
        </View>
      );
    }
    return this.props.children;
  }
}
