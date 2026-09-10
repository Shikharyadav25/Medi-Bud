import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { MedicalCard, CardIconKey } from "@/chat/types";
import { colors, spacing, typography, radii } from "@/theme/tokens";
import {
  Check,
  X,
  AlertTriangle,
  Heart,
  Activity,
  Zap,
  Leaf,
  Droplets,
  Shield,
  Flame,
  Utensils,
  Pill,
  Info,
  Thermometer,
} from "lucide-react-native";

interface ChatCardSectionProps {
  cards?: MedicalCard[];
}

function renderCardIcon(key?: CardIconKey) {
  const iconProps = { size: 14, color: colors.textPrimary, strokeWidth: 2 };
  switch (key) {
    case "check":
      return <Check {...iconProps} color={colors.selfCare.text} />;
    case "x":
      return <X {...iconProps} color={colors.emergency.text} />;
    case "alert":
      return <AlertTriangle {...iconProps} color={colors.soon.text} />;
    case "heart":
      return <Heart {...iconProps} color={colors.emergency.text} />;
    case "activity":
      return <Activity {...iconProps} color={colors.tint} />;
    case "zap":
      return <Zap {...iconProps} color={colors.soon.text} />;
    case "leaf":
      return <Leaf {...iconProps} color={colors.selfCare.text} />;
    case "droplet":
      return <Droplets {...iconProps} color={colors.tint} />;
    case "shield":
      return <Shield {...iconProps} color={colors.textPrimary} />;
    case "flame":
      return <Flame {...iconProps} color={colors.emergency.text} />;
    case "utensils":
      return <Utensils {...iconProps} color={colors.soon.text} />;
    case "pill":
      return <Pill {...iconProps} color={colors.tint} />;
    case "thermometer":
      return <Thermometer {...iconProps} color={colors.soon.text} />;
    default:
      return <Info {...iconProps} color={colors.textSecondary} />;
  }
}

export function ChatCardSection({ cards }: ChatCardSectionProps) {
  if (!cards || cards.length === 0) return null;

  return (
    <View style={styles.container}>
      {cards.map((card, idx) => {
        const isAlert = card.type === "warn" || card.type === "avoid";
        return (
          <View
            key={idx}
            style={[styles.card, isAlert && styles.cardAlert]}
          >
            <View style={styles.headerRow}>
              <View style={styles.iconBox}>{renderCardIcon(card.icon)}</View>
              <Text style={styles.label}>{card.label}</Text>
              {card.badge && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{card.badge}</Text>
                </View>
              )}
            </View>

            {card.value && <Text style={styles.value}>{card.value}</Text>}
            {card.text && <Text style={styles.bodyText}>{card.text}</Text>}
          </View>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing.sm,
    marginTop: spacing.sm,
  },
  card: {
    backgroundColor: colors.surface,
    borderColor: colors.borderSubtle,
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.md,
  },
  cardAlert: {
    borderColor: colors.emergency.border,
    backgroundColor: colors.emergency.bg,
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.xs + 2,
    marginBottom: spacing.xs,
  },
  iconBox: {
    width: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  label: {
    ...typography.caption2,
    fontWeight: "700",
    color: colors.textPrimary,
    textTransform: "uppercase",
    letterSpacing: 0.5,
    flex: 1,
  },
  badge: {
    backgroundColor: colors.surfaceSubtle,
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: 2,
    borderRadius: radii.sm,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: "600",
    color: colors.textSecondary,
  },
  value: {
    ...typography.headline,
    color: colors.textPrimary,
    marginVertical: 2,
  },
  bodyText: {
    ...typography.footnote,
    color: colors.textSecondary,
    lineHeight: 18,
  },
});
