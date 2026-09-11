import { Conversation } from "@/chat/types";

export interface GroupedConversations {
  title: string;
  data: Conversation[];
}

export function groupConversationsByDate(
  conversations: Conversation[]
): GroupedConversations[] {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const startOfYesterday = startOfToday - 86400000;
  const startOf7Days = startOfToday - 6 * 86400000;
  const startOf30Days = startOfToday - 29 * 86400000;

  const today: Conversation[] = [];
  const yesterday: Conversation[] = [];
  const previous7Days: Conversation[] = [];
  const previous30Days: Conversation[] = [];
  const older: Conversation[] = [];

  for (const conv of conversations) {
    const time = conv.updatedAt || conv.createdAt;
    if (time >= startOfToday) {
      today.push(conv);
    } else if (time >= startOfYesterday) {
      yesterday.push(conv);
    } else if (time >= startOf7Days) {
      previous7Days.push(conv);
    } else if (time >= startOf30Days) {
      previous30Days.push(conv);
    } else {
      older.push(conv);
    }
  }

  const groups: GroupedConversations[] = [];
  if (today.length > 0) groups.push({ title: "Today", data: today });
  if (yesterday.length > 0) groups.push({ title: "Yesterday", data: yesterday });
  if (previous7Days.length > 0) groups.push({ title: "Previous 7 Days", data: previous7Days });
  if (previous30Days.length > 0) groups.push({ title: "Previous 30 Days", data: previous30Days });
  if (older.length > 0) groups.push({ title: "Older", data: older });

  return groups;
}
