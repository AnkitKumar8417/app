import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";

import { ScreenHeader } from "@/src/components/screen-header";
import { DemoBadge } from "@/src/components/demo-badge";
import { TRAINS, getRouteFor } from "@/src/data/railways";
import { useTheme, spacing, radius } from "@/src/theme";

export default function TrainRoute() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { number } = useLocalSearchParams<{ number?: string }>();

  const [selected, setSelected] = useState<string>(number ?? "12951");
  const train = useMemo(() => TRAINS.find((t) => t.number === selected) ?? TRAINS[0], [selected]);
  const route = useMemo(() => getRouteFor(train.number), [train.number]);

  // Mark one station as "current" for a running-feel timeline
  const currentIdx = Math.max(1, Math.floor(route.length / 2));

  return (
    <View style={[styles.root, { backgroundColor: colors.surface }]} testID="train-route-screen">
      <ScreenHeader title="Train Route" subtitle={train.name} />
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: insets.bottom + spacing.xxl }}
      >
        <View style={{ marginTop: spacing.md }}>
          <DemoBadge />
        </View>

        <Text style={[styles.sectionLabel, { color: colors.muted }]}>SELECT TRAIN</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
          {TRAINS.map((t) => {
            const active = t.number === selected;
            return (
              <Pressable
                key={t.number}
                testID={`route-train-chip-${t.number}`}
                onPress={() => setSelected(t.number)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: active ? colors.brandPrimary : colors.surfaceSecondary,
                    borderColor: active ? colors.brandPrimary : colors.border,
                  },
                ]}
              >
                <Text style={[styles.chipText, { color: active ? colors.onBrandPrimary : colors.onSurface }]}>
                  {t.number}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        {/* Summary */}
        <View style={[styles.summary, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
          <View style={styles.summaryRow}>
            <Metric label="Stops" value={`${route.length}`} />
            <View style={[styles.vDiv, { backgroundColor: colors.divider }]} />
            <Metric label="Distance" value={`${route[route.length - 1].distanceKm} km`} />
            <View style={[styles.vDiv, { backgroundColor: colors.divider }]} />
            <Metric label="Duration" value={train.duration} />
          </View>
        </View>

        {/* Timeline */}
        <View style={styles.timeline}>
          {route.map((stop, idx) => {
            const passed = idx < currentIdx;
            const current = idx === currentIdx;
            const nodeColor = passed ? colors.muted : current ? colors.brandPrimary : colors.onSurface;
            const lineColor = passed ? colors.muted : colors.borderStrong;
            return (
              <View key={stop.code + idx} style={styles.timelineRow} testID={`route-stop-${idx}`}>
                <View style={styles.timelineLeft}>
                  <View
                    style={[
                      styles.node,
                      {
                        backgroundColor: current ? colors.brandPrimary : colors.surface,
                        borderColor: nodeColor,
                      },
                    ]}
                  >
                    {current ? (
                      <MaterialDesignIcons name="train" size={10} color={colors.onBrandPrimary} />
                    ) : passed ? (
                      <MaterialDesignIcons name="check" size={10} color={colors.muted} />
                    ) : null}
                  </View>
                  {idx !== route.length - 1 ? <View style={[styles.line, { backgroundColor: lineColor }]} /> : null}
                </View>
                <View style={[styles.stopCard, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
                  <View style={styles.stopHeader}>
                    <Text style={[styles.stationName, { color: colors.onSurface }]} numberOfLines={1}>
                      {stop.station}
                    </Text>
                    <Text style={[styles.stationCode, { color: colors.brandPrimary }]}>{stop.code}</Text>
                  </View>
                  <View style={styles.stopMeta}>
                    <TimeCell label="Arr" value={stop.arrival} color={colors.muted} valueColor={colors.onSurface} />
                    <TimeCell label="Dep" value={stop.departure} color={colors.muted} valueColor={colors.onSurface} />
                    <TimeCell
                      label="Halt"
                      value={stop.haltMin === 0 ? "—" : `${stop.haltMin}m`}
                      color={colors.muted}
                      valueColor={colors.onSurface}
                    />
                    <TimeCell
                      label="Day"
                      value={`D${stop.dayOffset}`}
                      color={colors.muted}
                      valueColor={colors.brandPrimary}
                    />
                  </View>
                  <View style={[styles.distRow, { borderTopColor: colors.divider }]}>
                    <MaterialDesignIcons name="map-marker-distance" size={12} color={colors.muted} />
                    <Text style={[styles.distText, { color: colors.muted }]}>{stop.distanceKm} km from origin</Text>
                  </View>
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  const { colors } = useTheme();
  return (
    <View style={styles.metric}>
      <Text style={[styles.metricLabel, { color: colors.muted }]}>{label}</Text>
      <Text style={[styles.metricValue, { color: colors.onSurface }]}>{value}</Text>
    </View>
  );
}

function TimeCell({ label, value, color, valueColor }: { label: string; value: string; color: string; valueColor: string }) {
  return (
    <View style={styles.timeCell}>
      <Text style={[styles.timeLabel, { color }]}>{label}</Text>
      <Text style={[styles.timeValue, { color: valueColor }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  sectionLabel: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.4,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  chipRow: { gap: spacing.sm, paddingRight: spacing.lg },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: radius.pill,
    borderWidth: 1,
    flexShrink: 0,
  },
  chipText: { fontSize: 12, fontWeight: "700" },
  summary: {
    marginTop: spacing.lg,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  summaryRow: { flexDirection: "row", alignItems: "center" },
  vDiv: { width: StyleSheet.hairlineWidth, height: 32, marginHorizontal: spacing.sm },
  metric: { flex: 1, alignItems: "center" },
  metricLabel: { fontSize: 10, fontWeight: "800", letterSpacing: 1 },
  metricValue: { fontSize: 15, fontWeight: "800", marginTop: 2 },
  timeline: { marginTop: spacing.xl },
  timelineRow: { flexDirection: "row" },
  timelineLeft: { width: 32, alignItems: "center" },
  node: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 10,
  },
  line: {
    width: 2,
    flex: 1,
    marginTop: 2,
  },
  stopCard: {
    flex: 1,
    marginLeft: spacing.sm,
    marginBottom: spacing.md,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  stopHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  stationName: { flex: 1, fontSize: 15, fontWeight: "700" },
  stationCode: { fontSize: 11, fontWeight: "800", letterSpacing: 0.8 },
  stopMeta: { flexDirection: "row", marginTop: spacing.sm },
  timeCell: { flex: 1 },
  timeLabel: { fontSize: 9, fontWeight: "800", letterSpacing: 1 },
  timeValue: { fontSize: 13, fontWeight: "700", marginTop: 2 },
  distRow: {
    marginTop: spacing.sm,
    paddingTop: spacing.sm,
    borderTopWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  distText: { fontSize: 11 },
});
