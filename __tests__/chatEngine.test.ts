import { processChatMessage } from "@/chat/chatEngine";
import { setForceOffline } from "@/services/networkService";

jest.mock("@/db/client", () => ({
  enqueueOutbox: jest.fn(),
}));

describe("chatEngine hybrid fallback routing", () => {
  beforeEach(() => {
    // Force offline to test fallback tiers reliably
    setForceOffline(true);
  });

  afterAll(() => {
    setForceOffline(false);
  });

  it("routes urgent burn query to offline intent matcher", async () => {
    const result = await processChatMessage({
      query: "how to treat boiling water burn on hand",
      conversationId: "conv_test",
      profile: null,
    });

    expect(result.source).toBe("intent");
    expect(result.isOffline).toBe(true);
    expect(result.content).toContain("Thermal Burn First-Aid");
    expect(result.cards?.length).toBeGreaterThan(0);
  });

  it("routes guided triage request to conversational decision tree", async () => {
    const result = await processChatMessage({
      query: "start guided triage for chest pain",
      conversationId: "conv_test",
      profile: null,
    });

    expect(result.source).toBe("decision_tree");
    expect(result.isOffline).toBe(true);
    expect(result.interactiveOptions?.length).toBeGreaterThan(0);
    expect(result.activeTreeId).toBe("chest_pain");
  });

  it("advances active decision tree with interactive choice selection", async () => {
    const result = await processChatMessage({
      query: "Yes, sudden pressure or radiating pain",
      conversationId: "conv_test",
      profile: null,
      activeTreeId: "chest_pain",
      targetNodeId: "cp_emergency",
    });

    expect(result.source).toBe("decision_tree");
    expect(result.content).toContain("EMERGENCY FINDING");
    expect(result.interactiveOptions).toBeUndefined();
  });

  it("routes wellness guide query to local medical manual search", async () => {
    const result = await processChatMessage({
      query: "what diet is good for type 2 diabetes sugar control?",
      conversationId: "conv_test",
      profile: null,
    });

    expect(result.source).toBe("manual");
    expect(result.isOffline).toBe(true);
    expect(result.content).toContain("TYPE 2 DIABETES");
  });

  it("routes Hindi/Hinglish query to offline intent matcher", async () => {
    const result = await processChatMessage({
      query: "haath par garam paani gir gaya jal gaya",
      conversationId: "conv_test",
      profile: null,
    });

    expect(result.source).toBe("intent");
    expect(result.isOffline).toBe(true);
    expect(result.content).toContain("Thermal Burn First-Aid");
  });

  it("automatically provides four triage options for unconventional message when offline", async () => {
    const result = await processChatMessage({
      query: "explain quantum physics in relation to mitochondria",
      conversationId: "conv_test",
      profile: null,
    });

    expect(result.source).toBe("outbox_pending");
    expect(result.isOffline).toBe(true);
    // Verifies no robotic "Offline Mode Active" boilerplate
    expect(result.content).not.toContain("Offline Mode Active");
    expect(result.content).toContain("please select the category below");
    expect(result.interactiveOptions).toBeDefined();
    expect(result.interactiveOptions?.length).toBe(4);
    expect(result.interactiveOptions?.[0].targetTreeId).toBe("chest_pain");
    expect(result.interactiveOptions?.[1].targetTreeId).toBe("fever");
    expect(result.interactiveOptions?.[2].targetTreeId).toBe("headache");
    expect(result.interactiveOptions?.[3].targetTreeId).toBe("abdominal_pain");
  });

  it("handles offline image input with local queueing and instant triage options", async () => {
    const result = await processChatMessage({
      query: "",
      conversationId: "conv_test",
      profile: null,
      imageUri: "file:///local/cache/rash.jpg",
    });

    expect(result.source).toBe("outbox_pending");
    expect(result.isOffline).toBe(true);
    expect(result.content).toContain("Photo Stored Locally");
    expect(result.interactiveOptions?.length).toBe(4);
  });
});
