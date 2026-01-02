import { VDORoom } from '../types';

export class VDONinjaService {
  private baseUrl = 'https://vdo.ninja';

  async createRoom(streamId: string): Promise<VDORoom> {
    const roomName = `stream_${streamId}`;
    const password = process.env.VDO_PASSWORD || this.generatePassword();
    const apiKey = process.env.VDO_API_KEY;

    return {
      id: roomName,
      directorUrl: `${this.baseUrl}/?director=${roomName}&api=${apiKey}&password=${password}&scene`,
      guestUrl: `${this.baseUrl}/?push=${roomName}&password=${password}`,
      viewUrl: `${this.baseUrl}/?view=${roomName}&password=${password}`
    };
  }

  async addGuest(roomId: string, guestName: string) {
    // Generate guest URL
    const password = process.env.VDO_PASSWORD;
    return {
      guestUrl: `${this.baseUrl}/?push=${roomId}&password=${password}&label=${guestName}`,
      viewUrl: `${this.baseUrl}/?view=${roomId}&password=${password}&scene`
    };
  }

  private generatePassword(): string {
    return Math.random().toString(36).substring(2, 15);
  }
}
