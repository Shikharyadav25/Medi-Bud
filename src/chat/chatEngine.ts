import { ChatMessage, DecisionTreeOption } from "./types";
import { UserProfile } from "@/lib/types";
import { checkNetworkOnline } from "@/services/networkService";
import { queryCloudDoctor } from "@/services/aiProxyService";
import { matchHealthIntent } from "./offline/intentMatcher";
import {
  matchDecisionTree,
  startDecisionTree,
  advanceDecisionTree,
} from "./offline/decisionTreeEngine";
import { searchMedicalManual } from "./offline/manualSearchEngine";
import { enqueueOutbox } from "@/db/client";
import { useSettingsStore } from "@/store/useSettingsStore";

export interface ChatEngineInput {
  query: string;
  conversationId: string;
  profile: UserProfile | null;
  activeTreeId?: string;
  targetNodeId?: string;
  targetTreeId?: string;
  imageUri?: string;
  imageBase64?: string;
  focusCondition?: string;
  language?: string;
}

export async function processChatMessage(
  input: ChatEngineInput
): Promise<Omit<ChatMessage, "id" | "createdAt">> {
  const {
    query,
    conversationId,
    profile,
    activeTreeId,
    targetNodeId,
    targetTreeId,
    imageUri,
    imageBase64,
    focusCondition,
    language = "en",
  } = input;

  // 1. Advance or start a decision tree if interactive choice tapped
  const effectiveTreeId = targetTreeId || activeTreeId;
  if (effectiveTreeId && targetNodeId) {
    const isRootNode =
      targetNodeId === "cp_root" ||
      targetNodeId === "fever_root" ||
      targetNodeId === "ha_root" ||
      targetNodeId === "ab_root";

    const stepResult = isRootNode
      ? startDecisionTree(effectiveTreeId)
      : advanceDecisionTree(effectiveTreeId, targetNodeId);

    if (stepResult) {
      return {
        conversationId,
        role: "assistant",
        content: stepResult.message,
        cards: stepResult.cards,
        interactiveOptions: stepResult.options,
        activeTreeId: stepResult.activeTreeId,
        source: "decision_tree",
        isOffline: true,
      };
    }
  }

  // 2. Explicit diagnostic triage request
  const matchedTree = matchDecisionTree(query);
  if (
    matchedTree &&
    (query.toLowerCase().includes("triage") ||
      query.toLowerCase().includes("flowchart") ||
      query.toLowerCase().includes("check my") ||
      query.toLowerCase().includes("diagnostic"))
  ) {
    const treeStart = startDecisionTree(matchedTree.id);
    if (treeStart) {
      return {
        conversationId,
        role: "assistant",
        content: treeStart.message,
        cards: treeStart.cards,
        interactiveOptions: treeStart.options,
        activeTreeId: treeStart.activeTreeId,
        source: "decision_tree",
        isOffline: true,
      };
    }
  }

  // 3. Online Path: Profile-aware Cloud LLM (Gemini) - bypassed in Low Data Mode
  const isLowData = useSettingsStore.getState().lowDataMode;
  const isOnline = !isLowData && (await checkNetworkOnline());
  if (isOnline) {
    try {
      const aiResponse = await queryCloudDoctor(
        query,
        profile,
        focusCondition,
        language,
        imageBase64
      );
      return {
        conversationId,
        role: "assistant",
        content: aiResponse.text,
        cards: aiResponse.cards,
        source: "cloud",
        isOffline: false,
      };
    } catch {
      // Fall through smoothly to offline stack
    }
  }

  // 4. Offline with image uploaded
  if (imageUri) {
    enqueueOutbox("CHAT_MESSAGE", {
      query,
      conversationId,
      imageUri,
      timestamp: Date.now(),
    });

    return {
      conversationId,
      role: "assistant",
      content:
        language === "hi"
          ? "📸 **फोटो सुरक्षित सहेज ली गई है**\n\nआपकी फोटो सुरक्षित रूप से डिवाइस पर सेव हो गई है और इंटरनेट कनेक्ट होते ही फुल AI जांच की जाएगी।\n\nतत्काल सुरक्षा जांच के लिए नीचे दिए गए विकल्पों में से चुनें:"
          : "📸 **Photo Stored Locally**\n\nYour image has been securely saved to your device and queued for full AI analysis upon reconnecting.\n\nTo perform an immediate clinical safety check, select an option below:",
      interactiveOptions: [
        { label: "🫀 Chest Discomfort", nextNodeId: "cp_root", targetTreeId: "chest_pain" },
        { label: "🌡️ Fever & Infection", nextNodeId: "fever_root", targetTreeId: "fever" },
        { label: "🤕 Headache", nextNodeId: "ha_root", targetTreeId: "headache" },
        { label: "🤢 Stomach Pain", nextNodeId: "ab_root", targetTreeId: "abdominal_pain" },
      ],
      source: "outbox_pending",
      isOffline: true,
    };
  }

  // 5. Offline Tier 1: Fast Intent Matcher (50+ emergency/first-aid intents)
  const intentMatch = matchHealthIntent(query);
  if (intentMatch) {
    return {
      conversationId,
      role: "assistant",
      content: intentMatch.content,
      cards: intentMatch.cards,
      source: "intent",
      isOffline: true,
    };
  }

  // 6. Offline Tier 2: Interactive Decision Tree match
  if (matchedTree) {
    const treeStart = startDecisionTree(matchedTree.id);
    if (treeStart) {
      return {
        conversationId,
        role: "assistant",
        content: treeStart.message,
        cards: treeStart.cards,
        interactiveOptions: treeStart.options,
        activeTreeId: treeStart.activeTreeId,
        source: "decision_tree",
        isOffline: true,
      };
    }
  }

  // 7. Offline Tier 3: Local Medical Manual Search
  const manualResult = searchMedicalManual(query);
  if (manualResult) {
    return {
      conversationId,
      role: "assistant",
      content: manualResult.content,
      cards: manualResult.cards,
      source: "manual",
      isOffline: true,
    };
  }

  // 8. Offline Tier 4: Unconventional message - automatically provide 4 triage options
  enqueueOutbox("CHAT_MESSAGE", {
    query,
    conversationId,
    timestamp: Date.now(),
  });

  const promptText =
    language === "hi"
      ? "आपकी सुरक्षा और सही जांच के लिए, कृपया नीचे दिए गए लक्षणों में से चुनें:"
      : "To help assess your condition safely, please select the category below that best matches what you are experiencing:";

  return {
    conversationId,
    role: "assistant",
    content: promptText,
    cards: [
      {
        type: "tip",
        icon: "activity",
        label: "Clinical Triage",
        text: "Select a category to begin guided symptom evaluation.",
      },
    ],
    interactiveOptions: [
      { label: "🫀 Chest Discomfort & Tightness", nextNodeId: "cp_root", targetTreeId: "chest_pain" },
      { label: "🌡️ Fever & Chills Check", nextNodeId: "fever_root", targetTreeId: "fever" },
      { label: "🤕 Headache & Migraine", nextNodeId: "ha_root", targetTreeId: "headache" },
      { label: "🤢 Stomach & Abdominal Pain", nextNodeId: "ab_root", targetTreeId: "abdominal_pain" },
    ],
    activeTreeId: undefined,
    source: "outbox_pending",
    isOffline: true,
  };
}
