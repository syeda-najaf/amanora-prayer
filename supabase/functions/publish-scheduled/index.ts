// Deploy: supabase functions deploy publish-scheduled --no-verify-jwt
// Call from Supabase Cron with header x-amanora-scheduler-secret.
// Publishes ONLY rows that are scheduled, due, and have a recorded approver.
// The database trigger enforces the same rules, so this cannot publish unapproved content.
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';
import { safeEqual } from '../_shared/security.ts';

Deno.serve(async (req) => {
  if (req.method !== 'POST') return new Response('Method not allowed', { status: 405 });
  const expected = Deno.env.get('AMANORA_SCHEDULER_SECRET');
  const supplied = req.headers.get('x-amanora-scheduler-secret');
  if (!expected || !supplied || !(await safeEqual(supplied, expected))) return new Response('Unauthorized', { status: 401 });

  const url = Deno.env.get('SUPABASE_URL');
  const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  if (!url || !serviceKey) return Response.json({ error: 'Server environment is incomplete' }, { status: 500 });

  const supabase = createClient(url, serviceKey, { auth: { persistSession: false } });
  const now = new Date().toISOString();

  const { data, error } = await supabase
    .from('amanora_content')
    .update({ status: 'published' })
    .eq('status', 'scheduled')
    .lte('publish_at', now)
    .not('approved_by', 'is', null)
    .select('id, content_type');
  if (error) { console.error('publish-scheduled failed', error.code); return Response.json({ error: 'Publish failed' }, { status: 500 }); }

  // Report (do not publish) due items that have no approver, so the owner can fix them.
  const { count: blocked } = await supabase.from('amanora_content')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'scheduled').lte('publish_at', now).is('approved_by', null);

  return Response.json({ published: data?.length ?? 0, blocked_missing_approver: blocked ?? 0, ran_at: now });
});
