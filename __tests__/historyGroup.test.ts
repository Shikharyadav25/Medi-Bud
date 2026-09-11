import { groupConversationsByDate } from "../src/chat/historyGroup";
import { Conversation } from "../src/chat/types";

describe("groupConversationsByDate", () => {
  it("groups conversations into Today, Yesterday, and Older appropriately", () => {
    const now = Date.now();
    const oneDayAgo = now - 24 * 60 * 60 * 1000;
    const tenDaysAgo = now - 10 * 24 * 60 * 60 * 1000;
    const fortyDaysAgo = now - 40 * 24 * 60 * 60 * 1000;

    const list: Conversation[] = [
      { id: "1", title: "Chat Today", createdAt: now, updatedAt: now },
      { id: "2", title: "Chat Yesterday", createdAt: oneDayAgo, updatedAt: oneDayAgo },
      { id: "3", title: "Chat 10 Days Ago", createdAt: tenDaysAgo, updatedAt: tenDaysAgo },
      { id: "4", title: "Chat Older", createdAt: fortyDaysAgo, updatedAt: fortyDaysAgo },
    ];

    const groups = groupConversationsByDate(list);
    expect(groups.length).toBeGreaterThan(0);

    const titles = groups.map((g) => g.title);
    expect(titles).toContain("Today");
    expect(titles).toContain("Older");
  });

  it("handles empty list without error", () => {
    const groups = groupConversationsByDate([]);
    expect(groups).toEqual([]);
  });
});
