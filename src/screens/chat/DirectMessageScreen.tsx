import React, { useRef, useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, FlatList,
  TextInput, KeyboardAvoidingView, Platform, Image,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { RootStackParamList } from '../../navigation/types';
import { useDirectChat } from '../../hooks/useChat';
import { useAuthStore } from '../../store/auth';
import { ChatMessage } from '../../types/chat.types';
import { formatChatTime, getInitial } from '../../utils/formatters';
import { getAvatarColor, MESSAGE_GROUP_THRESHOLD_MS } from '../../utils/constants';
import { colors } from '../../theme/colors';
import { typography } from '../../theme/typography';
import { spacing } from '../../theme/spacing';

export const DirectMessageScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RootStackParamList, 'DirectMessage'>>();
  const { t } = useTranslation('chat');
  const user = useAuthStore((s) => s.user);
  const { messages, sendMessage } = useDirectChat(route.params.userId);
  const [text, setText] = useState('');
  const flatListRef = useRef<FlatList>(null);

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100);
    }
  }, [messages.length]);

  const handleSend = () => {
    if (!text.trim()) return;
    sendMessage(text.trim());
    setText('');
  };

  const shouldShowAvatar = (msg: ChatMessage, index: number): boolean => {
    if (index === 0) return true;
    const prev = messages[index - 1];
    if (prev.sender_id !== msg.sender_id) return true;
    return new Date(msg.created_at).getTime() - new Date(prev.created_at).getTime() > MESSAGE_GROUP_THRESHOLD_MS;
  };

  const renderMessage = ({ item, index }: { item: ChatMessage; index: number }) => {
    const isOwn = item.sender_id === user?.id;
    const showAvatar = shouldShowAvatar(item, index);

    return (
      <View style={[styles.messageRow, isOwn && styles.messageRowOwn]}>
        {!isOwn && showAvatar && (
          item.sender.avatar_url ? (
            <Image source={{ uri: item.sender.avatar_url }} style={styles.msgAvatar} />
          ) : (
            <View style={[styles.msgAvatarFallback, { backgroundColor: getAvatarColor(item.sender.name) }]}>
              <Text style={styles.msgAvatarInitial}>{getInitial(item.sender.name)}</Text>
            </View>
          )
        )}
        {!isOwn && !showAvatar && <View style={styles.avatarSpacer} />}
        <View style={styles.messageContent}>
          <View style={[styles.bubble, isOwn ? styles.bubbleOwn : styles.bubbleOther]}>
            <Text style={[styles.messageText, isOwn && styles.messageTextOwn]}>{item.message}</Text>
          </View>
          <Text style={[styles.timeText, isOwn && styles.timeTextOwn]}>{formatChatTime(item.created_at)}</Text>
        </View>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{route.params.userName}</Text>
        <View style={{ width: 24 }} />
      </View>

      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.messageList}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyChat}>
            <Text style={styles.emptyChatText}>{t('emptyDirectChat')}</Text>
            <Text style={styles.emptyChatHint}>{t('emptyDirectChatHint')}</Text>
          </View>
        }
      />

      <View style={styles.inputBar}>
        <TextInput style={styles.input} placeholder={t('typeMessage')} placeholderTextColor={colors.text.muted} value={text} onChangeText={setText} multiline maxLength={1000} />
        <TouchableOpacity style={[styles.sendBtn, !text.trim() && styles.sendBtnDisabled]} onPress={handleSend} disabled={!text.trim()}>
          <Ionicons name="send" size={20} color={text.trim() ? colors.bg.primary : colors.text.muted} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.bg.primary },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.xl, paddingTop: spacing['4xl'], paddingBottom: spacing.md, borderBottomWidth: 1, borderBottomColor: colors.border.subtle },
  headerTitle: { ...typography.h3, color: colors.text.primary },
  messageList: { paddingHorizontal: spacing.base, paddingVertical: spacing.base, flexGrow: 1 },
  messageRow: { flexDirection: 'row', marginBottom: spacing.sm, alignItems: 'flex-end', gap: spacing.sm },
  messageRowOwn: { flexDirection: 'row-reverse' },
  msgAvatar: { width: 32, height: 32, borderRadius: 16 },
  msgAvatarFallback: { width: 32, height: 32, borderRadius: 16, justifyContent: 'center', alignItems: 'center' },
  msgAvatarInitial: { color: colors.bg.primary, fontSize: 13, fontWeight: '700' },
  avatarSpacer: { width: 32 },
  messageContent: { maxWidth: '75%' },
  bubble: { borderRadius: 16, paddingHorizontal: spacing.md, paddingVertical: spacing.sm },
  bubbleOwn: { backgroundColor: colors.accent.lime, borderBottomRightRadius: 4 },
  bubbleOther: { backgroundColor: colors.bg.surface, borderBottomLeftRadius: 4 },
  messageText: { color: colors.text.primary, fontSize: 15, lineHeight: 21 },
  messageTextOwn: { color: colors.bg.primary },
  timeText: { color: colors.text.muted, fontSize: 10, marginTop: 2, marginLeft: 4 },
  timeTextOwn: { textAlign: 'right', marginRight: 4 },
  emptyChat: { flex: 1, justifyContent: 'center', alignItems: 'center', paddingTop: spacing['5xl'] },
  emptyChatText: { color: colors.text.primary, fontSize: 16, fontWeight: '500' },
  emptyChatHint: { color: colors.text.muted, fontSize: 14, marginTop: spacing.xs },
  inputBar: { flexDirection: 'row', alignItems: 'flex-end', paddingHorizontal: spacing.base, paddingVertical: spacing.sm, paddingBottom: spacing['2xl'], borderTopWidth: 1, borderTopColor: colors.border.subtle, gap: spacing.sm },
  input: { flex: 1, backgroundColor: colors.bg.input, borderRadius: 20, paddingHorizontal: spacing.base, paddingVertical: spacing.sm, color: colors.text.primary, fontSize: 15, maxHeight: 100, borderWidth: 1, borderColor: colors.border.default },
  sendBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: colors.accent.lime, justifyContent: 'center', alignItems: 'center' },
  sendBtnDisabled: { backgroundColor: colors.bg.surface },
});
