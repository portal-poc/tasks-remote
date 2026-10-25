import { queryOptions } from '@tanstack/react-query';
import { parseResponse } from '@portal-poc/http';
import { taskListSchema, taskSchema } from './contracts';
import { http } from './http';
import { tasksKeys } from './query-keys';
import type { TaskFilters } from './query-keys';

/** Factories, not inline objects: `setQueryData(options.queryKey, …)` infers types through DataTag; preload-ready. */
export const tasksListOptions = (filters: TaskFilters) =>
  queryOptions({
    queryKey: tasksKeys.list(filters),
    queryFn: ({ signal }) =>
      http
        .get('/tasks', { signal, params: { status: filters.status === 'all' ? undefined : filters.status } })
        .then(parseResponse(taskListSchema)),
  });

export const taskDetailsOptions = (taskId: string) =>
  queryOptions({
    queryKey: tasksKeys.detail(taskId),
    queryFn: ({ signal }) => http.get(`/tasks/${taskId}`, { signal }).then(parseResponse(taskSchema)),
  });
