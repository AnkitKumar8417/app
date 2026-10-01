import React from "react";
import { StyleSheet, Text, View } from "react-native";

import { useTheme, spacing, radius } from "@/src/theme";

export function DemoBadge({ compact = false }: { compact?: boolean }) {
  const { colors } = useTheme();
  return (
    <View
      style={[
        styles.wrap,
        {
          backgroundColor: colors.brandTertiary,
          borderColor: colors.brandPrimary,
          paddingVertical: compact ? 2 : 4,
          paddingHorizontal: compact ? 6 : 8,
        },
      ]}
      testID="demo-data-badge"
    >
      <View style={[styles.dot, { backgroundColor: colors.brandPrimary }]} />
      <Text style={[styles.label, { color: colors.onBrandTertiary, fontSize: compact ? 10 : 11 }]}>
        SAMPLE / DEMO DATA
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    borderRadius: radius.pill,
    borderWidth: 1,
    alignSelf: "flex-start",
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  label: {
    fontWeight: "700",
    letterSpacing: 0.8,
  },
});
