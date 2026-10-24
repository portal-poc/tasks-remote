import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { DEFAULT_TASK_FILTERS, taskSchema, tasksKeys, tasksListOptions, useTasksHttp } from '@/shared/api';
import type { CreateTaskInput } from '@/shared/api';
import { addTaskToList } from '../model/add-task-to-list';

/**
 * Create → redirect to a list that is being refetched: put the response into the list cache BEFORE navigating,
 * do not wait for invalidation. The mutation stays pending until navigation finishes (await navigate).
 */
export const useCreateTask = () => {
  const http = useTasksHttp();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (input: CreateTaskInput) => http.post('/tasks', taskSchema, { body: input }),
    onSuccess: async (task) => {
      // Only where the record surely belongs (first page, default sort); everything else is invalidated.
      queryClient.setQueryData(tasksListOptions(http, DEFAULT_TASK_FILTERS).queryKey, (prev) => addTaskToList(prev, task));
      void queryClient.invalidateQueries({ queryKey: tasksKeys.lists() });
      await navigate('..');
    },
  });
};
