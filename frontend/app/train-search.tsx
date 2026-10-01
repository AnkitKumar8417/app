import React, { useMemo, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";

import { ScreenHeader } from "@/src/components/screen-header";
import { DemoBadge } from "@/src/components/demo-badge";
import { TRAINS, Train } from "@/src/data/railways";
import { useTheme, spacing, radius } from "@/src/theme";

export default function TrainSearch() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [date, setDate] = useState("15 May 2026");
  const [results, setResults] = useState<Train[] | null>(null);
  const [loading, setLoading] = useState(false);

  const canSearch = useMemo(() => from.trim().length > 1 && to.trim().length > 1, [from, to]);

  function doSearch() {
    if (!canSearch) return;
    setLoading(true);
    setResults(null);
    setTimeout(() => {
      const q = (from + to).toLowerCase();
      const match = TRAINS.filter((t) => {
        const inFrom = t.from.toLowerCase().includes(from.toLowerCase()) || t.fromCode.toLowerCase().includes(from.toLowerCase());
        const inTo = t.to.toLowerCase().includes(to.toLowerCase()) || t.toCode.toLowerCase().includes(to.toLowerCase());
        return inFrom && inTo;
      });
      setResults(match.length > 0 ? match : TRAINS.slice(0, 4));
      setLoading(false);
      void q;
    }, 650);
  }

  function openDetail(train: Train) {
    router.push({ pathname: "/train-detail", params: { number: train.number } });
  }

  return (
    <View style={[styles.root, { backgroundColor: colors.surface }]} testID="train-search-screen">
      <ScreenHeader title="Train Search" subtitle="Find trains between stations" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.formWrap}>
          <View style={[styles.card, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
            <FieldRow icon="train-car" label="FROM">
              <TextInput
                testID="search-from-input"
                placeholder="Mumbai Central / MMCT"
                placeholderTextColor={colors.muted}
                value={from}
                onChangeText={setFrom}
                style={[styles.input, { color: colors.onSurface }]}
              />
            </FieldRow>
            <View style={[styles.sep, { backgroundColor: colors.divider }]} />
            <FieldRow icon="map-marker-check" label="TO">
              <TextInput
                testID="search-to-input"
                placeholder="New Delhi / NDLS"
                placeholderTextColor={colors.muted}
                value={to}
                onChangeText={setTo}
                style={[styles.input, { color: colors.onSurface }]}
              />
            </FieldRow>
            <View style={[styles.sep, { backgroundColor: colors.divider }]} />
            <FieldRow icon="calendar" label="DATE">
              <TextInput
                testID="search-date-input"
                placeholder="15 May 2026"
                placeholderTextColor={colors.muted}
                value={date}
                onChangeText={setDate}
                style={[styles.input, { color: colors.onSurface }]}
              />
            </FieldRow>
          </View>

          <Pressable
            testID="search-submit-button"
            disabled={!canSearch || loading}
            onPress={doSearch}
            style={({ pressed }) => [
              styles.submit,
              {
                backgroundColor: canSearch ? colors.brandPrimary : colors.surfaceTertiary,
                opacity: pressed ? 0.9 : 1,
              },
            ]}
          >
            {loading ? (
              <ActivityIndicator color={colors.onBrandPrimary} />
            ) : (
              <>
                <MaterialDesignIcons name="magnify" size={20} color={canSearch ? colors.onBrandPrimary : colors.muted} />
                <Text style={[styles.submitText, { color: canSearch ? colors.onBrandPrimary : colors.muted }]}>
                  Search trains
                </Text>
              </>
            )}
          </Pressable>
        </View>

        <View style={styles.resultsHeader}>
          <Text style={[styles.resultsTitle, { color: colors.onSurface }]}>
            {results === null ? "Suggestions" : `${results.length} trains`}
          </Text>
          <DemoBadge compact />
        </View>

        <FlatList
          data={results ?? TRAINS}
          keyExtractor={(t) => t.number}
          contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: insets.bottom + spacing.xl }}
          ItemSeparatorComponent={() => <View style={{ height: spacing.md }} />}
          ListEmptyComponent={
            !loading ? (
              <View style={styles.empty}>
                <MaterialDesignIcons name="train-variant" size={48} color={colors.muted} />
                <Text style={[styles.emptyText, { color: colors.muted }]}>
                  No trains found. Try other stations.
                </Text>
              </View>
            ) : null
          }
          renderItem={({ item }) => (
            <TrainResultCard train={item} onPress={() => openDetail(item)} />
          )}
          testID="search-results-list"
        />
      </KeyboardAvoidingView>
    </View>
  );
}

function FieldRow({
  icon,
  label,
  children,
}: {
  icon: string;
  label: string;
  children: React.ReactNode;
}) {
  const { colors } = useTheme();
  return (
    <View style={styles.fieldRow}>
      <View style={[styles.fieldIcon, { backgroundColor: colors.brandTertiary }]}>
        <MaterialDesignIcons name={icon as any} size={18} color={colors.brandPrimary} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[styles.fieldLabel, { color: colors.muted }]}>{label}</Text>
        {children}
      </View>
    </View>
  );
}

export function TrainResultCard({ train, onPress }: { train: Train; onPress?: () => void }) {
  const { colors } = useTheme();
  return (
    <Pressable
      testID={`train-card-${train.number}`}
      onPress={onPress}
      style={({ pressed }) => [
        trainCardStyles.card,
        {
          backgroundColor: colors.surfaceSecondary,
          borderColor: colors.border,
          opacity: pressed ? 0.9 : 1,
        },
      ]}
    >
      <View style={trainCardStyles.topRow}>
        <View>
          <Text style={[trainCardStyles.number, { color: colors.brandPrimary }]}>{train.number}</Text>
          <Text style={[trainCardStyles.name, { color: colors.onSurface }]}>{train.name}</Text>
        </View>
        <View style={[trainCardStyles.daysChip, { backgroundColor: colors.surfaceTertiary }]}>
          <Text style={[trainCardStyles.daysText, { color: colors.muted }]}>{train.days}</Text>
        </View>
      </View>
      <View style={trainCardStyles.timeRow}>
        <View style={trainCardStyles.col}>
          <Text style={[trainCardStyles.time, { color: colors.onSurface }]}>{train.departure}</Text>
          <Text style={[trainCardStyles.station, { color: colors.muted }]}>{train.fromCode}</Text>
          <Text style={[trainCardStyles.stationName, { color: colors.onSurfaceSecondary }]} numberOfLines={1}>
            {train.from}
          </Text>
        </View>
        <View style={trainCardStyles.midCol}>
          <Text style={[trainCardStyles.duration, { color: colors.brandPrimary }]}>{train.duration}</Text>
          <View style={[trainCardStyles.line, { backgroundColor: colors.borderStrong }]} />
          <MaterialDesignIcons name="train" size={14} color={colors.muted} />
        </View>
        <View style={[trainCardStyles.col, { alignItems: "flex-end" }]}>
          <Text style={[trainCardStyles.time, { color: colors.onSurface }]}>{train.arrival}</Text>
          <Text style={[trainCardStyles.station, { color: colors.muted }]}>{train.toCode}</Text>
          <Text style={[trainCardStyles.stationName, { color: colors.onSurfaceSecondary }]} numberOfLines={1}>
            {train.to}
          </Text>
        </View>
      </View>
      <View style={trainCardStyles.classRow}>
        {train.classes.map((cls) => (
          <View key={cls} style={[trainCardStyles.classChip, { backgroundColor: colors.brandTertiary }]}>
            <Text style={[trainCardStyles.classText, { color: colors.brandPrimary }]}>{cls}</Text>
          </View>
        ))}
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  formWrap: { paddingHorizontal: spacing.lg, paddingTop: spacing.md, gap: spacing.md },
  card: {
    borderRadius: radius.md,
    borderWidth: 1,
    paddingHorizontal: spacing.md,
  },
  fieldRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: 12,
  },
  fieldIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 1.2,
    marginBottom: 2,
  },
  input: {
    fontSize: 15,
    fontWeight: "600",
    padding: 0,
  },
  sep: { height: StyleSheet.hairlineWidth },
  submit: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
    paddingVertical: 16,
    borderRadius: radius.md,
  },
  submitText: { fontSize: 15, fontWeight: "800", letterSpacing: 0.4 },
  resultsHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.xl,
    paddingBottom: spacing.md,
  },
  resultsTitle: { fontSize: 13, fontWeight: "700", letterSpacing: 1.2, textTransform: "uppercase" },
  empty: {
    alignItems: "center",
    gap: spacing.md,
    paddingVertical: spacing.xxxl,
  },
  emptyText: { fontSize: 14 },
});

const trainCardStyles = StyleSheet.create({
  card: {
    borderRadius: radius.md,
    borderWidth: 1,
    padding: spacing.md,
    gap: spacing.md,
  },
  topRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: spacing.sm,
  },
  number: { fontSize: 12, fontWeight: "800", letterSpacing: 1.4 },
  name: { fontSize: 16, fontWeight: "700", marginTop: 2 },
  daysChip: { paddingVertical: 4, paddingHorizontal: 8, borderRadius: radius.sm },
  daysText: { fontSize: 10, fontWeight: "700" },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  col: { flex: 1 },
  midCol: { alignItems: "center", gap: 4, width: 70 },
  time: { fontSize: 20, fontWeight: "800" },
  station: { fontSize: 11, fontWeight: "700", letterSpacing: 1, marginTop: 2 },
  stationName: { fontSize: 11, marginTop: 2 },
  duration: { fontSize: 11, fontWeight: "700" },
  line: { width: "100%", height: 1 },
  classRow: { flexDirection: "row", gap: 6, flexWrap: "wrap" },
  classChip: { paddingVertical: 4, paddingHorizontal: 10, borderRadius: radius.sm },
  classText: { fontSize: 11, fontWeight: "800", letterSpacing: 0.5 },
});
