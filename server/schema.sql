create table if not exists accounts (
  id text primary key,
  name text not null,
  email text not null unique,
  password_hash text not null,
  phone text,
  role text not null check (role in ('owner', 'admin')),
  status text not null check (status in ('active', 'inactive')),
  avatar text not null default '',
  created_at text not null
);

create table if not exists vehicles (
  id text primary key,
  owner_id text not null references accounts(id) on delete cascade,
  owner_name text not null,
  brand text not null,
  model text not null,
  year integer not null,
  color text not null,
  plate_number text not null,
  qr_token text not null unique,
  status text not null,
  scans_count integer not null default 0,
  reports_count integer not null default 0,
  image_url text,
  created_at text not null
);

create table if not exists reports (
  id text primary key,
  vehicle_id text not null references vehicles(id) on delete cascade,
  vehicle_name text not null,
  vehicle_plate text not null,
  category text not null,
  title text not null,
  description text not null,
  has_location boolean not null default false,
  status text not null,
  reporter_name text not null,
  reporter_session_id text not null,
  created_at timestamptz not null,
  timestamp text not null
);

create table if not exists conversations (
  id text primary key,
  report_id text not null,
  vehicle_id text not null references vehicles(id) on delete cascade,
  vehicle_name text not null,
  vehicle_plate text not null,
  last_message text not null,
  last_message_time text not null,
  unread_count integer not null default 0,
  reporter_session_id text not null,
  status text not null
);

create table if not exists messages (
  id text primary key,
  conversation_id text not null references conversations(id) on delete cascade,
  sender_role text not null,
  sender_name text not null,
  body text not null,
  timestamp text not null,
  created_at timestamptz not null,
  is_read boolean not null default false
);

create table if not exists notifications (
  id text primary key,
  user_id text not null references accounts(id) on delete cascade,
  vehicle_id text,
  report_id text,
  type text not null,
  title text not null,
  message text not null,
  time_ago text not null,
  created_at timestamptz not null,
  is_read boolean not null default false,
  severity text not null
);

create table if not exists activities (
  id text primary key,
  vehicle_id text,
  vehicle_name text,
  type text not null,
  title text not null,
  subtitle text not null,
  time_str text not null,
  date_group text not null,
  tag_text text,
  tag_type text,
  created_at timestamptz not null
);

create table if not exists sessions (
  id text primary key,
  user_id text not null references accounts(id) on delete cascade,
  expires_at bigint not null
);

create table if not exists visits (
  id text primary key,
  expires_at bigint not null,
  created_at timestamptz
);

create table if not exists visit_days (
  visit_id text not null references visits(id) on delete cascade,
  day date not null,
  primary key (visit_id, day)
);
grant select, insert, update, delete on visit_days to service_role;

create index if not exists vehicles_owner_idx on vehicles(owner_id);
create index if not exists vehicles_plate_idx on vehicles(plate_number);
create unique index if not exists vehicles_plate_compact_idx
  on vehicles (lower(regexp_replace(plate_number, '[[:space:]-]+', '', 'g')));
create index if not exists reports_vehicle_idx on reports(vehicle_id);
create index if not exists conversations_vehicle_idx on conversations(vehicle_id);
create index if not exists conversations_visit_idx on conversations(reporter_session_id);
create index if not exists messages_conversation_idx on messages(conversation_id);
create index if not exists notifications_user_idx on notifications(user_id);
create index if not exists activities_vehicle_idx on activities(vehicle_id);
create index if not exists sessions_user_idx on sessions(user_id);
create index if not exists visit_days_day_idx on visit_days(day);

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

alter table accounts enable row level security;
alter table vehicles enable row level security;
alter table reports enable row level security;
alter table conversations enable row level security;
alter table messages enable row level security;
alter table notifications enable row level security;
alter table activities enable row level security;
alter table sessions enable row level security;
alter table visits enable row level security;
alter table visit_days enable row level security;
alter table calls enable row level security;
alter table report_photos enable row level security;
alter table push_subscriptions enable row level security;

grant usage on schema public to service_role;
grant select, insert, update, delete on all tables in schema public to service_role;
notify pgrst, 'reload schema';

create table if not exists sos_helpers (
  user_id text primary key references accounts(id) on delete cascade,
  active boolean not null default false,
  lat double precision,
  lng double precision,
  updated_at timestamptz not null
);

create table if not exists sos_requests (
  id text primary key,
  requester_id text not null references accounts(id) on delete cascade,
  kind text not null,
  note text not null default '',
  lat double precision not null,
  lng double precision not null,
  status text not null,
  helper_id text references accounts(id),
  created_at timestamptz not null,
  expires_at timestamptz not null
);

create table if not exists sos_messages (
  id text primary key,
  request_id text not null references sos_requests(id) on delete cascade,
  sender_id text not null,
  body text not null,
  created_at timestamptz not null
);

alter table sos_helpers enable row level security;
alter table sos_requests enable row level security;
alter table sos_messages enable row level security;
grant select, insert, update, delete on sos_helpers, sos_requests, sos_messages to service_role;
notify pgrst, 'reload schema';
