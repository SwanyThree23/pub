/**
 * SmartDirectorService - AI-driven automated production director
 * Analyzes audio levels and automatically switches scenes to show the active speaker
 */
export class SmartDirectorService {
  constructor(vdoService, obsService) {
    this.vdoService = vdoService;
    this.obsService = obsService;
    this.activeSessions = new Map(); // roomId -> session config
    this.switchHistory = new Map(); // roomId -> switch history
    this.config = {
      switchDelay: 1000, // Minimum time between scene switches (ms)
      holdTime: 3000, // Hold on speaker for this long before switching
      silenceThreshold: 20, // Audio level threshold for "speaking"
      confidenceThreshold: 0.7 // AI confidence required for auto-switch
    };
  }

  /**
   * Start AI-driven scene switching for a room
   * @param {string} roomId - VDO.Ninja room ID
   * @param {Array} guestSlots - Array of guest slot numbers to monitor
   * @param {Object} options - Configuration options
   */
  startAutoSwitching(roomId, guestSlots, options = {}) {
    const config = { ...this.config, ...options };

    const session = {
      roomId,
      guestSlots,
      config,
      currentSpeaker: null,
      lastSwitch: Date.now(),
      speakerStartTime: null,
      interval: null,
      enabled: true
    };

    // Start monitoring loop
    session.interval = setInterval(() => {
      this.analyzeAndSwitch(session);
    }, 500); // Check every 500ms

    this.activeSessions.set(roomId, session);
    this.switchHistory.set(roomId, []);

    console.log(`✅ Smart Director started for room: ${roomId}`);
    return session;
  }

  /**
   * Stop AI-driven scene switching
   */
  stopAutoSwitching(roomId) {
    const session = this.activeSessions.get(roomId);
    if (!session) return;

    if (session.interval) {
      clearInterval(session.interval);
    }

    this.activeSessions.delete(roomId);
    console.log(`⏹️ Smart Director stopped for room: ${roomId}`);
  }

  /**
   * Analyze audio levels and switch scenes if needed
   * @private
   */
  async analyzeAndSwitch(session) {
    if (!session.enabled) return;

    // Get active speaker from audio levels
    const activeSpeaker = this.vdoService.getActiveSpeaker(session.roomId);

    // No clear speaker detected
    if (!activeSpeaker) {
      session.speakerStartTime = null;
      return;
    }

    // Same speaker still talking
    if (activeSpeaker === session.currentSpeaker) {
      return;
    }

    // New speaker detected
    const now = Date.now();

    // Initialize speaker start time
    if (!session.speakerStartTime) {
      session.speakerStartTime = now;
      return;
    }

    // Check if we've waited long enough before switching
    const speakingDuration = now - session.speakerStartTime;
    const timeSinceLastSwitch = now - session.lastSwitch;

    if (
      speakingDuration >= session.config.holdTime &&
      timeSinceLastSwitch >= session.config.switchDelay
    ) {
      await this.switchToSpeaker(session, activeSpeaker);
    }
  }

  /**
   * Switch the scene to show the active speaker
   * @private
   */
  async switchToSpeaker(session, guestSlot) {
    try {
      // Switch scene via OBS WebSocket
      const sceneName = `Guest_${guestSlot}`;
      await this.obsService.setCurrentScene(sceneName);

      // Log the switch
      const switchEvent = {
        from: session.currentSpeaker,
        to: guestSlot,
        timestamp: new Date(),
        auto: true
      };

      const history = this.switchHistory.get(session.roomId) || [];
      history.push(switchEvent);
      this.switchHistory.set(session.roomId, history);

      // Update session state
      session.currentSpeaker = guestSlot;
      session.lastSwitch = Date.now();
      session.speakerStartTime = null;

      console.log(`🔀 Auto-switched to Guest ${guestSlot} in room ${session.roomId}`);
    } catch (error) {
      console.error(`❌ Scene switch failed: ${error.message}`);
    }
  }

  /**
   * Manual scene switch (override AI)
   */
  async manualSwitch(roomId, guestSlot) {
    const session = this.activeSessions.get(roomId);
    if (!session) {
      throw new Error('Smart Director not active for this room');
    }

    // Temporarily disable auto-switching
    session.enabled = false;

    await this.switchToSpeaker(session, guestSlot);

    // Re-enable after 5 seconds
    setTimeout(() => {
      session.enabled = true;
    }, 5000);
  }

  /**
   * Get switching statistics
   */
  getStats(roomId) {
    const history = this.switchHistory.get(roomId) || [];
    const session = this.activeSessions.get(roomId);

    return {
      totalSwitches: history.length,
      autoSwitches: history.filter(s => s.auto).length,
      manualSwitches: history.filter(s => !s.auto).length,
      currentSpeaker: session?.currentSpeaker,
      enabled: session?.enabled || false,
      history: history.slice(-10) // Last 10 switches
    };
  }

  /**
   * Configure AI parameters
   */
  updateConfig(roomId, newConfig) {
    const session = this.activeSessions.get(roomId);
    if (!session) {
      throw new Error('Smart Director not active for this room');
    }

    session.config = { ...session.config, ...newConfig };
    return session.config;
  }
}
