import React, { useEffect, useRef } from "react";
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

export default function ChatScreen() {
  const insets = useSafeAreaInsets();
  const listRef = useRef<FlatList>(null);

  const {
    messages,
    isLoading,
    isOfflineForced,
    language,
    setLanguage,
    initStore,
    startNewConversation,
    sendMessage,
    selectInteractiveOption,
    toggleForceOffline,
  } = useChatStore();

  const { profile, loadProfile } = useProfileStore();

  useEffect(() => {
    initStore();
    loadProfile("local_user_default");
  }, [initStore, loadProfile]);

  const handleSendMessage = (
    text: string,
    image?: { uri: string; base64?: string } | null
  ) => {
    sendMessage(text, profile, image);
    setTimeout(() => {
      listRef.current?.scrollToEnd({ animated: true });
    }, 150);
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <ChatHeader
        isOffline={isOfflineForced}
        onToggleOffline={toggleForceOffline}
        onNewChat={() => startNewConversation()}
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
                onSelectOption={(opt) => selectInteractiveOption(opt, profile)}
                isLastMessage={index === messages.length - 1}
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
