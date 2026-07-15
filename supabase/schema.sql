-- =====================================================================
-- EnhanceMove CRM — Database Schema + Row Level Security
-- Run this in the Supabase SQL Editor (Project → SQL Editor → New query)
-- =====================================================================

-- ---------------------------------------------------------------------
-- Extensions
-- ---------------------------------------------------------------------
create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- profiles
-- One row per authenticated user (1:1 with auth.users).
-- ---------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text not null default '',
  role text not null default 'Other'
    check (role in ('Founder','Sales','Ops','Investor Relations','Other')),
  company_name text not null default '',
  timezone text not null default 'UTC',
  avatar_url text,
  notify_task_due boolean not null default true,
  notify_deal_changes boolean not null default true,
  onboarding_completed boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is 'One profile per auth user. owner_id in all other tables references profiles.id.';

-- ---------------------------------------------------------------------
-- companies
-- ---------------------------------------------------------------------
create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  website text,
  industry text,
  status text not null default 'Prospect'
    check (status in ('Prospect','Active','Inactive')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists companies_owner_id_idx on public.companies (owner_id);
create index if not exists companies_name_idx on public.companies using gin (to_tsvector('english', name));

-- ---------------------------------------------------------------------
-- contacts
-- ---------------------------------------------------------------------
create table if not exists public.contacts (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  company_id uuid references public.companies (id) on delete set null,
  first_name text not null,
  last_name text not null default '',
  email text,
  phone text,
  title text,
  linkedin_url text,
  notes text,
  last_contacted_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists contacts_owner_id_idx on public.contacts (owner_id);
create index if not exists contacts_company_id_idx on public.contacts (company_id);
create index if not exists contacts_name_idx on public.contacts using gin (
  to_tsvector('english', coalesce(first_name,'') || ' ' || coalesce(last_name,'') || ' ' || coalesce(email,''))
);

-- ---------------------------------------------------------------------
-- deals
-- ---------------------------------------------------------------------
create table if not exists public.deals (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  company_id uuid references public.companies (id) on delete set null,
  contact_id uuid references public.contacts (id) on delete set null,
  title text not null,
  stage text not null default 'Lead'
    check (stage in ('Lead','Qualified','Demo','Proposal','Won','Lost')),
  amount numeric(14,2) not null default 0,
  currency text not null default 'USD',
  expected_close_date date,
  probability int not null default 10 check (probability between 0 and 100),
  status text not null default 'Open'
    check (status in ('Open','Closed Won','Closed Lost')),
  notes text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists deals_owner_id_idx on public.deals (owner_id);
create index if not exists deals_company_id_idx on public.deals (company_id);
create index if not exists deals_contact_id_idx on public.deals (contact_id);
create index if not exists deals_stage_idx on public.deals (stage);

-- ---------------------------------------------------------------------
-- activities
-- related_entity_type/id form a lightweight polymorphic reference
-- (validated in application code, not a FK, since it can point at
-- contacts, companies, or deals).
-- ---------------------------------------------------------------------
create table if not exists public.activities (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  related_entity_type text not null
    check (related_entity_type in ('contact','company','deal')),
  related_entity_id uuid not null,
  type text not null default 'note'
    check (type in ('call','email','meeting','note','task','other')),
  subject text not null,
  description text,
  due_at timestamptz,
  completed_at timestamptz,
  ai_summary text,
  ai_next_action text,
  created_at timestamptz not null default now()
);

create index if not exists activities_owner_id_idx on public.activities (owner_id);
create index if not exists activities_related_idx on public.activities (related_entity_type, related_entity_id);
create index if not exists activities_created_at_idx on public.activities (created_at desc);

-- ---------------------------------------------------------------------
-- tasks
-- ---------------------------------------------------------------------
create table if not exists public.tasks (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles (id) on delete cascade,
  related_entity_type text
    check (related_entity_type in ('contact','company','deal') or related_entity_type is null),
  related_entity_id uuid,
  title text not null,
  description text,
  due_at timestamptz,
  completed boolean not null default false,
  priority text not null default 'Medium'
    check (priority in ('Low','Medium','High')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists tasks_owner_id_idx on public.tasks (owner_id);
create index if not exists tasks_due_at_idx on public.tasks (due_at);
create index if not exists tasks_related_idx on public.tasks (related_entity_type, related_entity_id);

-- ---------------------------------------------------------------------
-- team_members (optional simple sharing — v1 keeps every owner_id
-- scoped to a single profile, this table lays the groundwork only)
-- ---------------------------------------------------------------------
create table if not exists public.team_members (
  id uuid primary key default gen_random_uuid(),
  owner_profile_id uuid not null references public.profiles (id) on delete cascade,
  member_email text not null,
  role text not null default 'member',
  invited_at timestamptz not null default now(),
  accepted_at timestamptz
);

create index if not exists team_members_owner_idx on public.team_members (owner_profile_id);

-- =====================================================================
-- updated_at triggers
-- =====================================================================
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists set_updated_at on public.profiles;
create trigger set_updated_at before update on public.profiles
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at on public.companies;
create trigger set_updated_at before update on public.companies
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at on public.contacts;
create trigger set_updated_at before update on public.contacts
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at on public.deals;
create trigger set_updated_at before update on public.deals
  for each row execute function public.set_updated_at();

drop trigger if exists set_updated_at on public.tasks;
create trigger set_updated_at before update on public.tasks
  for each row execute function public.set_updated_at();

-- =====================================================================
-- Auto-create a profile row whenever a new auth user signs up
-- =====================================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name)
  values (new.id, coalesce(new.raw_user_meta_data->>'full_name', ''));
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =====================================================================
-- Row Level Security
-- Every table is owned by a single profile (owner_id / owner_profile_id
-- for team_members). Users may only read/write rows they own. This is
-- the multi-tenant isolation boundary for the whole app.
-- =====================================================================
alter table public.profiles enable row level security;
alter table public.companies enable row level security;
alter table public.contacts enable row level security;
alter table public.deals enable row level security;
alter table public.activities enable row level security;
alter table public.tasks enable row level security;
alter table public.team_members enable row level security;

-- profiles: a user can only see/edit their own profile row
drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);

-- companies
drop policy if exists "companies_all_own" on public.companies;
create policy "companies_select_own" on public.companies
  for select using (auth.uid() = owner_id);
create policy "companies_insert_own" on public.companies
  for insert with check (auth.uid() = owner_id);
create policy "companies_update_own" on public.companies
  for update using (auth.uid() = owner_id);
create policy "companies_delete_own" on public.companies
  for delete using (auth.uid() = owner_id);

-- contacts
create policy "contacts_select_own" on public.contacts
  for select using (auth.uid() = owner_id);
create policy "contacts_insert_own" on public.contacts
  for insert with check (auth.uid() = owner_id);
create policy "contacts_update_own" on public.contacts
  for update using (auth.uid() = owner_id);
create policy "contacts_delete_own" on public.contacts
  for delete using (auth.uid() = owner_id);

-- deals
create policy "deals_select_own" on public.deals
  for select using (auth.uid() = owner_id);
create policy "deals_insert_own" on public.deals
  for insert with check (auth.uid() = owner_id);
create policy "deals_update_own" on public.deals
  for update using (auth.uid() = owner_id);
create policy "deals_delete_own" on public.deals
  for delete using (auth.uid() = owner_id);

-- activities
create policy "activities_select_own" on public.activities
  for select using (auth.uid() = owner_id);
create policy "activities_insert_own" on public.activities
  for insert with check (auth.uid() = owner_id);
create policy "activities_update_own" on public.activities
  for update using (auth.uid() = owner_id);
create policy "activities_delete_own" on public.activities
  for delete using (auth.uid() = owner_id);

-- tasks
create policy "tasks_select_own" on public.tasks
  for select using (auth.uid() = owner_id);
create policy "tasks_insert_own" on public.tasks
  for insert with check (auth.uid() = owner_id);
create policy "tasks_update_own" on public.tasks
  for update using (auth.uid() = owner_id);
create policy "tasks_delete_own" on public.tasks
  for delete using (auth.uid() = owner_id);

-- team_members
create policy "team_members_select_own" on public.team_members
  for select using (auth.uid() = owner_profile_id);
create policy "team_members_insert_own" on public.team_members
  for insert with check (auth.uid() = owner_profile_id);
create policy "team_members_update_own" on public.team_members
  for update using (auth.uid() = owner_profile_id);
create policy "team_members_delete_own" on public.team_members
  for delete using (auth.uid() = owner_profile_id);

-- =====================================================================
-- Storage: avatar uploads
-- =====================================================================
insert into storage.buckets (id, name, public)
values ('avatars', 'avatars', true)
on conflict (id) do nothing;

drop policy if exists "avatar_public_read" on storage.objects;
create policy "avatar_public_read" on storage.objects
  for select using (bucket_id = 'avatars');

drop policy if exists "avatar_owner_write" on storage.objects;
create policy "avatar_owner_write" on storage.objects
  for insert with check (
    bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "avatar_owner_update" on storage.objects;
create policy "avatar_owner_update" on storage.objects
  for update using (
    bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]
  );

drop policy if exists "avatar_owner_delete" on storage.objects;
create policy "avatar_owner_delete" on storage.objects
  for delete using (
    bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]
  );
