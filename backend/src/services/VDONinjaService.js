export class VDONinjaService {
  constructor() {
    this.rooms = new Map();
    this.baseUrl = 'https://vdo.ninja';
  }

  createRoom({ name, password = null }) {
    const roomId = this.generateRoomId();

    const room = {
      id: roomId,
      name,
      password,
      directorUrl: `${this.baseUrl}/?director=${roomId}${password ? `&password=${password}` : ''}`,
      guestUrl: `${this.baseUrl}/?push=${roomId}${password ? `&password=${password}` : ''}`,
      viewUrl: `${this.baseUrl}/?view=${roomId}${password ? `&password=${password}` : ''}`,
      participants: [],
      createdAt: new Date()
    };

    this.rooms.set(roomId, room);
    console.log(`✅ VDO.Ninja room created: ${roomId}`);

    return room;
  }

  generateGuestLink(roomId, guestName) {
    const room = this.rooms.get(roomId);
    if (!room) throw new Error('Room not found');

    const guestUrl = `${this.baseUrl}/?push=${roomId}&label=${encodeURIComponent(guestName)}${
      room.password ? `&password=${room.password}` : ''
    }`;

    return {
      url: guestUrl,
      qrCode: guestUrl,
      guestName
    };
  }

  addParticipant(roomId, participant) {
    const room = this.rooms.get(roomId);
    if (!room) throw new Error('Room not found');

    room.participants.push({
      id: `participant_${Date.now()}`,
      name: participant.name,
      joinedAt: new Date()
    });

    return room;
  }

  removeParticipant(roomId, participantId) {
    const room = this.rooms.get(roomId);
    if (!room) throw new Error('Room not found');

    room.participants = room.participants.filter(p => p.id !== participantId);
    return room;
  }

  getRoom(roomId) {
    return this.rooms.get(roomId);
  }

  generateRoomId() {
    return Math.random().toString(36).substr(2, 10);
  }

  createDirectorConfig(roomId) {
    const room = this.rooms.get(roomId);
    if (!room) throw new Error('Room not found');

    return {
      directorUrl: room.directorUrl,
      features: {
        sceneControl: true,
        audioMixing: true,
        videoSwitching: true,
        recordingControl: true,
        chatModeration: true
      },
      settings: {
        quality: 'high',
        bitrate: 4000,
        resolution: '1920x1080',
        fps: 30
      }
    };
  }

  createMultiGuestLayout(roomId, guestCount) {
    const layouts = {
      1: 'fullscreen',
      2: 'split-horizontal',
      3: 'grid-2x2',
      4: 'grid-2x2',
      5: 'grid-3x2',
      6: 'grid-3x2',
      7: 'grid-3x3',
      8: 'grid-3x3',
      9: 'grid-3x3'
    };

    return {
      layout: layouts[Math.min(guestCount, 9)] || 'grid-3x3',
      maxGuests: 9,
      currentGuests: guestCount,
      recommended: guestCount <= 4 ? 'optimal' : guestCount <= 6 ? 'good' : 'crowded'
    };
  }
}
