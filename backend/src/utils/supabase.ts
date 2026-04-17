import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL     = process.env.SUPABASE_URL     || 'https://rxlgywvfclyjdfyvfvyc.supabase.co';
const SUPABASE_ANON    = process.env.SUPABASE_ANON_KEY || 'sb_publishable_CtHMhtj7hLmg8jejBnUrfA_BsWb0Lpb';
const SUPABASE_SERVICE = process.env.SUPABASE_SERVICE_KEY!;

// Public client (for user-facing requests)
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON);

// Admin client (for server-side operations - bypasses RLS)
export const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE, {
  auth: { autoRefreshToken: false, persistSession: false }
});

// ─── Vault Helpers ────────────────────────────────────────────────────────────

export async function vaultStore(name: string, secret: string, description = ''): Promise<string> {
  const { data, error } = await supabaseAdmin.rpc('vault.create_secret', {
    secret,
    name,
    description
  });
  if (error) throw new Error(`Vault store failed: ${error.message}`);
  return data as string; // returns the vault ID
}

export async function vaultRead(vaultId: string): Promise<string> {
  const { data, error } = await supabaseAdmin
    .from('vault.decrypted_secrets')
    .select('decrypted_secret')
    .eq('id', vaultId)
    .single();
  if (error) throw new Error(`Vault read failed: ${error.message}`);
  return (data as any).decrypted_secret;
}

export async function vaultDelete(vaultId: string): Promise<void> {
  const { error } = await supabaseAdmin.rpc('vault.delete_secret', { secret_id: vaultId });
  if (error) throw new Error(`Vault delete failed: ${error.message}`);
}

// ─── Storage Helpers ──────────────────────────────────────────────────────────

export async function uploadFile(
  bucket: string,
  path: string,
  file: Buffer,
  contentType: string
): Promise<string> {
  const { data, error } = await supabaseAdmin.storage
    .from(bucket)
    .upload(path, file, { contentType, upsert: true });
  if (error) throw error;

  const { data: urlData } = supabaseAdmin.storage.from(bucket).getPublicUrl(data.path);
  return urlData.publicUrl;
}

export async function getSignedUrl(bucket: string, path: string, expiresIn = 3600): Promise<string> {
  const { data, error } = await supabaseAdmin.storage
    .from(bucket)
    .createSignedUrl(path, expiresIn);
  if (error) throw error;
  return data.signedUrl;
}

// ─── Realtime Helpers ─────────────────────────────────────────────────────────

export function subscribeToStream(streamId: string, callback: (payload: any) => void) {
  return supabase
    .channel(`stream:${streamId}`)
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'Stream',
      filter: `id=eq.${streamId}`
    }, callback)
    .subscribe();
}

export function subscribeToViewerCount(streamId: string, callback: (count: number) => void) {
  return supabase
    .channel(`viewers:${streamId}`)
    .on('presence', { event: 'sync' }, () => {
      // Presence count handled by LiveKit
    })
    .subscribe();
}
