'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Bot, MessageCircle, Search, User } from 'lucide-react';
import { useConversation, useConversations } from '@/lib/api';
import type { Conversation } from '@/types';
import { cn, formatDateTime, formatTime, timeAgo } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { EmptyState, ErrorState, LoadingState } from '@/components/ui/state';

const INTENT_LABELS: Record<string, string> = {
  reservation: 'Reservation',
  order: 'Order',
  menu_query: 'Menu query',
  guard_alert: 'Guard alert',
  general: 'General',
};

function ConversationListItem({
  conversation,
  active,
  onClick,
}: {
  conversation: Conversation;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full rounded-lg border px-3 py-2.5 text-left transition-colors',
        active ? 'border-primary/50 bg-primary/10' : 'hover:border-primary/30 hover:bg-accent/50',
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <p className="truncate text-sm font-medium">
          {conversation.contact_name || conversation.phone || `Conversation #${conversation.id}`}
        </p>
        {conversation.unread_count > 0 && (
          <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-[10px] font-bold text-primary-foreground">
            {conversation.unread_count}
          </span>
        )}
      </div>
      <div className="mt-0.5 flex items-center justify-between gap-2">
        <p className="truncate text-xs text-muted-foreground">
          {conversation.last_message || 'No messages yet'}
        </p>
        {conversation.last_message_at && (
          <span className="shrink-0 text-[10px] text-muted-foreground">
            {timeAgo(conversation.last_message_at)}
          </span>
        )}
      </div>
    </button>
  );
}

function MessageThread({ conversationId }: { conversationId: number }) {
  const { data, error, isLoading } = useConversation(conversationId);
  const bottomRef = useRef<HTMLDivElement>(null);

  const messages = useMemo(() => data?.messages ?? [], [data]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages.length, conversationId]);

  if (isLoading) return <LoadingState label="Loading messages…" />;
  if (error) return <ErrorState message={error.message} />;
  if (messages.length === 0) {
    return <EmptyState icon={MessageCircle} title="No messages" message="This conversation is empty." />;
  }

  return (
    <div className="flex-1 space-y-3 overflow-y-auto p-4 scrollbar-thin">
      {messages.map((message) => {
        const inbound = message.direction === 'inbound';
        return (
          <div key={message.id} className={cn('flex', inbound ? 'justify-start' : 'justify-end')}>
            <div
              className={cn(
                'max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm shadow-sm',
                inbound
                  ? 'rounded-bl-sm bg-muted'
                  : 'rounded-br-sm bg-primary text-primary-foreground',
              )}
            >
              <div className="mb-0.5 flex items-center gap-1.5 text-[10px] font-medium uppercase tracking-wide opacity-70">
                {inbound ? <User className="h-3 w-3" /> : <Bot className="h-3 w-3" />}
                {inbound ? 'Customer' : 'Host.ia AI'}
                {message.intent && (
                  <Badge
                    variant="outline"
                    className={cn(
                      'ml-1 border-current px-1 py-0 text-[9px] normal-case opacity-80',
                    )}
                  >
                    {INTENT_LABELS[message.intent] ?? message.intent}
                  </Badge>
                )}
              </div>
              <p className="whitespace-pre-wrap break-words">{message.body}</p>
              <p className={cn('mt-1 text-right text-[10px]', inbound ? 'text-muted-foreground' : 'opacity-70')}>
                {formatTime(message.timestamp)}
              </p>
            </div>
          </div>
        );
      })}
      <div ref={bottomRef} />
    </div>
  );
}

export default function ConversationsPage() {
  const conversationsSwr = useConversations(8000);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [search, setSearch] = useState('');

  const conversations = useMemo(() => conversationsSwr.data ?? [], [conversationsSwr.data]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return conversations;
    return conversations.filter(
      (c) =>
        (c.contact_name ?? '').toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        (c.last_message ?? '').toLowerCase().includes(q),
    );
  }, [conversations, search]);

  // Auto-select the first conversation once data arrives.
  useEffect(() => {
    if (selectedId === null && filtered.length > 0) {
      setSelectedId(filtered[0].id);
    }
  }, [filtered, selectedId]);

  const selected = conversations.find((c) => c.id === selectedId) ?? null;

  if (conversationsSwr.error) {
    return (
      <ErrorState
        title="Chat service unavailable"
        message={`${conversationsSwr.error.message} Conversations require the chat service (default :3001) exposing GET /v1/conversations.`}
        onRetry={() => conversationsSwr.mutate()}
      />
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[320px_1fr] animate-fade-in" style={{ height: 'calc(100vh - 8.5rem)' }}>
      {/* Conversation list */}
      <div className="flex min-h-0 flex-col rounded-xl border bg-card">
        <div className="border-b p-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search phone or message…"
              className="pl-9"
            />
          </div>
        </div>
        <div className="min-h-0 flex-1 space-y-1.5 overflow-y-auto p-2 scrollbar-thin">
          {conversationsSwr.isLoading ? (
            <LoadingState label="Loading…" />
          ) : filtered.length === 0 ? (
            <EmptyState
              icon={MessageCircle}
              title="No conversations"
              message="WhatsApp conversations handled by your AI waiter will appear here."
              className="border-0"
            />
          ) : (
            filtered.map((c) => (
              <ConversationListItem
                key={c.id}
                conversation={c}
                active={c.id === selectedId}
                onClick={() => setSelectedId(c.id)}
              />
            ))
          )}
        </div>
      </div>

      {/* Thread */}
      <div className="flex min-h-0 flex-col rounded-xl border bg-card">
        {selected ? (
          <>
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div>
                <p className="text-sm font-semibold">
                  {selected.contact_name || selected.phone || `Conversation #${selected.id}`}
                </p>
                {selected.contact_name && (
                  <p className="text-xs text-muted-foreground">{selected.phone}</p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="capitalize text-muted-foreground">
                  {selected.status}
                </Badge>
                {selected.last_message_at && (
                  <span className="text-xs text-muted-foreground" title={formatDateTime(selected.last_message_at)}>
                    {timeAgo(selected.last_message_at)}
                  </span>
                )}
              </div>
            </div>
            <MessageThread conversationId={selected.id} />
          </>
        ) : (
          <EmptyState
            icon={MessageCircle}
            title="Select a conversation"
            message="Choose a conversation on the left to read the full thread."
            className="m-auto border-0"
          />
        )}
      </div>
    </div>
  );
}
