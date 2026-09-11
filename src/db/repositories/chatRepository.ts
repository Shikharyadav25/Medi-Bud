import { eq, asc, desc } from "drizzle-orm";
import { getDatabase } from "../client";
import * as schema from "../schema";
import { ChatMessage, Conversation } from "@/chat/types";

export function fetchConversations(profileId?: number): Conversation[] {
  const db = getDatabase();
  const query = db
    .select()
    .from(schema.conversations);

  const records = profileId
    ? query.where(eq(schema.conversations.profileId, profileId)).orderBy(desc(schema.conversations.updatedAt)).all()
    : query.orderBy(desc(schema.conversations.updatedAt)).all();

  return records.map((r) => ({
    id: r.id,
    profileId: r.profileId ?? undefined,
    title: r.title,
    createdAt: r.createdAt,
    updatedAt: r.updatedAt,
  }));
}

export function createConversation(
  id: string,
  title: string,
  profileId?: number
): Conversation {
  const db = getDatabase();
  const now = Date.now();
  const conv: Conversation = {
    id,
    profileId: profileId ?? undefined,
    title,
    createdAt: now,
    updatedAt: now,
  };

  db.insert(schema.conversations)
    .values({
      id: conv.id,
      profileId: conv.profileId ?? null,
      title: conv.title,
      createdAt: conv.createdAt,
      updatedAt: conv.updatedAt,
    })
    .onConflictDoUpdate({
      target: schema.conversations.id,
      set: { title, updatedAt: now, profileId: conv.profileId ?? null },
    })
    .run();

  return conv;
}

export function fetchConversationMessages(conversationId: string): ChatMessage[] {
  const db = getDatabase();
  const records = db
    .select()
    .from(schema.chatMessages)
    .where(eq(schema.chatMessages.conversationId, conversationId))
    .orderBy(asc(schema.chatMessages.createdAt))
    .all();

  return records.map((r) => {
    let cards: ChatMessage["cards"] = undefined;
    let interactiveOptions: ChatMessage["interactiveOptions"] = undefined;
    let activeTreeId: string | undefined = undefined;

    if (r.cardsJson) {
      try {
        cards = JSON.parse(r.cardsJson);
      } catch {
        // Fallback for corrupt JSON
      }
    }

    if (r.interactiveJson) {
      try {
        const parsed = JSON.parse(r.interactiveJson);
        interactiveOptions = parsed.interactiveOptions;
        activeTreeId = parsed.activeTreeId;
      } catch {
        // Fallback for corrupt JSON
      }
    }

    return {
      id: r.id,
      conversationId: r.conversationId,
      role: r.role as ChatMessage["role"],
      content: r.content,
      cards,
      interactiveOptions,
      activeTreeId,
      imageUri: r.imageUri ?? undefined,
      source: r.source as ChatMessage["source"],
      isOffline: r.isOffline === 1,
      createdAt: r.createdAt,
    };
  });
}

export function persistChatMessage(message: ChatMessage): void {
  const db = getDatabase();

  const interactivePayload =
    message.interactiveOptions || message.activeTreeId
      ? JSON.stringify({
          interactiveOptions: message.interactiveOptions,
          activeTreeId: message.activeTreeId,
        })
      : null;

  db.insert(schema.chatMessages)
    .values({
      id: message.id,
      conversationId: message.conversationId,
      role: message.role,
      content: message.content,
      cardsJson: message.cards ? JSON.stringify(message.cards) : null,
      interactiveJson: interactivePayload,
      imageUri: message.imageUri ?? null,
      source: message.source,
      isOffline: message.isOffline ? 1 : 0,
      createdAt: message.createdAt,
    })
    .run();

  // Keep conversation updatedAt synced
  db.update(schema.conversations)
    .set({ updatedAt: message.createdAt })
    .where(eq(schema.conversations.id, message.conversationId))
    .run();
}

export function deleteConversation(conversationId: string): void {
  const db = getDatabase();
  db.delete(schema.chatMessages)
    .where(eq(schema.chatMessages.conversationId, conversationId))
    .run();
  db.delete(schema.conversations)
    .where(eq(schema.conversations.id, conversationId))
    .run();
}

export function updateConversationTitle(
  conversationId: string,
  title: string
): void {
  const db = getDatabase();
  db.update(schema.conversations)
    .set({ title, updatedAt: Date.now() })
    .where(eq(schema.conversations.id, conversationId))
    .run();
}

export function clearAllConversations(): void {
  const db = getDatabase();
  db.delete(schema.chatMessages).run();
  db.delete(schema.conversations).run();
}

