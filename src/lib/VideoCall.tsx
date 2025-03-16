"use client"

import { useEffect, useState } from 'react';
import {
  StreamCall,
  StreamTheme,
  StreamVideo,
  StreamVideoClient,
  CallControls,
  SpeakerLayout,
  User,
} from '@stream-io/video-react-sdk';
import '@stream-io/video-react-sdk/dist/css/styles.css';

interface VideoCallProps {
  user: {
    id: string;
    name: string;
    image?: string;
  };
  token: string;
}

export default function VideoCall({ user, token }: VideoCallProps) {
  const [client, setClient] = useState<StreamVideoClient | null>(null);
  const [call, setCall] = useState<any>(null);

  console.log('VideoCall');

  useEffect(() => {
    console.log('i fire once');
    const initVideo = async () => {
      console.log('initVideo', user, token);
      try {
        // Initialize StreamVideo client
        const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY || '';
        const client = StreamVideoClient.getOrCreateInstance({ 
          apiKey, 
          user: { id: user.id }, 
          token 
        });

        // Create and join a call
        const call = client.call('default', 'general');
        await call.join({ create: true });

        setCall(call);
        setClient(client);
      } catch (error) {
        console.error('Error initializing video:', error);
      }
    };

    // Delay the initialization of the video call to avoid double videos when React strict mode is enabled
    const timer = setTimeout(() => {
      initVideo();
    }, 1000);

    // Cleanup on unmount
    return () => {
      clearTimeout(timer);
      console.log('cleanup');
      if (call) {
        console.log('leaving call');
        call.leave();
      }
      if (client) {
        console.log('disconnecting user');
        client.disconnectUser();
      }
      setCall(null);
      setClient(null);
    };
  }, [user, token]);

  if (!client || !call) {
    return <div>Loading video call...</div>;
  }

  return (
    <StreamVideo client={client}>
      <StreamCall call={call}>
        <StreamTheme>
          <SpeakerLayout />
          {/* <CallControls /> */}
        </StreamTheme>  
      </StreamCall>
    </StreamVideo>
  );
}
