import React, { useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import MaterialDesignIcons from "@react-native-vector-icons/material-design-icons";

import { ScreenHeader } from "@/src/components/screen-header";
import { DemoBadge } from "@/src/components/demo-badge";
import { generatePnrSample, PnrSample } from "@/src/data/railways";
import { useTheme, spacing, radius } from "@/src/theme";

export default function PnrStatus() {
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const [pnr, setPnr] = useState("");
  const [result, setResult] = useState<PnrSample | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSearch = pnr.replace(/\D/g, "").length === 10;

  function doCheck() {
    if (!canSearch) {
      setError("Enter a valid 10-digit PNR");
      return;
    }
    setError(null);
    setLoading(true);
    setResult(null);
    setTimeout(() => {
      setResult(generatePnrSample(pnr));
      setLoading(false);
    }, 700);
  }

  const confirmed = result?.currentStatus?.startsWith("CNF");

  return (
    <View style={[styles.root, { backgroundColor: colors.surface }]} testID="pnr-status-screen">
      <ScreenHeader title="PNR Status" subtitle="10-digit ticket PNR" />
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={{ paddingHorizontal: spacing.lg, paddingBottom: insets.bottom + spacing.xxl }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={{ marginTop: spacing.md }}>
            <DemoBadge />
          </View>
          <View style={[styles.inputCard, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]}>
            <Text style={[styles.inputLabel, { color: colors.muted }]}>PNR NUMBER</Text>
            <TextInput
              testID="pnr-input"
              value={pnr}
              onChangeText={(v) => setPnr(v.replace(/\s/g, "").slice(0, 10))}
              placeholder="1234567890"
              placeholderTextColor={colors.muted}
              keyboardType="number-pad"
              maxLength={10}
              style={[styles.pnrInput, { color: colors.onSurface }]}
            />
            <Text style={[styles.helper, { color: colors.muted }]}>{pnr.length}/10 digits</Text>
          </View>

          {error ? (
            <View style={[styles.errorCard, { backgroundColor: colors.surfaceSecondary, borderColor: colors.error }]}>
              <MaterialDesignIcons name="alert-circle" size={18} color={colors.error} />
              <Text style={[styles.errorText, { color: colors.error }]}>{error}</Text>
            </View>
          ) : null}

          <Pressable
            testID="pnr-check-button"
            disabled={!canSearch || loading}
            onPress={doCheck}
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
                <MaterialDesignIcons name="ticket-confirmation" size={20} color={canSearch ? colors.onBrandPrimary : colors.muted} />
                <Text style={[styles.submitText, { color: canSearch ? colors.onBrandPrimary : colors.muted }]}>
                  Check status
                </Text>
              </>
            )}
          </Pressable>

          {result ? (
            <View style={[styles.resultCard, { backgroundColor: colors.surfaceSecondary, borderColor: colors.border }]} testID="pnr-result-card">
              <View style={styles.resultHeader}>
                <View>
                  <Text style={[styles.resultPnrLabel, { color: colors.muted }]}>PNR</Text>
                  <Text style={[styles.resultPnr, { color: colors.onSurface }]}>{result.pnr}</Text>
                </View>
                <View
                  style={[
                    styles.statusChip,
                    {
                      backgroundColor: confirmed ? colors.brandTertiary : "rgba(255, 183, 77, 0.15)",
                      borderColor: confirmed ? colors.brandPrimary : colors.warning,
                    },
                  ]}
                >
                  <View style={[styles.statusDot, { backgroundColor: confirmed ? colors.success : colors.warning }]} />
                  <Text style={[styles.statusText, { color: confirmed ? colors.success : colors.warning }]}>
                    {confirmed ? "CONFIRMED" : "WAITING / RAC"}
                  </Text>
                </View>
              </View>

              <View style={[styles.rowSep, { backgroundColor: colors.divider }]} />

              <Text style={[styles.trainName, { color: colors.onSurface }]}>{result.trainName}</Text>
              <Text style={[styles.trainNumber, { color: colors.brandPrimary }]}>{result.trainNumber}  ·  {result.journeyDate}</Text>

              <View style={styles.journeyRow}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.journeyCode, { color: colors.onSurface }]}>{result.fromCode}</Text>
                  <Text style={[styles.journeyStation, { color: colors.muted }]}>{result.from}</Text>
                </View>
                <MaterialDesignIcons name="arrow-right" size={18} color={colors.brandPrimary} />
                <View style={{ flex: 1, alignItems: "flex-end" }}>
                  <Text style={[styles.journeyCode, { color: colors.onSurface }]}>{result.toCode}</Text>
                  <Text style={[styles.journeyStation, { color: colors.muted }]}>{result.to}</Text>
                </View>
              </View>

              <View style={[styles.rowSep, { backgroundColor: colors.divider }]} />

              <View style={styles.detailGrid}>
                <DetailCell label="Passenger" value={result.passengerName} />
                <DetailCell label="Class" value={result.classCode} />
                <DetailCell label="Booking" value={result.bookingStatus} />
                <DetailCell label="Current" value={result.currentStatus} highlight />
                <DetailCell label="Coach" value={result.coach} />
                <DetailCell label="Seat" value={result.seat} />
              </View>
            </View>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

function DetailCell({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  const { colors } = useTheme();
  return (
    <View style={styles.detailCell}>
      <Text style={[styles.detailLabel, { color: colors.muted }]}>{label.toUpperCase()}</Text>
      <Text style={[styles.detailValue, { color: highlight ? colors.brandPrimary : colors.onSurface }]} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  inputCard: {
    marginTop: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  inputLabel: { fontSize: 10, fontWeight: "700", letterSpacing: 1.4, marginBottom: 6 },
  pnrInput: { fontSize: 28, fontWeight: "800", letterSpacing: 4, padding: 0 },
  helper: { fontSize: 11, marginTop: 6 },
  errorCard: {
    marginTop: spacing.md,
    padding: spacing.md,
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    borderRadius: radius.md,
    borderWidth: 1,
  },
  errorText: { fontSize: 13 },
  submit: {
    marginTop: spacing.md,
    paddingVertical: 16,
    borderRadius: radius.md,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  submitText: { fontSize: 15, fontWeight: "800" },
  resultCard: {
    marginTop: spacing.xl,
    padding: spacing.lg,
    borderRadius: radius.md,
    borderWidth: 1,
    gap: spacing.md,
  },
  resultHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  resultPnrLabel: { fontSize: 10, fontWeight: "700", letterSpacing: 1.4 },
  resultPnr: { fontSize: 20, fontWeight: "800", marginTop: 2 },
  statusChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: radius.pill,
    borderWidth: 1,
  },
  statusDot: { width: 6, height: 6, borderRadius: 3 },
  statusText: { fontSize: 11, fontWeight: "800", letterSpacing: 0.4 },
  rowSep: { height: StyleSheet.hairlineWidth },
  trainName: { fontSize: 16, fontWeight: "700" },
  trainNumber: { fontSize: 12, fontWeight: "700", letterSpacing: 0.4, marginTop: 2 },
  journeyRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
    marginTop: 4,
  },
  journeyCode: { fontSize: 16, fontWeight: "800" },
  journeyStation: { fontSize: 11, marginTop: 2 },
  detailGrid: { flexDirection: "row", flexWrap: "wrap" },
  detailCell: { width: "50%", paddingVertical: 6 },
  detailLabel: { fontSize: 10, fontWeight: "700", letterSpacing: 1 },
  detailValue: { fontSize: 14, fontWeight: "700", marginTop: 2 },
});
