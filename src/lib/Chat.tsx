"use client"

import styles from './Chat.module.css';
import { StreamChat, Channel, DefaultGenerics } from "stream-chat";
import { useEffect, useState } from 'react';
import ChatInput from './components/ChatInput';
import MessageList from './components/MessageList';

console.log("Chat styles", styles);
interface ChatProps {
  user: {
    id: string;
    name: string;
    image?: string;
  };
  token: string;
}

export default function Chat({ user, token }: ChatProps) {
  const [chatClient, setChatClient] = useState<StreamChat | null>(null);
  const [channel, setChannel] = useState<Channel<DefaultGenerics> | null>(null);
  const [messages, setMessages] = useState<any[]>([]);

  useEffect(() => {
    const initChat = async () => {
      try {
        // Initialize StreamChat client
        const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY || '';
        const client = StreamChat.getInstance(apiKey);

        if (!client.userID) {
          await client.connectUser(
            {
              id: user.id,
              name: user.name,
              image: user.image,
            },
            token
          );

          // Create or join a channel
          const channel = client.channel('messaging', 'general', {
            name: 'General',
          });

          // Add the current user as a member of the channel through our API
          const addMemberResponse = await fetch('/api/channel-members', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              userId: user.id,
              channelId: 'general'
            }),
          });

          if (!addMemberResponse.ok) {
            throw new Error('Failed to add member to channel');
          }

          // Connect to the channel by watching it
          await channel.watch();
          
          // Load initial messages
          const messagesResponse = await channel.query({ messages: { limit: 25 } });
          setMessages(messagesResponse.messages || []);

          // Listen for new messages
          channel.on('message.new' as any, (event) => {
            if (event.message) {
              setMessages((prevMessages) => [...prevMessages, event.message]);
            }
          });

          setChannel(channel);
          setChatClient(client);
        }
      } catch (error) {
        console.error('Error connecting to Stream:', error);
      }
    };

    initChat();

    // Cleanup on unmount
    return () => {
      if (channel) {
        channel.off('message.new' as any); // Remove message.new event listener
      }
      if (chatClient) {
        chatClient.disconnectUser();
      }
      setChatClient(null);
      setChannel(null);
      setMessages([]);
    };
  }, [user, token]); // Add user and token to dependencies

  const handleSendMessage = async (messageText: string) => {
    if (channel) {
      try {
        await channel.sendMessage({
          text: messageText,
        });
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  };

  return (
    <div className={styles.chatContainer}>
      <div className={styles.chatContent}>
        {chatClient ? (
          <MessageList messages={messages} currentUserId={user.id} />
        ) : (
          'Connecting to chat...'
        )}
      </div>
      {chatClient && (
        <ChatInput onSendMessage={handleSendMessage} />
      )}
    </div>
  );
}
