create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text unique,
  full_name text,
  role text check (role in ('owner', 'provider', 'captain')),
  created_at timestamptz not null default now()
);

create table if not exists public.vessels (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  make text,
  model text,
  year int,
  length_ft numeric,
  beam_ft numeric,
  hull_id text,
  home_port text,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists public.service_requests (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  vessel_id uuid references public.vessels(id) on delete set null,
  title text not null,
  category text,
  priority text default 'medium',
  status text default 'open',
  description text,
  created_at timestamptz not null default now()
);

create table if not exists public.quotes (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.service_requests(id) on delete cascade,
  provider_id uuid references public.profiles(id) on delete set null,
  service_name text not null,
  amount_cents int not null,
  currency text not null default 'usd',
  eta_text text,
  status text not null default 'awaiting_approval',
  created_at timestamptz not null default now()
);

create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid references public.profiles(id) on delete set null,
  provider_id uuid references public.profiles(id) on delete set null,
  captain_id uuid references public.profiles(id) on delete set null,
  vessel_id uuid references public.vessels(id) on delete set null,
  title text not null,
  starts_at timestamptz,
  ends_at timestamptz,
  status text not null default 'pending',
  amount_cents int,
  currency text default 'usd',
  stripe_invoice_id text,
  created_at timestamptz not null default now()
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  stripe_customer_id text unique,
  stripe_subscription_id text unique,
  status text,
  price_key text,
  updated_at timestamptz not null default now()
);

create table if not exists public.payout_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references public.profiles(id) on delete cascade,
  stripe_account_id text unique not null,
  charges_enabled boolean not null default false,
  payouts_enabled boolean not null default false,
  details_submitted boolean not null default false,
  onboarding_complete boolean not null default false,
  updated_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.payments (
  id uuid primary key default gen_random_uuid(),
  appointment_id uuid references public.appointments(id) on delete set null,
  owner_id uuid references public.profiles(id) on delete set null,
  payee_user_id uuid references public.profiles(id) on delete set null,
  stripe_payment_intent_id text unique,
  stripe_connected_account_id text,
  amount_cents int not null,
  application_fee_cents int not null default 0,
  currency text not null default 'usd',
  status text not null default 'created',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.vessels enable row level security;
alter table public.service_requests enable row level security;
alter table public.quotes enable row level security;
alter table public.appointments enable row level security;
alter table public.subscriptions enable row level security;
alter table public.payout_accounts enable row level security;
alter table public.payments enable row level security;

create policy "profiles_select_own"
on public.profiles for select
using (auth.uid() = id);

create policy "profiles_update_own"
on public.profiles for update
using (auth.uid() = id);

create policy "vessels_owner_all"
on public.vessels for all
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

create policy "service_requests_owner_all"
on public.service_requests for all
using (auth.uid() = owner_id)
with check (auth.uid() = owner_id);

create policy "service_requests_provider_select"
on public.service_requests for select
using (
  exists (
    select 1 from public.profiles p
    where p.id = auth.uid() and p.role = 'provider'
  )
);

create policy "quotes_provider_all"
on public.quotes for all
using (
  provider_id = auth.uid()
  or exists (
    select 1 from public.service_requests sr
    where sr.id = request_id and sr.owner_id = auth.uid()
  )
)
with check (provider_id = auth.uid());

create policy "appointments_owner_select"
on public.appointments for select
using (owner_id = auth.uid());

create policy "appointments_provider_select"
on public.appointments for select
using (provider_id = auth.uid());

create policy "appointments_captain_select"
on public.appointments for select
using (captain_id = auth.uid());

create policy "subscriptions_owner_select"
on public.subscriptions for select
using (auth.uid() = user_id);

create policy "payout_accounts_select_own"
on public.payout_accounts for select
using (auth.uid() = user_id);

create policy "payments_owner_select"
on public.payments for select
using (owner_id = auth.uid());

create policy "payments_payee_select"
on public.payments for select
using (payee_user_id = auth.uid());

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    null
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();
