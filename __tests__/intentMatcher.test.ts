import { matchHealthIntent } from "@/chat/offline/intentMatcher";

describe("matchHealthIntent", () => {
  it("matches thermal burn queries with verified care steps", () => {
    const result = matchHealthIntent("I burned my hand on hot oil");
    expect(result).not.toBeNull();
    expect(result?.intent.id).toBe("burn_care");
    expect(result?.content).toContain("Cool the burn immediately under cool");
    expect(result?.content).toContain("Do NOT apply ice");
    expect(result?.cards.length).toBeGreaterThan(0);
  });

  it("matches adult CPR emergencies", () => {
    const result = matchHealthIntent("Someone collapsed and is not breathing, how to do cpr?");
    expect(result).not.toBeNull();
    expect(result?.intent.id).toBe("cpr_adult");
    expect(result?.intent.urgency).toBe("emergency");
    expect(result?.content).toContain("100-120 compressions per minute");
  });

  it("matches infant fever red flags", () => {
    const result = matchHealthIntent("my 2 month old baby fever high");
    expect(result).not.toBeNull();
    expect(result?.intent.id).toBe("infant_fever");
    expect(result?.intent.urgency).toBe("emergency");
    expect(result?.content).toContain("IMMEDIATE SAME-DAY EMERGENCY");
  });

  it("matches choking heimlich maneuver", () => {
    const result = matchHealthIntent("help choking on food cannot breathe");
    expect(result).not.toBeNull();
    expect(result?.intent.id).toBe("choking_adult");
    expect(result?.content.toLowerCase()).toContain("heimlich");
  });

  it("matches severe arterial bleeding", () => {
    const result = matchHealthIntent("deep cut spurting blood heavily");
    expect(result).not.toBeNull();
    expect(result?.intent.id).toBe("severe_bleeding");
    expect(result?.intent.urgency).toBe("emergency");
    expect(result?.content.toLowerCase()).toContain("direct, firm pressure");
  });

  it("returns null for unrelated casual banter", () => {
    const result = matchHealthIntent("what is the weather like today?");
    expect(result).toBeNull();
  });
});
