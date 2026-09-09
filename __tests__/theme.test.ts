import { colors, spacing, radii, typography, accessibility } from "../src/theme/tokens";

describe("Theme System & Tokens (Apple HIG Compliance)", () => {
  test("defines Apple system grouped background and primary label color", () => {
    expect(colors.background).toBe("#F2F2F7");
    expect(colors.surface).toBe("#FFFFFF");
    expect(colors.textPrimary).toBe("#000000");
  });

  test("defines all four medical triage urgency levels with contrasting colors", () => {
    expect(colors.emergency.text).toBe("#D70015"); // Apple System Red
    expect(colors.soon.text).toBe("#C93400");      // Apple System Orange
    expect(colors.monitor.text).toBe("#B25000");   // Apple System Yellow
    expect(colors.selfCare.text).toBe("#248A3D");  // Apple System Green

    expect(colors.emergency.text).not.toEqual(colors.selfCare.text);
  });

  test("follows standard spacing scale", () => {
    expect(spacing.xs).toBe(4);
    expect(spacing.sm).toBe(8);
    expect(spacing.md).toBe(12);
    expect(spacing.lg).toBe(16);
    expect(spacing.xl).toBe(20);
  });

  test("defines Apple corner radii (10pt controls, 12pt grouped cards)", () => {
    expect(radii.md).toBe(10);
    expect(radii.lg).toBe(12);
    expect(radii.full).toBe(9999);
  });

  test("defines Apple San Francisco typography scale with valid line heights", () => {
    expect(typography.largeTitle.fontSize).toBe(34);
    expect(typography.largeTitle.lineHeight).toBeGreaterThan(typography.largeTitle.fontSize);
    expect(typography.headline.fontSize).toBe(17);
    expect(typography.body.fontSize).toBe(17);
    expect(typography.footnote.fontSize).toBe(13);
  });

  test("specifies Apple minimum touch target of 44pt for mobile accessibility", () => {
    expect(accessibility.minTouchTarget).toBe(44);
  });
});
