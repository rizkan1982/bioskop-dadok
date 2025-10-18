-- ============================================
-- TABLE: Custom Ads/Banner Management
-- ============================================
create table public.ads (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  image_url text not null,
  link_url text,
  position text not null check (position in ('top', 'middle', 'bottom', 'sidebar')),
  is_active boolean not null default true,
  start_date timestamp with time zone default now(),
  end_date timestamp with time zone,
  click_count integer not null default 0,
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

-- Enable RLS
alter table public.ads enable row level security;

-- Indexes for better performance
create index idx_ads_position on public.ads(position);
create index idx_ads_is_active on public.ads(is_active);
create index idx_ads_dates on public.ads(start_date, end_date);

-- ============================================
-- POLICIES
-- ============================================

-- Allow anyone to read active ads
create policy "Enable read access for active ads"
on public.ads
for select
to anon, authenticated
using (
  is_active = true 
  and (end_date is null or end_date >= now())
);

-- Only admins can insert ads
create policy "Only admins can insert ads"
on public.ads
for insert
to authenticated
with check (
  exists (
    select 1 from public.profiles
    where id = auth.uid() and is_admin = true
  )
);

-- Only admins can update ads
create policy "Only admins can update ads"
on public.ads
for update
to authenticated
using (
  exists (
    select 1 from public.profiles
    where id = auth.uid() and is_admin = true
  )
);

-- Only admins can delete ads
create policy "Only admins can delete ads"
on public.ads
for delete
to authenticated
using (
  exists (
    select 1 from public.profiles
    where id = auth.uid() and is_admin = true
  )
);

-- Allow anyone to increment click count (for tracking)
create policy "Allow click count updates"
on public.ads
for update
to anon, authenticated
using (true)
with check (true);

-- ============================================
-- FUNCTION: Auto-update updated_at timestamp
-- ============================================
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_ads_updated
  before update on public.ads
  for each row
  execute procedure public.handle_updated_at();
