-- Tie every learning row to the user who owns its space.
-- Safe to run more than once. Applied automatically as schema version 2.

alter table concepts add column if not exists user_id uuid;
alter table concept_relationships add column if not exists user_id uuid;
alter table graph_generations add column if not exists user_id uuid;
alter table resources add column if not exists user_id uuid;
alter table captured_sources add column if not exists user_id uuid;

update concepts as c
set user_id = s.user_id
from learning_spaces as s
where c.space_id = s.id and c.user_id is null;

update concept_relationships as r
set user_id = s.user_id
from learning_spaces as s
where r.space_id = s.id and r.user_id is null;

update graph_generations as g
set user_id = s.user_id
from learning_spaces as s
where g.space_id = s.id and g.user_id is null;

update resources as r
set user_id = c.user_id
from concepts as c
where r.concept_id = c.id and r.user_id is null;

update captured_sources as src
set user_id = c.user_id
from concepts as c
where src.concept_id = c.id and src.user_id is null;

delete from resources where user_id is null;
delete from captured_sources where user_id is null;
delete from concepts where user_id is null;
delete from concept_relationships where user_id is null;
delete from graph_generations where user_id is null;

alter table concepts alter column user_id set not null;
alter table concept_relationships alter column user_id set not null;
alter table graph_generations alter column user_id set not null;
alter table resources alter column user_id set not null;
alter table captured_sources alter column user_id set not null;

alter table concepts drop constraint if exists concepts_user_fk;
alter table concepts
  add constraint concepts_user_fk foreign key (user_id) references users (id) on delete cascade;

alter table concept_relationships drop constraint if exists concept_relationships_user_fk;
alter table concept_relationships
  add constraint concept_relationships_user_fk foreign key (user_id) references users (id) on delete cascade;

alter table graph_generations drop constraint if exists graph_generations_user_fk;
alter table graph_generations
  add constraint graph_generations_user_fk foreign key (user_id) references users (id) on delete cascade;

alter table resources drop constraint if exists resources_user_fk;
alter table resources
  add constraint resources_user_fk foreign key (user_id) references users (id) on delete cascade;

alter table captured_sources drop constraint if exists captured_sources_user_fk;
alter table captured_sources
  add constraint captured_sources_user_fk foreign key (user_id) references users (id) on delete cascade;

create index if not exists concepts_user_idx on concepts (user_id);
create index if not exists concept_relationships_user_idx on concept_relationships (user_id);
create index if not exists graph_generations_user_idx on graph_generations (user_id);
create index if not exists resources_user_idx on resources (user_id);

create or replace function graphily_user_from_space()
returns trigger
language plpgsql
as $$
declare
  owner uuid;
begin
  select user_id into owner from learning_spaces where id = new.space_id;
  if owner is null then
    raise exception 'learning space not found';
  end if;
  if new.user_id is null then
    new.user_id := owner;
  elsif new.user_id is distinct from owner then
    raise exception 'row owner does not match the learning space';
  end if;
  return new;
end;
$$;

create or replace function graphily_user_from_concept()
returns trigger
language plpgsql
as $$
declare
  owner uuid;
begin
  select user_id into owner from concepts where id = new.concept_id;
  if owner is null then
    raise exception 'concept not found';
  end if;
  if new.user_id is null then
    new.user_id := owner;
  elsif new.user_id is distinct from owner then
    raise exception 'row owner does not match the concept';
  end if;
  return new;
end;
$$;

drop trigger if exists concepts_set_user on concepts;
create trigger concepts_set_user
  before insert or update on concepts
  for each row execute function graphily_user_from_space();

drop trigger if exists concept_relationships_set_user on concept_relationships;
create trigger concept_relationships_set_user
  before insert or update on concept_relationships
  for each row execute function graphily_user_from_space();

drop trigger if exists graph_generations_set_user on graph_generations;
create trigger graph_generations_set_user
  before insert or update on graph_generations
  for each row execute function graphily_user_from_space();

drop trigger if exists resources_set_user on resources;
create trigger resources_set_user
  before insert or update on resources
  for each row execute function graphily_user_from_concept();

drop trigger if exists captured_sources_set_user on captured_sources;
create trigger captured_sources_set_user
  before insert or update on captured_sources
  for each row execute function graphily_user_from_concept();

do $$
begin
  if to_regprocedure('auth.uid()') is not null then
    execute 'alter table users drop constraint if exists users_auth_fk';
    execute 'alter table users add constraint users_auth_fk foreign key (id) references auth.users (id) on delete cascade';

    execute 'alter table users enable row level security';
    execute 'alter table learning_spaces enable row level security';
    execute 'alter table concepts enable row level security';
    execute 'alter table concept_relationships enable row level security';
    execute 'alter table graph_generations enable row level security';
    execute 'alter table resources enable row level security';
    execute 'alter table captured_sources enable row level security';
    execute 'alter table learning_progress enable row level security';

    execute 'drop policy if exists users_own on users';
    execute 'create policy users_own on users for all using (id = auth.uid()) with check (id = auth.uid())';

    execute 'drop policy if exists learning_spaces_own on learning_spaces';
    execute 'create policy learning_spaces_own on learning_spaces for all using (user_id = auth.uid()) with check (user_id = auth.uid())';

    execute 'drop policy if exists concepts_own on concepts';
    execute 'create policy concepts_own on concepts for all using (user_id = auth.uid()) with check (user_id = auth.uid())';

    execute 'drop policy if exists concept_relationships_own on concept_relationships';
    execute 'create policy concept_relationships_own on concept_relationships for all using (user_id = auth.uid()) with check (user_id = auth.uid())';

    execute 'drop policy if exists graph_generations_own on graph_generations';
    execute 'create policy graph_generations_own on graph_generations for all using (user_id = auth.uid()) with check (user_id = auth.uid())';

    execute 'drop policy if exists resources_own on resources';
    execute 'create policy resources_own on resources for all using (user_id = auth.uid()) with check (user_id = auth.uid())';

    execute 'drop policy if exists captured_sources_own on captured_sources';
    execute 'create policy captured_sources_own on captured_sources for all using (user_id = auth.uid()) with check (user_id = auth.uid())';

    execute 'drop policy if exists learning_progress_own on learning_progress';
    execute 'create policy learning_progress_own on learning_progress for all using (user_id = auth.uid()) with check (user_id = auth.uid())';
  end if;
end $$;

insert into schema_migrations (version) values (2) on conflict do nothing;
