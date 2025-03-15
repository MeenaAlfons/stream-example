"use client"
import { StreamChat, Channel, DefaultGenerics, Event } from "stream-chat";
import styles from './room.module.css';
import { useEffect, useState } from 'react';
import ChatInput from './components/ChatInput';
import MessageList from './components/MessageList';
import { getCurrentUser } from './utils/user';

// Initialize the StreamChat client outside the component to avoid recreating it on every render
const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY || '';
const client = StreamChat.getInstance(apiKey);

export default function Room() {
  const [chatClient, setChatClient] = useState<StreamChat | null>(null);
  const [channel, setChannel] = useState<Channel<DefaultGenerics> | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [currentUser] = useState(getCurrentUser); // Call once during component initialization

  useEffect(() => {
    const initChat = async () => {
      try {
        if (!client.userID) { // Only connect if not already connected
          // Get token from our API
          const tokenResponse = await fetch('/api/stream-token', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ userId: currentUser.id }),
          });

          if (!tokenResponse.ok) {
            throw new Error('Failed to get token');
          }

          const { token } = await tokenResponse.json();

          await client.connectUser(
            {
              id: currentUser.id,
              name: currentUser.name,
              image: currentUser.image,
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
              userId: currentUser.id,
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
      client.disconnectUser();
      setChatClient(null);
      setChannel(null);
      setMessages([]);
    };
  }, [currentUser]); // Add currentUser to dependencies

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
    <div className={styles.roomContainer}>
      <main className={styles.mainSection}>
        {/* This section will be used for audio/video content */}
        <div className={styles.mediaContent}>
          Media content will go here
        </div>
      </main>
      
      <aside className={styles.chatSidebar}>
        <div className={styles.chatContent}>
          {chatClient ? (
            <MessageList messages={messages} currentUserId={currentUser.id} />
          ) : (
            'Connecting to chat...'
          )}
        </div>
        {chatClient && (
          <ChatInput onSendMessage={handleSendMessage} />
        )}
      </aside>
    </div>
  );
}
