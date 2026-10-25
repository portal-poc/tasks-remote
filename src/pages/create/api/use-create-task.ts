import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useNavigate } from 'react-router';
import { parseResponse } from '@portal-poc/http';
import { DEFAULT_TASK_FILTERS, http, taskSchema, tasksKeys, tasksListOptions } from '@/shared/api';
import type { CreateTaskInput } from '@/shared/api';
import { addTaskToList } from '../model/add-task-to-list';

/**
 * Create → redirect to a list that is being refetched: put the response into the list cache BEFORE navigating,
 * do not wait for invalidation. The mutation stays pending until navigation finishes (await navigate).
 */
export const useCreateTask = () => {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (input: CreateTaskInput) => http.post('/tasks', input).then(parseResponse(taskSchema)),
    onSuccess: async (task) => {
      // Only where the record surely belongs (first page, default sort); everything else is invalidated.
      queryClient.setQueryData(tasksListOptions(DEFAULT_TASK_FILTERS).queryKey, (prev) => addTaskToList(prev, task));
      void queryClient.invalidateQueries({ queryKey: tasksKeys.lists() });
      await navigate('..');
    },
  });
};
