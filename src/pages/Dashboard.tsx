import { useEffect, useState, FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { fetchProjects, fetchAllTasks, createTask, updateTask, deleteTask } from '@/lib/api';
import type { Project, Task, TaskInput, TaskPriority, TaskStatus } from '@/types';
import { SectionSpinner } from '@/components/ui/Spinner';
import { ProjectStatusBadge, TaskStatusBadge, PriorityBadge } from '@/components/ui/Badges';
import {
  FolderKanban,
  CheckCircle2,
  Clock,
  TrendingUp,
  ListTodo,
  ArrowRight,
  Pencil,
  Trash2,
} from 'lucide-react';

interface DashboardStats {
  totalProjects: number;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  projectsInProgress: number;
}

export function DashboardPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const [p, t] = await Promise.all([fetchProjects(), fetchAllTasks()]);
        setProjects(p);
        setTasks(t);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load data');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <SectionSpinner />;
  if (error) {
    return (
      <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
        {error}
      </div>
    );
  }

  const stats: DashboardStats = {
    totalProjects: projects.length,
    totalTasks: tasks.length,
    completedTasks: tasks.filter((t) => t.status === 'completed').length,
    pendingTasks: tasks.filter((t) => t.status === 'pending').length,
    projectsInProgress: projects.filter((p) => p.status === 'in_progress').length,
  };

  const completionRate =
    stats.totalTasks > 0
      ? Math.round((stats.completedTasks / stats.totalTasks) * 100)
      : 0;

  const recentProjects = projects.slice(0, 4);
  const recentTasks = tasks.slice(0, 5);

  const statCards = [
    {
      label: 'Total Projects',
      value: stats.totalProjects,
      icon: FolderKanban,
      color: 'bg-slate-900',
      bg: 'bg-slate-50',
    },
    {
      label: 'Total Tasks',
      value: stats.totalTasks,
      icon: ListTodo,
      color: 'bg-blue-600',
      bg: 'bg-blue-50',
    },
    {
      label: 'Completed Tasks',
      value: stats.completedTasks,
      icon: CheckCircle2,
      color: 'bg-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      label: 'Pending Tasks',
      value: stats.pendingTasks,
      icon: Clock,
      color: 'bg-amber-500',
      bg: 'bg-amber-50',
    },
    {
      label: 'Projects In Progress',
      value: stats.projectsInProgress,
      icon: TrendingUp,
      color: 'bg-indigo-600',
      bg: 'bg-indigo-50',
    },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
        <p className="text-slate-500 mt-1 text-sm">Overview of your projects and tasks</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="bg-white rounded-xl border border-slate-200 p-5 hover:shadow-md transition-shadow"
          >
            <div className={`inline-flex items-center justify-center w-10 h-10 rounded-lg ${card.bg} mb-3`}>
              <card.icon className={`w-5 h-5 ${card.color.replace('bg-', 'text-')}`} />
            </div>
            <p className="text-3xl font-bold text-slate-900">{card.value}</p>
            <p className="text-sm text-slate-500 mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* Completion rate */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-base font-semibold text-slate-900">Task Completion Rate</h2>
          <span className="text-2xl font-bold text-slate-900">{completionRate}%</span>
        </div>
        <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${completionRate}%` }}
          />
        </div>
        <p className="text-sm text-slate-500 mt-2">
          {stats.completedTasks} of {stats.totalTasks} tasks completed
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent projects */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-slate-900">Recent Projects</h2>
            <Link
              to="/projects"
              className="text-sm text-slate-500 hover:text-slate-900 flex items-center gap-1 transition-colors"
            >
              View all <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          {recentProjects.length === 0 ? (
            <p className="text-sm text-slate-400 py-8 text-center">No projects yet</p>
          ) : (
            <div className="space-y-3">
              {recentProjects.map((project) => (
                <Link
                  key={project.id}
                  to={`/projects/${project.id}`}
                  className="flex items-center justify-between p-3 rounded-lg border border-slate-100 hover:border-slate-300 hover:bg-slate-50 transition-all"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-900 truncate">{project.name}</p>
                    <p className="text-xs text-slate-400 mt-0.5">
                      {new Date(project.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <ProjectStatusBadge status={project.status} />
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Recent tasks */}
        <div className="bg-white rounded-xl border border-slate-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-slate-900">Recent Tasks</h2>
            <div className="flex items-center gap-2">
              <button onClick={() => setShowCreateTask(true)} className="inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-lg bg-slate-900 text-white hover:bg-slate-800">
                <ListTodo className="w-4 h-4" /> Add Task
              </button>
            </div>
          </div>
          {recentTasks.length === 0 ? (
            <p className="text-sm text-slate-400 py-8 text-center">No tasks yet</p>
          ) : (
            <div className="space-y-3">
              {recentTasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-slate-100"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-slate-900 truncate">{task.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <PriorityBadge priority={task.priority} />
                      <span className="text-xs text-slate-400">
                        {(task as Task & { projects?: { name: string } }).projects?.name ?? ''}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setEditingTask(task)}
                      title="Edit task"
                      className="p-1.5 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-50"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={async () => {
                        if (!confirm('Delete this task?')) return;
                        try {
                          await deleteTask(task.id);
                          const t = await fetchAllTasks();
                          setTasks(t);
                        } catch (err) {
                          setError(err instanceof Error ? err.message : 'Failed to delete task');
                        }
                      }}
                      title="Delete task"
                      className="p-1.5 rounded-md text-slate-400 hover:text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    <TaskStatusBadge status={task.status} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      {showCreateTask && (
        <TaskFormModal
          projects={projects}
          onClose={() => setShowCreateTask(false)}
          onSaved={async () => {
            setShowCreateTask(false);
            const t = await fetchAllTasks();
            setTasks(t);
          }}
        />
      )}

      {editingTask && (
        <TaskFormModal
          projects={projects}
          task={editingTask}
          onClose={() => setEditingTask(null)}
          onSaved={async () => {
            setEditingTask(null);
            const t = await fetchAllTasks();
            setTasks(t);
          }}
        />
      )}
    </div>
  );
}

// ---- Task Form Modal (for dashboard overview) ----
function TaskFormModal({
  projects,
  task,
  onClose,
  onSaved,
}: {
  projects: Project[];
  task?: Task;
  onClose: () => void;
  onSaved: () => void;
}) {
  const isEdit = !!task;
  const [name, setName] = useState(task?.name ?? '');
  const [description, setDescription] = useState(task?.description ?? '');
  const [priority, setPriority] = useState<TaskPriority>(task?.priority ?? 'medium');
  const [status, setStatus] = useState<TaskStatus>(task?.status ?? 'pending');
  const [dueDate, setDueDate] = useState(task?.due_date ?? '');
  const [projectId, setProjectId] = useState<string>(task?.project_id ?? projects[0]?.id ?? '');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  useEffect(() => {
    if (task) {
      setName(task.name ?? '');
      setDescription(task.description ?? '');
      setPriority(task.priority ?? 'medium');
      setStatus(task.status ?? 'pending');
      setDueDate(task.due_date ?? '');
      setProjectId(task.project_id ?? projects[0]?.id ?? '');
    }
  }, [task, projects]);

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Task name is required';
    if (!projectId) e.projectId = 'Select a project';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;
    setLoading(true);
    try {
      const input: TaskInput = {
        name: name.trim(),
        description: description.trim() || null,
        priority,
        status,
        due_date: dueDate || null,
        project_id: projectId,
      };
      if (isEdit && task) {
        await updateTask(task.id, input);
      } else {
        await createTask(input);
      }
      await onSaved();
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      {/* Modal wrapper from existing UI components */}
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        <div className="absolute inset-0 bg-slate-900/40" onClick={onClose} />
        <div className="relative bg-white rounded-xl border border-slate-200 p-6 w-full max-w-md">
          <h3 className="text-lg font-semibold mb-4">Create New Task</h3>
          {serverError && (
            <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{serverError}</div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Task Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} className="mt-1 w-full px-3 py-2 border rounded-lg" />
              {errors.name && <p className="text-xs text-red-600 mt-1">{errors.name}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Project</label>
              <select value={projectId} onChange={(e) => setProjectId(e.target.value)} className="mt-1 w-full px-3 py-2 border rounded-lg">
                <option value="">Select project</option>
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
              {errors.projectId && <p className="text-xs text-red-600 mt-1">{errors.projectId}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="mt-1 w-full px-3 py-2 border rounded-lg" rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <select value={priority} onChange={(e) => setPriority(e.target.value as TaskPriority)} className="px-3 py-2 border rounded-lg">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
              <select value={status} onChange={(e) => setStatus(e.target.value as TaskStatus)} className="px-3 py-2 border rounded-lg">
                <option value="pending">Pending</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Due Date</label>
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="mt-1 w-full px-3 py-2 border rounded-lg" />
            </div>
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose} className="flex-1 px-3 py-2 border rounded-lg">Cancel</button>
              <button type="submit" disabled={loading} className="flex-1 px-3 py-2 bg-slate-900 text-white rounded-lg disabled:opacity-50">
                {loading ? 'Saving...' : isEdit ? 'Save Changes' : 'Create Task'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
