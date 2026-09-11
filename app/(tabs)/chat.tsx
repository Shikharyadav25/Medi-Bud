import React, { useEffect, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { colors } from "@/theme/tokens";
import { useChatStore } from "@/store/useChatStore";
import { useProfileStore } from "@/store/useProfileStore";
import { ChatHeader } from "@/components/chat/ChatHeader";
import { ChatMessageItem } from "@/components/chat/ChatMessageItem";
import { ChatEmptyState } from "@/components/chat/ChatEmptyState";
import { ChatInputBar } from "@/components/chat/ChatInputBar";
import { ChatDrawer } from "@/components/chat/ChatDrawer";

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const listRef = useRef<FlatList>(null);
  const [showDrawer, setShowDrawer] = useState(false);

  const {
    conversations,
    activeConversationId,
    messages,
    isLoading,
    isOfflineForced,
    language,
    setLanguage,
    initStore,
    selectConversation,
    startNewConversation,
    updateConversationTitle,
    deleteConversation,
    clearAllConversations,
    sendMessage,
    selectInteractiveOption,
    toggleForceOffline,
  } = useChatStore();

  const { activeProfile, loadProfiles } = useProfileStore();

  useEffect(() => {
    loadProfiles();
    initStore(activeProfile?.id);
  }, [initStore, loadProfiles, activeProfile?.id]);

  const activeConv = conversations.find((c) => c.id === activeConversationId);
  const activeTitle = activeConv?.title || "New Consultation";

  const handleSendMessage = (
    text: string,
    image?: { uri: string; base64?: string } | null
  ) => {
    sendMessage(text, activeProfile, image);
    setTimeout(() => {
      listRef.current?.scrollToEnd({ animated: true });
    }, 150);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ChatDrawer
        visible={showDrawer}
        onClose={() => setShowDrawer(false)}
        conversations={conversations}
        activeConversationId={activeConversationId}
        onSelectConversation={selectConversation}
        onNewChat={() => startNewConversation(undefined, activeProfile?.id)}
        onRenameConversation={updateConversationTitle}
        onDeleteConversation={deleteConversation}
        onClearAll={clearAllConversations}
      />

      <ChatHeader
        title={activeTitle}
        savedCount={conversations.length}
        onOpenHistory={() => setShowDrawer(true)}
        isOffline={isOfflineForced}
        onToggleOffline={toggleForceOffline}
        onNewChat={() => startNewConversation(undefined, activeProfile?.id)}
        language={language}
        onToggleLanguage={() => setLanguage(language === "en" ? "hi" : "en")}
      />

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? insets.top : 0}
      >
        {messages.length === 0 ? (
          <ChatEmptyState onSelectPrompt={handleSendMessage} />
        ) : (
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(item) => item.id}
            renderItem={({ item, index }) => (
              <ChatMessageItem
                message={item}
                onSelectOption={(opt) => selectInteractiveOption(opt, activeProfile)}
                isLastMessage={index === messages.length - 1}
                language={language}
              />
            )}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() =>
              listRef.current?.scrollToEnd({ animated: true })
            }
          />
        )}

        <View style={{ paddingBottom: Math.max(insets.bottom, 12) }}>
          <ChatInputBar
            onSendMessage={handleSendMessage}
            isLoading={isLoading}
            onSelectShortcut={handleSendMessage}
            language={language}
          />
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  flex: {
    flex: 1,
  },
  listContent: {
    paddingVertical: 12,
  },
});
