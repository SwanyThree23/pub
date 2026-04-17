import axios from 'axios';
import { EvMuxConfig } from '../types';

export class EvMuxService {
  private baseUrl = 'https://api.evmux.com/v1';

  async startMultiStream(config: EvMuxConfig) {
    const apiKey = process.env.EVMUX_API_KEY;

    if (!apiKey) {
      throw new Error('EvMux API key not configured');
    }

    try {
      const response = await axios.post(
        `${this.baseUrl}/events`,
        {
          event_id: config.eventId,
          destinations: config.destinations
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKey}`
          }
        }
      );

      return response.data;
    } catch (error: any) {
      console.error('EvMux error:', error.response?.data || error.message);
      throw error;
    }
  }

  async stopMultiStream(eventId: string) {
    const apiKey = process.env.EVMUX_API_KEY;

    if (!apiKey) {
      throw new Error('EvMux API key not configured');
    }

    const response = await axios.delete(
      `${this.baseUrl}/events/${eventId}`,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      }
    );

    return response.data;
  }

  async getEventStatus(eventId: string) {
    const apiKey = process.env.EVMUX_API_KEY;

    if (!apiKey) {
      throw new Error('EvMux API key not configured');
    }

    const response = await axios.get(
      `${this.baseUrl}/events/${eventId}`,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      }
    );

    return response.data;
  }
}
