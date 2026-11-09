import type { Project, Task, ProjectInput, TaskInput } from '@/types';
import { supabase } from '@/lib/supabase';

const configuredApiUrl = (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, '');
const isLocalApiUrl = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?(?:\/|$)/i.test(configuredApiUrl ?? '');
const API_URL = import.meta.env.PROD && isLocalApiUrl ? '/api' : configuredApiUrl || '/api';

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const { data } = await supabase.auth.getSession();
  const token = data.session?.access_token;
  const url = API_URL === '/api' ? `${API_URL}${path}` : `${API_URL}/api${path}`;
  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null) as { error?: string } | null;
    throw new Error(body?.error || `Request failed with status ${response.status}`);
  }

  if (response.status === 204) return undefined as T;
  return response.json() as Promise<T>;
}

// ---- Projects ----

export async function fetchProjects(): Promise<Project[]> {
  return request<Project[]>('/projects');
}

export async function fetchProjectById(id: string): Promise<Project | null> {
  return request<Project>(`/projects/${id}`);
}

export async function createProject(input: ProjectInput): Promise<Project> {
  return request<Project>('/projects', { method: 'POST', body: JSON.stringify(input) });
}

export async function updateProject(id: string, input: Partial<ProjectInput>): Promise<Project> {
  return request<Project>(`/projects/${id}`, { method: 'PUT', body: JSON.stringify(input) });
}

export async function deleteProject(id: string): Promise<void> {
  return request<void>(`/projects/${id}`, { method: 'DELETE' });
}

// ---- Tasks ----

export async function fetchTasksByProject(projectId: string): Promise<Task[]> {
  return request<Task[]>(`/projects/${projectId}/tasks`);
}

export async function fetchAllTasks(): Promise<Task[]> {
  return request<Task[]>('/tasks');
}

export async function createTask(input: TaskInput): Promise<Task> {
  return request<Task>('/tasks', { method: 'POST', body: JSON.stringify(input) });
}

export async function updateTask(id: string, input: Partial<TaskInput>): Promise<Task> {
  return request<Task>(`/tasks/${id}`, { method: 'PUT', body: JSON.stringify(input) });
}

export async function deleteTask(id: string): Promise<void> {
  return request<void>(`/tasks/${id}`, { method: 'DELETE' });
}
