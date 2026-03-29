-- Beaches
create table beaches (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  name_fr text,
  lat double precision not null,
  lng double precision not null,
  island text not null default 'guadeloupe',
  current_status text check (current_status in ('clean', 'moderate', 'bad', 'unknown')) default 'unknown',
  last_updated timestamptz,
  last_report_source text check (last_report_source in ('partner', 'satellite', 'crowdsource')),
  created_at timestamptz default now()
);

-- Partners
create table partners (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  establishment_name text,
  token text unique not null,
  verified boolean default false,
  created_at timestamptz default now()
);

-- Condition reports
create table condition_reports (
  id uuid primary key default gen_random_uuid(),
  beach_id uuid references beaches(id) on delete cascade,
  partner_id uuid references partners(id),
  status text not null check (status in ('clean', 'moderate', 'bad')),
  notes text,
  source text check (source in ('partner', 'satellite', 'crowdsource')) default 'partner',
  reported_at timestamptz default now()
);

-- Index for fast beach status lookups
create index on condition_reports(beach_id, reported_at desc);

-- RLS: beaches are public read
alter table beaches enable row level security;
create policy "beaches_public_read" on beaches for select using (true);

-- RLS: condition_reports public read
alter table condition_reports enable row level security;
create policy "reports_public_read" on condition_reports for select using (true);
create policy "reports_partner_insert" on condition_reports for insert with check (true);

-- RLS: partners — no public access
alter table partners enable row level security;
