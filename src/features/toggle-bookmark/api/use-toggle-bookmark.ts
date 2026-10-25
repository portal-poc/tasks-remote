import { useMutation, useQueryClient } from '@tanstack/react-query';
import { bookmarksChanged, publishEvent } from '@portal-poc/events';
import { CORRELATION_ID_HEADER } from '@portal-poc/http';
import { usePlatform } from '@portal-poc/platform-runtime';
import { http, taskDetailsOptions, tasksKeys } from '@/shared/api';
import type { Task } from '@/shared/api';
import { REMOTE_NAME } from '@/shared/config';

type ToggleVariables = { task: Task; bookmarked: boolean };

const setBookmarked = (taskId: string, bookmarked: boolean) => (task: Task) =>
  task.id === taskId ? { ...task, bookmarked } : task;

export const useToggleBookmark = () => {
  const queryClient = useQueryClient();
  const platform = usePlatform();

  return useMutation({
    mutationFn: async ({ task, bookmarked }: ToggleVariables) => {
      // Our own id (not the generated one): the event below carries it, so the host can correlate.
      const correlationId = crypto.randomUUID();
      const path = `/bookmarks/${task.id}`;
      const headers = { [CORRELATION_ID_HEADER]: correlationId };
      await (bookmarked ? http.put(path, undefined, { headers }) : http.delete(path, { headers }));
      return { taskId: task.id, bookmarked, correlationId };
    },
    onSuccess: ({ taskId, bookmarked, correlationId }) => {
      const update = setBookmarked(taskId, bookmarked);
      // Own UI: update the cache right away.
      queryClient.setQueriesData<Task[]>({ queryKey: tasksKeys.lists() }, (list) => list?.map(update));
      queryClient.setQueryData(taskDetailsOptions(taskId).queryKey, (task) => (task ? update(task) : task));
      // Other apps (host bookmarks widget) react through the local platform bus: an event of the catalog, validated.
      publishEvent(platform, bookmarksChanged, { source: REMOTE_NAME, correlationId });
    },
  });
};
