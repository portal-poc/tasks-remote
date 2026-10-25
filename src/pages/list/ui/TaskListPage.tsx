import { useQueryClient } from '@tanstack/react-query';
import { useState, useTransition } from 'react';
import { Link as RouterLink } from 'react-router';
import { Button, Option, PendingRegion, Select, Stack } from '@portal-poc/ds';
import { usePageTitle } from '@portal-poc/platform-runtime';
import { useRealtimeEvent } from '@portal-poc/realtime';
import { DEFAULT_TASK_FILTERS, insertTaskFromColleague, realtime, tasksKeys } from '@/shared/api';
import type { TaskFilters } from '@/shared/api';
import { QueryBoundary } from '@/shared/ui';
import { ForbiddenScopeDemo } from './ForbiddenScopeDemo';
import { TaskList } from './TaskList';

const STATUSES: TaskFilters['status'][] = ['all', 'todo', 'in-progress', 'done'];

export const TaskListPage = () => {
  usePageTitle('All tasks');
  const [filters, setFilters] = useState(DEFAULT_TASK_FILTERS);
  const [isPending, startTransition] = useTransition();
  const queryClient = useQueryClient();

  // Key change in a transition: the old list stays on screen instead of the Suspense fallback.
  const handleStatusChange = (_event: unknown, status: TaskFilters['status'] | null) => {
    if (status) {
      startTransition(() => {
        setFilters({ status });
      });
    }
  };

  // Subscribed while the list is on screen: a change anywhere (another user, another tab) refetches the list.
  useRealtimeEvent(realtime, 'tasks', () => {
    void queryClient.invalidateQueries({ queryKey: tasksKeys.lists() });
  });


  return (
    <Stack gap={2}>
      <Stack direction="row" gap={1} alignItems="center" flexWrap="wrap">
        <Select value={filters.status} onChange={handleStatusChange} sx={{ minWidth: 160 }}>
          {STATUSES.map((status) => (
            <Option key={status} value={status}>
              {status}
            </Option>
          ))}
        </Select>
        <Button component={RouterLink} to="new">
          New task
        </Button>
        {/* The fake BFF pushes the new task to every subscribed socket: the realtime event refreshes the list. */}
        <Button variant="plain" onClick={insertTaskFromColleague}>
          Simulate colleague's task
        </Button>
        <ForbiddenScopeDemo />
      </Stack>
      <PendingRegion isPending={isPending}>
        <QueryBoundary>
          <TaskList filters={filters} />
        </QueryBoundary>
      </PendingRegion>
    </Stack>
  );
};
