/*
# Create projects and tasks tables

## Purpose
This migration creates the core data model for a multi-user Project Management System.
Users can create projects, organize tasks within projects, track progress, and view
dashboard statistics. Each user only sees and manages their own data.

## New Tables

### projects
- `id` (uuid, primary key, auto-generated)
- `name` (text, not null) — project name
- `description` (text, nullable) — optional project description
- `status` (text, not null, default 'not_started') — one of: not_started, in_progress, completed
- `start_date` (date, nullable) — optional project start date
- `end_date` (date, nullable) — optional project end date
- `user_id` (uuid, not null, defaults to auth.uid()) — owner of the project, FK to auth.users
- `created_at` (timestamptz, default now()) — creation timestamp

### tasks
- `id` (uuid, primary key, auto-generated)
- `name` (text, not null) — task name
- `description` (text, nullable) — optional task description
- `priority` (text, not null, default 'medium') — one of: low, medium, high
- `status` (text, not null, default 'pending') — one of: pending, in_progress, completed
- `due_date` (date, nullable) — optional task due date
- `project_id` (uuid, not null) — FK to projects, ON DELETE CASCADE
- `user_id` (uuid, not null, defaults to auth.uid()) — owner of the task, FK to auth.users
- `created_at` (timestamptz, default now()) — creation timestamp

## Constraints
- `projects_status_check` — ensures status is one of the allowed enum values
- `tasks_priority_check` — ensures priority is one of the allowed enum values
- `tasks_status_check` — ensures status is one of the allowed enum values

## Indexes
- `idx_projects_user_id` — speeds up per-user project queries
- `idx_tasks_user_id` — speeds up per-user task queries
- `idx_tasks_project_id` — speeds up fetching tasks for a project

## Security (Row Level Security)
Both tables have RLS enabled with owner-scoped policies:
- SELECT: users can only read rows where user_id = auth.uid()
- INSERT: users can only insert rows where user_id = auth.uid() (enforced via WITH CHECK)
- UPDATE: users can only update rows they own (USING + WITH CHECK)
- DELETE: users can only delete rows they own (USING)
All policies are scoped TO authenticated.

## Important Notes
1. The `user_id` column on both tables defaults to `auth.uid()`, so frontend inserts
   that omit `user_id` will still satisfy the INSERT policy's WITH CHECK.
2. Tasks cascade-delete when their parent project is deleted.
3. Email/password auth is used (Supabase built-in). No custom auth tables.
4. Passwords are hashed by Supabase Auth (bcrypt-equivalent). Never stored in plain text.
*/

-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  status text NOT NULL DEFAULT 'not_started' CHECK (status IN ('not_started', 'in_progress', 'completed')),
  start_date date,
  end_date date,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  priority text NOT NULL DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  due_date date,
  project_id uuid NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id uuid NOT NULL DEFAULT auth.uid() REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Projects policies
DROP POLICY IF EXISTS "select_own_projects" ON projects;
CREATE POLICY "select_own_projects" ON projects FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_projects" ON projects;
CREATE POLICY "insert_own_projects" ON projects FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_projects" ON projects;
CREATE POLICY "update_own_projects" ON projects FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_projects" ON projects;
CREATE POLICY "delete_own_projects" ON projects FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Tasks policies
DROP POLICY IF EXISTS "select_own_tasks" ON tasks;
CREATE POLICY "select_own_tasks" ON tasks FOR SELECT
  TO authenticated USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "insert_own_tasks" ON tasks;
CREATE POLICY "insert_own_tasks" ON tasks FOR INSERT
  TO authenticated WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "update_own_tasks" ON tasks;
CREATE POLICY "update_own_tasks" ON tasks FOR UPDATE
  TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "delete_own_tasks" ON tasks;
CREATE POLICY "delete_own_tasks" ON tasks FOR DELETE
  TO authenticated USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_project_id ON tasks(project_id);