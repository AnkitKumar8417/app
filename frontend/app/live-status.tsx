import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";

import { ScreenHeader } from "@/src/components/screen-header";
import { DemoBadge } from "@/src/components/demo-badge";
import { TRAINS, generateLiveStatus, LiveStatus } from "@/src/data/railways";
import { useTheme, spacing, radius } from "@/src/theme";

export default function LiveStatusScreen() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { number } = useLocalSearchParams<{ number?: string }>();

  const [selected, setSelected] = useState<string>(number ?? TRAINS[0].number);
  const [refreshKey, setRefreshKey] = useState(0);

  const train = useMemo(() => TRAINS.find((t) => t.number === selected) ?? TRAINS[0], [selected]);
  const status: LiveStatus = useMemo(() => {
    void refreshKey;
    return generateLiveStatus(train);
  }, [train, refreshKey]);

  const progress = Math.min(100, Math.round((status.distanceCoveredKm / status.totalDistanceKm) * 100));
  const onTime = status.delayMin === 0;

  return (
    <View style={[styles.root, { backgroundColor: colors.surface }]} testID="live-status-screen">
      <ScreenHeader
        title="Live Train Status"
        subtitle={train.name}
        rightIcon="refresh"
        onRightPress={() => setRefreshKey((k) => k + 1)}
      />
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: insets.bottom + spacing.xxl }}
        showsVerticalScrollIndicator={false}
      >
        <View style={{ marginTop: spacing.md }}>
          <DemoBadge />
        </View>

        {/* Train picker */}
        <Text style={[styles.sectionLabel, { color: colors.muted }]}>SELECT TRAIN</Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipRow}
        >
          {TRAINS.map((t) => {
            const active = t.number === selected;
            return (
              <Pressable
                key={t.number}
                testID={`live-train-chip-${t.number}`}
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

        {/* Delay banner */}
        <View
          style={[
            styles.delayBanner,
            {
              backgroundColor: onTime ? colors.brandTertiary : "rgba(255, 183, 77, 0.15)",
              borderColor: onTime ? colors.brandPrimary : colors.warning,
            },
          ]}
          testID="live-delay-banner"
        >
          <MaterialDesignIcons
            name={onTime ? "check-circle" : "clock-alert-outline"}
            size={22}
            color={onTime ? colors.brandPrimary : colors.warning}
          />
          <View style={{ flex: 1 }}>
            <Text style={[styles.delayLabel, { color: onTime ? colors.brandPrimary : colors.warning }]}>
              {onTime ? "ON TIME" : `DELAYED ${status.delayMin} MIN`}
            </Text>
            <Text style={[styles.delaySub, { color: colors.muted }]}>Last updated · {status.lastUpdated}</Text>
          </View>
        </View>

        {/* Current station */}
        <View style={[styles.block, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
          <Text style={[styles.blockLabel, { color: colors.muted }]}>CURRENTLY AT</Text>
          <Text style={[styles.currentStation, { color: colors.onSurface }]}>{status.currentStation}</Text>
          <View style={styles.progressWrap}>
            <View style={[styles.progressTrack, { backgroundColor: colors.surfaceTertiary }]}>
              <View style={[styles.progressFill, { backgroundColor: colors.brandPrimary, width: `${progress}%` }]} />
            </View>
            <Text style={[styles.progressText, { color: colors.muted }]}>
              {status.distanceCoveredKm} / {status.totalDistanceKm} km · {progress}%
            </Text>
          </View>
        </View>

        {/* Next station */}
        <View style={[styles.block, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
          <Text style={[styles.blockLabel, { color: colors.muted }]}>NEXT STOP</Text>
          <View style={styles.nextRow}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.nextStation, { color: colors.onSurface }]}>{status.nextStation}</Text>
              <Text style={[styles.nextSub, { color: colors.muted }]}>Expected arrival at destination</Text>
            </View>
            <View style={styles.timeCol}>
              <Text style={[styles.timeBig, { color: colors.brandPrimary }]}>{status.expectedArrival}</Text>
              <Text style={[styles.timeLabel, { color: colors.muted }]}>ETA</Text>
            </View>
          </View>
        </View>

        <Text style={[styles.footerNote, { color: colors.muted }]}>
          Values are sample live-data for UI demonstration. Connect an external railway API later for real tracking.
        </Text>
      </ScrollView>
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
  chipText: { fontSize: 12, fontWeight: "700", letterSpacing: 0.5 },
  delayBanner: {
    marginTop: spacing.lg,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  delayLabel: { fontSize: 13, fontWeight: "800", letterSpacing: 0.8 },
  delaySub: { fontSize: 11, marginTop: 2 },
  block: {
    marginTop: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.md,
  },
  blockLabel: { fontSize: 10, fontWeight: "800", letterSpacing: 1.4 },
  currentStation: { fontSize: 26, fontWeight: "800" },
  progressWrap: { gap: 6 },
  progressTrack: { height: 6, borderRadius: 3, overflow: "hidden" },
  progressFill: { height: "100%" },
  progressText: { fontSize: 11, fontWeight: "600" },
  nextRow: { flexDirection: "row", alignItems: "center" },
  nextStation: { fontSize: 20, fontWeight: "800" },
  nextSub: { fontSize: 11, marginTop: 4 },
  timeCol: { alignItems: "flex-end" },
  timeBig: { fontSize: 22, fontWeight: "800" },
  timeLabel: { fontSize: 10, fontWeight: "700", letterSpacing: 1 },
  footerNote: {
    marginTop: spacing.xl,
    fontSize: 11,
    lineHeight: 16,
    textAlign: "center",
  },
});
