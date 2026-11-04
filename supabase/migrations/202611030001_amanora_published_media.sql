-- Amanora: allow signed-URL creation only for media attached to currently published content.
-- The bucket remains PRIVATE. Do not change amanora-media to public.
drop policy if exists "Amanora published media read" on storage.objects;

create policy "Amanora published media read"
on storage.objects
for select
to anon, authenticated
using (
  bucket_id = 'amanora-media'
  and exists (
    select 1
    from public.amanora_content as c
    where c.media_url = storage.objects.name
      and c.status = 'published'
      and (c.publish_at is null or c.publish_at <= now())
  )
);
