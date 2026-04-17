import axios from 'axios';

const N8N_BASE  = process.env.N8N_URL       || 'https://n8n.srv1587098.hstgr.cloud';
const N8N_TOKEN = process.env.N8N_API_TOKEN || '';

interface N8nWebhookPayload {
  event: string;
  streamId?: string;
  userId?: string;
  data: Record<string, any>;
  timestamp: string;
}

const n8n = axios.create({
  baseURL: N8N_BASE,
  headers: {
    'Content-Type': 'application/json',
    ...(N8N_TOKEN ? { 'Authorization': `Bearer ${N8N_TOKEN}` } : {})
  },
  timeout: 10000
});

export class N8nService {
  // ─── Stream Events ────────────────────────────────────────────────────────

  async onStreamStarted(streamId: string, userId: string, platforms: string[]) {
    return this.trigger('stream.started', {
      streamId, userId,
      data: { platforms, timestamp: new Date().toISOString() }
    });
  }

  async onStreamEnded(streamId: string, userId: string, stats: {
    totalViewers: number;
    peakViewers: number;
    durationMinutes: number;
  }) {
    return this.trigger('stream.ended', { streamId, userId, data: stats });
  }

  async onViewerMilestone(streamId: string, viewerCount: number) {
    return this.trigger('stream.viewer_milestone', {
      streamId,
      data: { viewerCount, milestone: this.getMilestone(viewerCount) }
    });
  }

  // ─── AI Content Events ────────────────────────────────────────────────────

  async onVideoGenerated(userId: string, videoId: string, type: string, videoUrl: string) {
    return this.trigger('content.video_generated', {
      userId,
      data: { videoId, type, videoUrl }
    });
  }

  async onVoiceCloned(userId: string, voiceId: string, voiceName: string) {
    return this.trigger('content.voice_cloned', {
      userId,
      data: { voiceId, voiceName }
    });
  }

  // ─── Platform Events ─────────────────────────────────────────────────────

  async onPlatformConnected(userId: string, platform: string) {
    return this.trigger('platform.connected', { userId, data: { platform } });
  }

  async onPlatformError(userId: string, platform: string, error: string) {
    return this.trigger('platform.error', { userId, data: { platform, error } });
  }

  // ─── User Events ─────────────────────────────────────────────────────────

  async onUserRegistered(userId: string, email: string) {
    return this.trigger('user.registered', { userId, data: { email } });
  }

  async onSubscriptionChanged(userId: string, plan: string, status: string) {
    return this.trigger('subscription.changed', { userId, data: { plan, status } });
  }

  // ─── Custom Workflow Triggers ─────────────────────────────────────────────

  async triggerWorkflow(workflowId: string, payload: Record<string, any>) {
    try {
      const response = await n8n.post(`/webhook/${workflowId}`, payload);
      return response.data;
    } catch (error: any) {
      console.error(`n8n workflow ${workflowId} trigger failed:`, error.message);
      // Fire-and-forget – don't break the main flow
      return null;
    }
  }

  // ─── Batch Processing ─────────────────────────────────────────────────────

  async scheduleContentBatch(userId: string, jobs: Array<{
    type: string;
    params: Record<string, any>;
    scheduledAt?: Date;
  }>) {
    return this.trigger('content.batch_scheduled', {
      userId,
      data: { jobs, total: jobs.length }
    });
  }

  // ─── Internal ─────────────────────────────────────────────────────────────

  private async trigger(event: string, params: {
    streamId?: string;
    userId?: string;
    data: Record<string, any>;
  }) {
    const payload: N8nWebhookPayload = {
      event,
      streamId: params.streamId,
      userId: params.userId,
      data: params.data,
      timestamp: new Date().toISOString()
    };

    const webhookPath = process.env[`N8N_WEBHOOK_${event.toUpperCase().replace('.', '_')}`]
      || `/webhook/unified-platform`;

    try {
      const response = await n8n.post(webhookPath, payload);
      console.log(`n8n event sent: ${event}`);
      return response.data;
    } catch (error: any) {
      // Non-blocking – log only
      console.warn(`n8n trigger failed for ${event}:`, error.message);
      return null;
    }
  }

  private getMilestone(count: number): string {
    if (count >= 10000) return '10K';
    if (count >= 1000)  return '1K';
    if (count >= 500)   return '500';
    if (count >= 100)   return '100';
    if (count >= 50)    return '50';
    return '10';
  }
}

export const n8nService = new N8nService();
