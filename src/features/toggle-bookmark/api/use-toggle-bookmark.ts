import { useMutation, useQueryClient } from '@tanstack/react-query';
import { z } from 'zod';
import { usePlatformEvents } from '@portal/platform-runtime';
import { taskDetailsOptions, tasksKeys, useTasksHttp } from '@/shared/api';
import type { Task } from '@/shared/api';
import { REMOTE_NAME } from '@/shared/config';

type ToggleVariables = { task: Task; bookmarked: boolean };

const setBookmarked = (taskId: string, bookmarked: boolean) => (task: Task) =>
  task.id === taskId ? { ...task, bookmarked } : task;

export const useToggleBookmark = () => {
  const http = useTasksHttp();
  const queryClient = useQueryClient();
  const events = usePlatformEvents();

  return useMutation({
    mutationFn: async ({ task, bookmarked }: ToggleVariables) => {
      const correlationId = crypto.randomUUID();
      const path = `/bookmarks/${task.id}`;
      const options = { correlationId };
      await (bookmarked ? http.put(path, z.undefined(), options) : http.delete(path, z.undefined(), options));
      return { taskId: task.id, bookmarked, correlationId };
    },
    onSuccess: ({ taskId, bookmarked, correlationId }) => {
      const update = setBookmarked(taskId, bookmarked);
      // Own UI: update the cache right away.
      queryClient.setQueriesData<Task[]>({ queryKey: tasksKeys.lists() }, (list) => list?.map(update));
      queryClient.setQueryData(taskDetailsOptions(http, taskId).queryKey, (task) => (task ? update(task) : task));
      // Other apps (host bookmarks widget) react through the local platform bus.
      events.emit('bookmarks.changed', { source: REMOTE_NAME, correlationId });
    },
  });
};
