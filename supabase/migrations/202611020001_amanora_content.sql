
create extension if not exists pgcrypto;

create table if not exists public.amanora_admins (
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);

create or replace function public.amanora_is_admin()
returns boolean
language sql
stable
security definer
set search_path = public, pg_temp
as $$
  select exists (
    select 1
    from public.amanora_admins
    where user_id = auth.uid()
  );
$$;

create table if not exists public.amanora_content (
  id uuid primary key default gen_random_uuid(),
  content_type text not null check (
    content_type in ('hadith','dua','story','quiz','bayan','reel','reflection')
  ),
  title text not null,
  body text,
  body_ur text,
  body_ar text,
  reference text,
  source_name text,
  source_url text,
  media_url text,
  media_kind text check (
    media_kind is null or media_kind in ('audio','video','image')
  ),
  language text not null default 'en' check (
    language in ('en','ur','ar','multi')
  ),
  presenter_type text check (
    presenter_type is null or presenter_type in ('human','ai')
  ),
  status text not null default 'draft' check (
    status in ('draft','pending_review','approved','scheduled','published','rejected','archived')
  ),
  approved_by uuid references auth.users(id),
  approved_at timestamptz,
  publish_at timestamptz,
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint source_required_for_religious_text check (
    content_type not in ('hadith','dua','story')
    or source_name is not null
    or reference is not null
  )
);

create index if not exists amanora_content_public_idx
on public.amanora_content (status, publish_at desc, published_at desc);

create index if not exists amanora_content_type_idx
on public.amanora_content (content_type, language, status);

alter table public.amanora_admins enable row level security;
alter table public.amanora_content enable row level security;

drop policy if exists "admins can read admin list" on public.amanora_admins;
create policy "admins can read admin list"
on public.amanora_admins
for select to authenticated
using (public.amanora_is_admin());

drop policy if exists "public reads published content" on public.amanora_content;
create policy "public reads published content"
on public.amanora_content
for select to anon, authenticated
using (
  status = 'published'
  and (publish_at is null or publish_at <= now())
);

drop policy if exists "admins manage content" on public.amanora_content;
create policy "admins manage content"
on public.amanora_content
for all to authenticated
using (public.amanora_is_admin())
with check (public.amanora_is_admin());

insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'amanora-media',
  'amanora-media',
  false,
  52428800,
  array['audio/mpeg','audio/mp4','audio/aac','video/mp4','video/webm','image/jpeg','image/png','image/webp']
)
on conflict (id) do nothing;

drop policy if exists "Amanora admins upload media" on storage.objects;
create policy "Amanora admins upload media"
on storage.objects
for insert to authenticated
with check (
  bucket_id = 'amanora-media'
  and public.amanora_is_admin()
);

drop policy if exists "Amanora admins update media" on storage.objects;
create policy "Amanora admins update media"
on storage.objects
for update to authenticated
using (
  bucket_id = 'amanora-media'
  and public.amanora_is_admin()
)
with check (
  bucket_id = 'amanora-media'
  and public.amanora_is_admin()
);

drop policy if exists "Amanora admins delete media" on storage.objects;
create policy "Amanora admins delete media"
on storage.objects
for delete to authenticated
using (
  bucket_id = 'amanora-media'
  and public.amanora_is_admin()
);
