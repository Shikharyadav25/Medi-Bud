# Medi Bud — Apple Human Interface Guidelines (HIG) Standards

This document establishes the UI/UX design standards for Medi Bud, grounded in Apple Human Interface Guidelines adapted for React Native / Expo mobile development.

---

## 1. Core Principles

1. **Clarity & Focus**:
   - Content should be clean and readable with ample breathing room (8pt grid system).
   - Text is legible with strong typographical hierarchy (San Francisco style typography scale).
   - Visual elements clarify rather than distract. No gratuitous neon gradients or heavy glowing borders.

2. **Deference & Minimalism**:
   - The UI recedes to let health data and clinical guidance take center stage.
   - Use System Grouped Backgrounds: `#F2F2F7` for grouped backgrounds, `#FFFFFF` for cards with 1px subtle `#E5E5EA` borders.
   - Monochromatic iconography with consistent 1.5–2px stroke widths (Lucide icons).

3. **Depth & Hierarchy**:
   - Distinct elevation layers: Screen background (`#F2F2F7`) → Card surface (`#FFFFFF`) → Controls/Chips (`#E5E5EA`).
   - Mathematical corner radius harmony: $R_{\text{inner}} = R_{\text{outer}} - P$ (where $P$ is padding).
   - Standard control radius: 10–12pt, inset grouped cards: 12–16pt.

---

## 2. Color System & Urgency Tints

Colors follow Apple Health clinical urgency standards with WCAG AAA contrast:

- **Surface / Background**:
  - `background`: `#F2F2F7` (System Grouped Background)
  - `surface`: `#FFFFFF` (Secondary Grouped Surface)
  - `surfaceSubtle`: `#E5E5EA` (Tertiary Grouped Surface)
  - `borderSubtle`: `#E5E5EA` (Apple Separator Color)

- **Labels & Hierarchy**:
  - `textPrimary`: `#000000` (100% contrast)
  - `textSecondary`: `#3C3C43` (Subtle dark gray, 60% opacity)
  - `textTertiary`: `#6C6C70` (Captions / headers, 30% opacity)
  - `textMuted`: `#8E8E93` (Quaternary / placeholders)

- **Clinical Urgency Levels**:
  - **Emergency**: Text `#D70015`, Background `#FFEEEE`, Border `#FFB3B8`
  - **Soon / Warning**: Text `#C93400`, Background `#FFF2EC`, Border `#FFCCA8`
  - **Monitor**: Text `#B25000`, Background `#FFF8E6`, Border `#FFE199`
  - **Self-Care / Good**: Text `#248A3D`, Background `#E8F8ED`, Border `#A1E8B4`

---

## 3. Typography Hierarchy

Based on iOS Dynamic Type standards:

| Style | Size / Line Height | Weight | Tracking | Usage |
|---|---|---|---|---|
| **Large Title** | 34pt / 41pt | Bold (700) | +0.37 | Primary view headers |
| **Title 1** | 28pt / 34pt | Bold (700) | +0.36 | Top-level screen titles |
| **Title 2** | 22pt / 28pt | Bold (700) | +0.35 | Section headlines |
| **Title 3** | 20pt / 25pt | Semi-bold (600) | +0.38 | Card titles |
| **Headline** | 17pt / 22pt | Semi-bold (600) | -0.41 | Prominent list item titles |
| **Body** | 17pt / 22pt | Regular (400) | -0.41 | Default conversational text |
| **Subheadline** | 15pt / 20pt | Regular (400) | -0.24 | Secondary list labels |
| **Footnote** | 13pt / 18pt | Regular (400) | -0.08 | Explanatory captions |
| **Caption 1** | 12pt / 16pt | Regular (400) | 0.00 | Metadata & timestamps |
| **Caption 2** | 11pt / 13pt | Regular (400) | +0.07 | Badge text & small labels |

---

## 4. Touch Targets & Accessibility

- **Minimum Touch Target**: 44 × 44pt for all buttons, chips, and interactive elements.
- **Form Controls**: Text inputs and buttons must provide visual pressed states and accessibility labels (`accessibilityRole`, `accessibilityLabel`).
- **Keyboard Avoidance**: All input views wrap in `KeyboardAvoidingView` with safe area inset accounting.
