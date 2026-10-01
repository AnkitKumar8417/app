import React, { useMemo, useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { useLocalSearchParams } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";

import { ScreenHeader } from "@/src/components/screen-header";
import { DemoBadge } from "@/src/components/demo-badge";
import { TRAINS, TrainClass, generateAvailability } from "@/src/data/railways";
import { useTheme, spacing, radius } from "@/src/theme";

const CLASS_LABELS: Record<TrainClass, string> = {
  "1A": "First AC",
  "2A": "AC 2 Tier",
  "3A": "AC 3 Tier",
  "SL": "Sleeper",
  "CC": "Chair Car",
  "2S": "Second Sitting",
};

export default function SeatAvailability() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { number } = useLocalSearchParams<{ number?: string }>();

  const [selectedTrain, setSelectedTrain] = useState<string>(number ?? TRAINS[0].number);
  const [selectedClass, setSelectedClass] = useState<TrainClass>("SL");
  const [date, setDate] = useState("15 May 2026");

  const train = useMemo(() => TRAINS.find((t) => t.number === selectedTrain) ?? TRAINS[0], [selectedTrain]);

  const days = useMemo(() => {
    return Array.from({ length: 5 }).map((_, idx) => {
      const dateStr = `${15 + idx} May 2026`;
      const [avail] = generateAvailability(train.number, dateStr).filter((a) => a.classCode === selectedClass).concat(
        generateAvailability(train.number, dateStr),
      );
      return { date: dateStr, avail };
    });
  }, [train.number, selectedClass]);

  return (
    <View style={[styles.root, { backgroundColor: colors.surface }]} testID="seat-availability-screen">
      <ScreenHeader title="Seat Availability" subtitle={train.name} />
      <ScrollView
        contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: insets.bottom + spacing.xxl }}
      >
        <View style={{ marginTop: spacing.md }}>
          <DemoBadge />
        </View>

        <Text style={[styles.sectionLabel, { color: colors.muted }]}>TRAIN</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
          {TRAINS.map((t) => {
            const active = t.number === selectedTrain;
            return (
              <Pressable
                key={t.number}
                testID={`avail-train-chip-${t.number}`}
                onPress={() => setSelectedTrain(t.number)}
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

        <Text style={[styles.sectionLabel, { color: colors.muted }]}>CLASS</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
          {(["SL", "3A", "2A"] as TrainClass[]).map((cls) => {
            const active = cls === selectedClass;
            return (
              <Pressable
                key={cls}
                testID={`avail-class-chip-${cls}`}
                onPress={() => setSelectedClass(cls)}
                style={[
                  styles.chip,
                  {
                    backgroundColor: active ? colors.brandPrimary : colors.surfaceSecondary,
                    borderColor: active ? colors.brandPrimary : colors.border,
                  },
                ]}
              >
                <Text style={[styles.chipText, { color: active ? colors.onBrandPrimary : colors.onSurface }]}>
                  {cls}
                </Text>
                <Text style={[styles.chipSub, { color: active ? colors.onBrandPrimary : colors.muted }]}>
                  {CLASS_LABELS[cls]}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>

        <View style={[styles.dateCard, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
          <MaterialDesignIcons name="calendar" size={18} color={colors.brandPrimary} />
          <View style={{ flex: 1 }}>
            <Text style={[styles.dateLabel, { color: colors.muted }]}>FROM DATE</Text>
            <Text style={[styles.dateValue, { color: colors.onSurface }]}>{date}</Text>
          </View>
        </View>

        <Text style={[styles.sectionLabel, { color: colors.muted }]}>5-DAY AVAILABILITY · {selectedClass}</Text>

        <View style={styles.availList}>
          {days.map((d, idx) => {
            const availForClass = generateAvailability(train.number, d.date).find((a) => a.classCode === selectedClass)
              ?? generateAvailability(train.number, d.date)[0];
            const tag = availForClass.tag;
            const color =
              tag === "AVL" ? colors.success : tag === "RAC" ? colors.warning : colors.error;
            const bg =
              tag === "AVL"
                ? colors.brandTertiary
                : tag === "RAC"
                ? "rgba(255,183,77,0.14)"
                : "rgba(239,83,80,0.14)";
            return (
              <View
                key={idx}
                style={[styles.availRow, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}
                testID={`avail-row-${idx}`}
              >
                <View style={styles.dayCol}>
                  <Text style={[styles.dayNum, { color: colors.onSurface }]}>{d.date.split(" ")[0]}</Text>
                  <Text style={[styles.dayMonth, { color: colors.muted }]}>
                    {d.date.split(" ").slice(1).join(" ").toUpperCase()}
                  </Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.availStatus, { color: colors.onSurface }]}>{availForClass.status}</Text>
                  <Text style={[styles.availSub, { color: colors.muted }]}>GN Quota · {selectedClass}</Text>
                </View>
                <View style={[styles.tag, { backgroundColor: bg, borderColor: color }]}>
                  <Text style={[styles.tagText, { color }]}>{tag}</Text>
                </View>
              </View>
            );
          })}
        </View>
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
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: radius.md,
    borderWidth: 1,
    flexShrink: 0,
    alignItems: "flex-start",
    minWidth: 72,
  },
  chipText: { fontSize: 13, fontWeight: "800" },
  chipSub: { fontSize: 10, marginTop: 2 },
  dateCard: {
    marginTop: spacing.lg,
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  dateLabel: { fontSize: 10, fontWeight: "800", letterSpacing: 1.2 },
  dateValue: { fontSize: 15, fontWeight: "700", marginTop: 2 },
  availList: { gap: spacing.sm },
  availRow: {
    padding: spacing.md,
    borderRadius: radius.md,
    borderWidth: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  dayCol: { width: 56 },
  dayNum: { fontSize: 22, fontWeight: "800" },
  dayMonth: { fontSize: 10, fontWeight: "700", letterSpacing: 1 },
  availStatus: { fontSize: 15, fontWeight: "800" },
  availSub: { fontSize: 11, marginTop: 2 },
  tag: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  tagText: { fontSize: 11, fontWeight: "800", letterSpacing: 0.5 },
});
