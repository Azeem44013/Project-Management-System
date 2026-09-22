import { useEffect, useState, useMemo, useCallback, FormEvent } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  fetchProjectById,
  fetchTasksByProject,
  createTask,
  updateTask,
  deleteTask,
  updateProject,
  deleteProject,
} from '@/lib/api';
import type { Project, Task, TaskPriority, TaskStatus, TaskInput, ProjectStatus } from '@/types';
import {
  PROJECT_STATUS_OPTIONS,
  TASK_STATUS_OPTIONS,
  TASK_PRIORITY_OPTIONS,
} from '@/types';
import { SectionSpinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Form';
import { Modal } from '@/components/ui/Modal';
import { ProjectStatusBadge, TaskStatusBadge, PriorityBadge } from '@/components/ui/Badges';
import {
  ArrowLeft,
  Plus,
  Search,
  Trash2,
  Pencil,
  CheckCircle2,
  Circle,
  CircleDashed,
  Calendar,
  AlertCircle,
} from 'lucide-react';

export function ProjectDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [showEditProject, setShowEditProject] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError('');
    try {
      const [p, t] = await Promise.all([fetchProjectById(id), fetchTasksByProject(id)]);
      if (!p) {
        setError('Project not found');
        return;
      }
      setProject(p);
      setTasks(t);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load project');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    load();
  }, [load]);

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      const matchesSearch = t.name.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
      const matchesPriority = priorityFilter === 'all' || t.priority === priorityFilter;
      return matchesSearch && matchesStatus && matchesPriority;
    });
  }, [tasks, search, statusFilter, priorityFilter]);

  const completedCount = tasks.filter((t) => t.status === 'completed').length;
  const progress = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  const handleDeleteProject = async () => {
    if (!project) return;
    if (!confirm('Delete this project and all its tasks? This cannot be undone.')) return;
    try {
      await deleteProject(project.id);
      navigate('/projects');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete project');
    }
  };

  const handleToggleTaskStatus = async (task: Task) => {
    const nextStatus: TaskStatus =
      task.status === 'completed' ? 'pending' : task.status === 'pending' ? 'in_progress' : 'completed';
    try {
      const updated = await updateTask(task.id, { status: nextStatus });
      setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update task');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm('Delete this task?')) return;
    try {
      await deleteTask(taskId);
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete task');
    }
  };

  if (loading) return <SectionSpinner />;
  if (error && !project) {
    return (
      <div className="space-y-4">
        <Link to="/projects" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900">
          <ArrowLeft className="w-4 h-4" /> Back to Projects
        </Link>
        <div className="px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      </div>
    );
  }
  if (!project) return null;

  return (
    <div className="space-y-6">
      <Link to="/projects" className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 transition-colors">
        <ArrowLeft className="w-4 h-4" /> Back to Projects
      </Link>

      {error && (
        <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Project header */}
      <div className="bg-white rounded-xl border border-slate-200 p-6">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold text-slate-900">{project.name}</h1>
              <ProjectStatusBadge status={project.status} />
            </div>
            <p className="text-sm text-slate-500">{project.description || 'No description'}</p>
            <div className="flex items-center gap-4 mt-3 text-xs text-slate-400">
              {project.start_date && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> Start: {new Date(project.start_date).toLocaleDateString()}
                </span>
              )}
              {project.end_date && (
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" /> End: {new Date(project.end_date).toLocaleDateString()}
                </span>
              )}
              <span>Created: {new Date(project.created_at).toLocaleDateString()}</span>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="secondary" size="sm" onClick={() => setShowEditProject(true)}>
              <Pencil className="w-4 h-4" /> Edit
            </Button>
            <Button variant="danger" size="sm" onClick={handleDeleteProject}>
              <Trash2 className="w-4 h-4" /> Delete
            </Button>
          </div>
        </div>

        {/* Progress bar */}
        {tasks.length > 0 && (
          <div className="mt-6 pt-4 border-t border-slate-100">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-700">Progress</span>
              <span className="text-sm text-slate-500">
                {completedCount}/{tasks.length} tasks completed ({progress}%)
              </span>
            </div>
            <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Tasks section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <h2 className="text-lg font-semibold text-slate-900">Tasks</h2>
          <Button size="sm" onClick={() => setShowCreateTask(true)}>
            <Plus className="w-4 h-4" /> Add Task
          </Button>
        </div>

        {/* Search & filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search tasks by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent"
          >
            <option value="all">All Statuses</option>
            {TASK_STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-3.5 py-2.5 text-sm rounded-lg border border-slate-300 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-slate-400 focus:border-transparent"
          >
            <option value="all">All Priorities</option>
            {TASK_PRIORITY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {/* Task list */}
        {filteredTasks.length === 0 ? (
          <div className="bg-white rounded-xl border border-slate-200 p-12 text-center">
            <h3 className="text-base font-semibold text-slate-900">
              {search || statusFilter !== 'all' || priorityFilter !== 'all'
                ? 'No tasks found'
                : 'No tasks yet'}
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              {search || statusFilter !== 'all' || priorityFilter !== 'all'
                ? 'Try adjusting your filters'
                : 'Add a task to get started'}
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredTasks.map((task) => (
              <div
                key={task.id}
                className="group bg-white rounded-xl border border-slate-200 p-4 hover:border-slate-300 transition-all"
              >
                <div className="flex items-start gap-3">
                  <button
                    onClick={() => handleToggleTaskStatus(task)}
                    className="mt-0.5 flex-shrink-0"
                    title="Cycle status"
                  >
                    {task.status === 'completed' ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 hover:text-emerald-600" />
                    ) : task.status === 'in_progress' ? (
                      <CircleDashed className="w-5 h-5 text-blue-500 hover:text-blue-600" />
                    ) : (
                      <Circle className="w-5 h-5 text-slate-300 hover:text-slate-400" />
                    )}
                  </button>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p
                          className={`text-sm font-medium ${
                            task.status === 'completed' ? 'text-slate-400 line-through' : 'text-slate-900'
                          }`}
                        >
                          {task.name}
                        </p>
                        {task.description && (
                          <p className="text-sm text-slate-500 mt-0.5 line-clamp-1">
                            {task.description}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button
                          onClick={() => setEditingTask(task)}
                          className="p-1.5 rounded-lg text-slate-300 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                          title="Edit task"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="p-1.5 rounded-lg text-slate-300 hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Delete task"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <PriorityBadge priority={task.priority} />
                      <TaskStatusBadge status={task.status} />
                      {task.due_date && (
                        <span className="flex items-center gap-1 text-xs text-slate-400">
                          <Calendar className="w-3.5 h-3.5" />
                          Due: {new Date(task.due_date).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showCreateTask && project && (
        <TaskFormModal
          projectId={project.id}
          onClose={() => setShowCreateTask(false)}
          onSaved={() => {
            setShowCreateTask(false);
            load();
          }}
        />
      )}

      {editingTask && (
        <TaskFormModal
          projectId={project.id}
          task={editingTask}
          onClose={() => setEditingTask(null)}
          onSaved={() => {
            setEditingTask(null);
            load();
          }}
        />
      )}

      {showEditProject && project && (
        <EditProjectModal
          project={project}
          onClose={() => setShowEditProject(false)}
          onSaved={() => {
            setShowEditProject(false);
            load();
          }}
        />
      )}
    </div>
  );
}

// ---- Task Form Modal ----

function TaskFormModal({
  projectId,
  task,
  onClose,
  onSaved,
}: {
  projectId: string;
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
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Task name is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
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
      onSaved();
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Failed to save task');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open onClose={onClose} title={isEdit ? 'Edit Task' : 'Create New Task'}>
      {serverError && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {serverError}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Task Name"
          name="name"
          placeholder="Enter task name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
        />
        <Textarea
          label="Description"
          name="description"
          placeholder="Enter task description"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <div className="grid grid-cols-2 gap-4">
          <Select
            label="Priority"
            name="priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as TaskPriority)}
          >
            {TASK_PRIORITY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Select>
          <Select
            label="Status"
            name="status"
            value={status}
            onChange={(e) => setStatus(e.target.value as TaskStatus)}
          >
            {TASK_STATUS_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </Select>
        </div>
        <Input
          label="Due Date"
          name="dueDate"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />
        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" loading={loading} className="flex-1">
            {isEdit ? 'Save Changes' : 'Create Task'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}

// ---- Edit Project Modal ----

function EditProjectModal({
  project,
  onClose,
  onSaved,
}: {
  project: Project;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [name, setName] = useState(project.name);
  const [description, setDescription] = useState(project.description ?? '');
  const [status, setStatus] = useState<ProjectStatus>(project.status);
  const [startDate, setStartDate] = useState(project.start_date ?? '');
  const [endDate, setEndDate] = useState(project.end_date ?? '');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [serverError, setServerError] = useState('');

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = 'Project name is required';
    if (startDate && endDate && new Date(endDate) < new Date(startDate)) {
      e.endDate = 'End date cannot be before start date';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setServerError('');
    if (!validate()) return;
    setLoading(true);
    try {
      await updateProject(project.id, {
        name: name.trim(),
        description: description.trim() || null,
        status,
        start_date: startDate || null,
        end_date: endDate || null,
      });
      onSaved();
    } catch (err) {
      setServerError(err instanceof Error ? err.message : 'Failed to update project');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open onClose={onClose} title="Edit Project">
      {serverError && (
        <div className="mb-4 px-4 py-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {serverError}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="Project Name"
          name="name"
          placeholder="Enter project name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          error={errors.name}
        />
        <Textarea
          label="Description"
          name="description"
          placeholder="Enter project description"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
        <Select
          label="Status"
          name="status"
          value={status}
          onChange={(e) => setStatus(e.target.value as ProjectStatus)}
        >
          {PROJECT_STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </Select>
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Start Date"
            name="startDate"
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
          <Input
            label="End Date"
            name="endDate"
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            error={errors.endDate}
          />
        </div>
        <div className="flex gap-3 pt-2">
          <Button type="button" variant="secondary" onClick={onClose} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" loading={loading} className="flex-1">
            Save Changes
          </Button>
        </div>
      </form>
    </Modal>
  );
}
