import fetch from 'node-fetch';

export class VDONinjaService {
  constructor() {
    this.rooms = new Map();
    this.baseUrl = 'https://vdo.ninja';
    this.apiBaseUrl = 'https://api.vdo.ninja';
    this.apiKeys = new Map(); // roomId -> apiKey mapping
    this.scenes = new Map(); // roomId -> scenes mapping
    this.audioLevels = new Map(); // Track audio levels for AI scene switching
  }

  createRoom({ name, password = null, enableAPI = true }) {
    const roomId = this.generateRoomId();
    const apiKey = enableAPI ? this.generateAPIKey() : null;

    const room = {
      id: roomId,
      name,
      password,
      apiKey,
      directorUrl: `${this.baseUrl}/?director=${roomId}${password ? `&password=${password}` : ''}${apiKey ? `&api=${apiKey}` : ''}`,
      guestUrl: `${this.baseUrl}/?push=${roomId}${password ? `&password=${password}` : ''}`,
      viewUrl: `${this.baseUrl}/?view=${roomId}${password ? `&password=${password}` : ''}`,
      participants: [],
      scenes: [],
      createdAt: new Date()
    };

    this.rooms.set(roomId, room);
    if (apiKey) {
      this.apiKeys.set(roomId, apiKey);
      this.scenes.set(roomId, []);
    }

    console.log(`✅ VDO.Ninja room created: ${roomId} ${apiKey ? 'with API enabled' : ''}`);

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

  generateAPIKey() {
    return `vdo_${Math.random().toString(36).substr(2, 24)}`;
  }

  // ==================== VDO.Ninja Remote Control API ====================

  /**
   * Execute a VDO.Ninja API command via HTTP webhook
   * @param {string} roomId - The room ID
   * @param {string} action - The API action to perform
   * @param {string} value - Optional value for the action
   */
  async executeWebhook(roomId, action, value = '') {
    const apiKey = this.apiKeys.get(roomId);
    if (!apiKey) throw new Error('API not enabled for this room');

    const url = value
      ? `${this.apiBaseUrl}/${apiKey}/${action}/${value}`
      : `${this.apiBaseUrl}/${apiKey}/${action}`;

    try {
      const response = await fetch(url, { method: 'GET' });
      const result = await response.text();

      console.log(`✅ VDO.Ninja webhook executed: ${action} ${value || ''}`);
      return { success: true, action, value, result };
    } catch (error) {
      console.error(`❌ VDO.Ninja webhook failed: ${error.message}`);
      return { success: false, error: error.message };
    }
  }

  /**
   * Mute local microphone
   */
  async muteLocal(roomId) {
    return this.executeWebhook(roomId, 'mute');
  }

  /**
   * Unmute local microphone
   */
  async unmuteLocal(roomId) {
    return this.executeWebhook(roomId, 'unmute');
  }

  /**
   * Toggle camera on/off
   */
  async toggleCamera(roomId) {
    return this.executeWebhook(roomId, 'toggleCamera');
  }

  /**
   * Add guest to scene (toggle)
   * @param {string} roomId - Room ID
   * @param {number} guestSlot - Guest slot number (1-based)
   * @param {number} sceneNumber - Scene number (1-based)
   */
  async addGuestToScene(roomId, guestSlot, sceneNumber) {
    return this.executeWebhook(roomId, 'addScene', `${guestSlot}/${sceneNumber}`);
  }

  /**
   * Clear featured chat message
   */
  async clearFeaturedChat(roomId) {
    return this.executeWebhook(roomId, 'clearChat');
  }

  /**
   * Set volume for a specific guest
   * @param {string} roomId - Room ID
   * @param {number} guestSlot - Guest slot number
   * @param {number} volume - Volume level (0-100)
   */
  async setGuestVolume(roomId, guestSlot, volume) {
    return this.executeWebhook(roomId, 'volume', `${guestSlot}/${volume}`);
  }

  /**
   * Mute a specific guest
   * @param {string} roomId - Room ID
   * @param {number} guestSlot - Guest slot number
   */
  async muteGuest(roomId, guestSlot) {
    return this.executeWebhook(roomId, 'mute', guestSlot);
  }

  /**
   * Unmute a specific guest
   */
  async unmuteGuest(roomId, guestSlot) {
    return this.executeWebhook(roomId, 'unmute', guestSlot);
  }

  /**
   * Switch to a specific scene
   * @param {string} roomId - Room ID
   * @param {number} sceneNumber - Scene number to activate
   */
  async switchScene(roomId, sceneNumber) {
    return this.executeWebhook(roomId, 'scene', sceneNumber);
  }

  /**
   * Send a message to a specific guest
   * @param {string} roomId - Room ID
   * @param {number} guestSlot - Guest slot number
   * @param {string} message - Message to send
   */
  async sendMessageToGuest(roomId, guestSlot, message) {
    const encodedMessage = encodeURIComponent(message);
    return this.executeWebhook(roomId, 'sendMessage', `${guestSlot}/${encodedMessage}`);
  }

  /**
   * Record audio levels for AI-driven scene switching
   * @param {string} roomId - Room ID
   * @param {number} guestSlot - Guest slot number
   * @param {number} audioLevel - Audio level (0-100)
   */
  trackAudioLevel(roomId, guestSlot, audioLevel) {
    if (!this.audioLevels.has(roomId)) {
      this.audioLevels.set(roomId, new Map());
    }

    const roomLevels = this.audioLevels.get(roomId);
    roomLevels.set(guestSlot, {
      level: audioLevel,
      timestamp: Date.now()
    });
  }

  /**
   * Get the currently active speaker based on audio levels
   * @param {string} roomId - Room ID
   * @returns {number|null} - Guest slot of active speaker or null
   */
  getActiveSpeaker(roomId) {
    const roomLevels = this.audioLevels.get(roomId);
    if (!roomLevels || roomLevels.size === 0) return null;

    let maxLevel = 0;
    let activeSpeaker = null;

    for (const [guestSlot, data] of roomLevels.entries()) {
      // Only consider recent audio (within last 2 seconds)
      if (Date.now() - data.timestamp < 2000 && data.level > maxLevel) {
        maxLevel = data.level;
        activeSpeaker = guestSlot;
      }
    }

    return maxLevel > 20 ? activeSpeaker : null; // Threshold for "speaking"
  }

  /**
   * Create a browser capture URL for PRISM Live Studio
   * @param {string} roomId - Room ID
   * @param {number} guestSlot - Guest slot number or scene number
   * @param {string} type - 'guest' or 'scene'
   */
  createBrowserCaptureURL(roomId, guestSlot, type = 'guest') {
    const room = this.rooms.get(roomId);
    if (!room) throw new Error('Room not found');

    const baseUrl = type === 'guest'
      ? `${this.baseUrl}/?view=${roomId}&slot=${guestSlot}`
      : `${this.baseUrl}/?scene=${roomId}&scene=${guestSlot}`;

    if (room.password) {
      return `${baseUrl}&password=${room.password}`;
    }

    return baseUrl;
  }

  /**
   * Get all scenes for a room
   */
  getScenes(roomId) {
    return this.scenes.get(roomId) || [];
  }

  /**
   * Create a new scene
   */
  createScene(roomId, sceneName, guestSlots = []) {
    const scenes = this.scenes.get(roomId) || [];
    const sceneNumber = scenes.length + 1;

    const scene = {
      number: sceneNumber,
      name: sceneName,
      guestSlots,
      createdAt: new Date()
    };

    scenes.push(scene);
    this.scenes.set(roomId, scenes);

    return scene;
  }

  /**
   * Generate n8n webhook workflow JSON for VDO.Ninja automation
   */
  generateN8nWorkflow(roomId, workflowType = 'scene-switching') {
    const apiKey = this.apiKeys.get(roomId);
    if (!apiKey) throw new Error('API not enabled for this room');

    const workflows = {
      'scene-switching': {
        name: 'VDO.Ninja Auto Scene Switch',
        nodes: [
          {
            name: 'Schedule Trigger',
            type: 'n8n-nodes-base.scheduleTrigger',
            parameters: { rule: { interval: [{ field: 'seconds', value: 5 }] } }
          },
          {
            name: 'HTTP Request',
            type: 'n8n-nodes-base.httpRequest',
            parameters: {
              method: 'GET',
              url: `${this.apiBaseUrl}/${apiKey}/scene/{{ $json.sceneNumber }}`
            }
          }
        ]
      },
      'guest-mute': {
        name: 'VDO.Ninja Guest Auto Mute',
        nodes: [
          {
            name: 'Webhook',
            type: 'n8n-nodes-base.webhook',
            parameters: { path: 'vdo-mute' }
          },
          {
            name: 'HTTP Request',
            type: 'n8n-nodes-base.httpRequest',
            parameters: {
              method: 'GET',
              url: `${this.apiBaseUrl}/${apiKey}/mute/{{ $json.guestSlot }}`
            }
          }
        ]
      }
    };

    return workflows[workflowType] || workflows['scene-switching'];
  }
}
