import { create } from "zustand";
import { ChatMessage, Conversation, DecisionTreeOption } from "@/chat/types";
import { UserProfile } from "@/lib/types";
import {
  fetchConversations,
  createConversation,
  fetchConversationMessages,
  persistChatMessage,
  deleteConversation as deleteConvRepo,
  updateConversationTitle as updateTitleRepo,
  clearAllConversations as clearAllRepo,
} from "@/db/repositories/chatRepository";
import { processChatMessage } from "@/chat/chatEngine";
import { setForceOffline, isForceOffline } from "@/services/networkService";
import { generateTitleFromPrompt } from "@/chat/titleGenerator";

interface ChatState {
  conversations: Conversation[];
  activeConversationId: string | null;
  messages: ChatMessage[];
  isLoading: boolean;
  isOfflineForced: boolean;
  activeTreeId?: string;
  focusCondition: string;
  language: "en" | "hi";
  selectedImage: { uri: string; base64?: string } | null;

  initStore: () => void;
  selectConversation: (id: string) => void;
  startNewConversation: (title?: string) => string;
  updateConversationTitle: (id: string, title: string) => void;
  deleteConversation: (id: string) => void;
  clearAllConversations: () => void;
  sendMessage: (
    text: string,
    profile: UserProfile | null,
    image?: { uri: string; base64?: string } | null
  ) => Promise<void>;
  selectInteractiveOption: (
    option: DecisionTreeOption,
    profile: UserProfile | null
  ) => Promise<void>;
  toggleForceOffline: () => void;
  setFocusCondition: (condition: string) => void;
  setLanguage: (lang: "en" | "hi") => void;
  setSelectedImage: (img: { uri: string; base64?: string } | null) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversations: [],
  activeConversationId: null,
  messages: [],
  isLoading: false,
  isOfflineForced: isForceOffline(),
  activeTreeId: undefined,
  focusCondition: "",
  language: "en",
  selectedImage: null,

  initStore: () => {
    const list = fetchConversations();
    if (list.length > 0) {
      const activeId = list[0].id;
      const msgs = fetchConversationMessages(activeId);
      set({
        conversations: list,
        activeConversationId: activeId,
        messages: msgs,
        isOfflineForced: isForceOffline(),
      });
    } else {
      const newId = `conv_${Date.now()}`;
      const newConv = createConversation(newId, "New Health Consultation");
      set({
        conversations: [newConv],
        activeConversationId: newId,
        messages: [],
        isOfflineForced: isForceOffline(),
      });
    }
  },

  selectConversation: (id: string) => {
    const msgs = fetchConversationMessages(id);
    set({
      activeConversationId: id,
      messages: msgs,
      activeTreeId: undefined,
      selectedImage: null,
    });
  },

  startNewConversation: (title?: string) => {
    const newId = `conv_${Date.now()}`;
    const newConv = createConversation(newId, title || "New Health Consultation");
    const updated = [newConv, ...get().conversations];
    set({
      conversations: updated,
      activeConversationId: newId,
      messages: [],
      activeTreeId: undefined,
      selectedImage: null,
    });
    return newId;
  },

  updateConversationTitle: (id: string, title: string) => {
    const trimmed = title.trim();
    if (!trimmed) return;
    updateTitleRepo(id, trimmed);
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c.id === id ? { ...c, title: trimmed } : c
      ),
    }));
  },

  deleteConversation: (id: string) => {
    deleteConvRepo(id);
    const remaining = get().conversations.filter((c) => c.id !== id);
    if (remaining.length > 0) {
      const nextId = remaining[0].id;
      const msgs = fetchConversationMessages(nextId);
      set({
        conversations: remaining,
        activeConversationId: nextId,
        messages: msgs,
      });
    } else {
      const newId = `conv_${Date.now()}`;
      const newConv = createConversation(newId, "New Health Consultation");
      set({
        conversations: [newConv],
        activeConversationId: newId,
        messages: [],
      });
    }
  },

  clearAllConversations: () => {
    clearAllRepo();
    const newId = `conv_${Date.now()}`;
    const newConv = createConversation(newId, "New Health Consultation");
    set({
      conversations: [newConv],
      activeConversationId: newId,
      messages: [],
      activeTreeId: undefined,
      selectedImage: null,
    });
  },

  sendMessage: async (
    text: string,
    profile: UserProfile | null,
    image?: { uri: string; base64?: string } | null
  ) => {
    const trimmed = text.trim();
    if (!trimmed && !image) return;

    let convId = get().activeConversationId;
    if (!convId) {
      convId = get().startNewConversation();
    }

    // Auto-generate title if this is the start of a consultation
    const isFirstMessage = get().messages.length === 0;
    const currentConv = get().conversations.find((c) => c.id === convId);
    if (isFirstMessage && currentConv && currentConv.title === "New Health Consultation") {
      const smartTitle = generateTitleFromPrompt(trimmed || "Medical Photo Analysis");
      updateTitleRepo(convId, smartTitle);
      set((state) => ({
        conversations: state.conversations.map((c) =>
          c.id === convId ? { ...c, title: smartTitle } : c
        ),
      }));
    }

    const now = Date.now();
    const userMessage: ChatMessage = {
      id: `msg_${now}_u`,
      conversationId: convId,
      role: "user",
      content: trimmed || "Uploaded medical photo for analysis",
      imageUri: image?.uri,
      imageBase64: image?.base64,
      source: "cloud",
      isOffline: false,
      createdAt: now,
    };

    persistChatMessage(userMessage);

    set((state) => ({
      messages: [...state.messages, userMessage],
      isLoading: true,
      selectedImage: null,
    }));

    try {
      const assistantPayload = await processChatMessage({
        query: trimmed || "Uploaded medical photo",
        conversationId: convId,
        profile,
        activeTreeId: get().activeTreeId,
        focusCondition: get().focusCondition,
        language: get().language,
        imageUri: image?.uri,
        imageBase64: image?.base64,
      });

      const assistantMessage: ChatMessage = {
        ...assistantPayload,
        id: `msg_${Date.now()}_a`,
        createdAt: Date.now(),
      };

      persistChatMessage(assistantMessage);

      set((state) => ({
        messages: [...state.messages, assistantMessage],
        isLoading: false,
        activeTreeId: assistantMessage.activeTreeId,
      }));
    } catch {
      set({ isLoading: false });
    }
  },

  selectInteractiveOption: async (
    option: DecisionTreeOption,
    profile: UserProfile | null
  ) => {
    const convId = get().activeConversationId;
    if (!convId) return;

    const now = Date.now();
    const userMessage: ChatMessage = {
      id: `msg_${now}_u`,
      conversationId: convId,
      role: "user",
      content: option.label,
      source: "decision_tree",
      isOffline: true,
      createdAt: now,
    };

    persistChatMessage(userMessage);

    set((state) => ({
      messages: [...state.messages, userMessage],
      isLoading: true,
    }));

    try {
      const assistantPayload = await processChatMessage({
        query: option.label,
        conversationId: convId,
        profile,
        activeTreeId: get().activeTreeId,
        targetNodeId: option.nextNodeId,
        targetTreeId: option.targetTreeId,
        focusCondition: get().focusCondition,
        language: get().language,
      });

      const assistantMessage: ChatMessage = {
        ...assistantPayload,
        id: `msg_${Date.now()}_a`,
        createdAt: Date.now(),
      };

      persistChatMessage(assistantMessage);

      set((state) => ({
        messages: [...state.messages, assistantMessage],
        isLoading: false,
        activeTreeId: assistantMessage.activeTreeId,
      }));
    } catch {
      set({ isLoading: false });
    }
  },

  toggleForceOffline: () => {
    const nextState = !get().isOfflineForced;
    setForceOffline(nextState);
    set({ isOfflineForced: nextState });
  },

  setFocusCondition: (condition: string) => {
    set({ focusCondition: condition });
  },

  setLanguage: (lang: "en" | "hi") => {
    set({ language: lang });
  },

  setSelectedImage: (img: { uri: string; base64?: string } | null) => {
    set({ selectedImage: img });
  },
}));
