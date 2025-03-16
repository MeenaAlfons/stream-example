"use client"
import styles from './Room.module.css';
import { useEffect, useState } from 'react';
import Chat from './Chat';
import VideoCall from './VideoCall';
import { getCurrentUser } from './utils/user';

export default function Room() {
  const [currentUser] = useState(getCurrentUser);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    const getToken = async () => {
      try {
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
        setToken(token);
      } catch (error) {
        console.error('Error getting token:', error);
      }
    };

    getToken();
  }, [currentUser]);

  return (
    <div className={styles.roomContainer}>
      <main className={styles.mainSection}>
        <div className={styles.mediaContent}>
          {token ? (
            <VideoCall user={currentUser} token={token} />
          ) : (
            'Loading video call...'
          )}
        </div>
      </main>
      
      <aside className={styles.chatSidebar}>
        {token ? (
          <Chat user={currentUser} token={token} />
        ) : (
          'Loading chat...'
        )}
      </aside>
    </div>
  );
}
