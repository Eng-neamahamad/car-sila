alter table vehicles add column if not exists return_at timestamptz;

create table if not exists calls (
  id text primary key,
  vehicle_id text not null references vehicles(id) on delete cascade,
  owner_id text not null references accounts(id) on delete cascade,
  visit_id text not null,
  status text not null,
  offer text,
  answer text,
  visitor_ice text not null default '[]',
  owner_ice text not null default '[]',
  plate text not null,
  car text not null,
  created_at timestamptz not null,
  updated_at timestamptz not null
);

create table if not exists report_photos (
  report_id text primary key references reports(id) on delete cascade,
  photo text not null,
  captured_at timestamptz not null
);

create index if not exists calls_owner_idx on calls(owner_id);
create index if not exists calls_vehicle_idx on calls(vehicle_id);
create index if not exists calls_visit_idx on calls(visit_id);

create table if not exists push_subscriptions (
  endpoint text primary key,
  user_id text not null references accounts(id) on delete cascade,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null
);

create index if not exists push_subscriptions_user_idx on push_subscriptions(user_id);

alter table calls enable row level security;
alter table report_photos enable row level security;
alter table push_subscriptions enable row level security;

grant select, insert, update, delete on all tables in schema public to service_role;
notify pgrst, 'reload schema';
