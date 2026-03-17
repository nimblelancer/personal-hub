-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles
create table profiles (
  id uuid primary key references auth.users on delete cascade,
  display_name text,
  bio text,
  avatar_url text,
  contact_json jsonb default '{}',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Notes (Learning Lab)
create type note_topic as enum ('ai-ml', 'coding', 'english', 'japanese', 'other');
create type visibility_type as enum ('private', 'public');

create table notes (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users on delete cascade,
  title text not null,
  content text default '',
  topic note_topic default 'other',
  tags text[] default '{}',
  visibility visibility_type default 'private',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Review Schedule (Spaced Repetition)
create table review_schedule (
  id uuid primary key default uuid_generate_v4(),
  note_id uuid not null references notes on delete cascade,
  user_id uuid not null references auth.users on delete cascade,
  next_review date not null default current_date + 1,
  level int default 0 check (level >= 0 and level <= 5),
  last_reviewed timestamptz,
  created_at timestamptz default now()
);

-- Bookmarks
create type bookmark_status as enum ('saved', 'reading', 'done', 'noted');

create table bookmarks (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users on delete cascade,
  url text not null,
  title text not null,
  description text,
  tags text[] default '{}',
  status bookmark_status default 'saved',
  note_id uuid references notes on delete set null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Projects
create type project_type as enum ('software', 'learning', 'content', 'personal');
create type project_status as enum ('idea', 'planning', 'in_progress', 'paused', 'completed', 'archived');

create table projects (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users on delete cascade,
  name text not null,
  type project_type default 'software',
  status project_status default 'idea',
  visibility visibility_type default 'private',
  one_liner text,
  tech_stack text[] default '{}',
  topics text[] default '{}',
  github_url text,
  demo_url text,
  thumbnail_url text,
  started_at date,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Project Docs
create table project_docs (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references projects on delete cascade,
  content text default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Project Milestones
create type milestone_status as enum ('pending', 'in_progress', 'completed');

create table project_milestones (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references projects on delete cascade,
  title text not null,
  description text,
  status milestone_status default 'pending',
  sort_order int default 0,
  deadline date,
  completed_at timestamptz,
  created_at timestamptz default now()
);

-- Lessons Learned
create table lessons_learned (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid not null references projects on delete cascade,
  content text default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Roadmaps
create table roadmaps (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users on delete cascade,
  name text not null,
  description text,
  topic note_topic default 'other',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create type roadmap_node_status as enum ('not_started', 'in_progress', 'learned', 'mastered');

create table roadmap_nodes (
  id uuid primary key default uuid_generate_v4(),
  roadmap_id uuid not null references roadmaps on delete cascade,
  parent_id uuid references roadmap_nodes on delete set null,
  title text not null,
  description text,
  status roadmap_node_status default 'not_started',
  sort_order int default 0,
  created_at timestamptz default now()
);

-- Entity Links (Cross-Linking)
create type entity_type as enum ('note', 'project', 'bookmark', 'lesson', 'roadmap_node');

create table entity_links (
  id uuid primary key default uuid_generate_v4(),
  entity_a_type entity_type not null,
  entity_a_id uuid not null,
  entity_b_type entity_type not null,
  entity_b_id uuid not null,
  created_at timestamptz default now(),
  unique(entity_a_type, entity_a_id, entity_b_type, entity_b_id)
);

-- Activity Log
create table activity_log (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid not null references auth.users on delete cascade,
  entity_type entity_type not null,
  entity_id uuid not null,
  action text not null,
  created_at timestamptz default now()
);

-- Indexes
create index idx_notes_user on notes(user_id);
create index idx_notes_topic on notes(topic);
create index idx_notes_visibility on notes(visibility);
create index idx_notes_created on notes(created_at desc);
create index idx_review_schedule_user_next on review_schedule(user_id, next_review);
create index idx_bookmarks_user on bookmarks(user_id);
create index idx_projects_user on projects(user_id);
create index idx_projects_status on projects(status);
create index idx_projects_visibility on projects(visibility);
create index idx_entity_links_a on entity_links(entity_a_type, entity_a_id);
create index idx_entity_links_b on entity_links(entity_b_type, entity_b_id);
create index idx_activity_user on activity_log(user_id, created_at desc);

-- RLS
alter table profiles enable row level security;
alter table notes enable row level security;
alter table review_schedule enable row level security;
alter table bookmarks enable row level security;
alter table projects enable row level security;
alter table project_docs enable row level security;
alter table project_milestones enable row level security;
alter table lessons_learned enable row level security;
alter table roadmaps enable row level security;
alter table roadmap_nodes enable row level security;
alter table entity_links enable row level security;
alter table activity_log enable row level security;

-- Policies
create policy "Users can view own profile" on profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on profiles for update using (auth.uid() = id);
create policy "Users can insert own profile" on profiles for insert with check (auth.uid() = id);
create policy "Users can CRUD own notes" on notes for all using (auth.uid() = user_id);
create policy "Public notes are readable" on notes for select using (visibility = 'public');
create policy "Users can CRUD own reviews" on review_schedule for all using (auth.uid() = user_id);
create policy "Users can CRUD own bookmarks" on bookmarks for all using (auth.uid() = user_id);
create policy "Users can CRUD own projects" on projects for all using (auth.uid() = user_id);
create policy "Public projects are readable" on projects for select using (visibility = 'public');
create policy "Users can CRUD own project docs" on project_docs for all
  using (exists (select 1 from projects where projects.id = project_docs.project_id and projects.user_id = auth.uid()));
create policy "Public project docs are readable" on project_docs for select
  using (exists (select 1 from projects where projects.id = project_docs.project_id and projects.visibility = 'public'));
create policy "Users can CRUD own milestones" on project_milestones for all
  using (exists (select 1 from projects where projects.id = project_milestones.project_id and projects.user_id = auth.uid()));
create policy "Users can CRUD own lessons" on lessons_learned for all
  using (exists (select 1 from projects where projects.id = lessons_learned.project_id and projects.user_id = auth.uid()));
create policy "Users can CRUD own roadmaps" on roadmaps for all using (auth.uid() = user_id);
create policy "Users can CRUD own roadmap nodes" on roadmap_nodes for all
  using (exists (select 1 from roadmaps where roadmaps.id = roadmap_nodes.roadmap_id and roadmaps.user_id = auth.uid()));
create policy "Users can manage entity links" on entity_links for all using (true);
create policy "Users can CRUD own activity" on activity_log for all using (auth.uid() = user_id);

-- updated_at trigger
create or replace function update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger set_updated_at before update on profiles for each row execute function update_updated_at();
create trigger set_updated_at before update on notes for each row execute function update_updated_at();
create trigger set_updated_at before update on bookmarks for each row execute function update_updated_at();
create trigger set_updated_at before update on projects for each row execute function update_updated_at();
create trigger set_updated_at before update on project_docs for each row execute function update_updated_at();
create trigger set_updated_at before update on lessons_learned for each row execute function update_updated_at();
create trigger set_updated_at before update on roadmaps for each row execute function update_updated_at();
