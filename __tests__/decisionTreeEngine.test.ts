import {
  matchDecisionTree,
  startDecisionTree,
  advanceDecisionTree,
} from "@/chat/offline/decisionTreeEngine";

describe("decisionTreeEngine", () => {
  it("matches chest pain and fever keywords to appropriate decision trees", () => {
    const cpTree = matchDecisionTree("triage chest tightness");
    expect(cpTree).not.toBeNull();
    expect(cpTree?.id).toBe("chest_pain");

    const feverTree = matchDecisionTree("fever triage flowchart");
    expect(feverTree).not.toBeNull();
    expect(feverTree?.id).toBe("fever");
  });

  it("starts a decision tree at its root node with choices", () => {
    const start = startDecisionTree("chest_pain");
    expect(start).not.toBeNull();
    expect(start?.isTerminal).toBe(false);
    expect(start?.options?.length).toBe(2);
    expect(start?.options?.[0].nextNodeId).toBe("cp_emergency");
  });

  it("advances to emergency terminal node when user reports cardiac red flags", () => {
    const step = advanceDecisionTree("chest_pain", "cp_emergency");
    expect(step).not.toBeNull();
    expect(step?.isTerminal).toBe(true);
    expect(step?.urgency).toBe("emergency");
    expect(step?.message).toContain("EMERGENCY FINDING");
    expect(step?.message).toContain("112 / 911");
    expect(step?.cards?.length).toBeGreaterThan(0);
  });

  it("advances through intermediate nodes to a self-care conclusion", () => {
    const step1 = advanceDecisionTree("chest_pain", "cp_movement");
    expect(step1?.isTerminal).toBe(false);
    expect(step1?.options?.length).toBe(3);

    const step2 = advanceDecisionTree("chest_pain", "cp_musculoskeletal");
    expect(step2?.isTerminal).toBe(true);
    expect(step2?.urgency).toBe("self_care");
    expect(step2?.message).toContain("Musculoskeletal Chest Wall Strain");
  });

  it("returns null for non-existent trees or nodes", () => {
    expect(startDecisionTree("unknown_tree")).toBeNull();
    expect(advanceDecisionTree("chest_pain", "invalid_node_id")).toBeNull();
  });
});
