import { queryOptions } from '@tanstack/react-query';
import type { HttpClient } from '@portal-poc/platform-runtime';
import { taskListSchema, taskSchema } from './contracts';
import { tasksKeys } from './query-keys';
import type { TaskFilters } from './query-keys';

/** Factories, not inline objects: `setQueryData(options.queryKey, …)` infers types through DataTag; preload-ready. */
export const tasksListOptions = (http: HttpClient, filters: TaskFilters) =>
  queryOptions({
    queryKey: tasksKeys.list(filters),
    queryFn: ({ signal }) =>
      http.get('/tasks', taskListSchema, { signal, query: { status: filters.status === 'all' ? undefined : filters.status } }),
  });

export const taskDetailsOptions = (http: HttpClient, taskId: string) =>
  queryOptions({
    queryKey: tasksKeys.detail(taskId),
    queryFn: ({ signal }) => http.get(`/tasks/${taskId}`, taskSchema, { signal }),
  });
