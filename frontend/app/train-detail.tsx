import React from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";

import { ScreenHeader } from "@/src/components/screen-header";
import { DemoBadge } from "@/src/components/demo-badge";
import { TRAINS, getRouteFor } from "@/src/data/railways";
import { useTheme, spacing, radius } from "@/src/theme";

export default function TrainDetail() {
  const { colors } = useTheme();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { number } = useLocalSearchParams<{ number: string }>();
  const train = TRAINS.find((t) => t.number === number) ?? TRAINS[0];
  const route = getRouteFor(train.number);

  return (
    <View style={[styles.root, { backgroundColor: colors.surface }]} testID="train-detail-screen">
      <ScreenHeader title={train.number} subtitle={train.name} />
      <ScrollView
        contentContainerStyle={{ padding: spacing.lg, paddingBottom: insets.bottom + 120 }}
        showsVerticalScrollIndicator={false}
      >
        <DemoBadge />
        <View style={[styles.summary, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
          <View style={styles.row}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.time, { color: colors.onSurface }]}>{train.departure}</Text>
              <Text style={[styles.code, { color: colors.brandPrimary }]}>{train.fromCode}</Text>
              <Text style={[styles.stationName, { color: colors.muted }]}>{train.from}</Text>
            </View>
            <View style={styles.midCol}>
              <MaterialDesignIcons name="train" size={16} color={colors.muted} />
              <View style={[styles.hLine, { backgroundColor: colors.borderStrong }]} />
              <Text style={[styles.duration, { color: colors.brandPrimary }]}>{train.duration}</Text>
            </View>
            <View style={[{ flex: 1 }, { alignItems: "flex-end" }]}>
              <Text style={[styles.time, { color: colors.onSurface }]}>{train.arrival}</Text>
              <Text style={[styles.code, { color: colors.brandPrimary }]}>{train.toCode}</Text>
              <Text style={[styles.stationName, { color: colors.muted }]}>{train.to}</Text>
            </View>
          </View>
          <View style={[styles.divider, { backgroundColor: colors.divider }]} />
          <View style={styles.metaRow}>
            <Meta icon="calendar" label="Runs" value={train.days} />
            <Meta icon="map-marker-distance" label="Distance" value={`${route[route.length - 1].distanceKm} km`} />
            <Meta icon="train-car-passenger" label="Stops" value={`${route.length}`} />
          </View>
        </View>

        <Text style={[styles.sectionTitle, { color: colors.muted }]}>CLASSES</Text>
        <View style={styles.classRow}>
          {train.classes.map((cls) => (
            <View key={cls} style={[styles.classCard, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
              <Text style={[styles.classCardTitle, { color: colors.brandPrimary }]}>{cls}</Text>
              <Text style={[styles.classCardSub, { color: colors.muted }]}>{classLabel(cls)}</Text>
            </View>
          ))}
        </View>

        <Text style={[styles.sectionTitle, { color: colors.muted }]}>QUICK ACTIONS</Text>
        <View style={styles.actionRow}>
          <ActionBtn
            icon="radar"
            label="Live Status"
            onPress={() => router.push({ pathname: "/live-status", params: { number: train.number } })}
            testID="detail-action-live"
          />
          <ActionBtn
            icon="seat-passenger"
            label="Availability"
            onPress={() => router.push({ pathname: "/seat-availability", params: { number: train.number } })}
            testID="detail-action-availability"
          />
          <ActionBtn
            icon="map-marker-path"
            label="Route"
            onPress={() => router.push({ pathname: "/train-route", params: { number: train.number } })}
            testID="detail-action-route"
          />
        </View>
      </ScrollView>
    </View>
  );
}

function classLabel(cls: string) {
  switch (cls) {
    case "1A": return "First AC";
    case "2A": return "AC 2 Tier";
    case "3A": return "AC 3 Tier";
    case "SL": return "Sleeper";
    case "CC": return "Chair Car";
    case "2S": return "Second Sitting";
    default: return cls;
  }
}

function Meta({ icon, label, value }: { icon: string; label: string; value: string }) {
  const { colors } = useTheme();
  return (
    <View style={styles.meta}>
      <MaterialDesignIcons name={icon as any} size={16} color={colors.brandPrimary} />
      <View>
        <Text style={[styles.metaLabel, { color: colors.muted }]}>{label}</Text>
        <Text style={[styles.metaValue, { color: colors.onSurface }]}>{value}</Text>
      </View>
    </View>
  );
}

function ActionBtn({ icon, label, onPress, testID }: { icon: string; label: string; onPress: () => void; testID: string }) {
  const { colors } = useTheme();
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      style={({ pressed }) => [
        styles.action,
        {
          backgroundColor: colors.surfaceSecondary,
          borderColor: colors.border,
          opacity: pressed ? 0.85 : 1,
        },
      ]}
    >
      <View style={[styles.actionIcon, { backgroundColor: colors.brandTertiary }]}>
        <MaterialDesignIcons name={icon as any} size={20} color={colors.brandPrimary} />
      </View>
      <Text style={[styles.actionLabel, { color: colors.onSurface }]}>{label}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  summary: {
    marginTop: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.lg,
  },
  row: { flexDirection: "row", alignItems: "center" },
  time: { fontSize: 22, fontWeight: "800" },
  code: { fontSize: 12, fontWeight: "800", letterSpacing: 1, marginTop: 4 },
  stationName: { fontSize: 11, marginTop: 2 },
  midCol: { alignItems: "center", gap: 6, width: 90 },
  hLine: { width: "100%", height: 1 },
  duration: { fontSize: 11, fontWeight: "700" },
  divider: { height: StyleSheet.hairlineWidth },
  metaRow: { flexDirection: "row", justifyContent: "space-between" },
  meta: { flexDirection: "row", alignItems: "center", gap: 8, flex: 1 },
  metaLabel: { fontSize: 10, fontWeight: "700", letterSpacing: 1 },
  metaValue: { fontSize: 13, fontWeight: "700", marginTop: 2 },
  sectionTitle: {
    marginTop: spacing.xl,
    marginBottom: spacing.sm,
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 1.4,
  },
  classRow: { flexDirection: "row", gap: spacing.sm, flexWrap: "wrap" },
  classCard: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderRadius: radius.md,
    borderWidth: 1,
    minWidth: 86,
    alignItems: "center",
  },
  classCardTitle: { fontSize: 16, fontWeight: "800", letterSpacing: 0.5 },
  classCardSub: { fontSize: 10, marginTop: 2 },
  actionRow: { flexDirection: "row", gap: spacing.sm },
  action: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: radius.md,
    borderWidth: 1,
    alignItems: "center",
    gap: spacing.sm,
  },
  actionIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  actionLabel: { fontSize: 12, fontWeight: "700" },
});
