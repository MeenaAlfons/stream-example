import { StreamChat } from 'stream-chat';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { userId, channelId } = await request.json();

    if (!userId || !channelId) {
      return NextResponse.json(
        { error: 'userId and channelId are required' },
        { status: 400 }
      );
    }

    const serverClient = StreamChat.getInstance(
      process.env.NEXT_PUBLIC_STREAM_API_KEY!,
      process.env.STREAM_API_SECRET
    );

    // Get the channel
    const channel = serverClient.channel('messaging', channelId);

    // Add the member to the channel
    await channel.addMembers([userId]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error adding member to channel:', error);
    return NextResponse.json(
      { error: 'Error adding member to channel' },
      { status: 500 }
    );
  }
} 