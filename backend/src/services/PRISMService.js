export class PRISMService {
  constructor() {
    this.configs = new Map();
  }

  createMobileStreamURL(rtmpConfig) {
    // Generate PRISM Live Studio mobile URL
    const encodedRTMP = encodeURIComponent(rtmpConfig.server);
    const encodedKey = encodeURIComponent(rtmpConfig.key);

    return {
      qrCode: `prism://stream?server=${encodedRTMP}&key=${encodedKey}`,
      deepLink: `prism://stream?server=${encodedRTMP}&key=${encodedKey}`,
      manual: {
        server: rtmpConfig.server,
        streamKey: rtmpConfig.key
      }
    };
  }

  createRTMPSource({ name, rtmpUrl, streamKey }) {
    const sourceId = `rtmp_${Date.now()}`;

    return {
      id: sourceId,
      type: 'rtmp',
      name,
      config: {
        url: rtmpUrl,
        streamKey,
        protocol: 'RTMP'
      },
      status: 'ready'
    };
  }

  createVDOSource({ name, url, isDirector = false }) {
    const sourceId = `vdo_${Date.now()}`;

    return {
      id: sourceId,
      type: 'vdo.ninja',
      name,
      config: {
        url,
        isDirector,
        embedUrl: isDirector
          ? `${url}/?director`
          : `${url}/?view=`
      },
      status: 'ready'
    };
  }

  generateStudioConfig() {
    return {
      resolution: '1920x1080',
      fps: 30,
      bitrate: 4500,
      audioCodec: 'AAC',
      videoCodec: 'H.264',
      keyframeInterval: 2,
      profile: 'high',
      preset: 'veryfast',
      layout: 'grid',
      multiGuestSupport: true,
      cloudRecording: true
    };
  }

  createSceneLayout({ sources, layout = 'grid' }) {
    const sceneId = `scene_${Date.now()}`;

    const layouts = {
      grid: this.generateGridLayout(sources),
      spotlight: this.generateSpotlightLayout(sources),
      sidebar: this.generateSidebarLayout(sources),
      picture_in_picture: this.generatePIPLayout(sources)
    };

    return {
      id: sceneId,
      layout: layouts[layout] || layouts.grid,
      sources,
      timestamp: new Date()
    };
  }

  generateGridLayout(sources) {
    const count = sources.length;
    const cols = Math.ceil(Math.sqrt(count));
    const rows = Math.ceil(count / cols);

    return sources.map((source, index) => ({
      sourceId: source.id,
      x: (index % cols) * (1920 / cols),
      y: Math.floor(index / cols) * (1080 / rows),
      width: 1920 / cols,
      height: 1080 / rows
    }));
  }

  generateSpotlightLayout(sources) {
    if (sources.length === 0) return [];

    const layout = [
      {
        sourceId: sources[0].id,
        x: 0,
        y: 0,
        width: 1920,
        height: 1080
      }
    ];

    sources.slice(1).forEach((source, index) => {
      layout.push({
        sourceId: source.id,
        x: 1920 - 320,
        y: index * 200,
        width: 320,
        height: 180
      });
    });

    return layout;
  }

  generateSidebarLayout(sources) {
    if (sources.length === 0) return [];

    const layout = [
      {
        sourceId: sources[0].id,
        x: 0,
        y: 0,
        width: 1440,
        height: 1080
      }
    ];

    sources.slice(1).forEach((source, index) => {
      layout.push({
        sourceId: source.id,
        x: 1440,
        y: index * 270,
        width: 480,
        height: 270
      });
    });

    return layout;
  }

  generatePIPLayout(sources) {
    if (sources.length === 0) return [];

    const layout = [
      {
        sourceId: sources[0].id,
        x: 0,
        y: 0,
        width: 1920,
        height: 1080
      }
    ];

    if (sources.length > 1) {
      layout.push({
        sourceId: sources[1].id,
        x: 1920 - 480 - 40,
        y: 1080 - 270 - 40,
        width: 480,
        height: 270
      });
    }

    return layout;
  }
}
