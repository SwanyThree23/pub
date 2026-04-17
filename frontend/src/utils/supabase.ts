import { createBrowserClient } from '@supabase/ssr';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
  || 'https://rxlgywvfclyjdfyvfvyc.supabase.co';

const SUPABASE_KEY = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY
  || 'sb_publishable_CtHMhtj7hLmg8jejBnUrfA_BsWb0Lpb';

export const supabase = createBrowserClient(SUPABASE_URL, SUPABASE_KEY);

// ── Realtime subscriptions ─────────────────────────────────

export function subscribeToStream(streamId: string, callback: (data: any) => void) {
  return supabase
    .channel(`stream_updates_${streamId}`)
    .on('postgres_changes', {
      event: 'UPDATE',
      schema: 'public',
      table: 'Stream',
      filter: `id=eq.${streamId}`
    }, callback)
    .subscribe();
}

export function subscribeToViewers(streamId: string, onUpdate: (viewers: number) => void) {
  const channel = supabase.channel(`viewers_${streamId}`);

  channel
    .on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState();
      onUpdate(Object.keys(state).length);
    })
    .subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({ streamId, joinedAt: Date.now() });
      }
    });

  return channel;
}
