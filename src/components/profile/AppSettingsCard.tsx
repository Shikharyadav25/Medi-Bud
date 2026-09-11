import React from "react";
import { View, Text, StyleSheet, Switch, Pressable } from "react-native";
import { colors, spacing, radii, typography, accessibility } from "@/theme/tokens";
import { useSettingsStore } from "@/store/useSettingsStore";
import { useTranslation } from "@/locales";
import { Globe, WifiOff, Type, Phone, ChevronRight } from "lucide-react-native";

interface AppSettingsCardProps {
  onEditEmergencyContact: () => void;
}

export function AppSettingsCard({ onEditEmergencyContact }: AppSettingsCardProps) {
  const { language, lowDataMode, largerText, emergencyContact, setLanguage, setLowDataMode, setLargerText } =
    useSettingsStore();
  const { t } = useTranslation();

  return (
    <View style={styles.section}>
      <Text style={styles.sectionHeader}>{t.profile.settings}</Text>

      <View style={styles.groupedCard}>
        {/* Language Row */}
        <View style={styles.row}>
          <View style={styles.rowLead}>
            <Globe size={18} color={colors.textPrimary} />
            <Text style={styles.rowLabel}>{t.profile.language}</Text>
          </View>
          <View style={styles.langSwitch}>
            <Pressable
              style={[styles.langBtn, language === "en" && styles.langBtnActive]}
              onPress={() => setLanguage("en")}
              accessibilityRole="button"
              accessibilityLabel="Switch language to English"
            >
              <Text style={[styles.langText, language === "en" && styles.langTextActive]}>
                EN
              </Text>
            </Pressable>
            <Pressable
              style={[styles.langBtn, language === "hi" && styles.langBtnActive]}
              onPress={() => setLanguage("hi")}
              accessibilityRole="button"
              accessibilityLabel="Switch language to Hindi"
            >
              <Text style={[styles.langText, language === "hi" && styles.langTextActive]}>
                हिंदी
              </Text>
            </Pressable>
          </View>
        </View>

        <View style={styles.divider} />

        {/* Low Data Mode */}
        <View style={styles.rowWithDesc}>
          <View style={styles.textStack}>
            <View style={styles.rowLead}>
              <WifiOff size={18} color={colors.textPrimary} />
              <Text style={styles.rowLabel}>{t.profile.lowDataMode}</Text>
            </View>
            <Text style={styles.rowDesc}>{t.profile.lowDataDesc}</Text>
          </View>
          <Switch
            value={lowDataMode}
            onValueChange={setLowDataMode}
            trackColor={{ false: colors.borderSubtle, true: colors.textPrimary }}
            thumbColor={colors.surface}
            accessibilityLabel="Toggle low data mode"
          />
        </View>

        <View style={styles.divider} />

        {/* Larger Text Toggle */}
        <View style={styles.rowWithDesc}>
          <View style={styles.textStack}>
            <View style={styles.rowLead}>
              <Type size={18} color={colors.textPrimary} />
              <Text style={styles.rowLabel}>{t.profile.largerText}</Text>
            </View>
            <Text style={styles.rowDesc}>{t.profile.largerTextDesc}</Text>
          </View>
          <Switch
            value={largerText}
            onValueChange={setLargerText}
            trackColor={{ false: colors.borderSubtle, true: colors.textPrimary }}
            thumbColor={colors.surface}
            accessibilityLabel="Toggle larger text"
          />
        </View>

        <View style={styles.divider} />

        {/* Emergency Contact */}
        <Pressable
          style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
          onPress={onEditEmergencyContact}
          accessibilityRole="button"
          accessibilityLabel="Edit Emergency Contact"
        >
          <View style={styles.rowLead}>
            <Phone size={18} color={colors.emergency.text} />
            <View>
              <Text style={styles.rowLabel}>{t.profile.emergencyContact}</Text>
              <Text style={styles.rowDesc}>
                {emergencyContact
                  ? `${emergencyContact.name} (${emergencyContact.phone})`
                  : t.profile.emergencyContactDesc}
              </Text>
            </View>
          </View>
          <ChevronRight size={18} color={colors.textMuted} />
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    ...typography.footnote,
    color: colors.textTertiary,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: spacing.xs,
    paddingHorizontal: spacing.xs,
  },
  groupedCard: {
    backgroundColor: colors.surface,
    borderRadius: radii.lg,
    borderColor: colors.borderSubtle,
    borderWidth: 1,
    overflow: "hidden",
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    minHeight: accessibility.minTouchTarget + 6,
  },
  rowWithDesc: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  rowLead: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.md,
  },
  textStack: {
    flex: 1,
    paddingRight: spacing.md,
  },
  rowLabel: {
    ...typography.body,
    color: colors.textPrimary,
    fontWeight: "500",
  },
  rowDesc: {
    ...typography.caption1,
    color: colors.textSecondary,
    marginTop: 2,
    paddingLeft: 18 + spacing.md,
  },
  langSwitch: {
    flexDirection: "row",
    backgroundColor: colors.background,
    borderRadius: radii.sm,
    padding: 2,
    borderWidth: 1,
    borderColor: colors.borderSubtle,
  },
  langBtn: {
    paddingHorizontal: spacing.sm,
    paddingVertical: 4,
    borderRadius: radii.sm - 2,
  },
  langBtnActive: {
    backgroundColor: colors.textPrimary,
  },
  langText: {
    ...typography.caption1,
    color: colors.textSecondary,
    fontWeight: "600",
  },
  langTextActive: {
    color: colors.textInverse,
  },
  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.borderSubtle,
    marginLeft: spacing.lg,
  },
  rowPressed: {
    backgroundColor: colors.surfaceSubtle,
  },
});
