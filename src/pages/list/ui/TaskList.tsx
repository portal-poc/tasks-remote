import { useSuspenseQuery } from '@tanstack/react-query';
import { useDeferredValue, ViewTransition } from 'react';
import { Link as RouterLink } from 'react-router';
import { Chip, Link, List, ListItem, Typography } from '@portal-poc/ds';
import { BookmarkToggle } from '@/features/toggle-bookmark';
import { tasksListOptions, useRemoteHttp } from '@/shared/api';
import type { TaskFilters } from '@/shared/api';

/**
 * TanStack Query updates arrive through useSyncExternalStore (sync, not a transition) and would not animate.
 * `useDeferredValue` turns them into a transition, so new rows from a background refetch animate in.
 */
export const TaskList = ({ filters }: { filters: TaskFilters }) => {
  const http = useRemoteHttp();
  const { data } = useSuspenseQuery(tasksListOptions(http, filters));
  const tasks = useDeferredValue(data);

  if (tasks.length === 0) {
    return <Typography level="body-sm">No tasks.</Typography>;
  }
  return (
    <List>
      {tasks.map((task) => (
        <ViewTransition key={task.id} enter="tasks-item-enter" exit="tasks-item-exit" default="none">
          <ListItem endAction={<BookmarkToggle task={task} />}>
            <Link component={RouterLink} to={task.id}>
              {/* Shared element: names are document-wide, so they carry the remote prefix. */}
              <ViewTransition name={`tasks-task-${task.id}`}>
                <span>{task.title}</span>
              </ViewTransition>
            </Link>
            <Chip size="sm" variant="soft">
              {task.status}
            </Chip>
          </ListItem>
        </ViewTransition>
      ))}
    </List>
  );
};
