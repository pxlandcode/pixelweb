-- DO NOT RUN: Schema for resumes
create extension if not exists "pgcrypto";
create extension if not exists "uuid-ossp";

create table if not exists public.resumes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  version_name text not null,
  is_main boolean not null default false,
  is_active boolean not null default true,
  allow_word_export boolean not null default false,
  content jsonb not null default '[]'::jsonb,
  preview_html text,
  created_by uuid references auth.users(id),
  updated_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists idx_resumes_user_id on public.resumes(user_id);
create index if not exists idx_resumes_main_active on public.resumes(is_main, is_active);
create unique index if not exists uniq_resumes_user_main on public.resumes(user_id) where is_main;

create table if not exists public.resume_versions (
  id uuid primary key default gen_random_uuid(),
  resume_id uuid not null references public.resumes(id) on delete cascade,
  version_name text not null,
  is_main boolean not null default false,
  is_active boolean not null default true,
  content jsonb not null default '[]'::jsonb,
  preview_html text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now()
);
create index if not exists idx_resume_versions_resume on public.resume_versions(resume_id);
create index if not exists idx_resume_versions_main on public.resume_versions(resume_id) where is_main;
create unique index if not exists uniq_resume_versions_main on public.resume_versions(resume_id) where is_main;

create table if not exists public.resume_client_access (
  id uuid primary key default gen_random_uuid(),
  resume_id uuid not null references public.resumes(id) on delete cascade,
  client_user_id uuid not null references auth.users(id) on delete cascade,
  allow_word_export boolean not null default false,
  created_at timestamptz not null default now(),
  created_by uuid references auth.users(id)
);
create unique index if not exists uniq_resume_client_access on public.resume_client_access(resume_id, client_user_id);
create index if not exists idx_resume_client_access_client on public.resume_client_access(client_user_id);

create or replace function public.touch_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists trg_resumes_updated_at on public.resumes;
create trigger trg_resumes_updated_at
  before update on public.resumes
  for each row
  execute function public.touch_updated_at();

alter table public.resumes enable row level security;
alter table public.resume_versions enable row level security;
alter table public.resume_client_access enable row level security;

create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.user_roles
    where user_id = auth.uid() and role in ('admin', 'cms_admin')
  );
$$ language sql stable;

create or replace function public.is_employee()
returns boolean as $$
  select exists (
    select 1 from public.user_roles
    where user_id = auth.uid() and role = 'employee'
  );
$$ language sql stable;

create or replace function public.is_employer()
returns boolean as $$
  select exists (
    select 1 from public.user_roles
    where user_id = auth.uid() and role = 'employer'
  );
$$ language sql stable;

create policy "admin full access" on public.resumes
  using (public.is_admin()) with check (public.is_admin());

create policy "consultant owns resume" on public.resumes
  using (public.is_employee() and user_id = auth.uid())
  with check (public.is_employee() and user_id = auth.uid());

create policy "client read assigned resume" on public.resumes
  for select using (
    public.is_employer() and exists (
      select 1 from public.resume_client_access rca
      where rca.resume_id = resumes.id and rca.client_user_id = auth.uid()
    )
  );

create policy "admin full access" on public.resume_versions
  using (public.is_admin()) with check (public.is_admin());

create policy "owner manage versions" on public.resume_versions
  using (
    public.is_employee() and exists (
      select 1 from public.resumes r
      where r.id = resume_versions.resume_id and r.user_id = auth.uid()
    )
  )
  with check (
    public.is_employee() and exists (
      select 1 from public.resumes r
      where r.id = resume_versions.resume_id and r.user_id = auth.uid()
    )
  );

create policy "client read assigned version" on public.resume_versions
  for select using (
    public.is_employer() and exists (
      select 1 from public.resume_client_access rca
      join public.resumes r on rca.resume_id = r.id
      where r.id = resume_versions.resume_id and rca.client_user_id = auth.uid()
    )
  );

create policy "admin manage access" on public.resume_client_access
  using (public.is_admin()) with check (public.is_admin());

create policy "client read own access" on public.resume_client_access
  for select using (public.is_employer() and client_user_id = auth.uid());

-- Suggested updates after review
alter table public.resume_versions
  add column if not exists updated_at timestamptz not null default now();

drop trigger if exists trg_resume_versions_updated_at on public.resume_versions;
create trigger trg_resume_versions_updated_at
  before update on public.resume_versions
  for each row
  execute function public.touch_updated_at();

-- Safe view for public/service-role reads of main, active resumes only
create or replace view public.resume_public_main as
select
  r.id,
  r.user_id,
  r.version_name,
  r.allow_word_export,
  r.content,
  r.preview_html,
  r.updated_at
from public.resumes r
where r.is_main = true and r.is_active = true;

grant select on public.resume_public_main to anon, authenticated;
