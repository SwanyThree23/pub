export class EVMuxService {
  constructor() {
    this.streams = new Map();
  }

  async createStream({ name, userId }) {
    const streamId = `evmux_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    const stream = {
      id: streamId,
      name,
      userId,
      status: 'created',
      rtmpServer: `rtmp://evmux.cloud/live`,
      streamKey: this.generateStreamKey(),
      hlsUrl: `https://evmux.cloud/hls/${streamId}/index.m3u8`,
      createdAt: new Date()
    };

    this.streams.set(streamId, stream);
    console.log(`✅ EVMux stream created: ${streamId}`);

    return stream;
  }

  async startStream(streamId) {
    const stream = this.streams.get(streamId);
    if (!stream) throw new Error('Stream not found');

    stream.status = 'live';
    stream.startedAt = new Date();

    console.log(`🔴 EVMux stream started: ${streamId}`);
    return stream;
  }

  async stopStream(streamId) {
    const stream = this.streams.get(streamId);
    if (!stream) throw new Error('Stream not found');

    stream.status = 'ended';
    stream.endedAt = new Date();

    console.log(`⏹️ EVMux stream stopped: ${streamId}`);
    return stream;
  }

  getStreamRTMPConfig(streamId) {
    const stream = this.streams.get(streamId);
    if (!stream) throw new Error('Stream not found');

    return {
      server: stream.rtmpServer,
      key: stream.streamKey,
      fullUrl: `${stream.rtmpServer}/${stream.streamKey}`
    };
  }

  generateStreamKey() {
    return `sk_${Math.random().toString(36).substr(2, 24)}`;
  }

  getStream(streamId) {
    return this.streams.get(streamId);
  }

  getAllStreams(userId) {
    return Array.from(this.streams.values()).filter(s => s.userId === userId);
  }
}
