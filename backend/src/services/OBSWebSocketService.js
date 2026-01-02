import OBSWebSocket from 'obs-websocket-js';

/**
 * OBSWebSocketService - Control PRISM Live Studio via OBS WebSocket
 * PRISM is built on OBS, so it supports all OBS WebSocket commands
 */
export class OBSWebSocketService {
  constructor() {
    this.obs = new OBSWebSocket();
    this.connected = false;
    this.host = process.env.OBS_WEBSOCKET_HOST || 'localhost:4455';
    this.password = process.env.OBS_WEBSOCKET_PASSWORD || '';
    this.sceneCache = new Map();
  }

  /**
   * Connect to OBS/PRISM WebSocket
   */
  async connect() {
    try {
      await this.obs.connect(`ws://${this.host}`, this.password);
      this.connected = true;
      console.log(`✅ Connected to OBS WebSocket at ${this.host}`);

      // Cache scenes
      await this.refreshSceneList();

      return true;
    } catch (error) {
      console.error(`❌ OBS WebSocket connection failed: ${error.message}`);
      this.connected = false;
      return false;
    }
  }

  /**
   * Disconnect from OBS/PRISM
   */
  async disconnect() {
    if (this.connected) {
      await this.obs.disconnect();
      this.connected = false;
      console.log(`⏹️ Disconnected from OBS WebSocket`);
    }
  }

  /**
   * Refresh scene list cache
   */
  async refreshSceneList() {
    if (!this.connected) throw new Error('Not connected to OBS');

    const { scenes } = await this.obs.call('GetSceneList');
    this.sceneCache.clear();

    scenes.forEach(scene => {
      this.sceneCache.set(scene.sceneName, scene);
    });

    return Array.from(this.sceneCache.keys());
  }

  /**
   * Get current scene name
   */
  async getCurrentScene() {
    if (!this.connected) throw new Error('Not connected to OBS');

    const { currentProgramSceneName } = await this.obs.call('GetCurrentProgramScene');
    return currentProgramSceneName;
  }

  /**
   * Set current scene (switch to scene)
   * @param {string} sceneName - Name of the scene to switch to
   */
  async setCurrentScene(sceneName) {
    if (!this.connected) throw new Error('Not connected to OBS');

    await this.obs.call('SetCurrentProgramScene', { sceneName });
    console.log(`🔀 Switched to scene: ${sceneName}`);
    return sceneName;
  }

  /**
   * Set preview scene (Studio Mode)
   * @param {string} sceneName - Name of the scene to preview
   */
  async setPreviewScene(sceneName) {
    if (!this.connected) throw new Error('Not connected to OBS');

    await this.obs.call('SetCurrentPreviewScene', { sceneName });
    console.log(`👁️ Preview scene set to: ${sceneName}`);
    return sceneName;
  }

  /**
   * Transition preview to program (Studio Mode)
   */
  async transitionToProgram() {
    if (!this.connected) throw new Error('Not connected to OBS');

    await this.obs.call('TriggerStudioModeTransition');
    console.log(`✨ Transitioned preview to program`);
  }

  /**
   * Get all scenes
   */
  async getScenes() {
    if (!this.connected) throw new Error('Not connected to OBS');

    return Array.from(this.sceneCache.keys());
  }

  /**
   * Create a new scene
   * @param {string} sceneName - Name for the new scene
   */
  async createScene(sceneName) {
    if (!this.connected) throw new Error('Not connected to OBS');

    await this.obs.call('CreateScene', { sceneName });
    await this.refreshSceneList();

    console.log(`➕ Created scene: ${sceneName}`);
    return sceneName;
  }

  /**
   * Get sources in a scene
   * @param {string} sceneName - Scene name
   */
  async getSceneSources(sceneName) {
    if (!this.connected) throw new Error('Not connected to OBS');

    const { sceneItems } = await this.obs.call('GetSceneItemList', { sceneName });
    return sceneItems;
  }

  /**
   * Set source visibility
   * @param {string} sceneName - Scene name
   * @param {number} sceneItemId - Scene item ID
   * @param {boolean} visible - Visibility state
   */
  async setSourceVisibility(sceneName, sceneItemId, visible) {
    if (!this.connected) throw new Error('Not connected to OBS');

    await this.obs.call('SetSceneItemEnabled', {
      sceneName,
      sceneItemId,
      sceneItemEnabled: visible
    });

    console.log(`👁️ Set source ${sceneItemId} visibility to: ${visible}`);
  }

  /**
   * Mute audio source
   * @param {string} sourceName - Audio source name
   * @param {boolean} muted - Mute state
   */
  async setAudioMute(sourceName, muted) {
    if (!this.connected) throw new Error('Not connected to OBS');

    await this.obs.call('SetInputMute', {
      inputName: sourceName,
      inputMuted: muted
    });

    console.log(`🔇 ${muted ? 'Muted' : 'Unmuted'} audio source: ${sourceName}`);
  }

  /**
   * Set audio volume
   * @param {string} sourceName - Audio source name
   * @param {number} volume - Volume level (0-100)
   */
  async setAudioVolume(sourceName, volume) {
    if (!this.connected) throw new Error('Not connected to OBS');

    // Convert 0-100 to 0-1 (OBS uses 0-1 scale)
    const volumeDb = volume / 100;

    await this.obs.call('SetInputVolume', {
      inputName: sourceName,
      inputVolumeDb: volumeDb
    });

    console.log(`🔊 Set ${sourceName} volume to: ${volume}%`);
  }

  /**
   * Start streaming
   */
  async startStreaming() {
    if (!this.connected) throw new Error('Not connected to OBS');

    await this.obs.call('StartStream');
    console.log(`🔴 Streaming started`);
  }

  /**
   * Stop streaming
   */
  async stopStreaming() {
    if (!this.connected) throw new Error('Not connected to OBS');

    await this.obs.call('StopStream');
    console.log(`⏹️ Streaming stopped`);
  }

  /**
   * Start recording
   */
  async startRecording() {
    if (!this.connected) throw new Error('Not connected to OBS');

    await this.obs.call('StartRecord');
    console.log(`⏺️ Recording started`);
  }

  /**
   * Stop recording
   */
  async stopRecording() {
    if (!this.connected) throw new Error('Not connected to OBS');

    await this.obs.call('StopRecord');
    console.log(`⏹️ Recording stopped`);
  }

  /**
   * Get streaming status
   */
  async getStreamStatus() {
    if (!this.connected) throw new Error('Not connected to OBS');

    const status = await this.obs.call('GetStreamStatus');
    return {
      active: status.outputActive,
      duration: status.outputDuration,
      bytes: status.outputBytes,
      frames: status.outputSkippedFrames
    };
  }

  /**
   * Enable Studio Mode
   */
  async enableStudioMode() {
    if (!this.connected) throw new Error('Not connected to OBS');

    await this.obs.call('SetStudioModeEnabled', { studioModeEnabled: true });
    console.log(`✅ Studio Mode enabled`);
  }

  /**
   * Disable Studio Mode
   */
  async disableStudioMode() {
    if (!this.connected) throw new Error('Not connected to OBS');

    await this.obs.call('SetStudioModeEnabled', { studioModeEnabled: false });
    console.log(`❌ Studio Mode disabled`);
  }

  /**
   * Create automated scene for VDO.Ninja guest
   * @param {number} guestSlot - Guest slot number
   * @param {string} browserCaptureURL - VDO.Ninja browser capture URL
   */
  async createGuestScene(guestSlot, browserCaptureURL) {
    if (!this.connected) throw new Error('Not connected to OBS');

    const sceneName = `Guest_${guestSlot}`;

    // Create scene
    await this.createScene(sceneName);

    // Add browser source
    await this.obs.call('CreateInput', {
      sceneName,
      inputName: `VDO_Guest_${guestSlot}`,
      inputKind: 'browser_source',
      inputSettings: {
        url: browserCaptureURL,
        width: 1920,
        height: 1080,
        fps: 30,
        shutdown: false,
        restart_when_active: false,
        css: 'body { background-color: transparent; }'
      }
    });

    console.log(`✅ Created guest scene: ${sceneName}`);
    return sceneName;
  }

  /**
   * Create multi-guest grid scene
   * @param {Array} guestSlots - Array of guest slot numbers
   * @param {Function} getURL - Function to get browser capture URL for each guest
   */
  async createGridScene(guestSlots, getURL) {
    if (!this.connected) throw new Error('Not connected to OBS');

    const sceneName = `Grid_${guestSlots.length}_Guests`;
    await this.createScene(sceneName);

    const cols = Math.ceil(Math.sqrt(guestSlots.length));
    const rows = Math.ceil(guestSlots.length / cols);
    const width = 1920 / cols;
    const height = 1080 / rows;

    for (let i = 0; i < guestSlots.length; i++) {
      const guestSlot = guestSlots[i];
      const col = i % cols;
      const row = Math.floor(i / cols);

      const x = col * width;
      const y = row * height;

      await this.obs.call('CreateInput', {
        sceneName,
        inputName: `VDO_Guest_${guestSlot}`,
        inputKind: 'browser_source',
        inputSettings: {
          url: getURL(guestSlot),
          width: Math.floor(width),
          height: Math.floor(height),
          fps: 30
        }
      });

      // Position the source
      const { sceneItemId } = await this.obs.call('GetSceneItemId', {
        sceneName,
        sourceName: `VDO_Guest_${guestSlot}`
      });

      await this.obs.call('SetSceneItemTransform', {
        sceneName,
        sceneItemId,
        sceneItemTransform: {
          positionX: x,
          positionY: y,
          scaleX: 1,
          scaleY: 1
        }
      });
    }

    console.log(`✅ Created grid scene: ${sceneName}`);
    return sceneName;
  }

  /**
   * Get OBS statistics
   */
  async getStats() {
    if (!this.connected) throw new Error('Not connected to OBS');

    const stats = await this.obs.call('GetStats');
    return {
      fps: stats.activeFps,
      cpuUsage: stats.cpuUsage,
      memoryUsage: stats.memoryUsage,
      renderTotalFrames: stats.renderTotalFrames,
      renderSkippedFrames: stats.renderSkippedFrames
    };
  }
}
