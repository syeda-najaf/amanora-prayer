// Deploy with Supabase CLI. Schedule this Edge Function from Supabase Cron.
// It only publishes content already approved by an Amanora admin.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });
  const expected = Deno.env.get('AMANORA_SCHEDULER_SECRET');
  const supplied = req.headers.get('x-amanora-scheduler-secret');
  if (!expected || !supplied || supplied !== expected) return new Response('Unauthorized', { status: 401 });

  const url = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !serviceKey) return Response.json({ error: 'Server environment is incomplete' }, { status: 500 });

  const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });
  const now = new Date().toISOString();
  const { data, error } = await supabase
    .from('amanora_content')
    .update({ status: 'published', published_at: now, updated_at: now })
    .eq('status', 'scheduled')
    .lte('publish_at', now)
    .select('id, content_type, title');

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ published: data?.length ?? 0, items: data ?? [], ran_at: now });
});
