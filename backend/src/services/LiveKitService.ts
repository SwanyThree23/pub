import { AccessToken, RoomServiceClient } from 'livekit-server-sdk';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export class LiveKitService {
  private roomService: RoomServiceClient;
  private apiKey: string;
  private apiSecret: string;
  private wsUrl: string;

  constructor() {
    this.apiKey    = process.env.LIVEKIT_API_KEY!;
    this.apiSecret = process.env.LIVEKIT_API_SECRET!;
    this.wsUrl     = process.env.LIVEKIT_URL || 'wss://seewhylive-1.livekit.cloud';

    this.roomService = new RoomServiceClient(
      this.wsUrl.replace('wss://', 'https://'),
      this.apiKey,
      this.apiSecret
    );
  }

  // Create a room for a stream
  async createRoom(streamId: string, options?: {
    maxParticipants?: number;
    emptyTimeout?: number;
  }) {
    const roomName = `stream_${streamId}`;

    const room = await this.roomService.createRoom({
      name: roomName,
      maxParticipants: options?.maxParticipants || 100,
      emptyTimeout: options?.emptyTimeout || 300, // 5 minutes
      metadata: JSON.stringify({ streamId })
    });

    return room;
  }

  // Generate a token for a participant
  generateToken(params: {
    roomName: string;
    participantName: string;
    isPublisher?: boolean;
    metadata?: string;
    ttl?: number;
  }): string {
    const at = new AccessToken(this.apiKey, this.apiSecret, {
      identity: params.participantName,
      ttl: params.ttl || 3600, // 1 hour
      metadata: params.metadata
    });

    at.addGrant({
      roomJoin: true,
      room: params.roomName,
      canPublish: params.isPublisher ?? false,
      canSubscribe: true,
      canPublishData: true
    });

    return at.toJwt();
  }

  // Generate host token (publisher + admin)
  generateHostToken(streamId: string, userId: string): string {
    const at = new AccessToken(this.apiKey, this.apiSecret, {
      identity: `host_${userId}`,
      ttl: 14400, // 4 hours
      metadata: JSON.stringify({ role: 'host', userId })
    });

    at.addGrant({
      roomJoin: true,
      room: `stream_${streamId}`,
      roomAdmin: true,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true
    });

    return at.toJwt();
  }

  // Generate viewer token (subscriber only)
  generateViewerToken(streamId: string, viewerId: string): string {
    const at = new AccessToken(this.apiKey, this.apiSecret, {
      identity: `viewer_${viewerId}`,
      ttl: 7200, // 2 hours
      metadata: JSON.stringify({ role: 'viewer' })
    });

    at.addGrant({
      roomJoin: true,
      room: `stream_${streamId}`,
      canPublish: false,
      canSubscribe: true,
      canPublishData: false
    });

    return at.toJwt();
  }

  // Generate guest token (can publish camera/mic)
  generateGuestToken(streamId: string, guestName: string): string {
    const at = new AccessToken(this.apiKey, this.apiSecret, {
      identity: `guest_${guestName.toLowerCase().replace(/\s/g, '_')}`,
      ttl: 7200,
      metadata: JSON.stringify({ role: 'guest', name: guestName })
    });

    at.addGrant({
      roomJoin: true,
      room: `stream_${streamId}`,
      canPublish: true,
      canSubscribe: true,
      canPublishData: true
    });

    return at.toJwt();
  }

  // List active rooms
  async listRooms() {
    return this.roomService.listRooms();
  }

  // List participants in a room
  async listParticipants(roomName: string) {
    return this.roomService.listParticipants(roomName);
  }

  // Remove a participant
  async removeParticipant(roomName: string, identity: string) {
    return this.roomService.removeParticipant(roomName, identity);
  }

  // Delete a room (end stream)
  async deleteRoom(streamId: string) {
    const roomName = `stream_${streamId}`;
    return this.roomService.deleteRoom(roomName);
  }

  // Mute participant's track
  async muteParticipant(roomName: string, identity: string, trackSid: string) {
    return this.roomService.mutePublishedTrack(roomName, identity, trackSid, true);
  }

  // Get room info
  async getRoomInfo(streamId: string) {
    const rooms = await this.roomService.listRooms([`stream_${streamId}`]);
    return rooms[0] || null;
  }

  // Get connection URL for frontend
  getConnectionInfo() {
    return {
      url: this.wsUrl,
      apiKey: this.apiKey
    };
  }
}

export const livekitService = new LiveKitService();
