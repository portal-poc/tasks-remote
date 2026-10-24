import type { TaskStatus } from './contracts';

export type TaskFilters = { status: TaskStatus | 'all' };

export const DEFAULT_TASK_FILTERS: TaskFilters = { status: 'all' };

/** Namespace first (`tasks`), then domain scope — readable in devtools. */
export const tasksKeys = {
  all: ['tasks'] as const,
  lists: () => [...tasksKeys.all, 'list'] as const,
  list: (filters: TaskFilters) => [...tasksKeys.lists(), filters] as const,
  details: () => [...tasksKeys.all, 'detail'] as const,
  detail: (taskId: string) => [...tasksKeys.details(), taskId] as const,
};
