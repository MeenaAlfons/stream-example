import { useEffect, useRef } from 'react';
import { MessageResponse, DefaultGenerics } from 'stream-chat';
import styles from './MessageList.module.css';

interface MessageListProps {
  messages: MessageResponse<DefaultGenerics>[];
  currentUserId: string;
}

export default function MessageList({ messages, currentUserId }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const formatTime = (dateString: string | undefined) => {
    if (!dateString) return '';
    return new Date(dateString).toLocaleTimeString();
  };

  return (
    <div className={styles.messageList}>
      {messages.map((message) => (
        <div
          key={message.id}
          className={`${styles.messageContainer} ${
            message.user?.id === currentUserId ? styles.ownMessage : styles.otherMessage
          }`}
        >
          <div className={styles.messageContent}>
            <div className={styles.messageHeader}>
              <span className={styles.userName}>{message.user?.name || 'Unknown'}</span>
              <span className={styles.messageTime}>
                {formatTime(message.created_at)}
              </span>
            </div>
            <div className={styles.messageText}>{message.text}</div>
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </div>
  );
} 