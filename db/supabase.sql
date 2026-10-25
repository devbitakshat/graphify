-- Run once in the Supabase SQL editor for a fresh project.
-- Requires Auth (auth.users). Disable "Confirm email" under Auth settings for local MVP signup.

create table if not exists schema_migrations (
  version integer primary key
);

create table if not exists users (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique,
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists learning_spaces (
  id text primary key,
  user_id uuid not null references users (id) on delete cascade,
  name text not null,
  goal text not null default 'curiosity',
  level text not null default 'beginner',
  depth text not null default 'overview',
  time_available text not null default '6 hours',
  resource_preference text not null default 'any',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists concepts (
  id text primary key,
  space_id text not null references learning_spaces (id) on delete cascade,
  title text not null,
  normalized_title text not null,
  type text not null,
  origin text not null,
  priority text not null default 'should',
  explanation text not null default '',
  why_it_matters text not null default '',
  goal_relationship text not null default '',
  example text not null default '',
  effort text not null default '',
  prerequisite_reason text not null default '',
  status text not null default 'unfamiliar',
  parent_concept_id text,
  position_x double precision,
  position_y double precision,
  learning_order integer,
  dismissed_at timestamptz,
  dismissed_by text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  capture_order integer,
  parent_inferred boolean not null default false
);

create table if not exists concept_relationships (
  id text primary key,
  space_id text not null references learning_spaces (id) on delete cascade,
  source_id text not null references concepts (id) on delete cascade,
  target_id text not null references concepts (id) on delete cascade,
  relationship text not null,
  origin text not null,
  dismissed_at timestamptz,
  dismissed_by text,
  created_at timestamptz not null default now()
);

create table if not exists captured_sources (
  id text primary key,
  concept_id text not null unique references concepts (id) on delete cascade,
  url text not null default '',
  note text not null default ''
);

create table if not exists resources (
  id text primary key,
  concept_id text not null references concepts (id) on delete cascade,
  title text not null,
  url text not null,
  kind text not null,
  provider text not null,
  why_recommended text not null,
  duration text not null default '',
  is_free boolean not null default true,
  rank integer not null default 0
);

create table if not exists learning_progress (
  id text primary key,
  user_id uuid not null references users (id) on delete cascade,
  concept_id text not null references concepts (id) on delete cascade,
  status text not null,
  created_at timestamptz not null default now()
);

create table if not exists graph_generations (
  id text primary key,
  space_id text not null references learning_spaces (id) on delete cascade,
  model text not null,
  summary text not null default '',
  validated_json jsonb not null,
  created_at timestamptz not null default now()
);

create index if not exists learning_spaces_user_idx on learning_spaces (user_id);
create index if not exists concepts_space_idx on concepts (space_id);
create index if not exists concept_relationships_space_idx on concept_relationships (space_id);
create index if not exists resources_concept_idx on resources (concept_id);
create index if not exists learning_progress_concept_idx on learning_progress (concept_id);
create index if not exists graph_generations_space_idx on graph_generations (space_id);

create unique index if not exists concepts_active_title_idx
  on concepts (space_id, normalized_title)
  where dismissed_at is null;

create unique index if not exists concept_relationships_unique_idx
  on concept_relationships (source_id, target_id, relationship);

alter table concepts drop constraint if exists concepts_parent_fk;

alter table concepts
  add constraint concepts_parent_fk
  foreign key (parent_concept_id) references concepts (id) on delete set null;

insert into schema_migrations (version) values (1) on conflict do nothing;

-- Per-user foreign keys and row security live in db/ownership.sql.
-- Bring-your-own-key settings live in db/ai-settings.sql.
-- The app applies both files on startup. Run them once here if this database was created earlier.
