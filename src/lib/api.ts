import type { Project, Task, ProjectInput, TaskInput } from '@/types';
import { supabase } from '@/lib/supabase';

function throwIfError(error: { message: string } | null) {
  if (error) throw new Error(error.message);
}

// ---- Projects ----

export async function fetchProjects(): Promise<Project[]> {
  const { data, error } = await supabase
    .from('projects')
    .select('*')
    .order('created_at', { ascending: false });
  throwIfError(error);
  return data ?? [];
}

export async function fetchProjectById(id: string): Promise<Project | null> {
  const { data, error } = await supabase.from('projects').select('*').eq('id', id).maybeSingle();
  throwIfError(error);
  return data;
}

export async function createProject(input: ProjectInput): Promise<Project> {
  const { data, error } = await supabase.from('projects').insert(input).select().single();
  throwIfError(error);
  return data;
}

export async function updateProject(id: string, input: Partial<ProjectInput>): Promise<Project> {
  const { data, error } = await supabase.from('projects').update(input).eq('id', id).select().single();
  throwIfError(error);
  return data;
}

export async function deleteProject(id: string): Promise<void> {
  const { error } = await supabase.from('projects').delete().eq('id', id);
  throwIfError(error);
}

// ---- Tasks ----

export async function fetchTasksByProject(projectId: string): Promise<Task[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('project_id', projectId)
    .order('created_at', { ascending: false });
  throwIfError(error);
  return data ?? [];
}

export async function fetchAllTasks(): Promise<Task[]> {
  const { data, error } = await supabase
    .from('tasks')
    .select('*, projects(name)')
    .order('created_at', { ascending: false });
  throwIfError(error);
  return data ?? [];
}

export async function createTask(input: TaskInput): Promise<Task> {
  const { data, error } = await supabase.from('tasks').insert(input).select().single();
  throwIfError(error);
  return data;
}

export async function updateTask(id: string, input: Partial<TaskInput>): Promise<Task> {
  const { data, error } = await supabase.from('tasks').update(input).eq('id', id).select().single();
  throwIfError(error);
  return data;
}

export async function deleteTask(id: string): Promise<void> {
  const { error } = await supabase.from('tasks').delete().eq('id', id);
  throwIfError(error);
}
