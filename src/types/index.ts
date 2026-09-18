export type ProjectStatus = 'not_started' | 'in_progress' | 'completed';
export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskStatus = 'pending' | 'in_progress' | 'completed';

export interface Project {
  id: string;
  name: string;
  description: string | null;
  status: ProjectStatus;
  start_date: string | null;
  end_date: string | null;
  user_id: string;
  created_at: string;
}

export interface Task {
  id: string;
  name: string;
  description: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  due_date: string | null;
  project_id: string;
  user_id: string;
  created_at: string;
}

export interface ProjectInput {
  name: string;
  description?: string | null;
  status: ProjectStatus;
  start_date?: string | null;
  end_date?: string | null;
}

export interface TaskInput {
  name: string;
  description?: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  due_date?: string | null;
  project_id: string;
}

export const PROJECT_STATUS_LABELS: Record<ProjectStatus, string> = {
  not_started: 'Not Started',
  in_progress: 'In Progress',
  completed: 'Completed',
};

export const TASK_STATUS_LABELS: Record<TaskStatus, string> = {
  pending: 'Pending',
  in_progress: 'In Progress',
  completed: 'Completed',
};

export const TASK_PRIORITY_LABELS: Record<TaskPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

export const PROJECT_STATUS_OPTIONS = Object.entries(PROJECT_STATUS_LABELS).map(
  ([value, label]) => ({ value, label })
);

export const TASK_STATUS_OPTIONS = Object.entries(TASK_STATUS_LABELS).map(
  ([value, label]) => ({ value, label })
);

export const TASK_PRIORITY_OPTIONS = Object.entries(TASK_PRIORITY_LABELS).map(
  ([value, label]) => ({ value, label })
);
