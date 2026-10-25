-- Bring-your-own-key model settings, one row per user.
-- Safe to run more than once. Applied automatically as schema version 3.

create table if not exists ai_settings (
  user_id uuid primary key references users (id) on delete cascade,
  provider text not null,
  model text not null,
  api_key_ciphertext text not null,
  api_key_hint text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Row security with no policies: the Supabase REST API cannot read keys.
-- The server reaches this table through DATABASE_URL only.
do $$
begin
  if to_regprocedure('auth.uid()') is not null then
    execute 'alter table ai_settings enable row level security';
  end if;
end $$;

insert into schema_migrations (version) values (3) on conflict do nothing;
