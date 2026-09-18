import { ProjectStatus, TaskPriority, TaskStatus } from '@/types';
import {
  PROJECT_STATUS_LABELS,
  TASK_STATUS_LABELS,
  TASK_PRIORITY_LABELS,
} from '@/types';

const projectStatusClasses: Record<ProjectStatus, string> = {
  not_started: 'bg-slate-100 text-slate-600 border-slate-200',
  in_progress: 'bg-blue-50 text-blue-700 border-blue-200',
  completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

const taskStatusClasses: Record<TaskStatus, string> = {
  pending: 'bg-amber-50 text-amber-700 border-amber-200',
  in_progress: 'bg-blue-50 text-blue-700 border-blue-200',
  completed: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

const priorityClasses: Record<TaskPriority, string> = {
  low: 'bg-slate-100 text-slate-600 border-slate-200',
  medium: 'bg-amber-50 text-amber-700 border-amber-200',
  high: 'bg-red-50 text-red-700 border-red-200',
};

export function ProjectStatusBadge({ status }: { status: ProjectStatus }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${projectStatusClasses[status]}`}
    >
      {PROJECT_STATUS_LABELS[status]}
    </span>
  );
}

export function TaskStatusBadge({ status }: { status: TaskStatus }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${taskStatusClasses[status]}`}
    >
      {TASK_STATUS_LABELS[status]}
    </span>
  );
}

export function PriorityBadge({ priority }: { priority: TaskPriority }) {
  return (
    <span
      className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${priorityClasses[priority]}`}
    >
      {TASK_PRIORITY_LABELS[priority]}
    </span>
  );
}
