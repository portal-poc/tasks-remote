import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { Activity, useState, ViewTransition } from 'react';
import { Link as RouterLink, useParams } from 'react-router';
import { Card, Link, Stack, Tab, TabList, Tabs, Typography } from '@portal-poc/ds';
import { usePageTitle } from '@portal-poc/platform-runtime';
import { useRealtimeEvent } from '@portal-poc/realtime';
import { BookmarkToggle } from '@/features/toggle-bookmark';
import { realtime, taskDetailsOptions } from '@/shared/api';

type DetailsTab = 'overview' | 'history';

export const TaskDetailsPage = () => {
  const { taskId = '' } = useParams();
  const { data: task } = useSuspenseQuery(taskDetailsOptions(taskId));
  usePageTitle(task.title);
  const queryClient = useQueryClient();
  // Granular: only this task's topic, for as long as this page is open.
  useRealtimeEvent(realtime, `task:${taskId}`, () => {
    void queryClient.invalidateQueries({ queryKey: taskDetailsOptions(taskId).queryKey });
  });
  const [tab, setTab] = useState<DetailsTab>('overview');

  const handleTabChange = (_event: unknown, value: string | number | null) => {
    setTab(value === 'history' ? 'history' : 'overview');
  };

  return (
    <Stack gap={2}>
      <Link component={RouterLink} to="..">
        ← All tasks
      </Link>
      <Stack direction="row" alignItems="center" gap={1}>
        <ViewTransition name={`tasks-task-${task.id}`}>
          <Typography level="h4">{task.title}</Typography>
        </ViewTransition>
        <BookmarkToggle task={task} />
      </Stack>
      <Tabs value={tab} onChange={handleTabChange}>
        <TabList>
          <Tab value="overview">Overview</Tab>
          <Tab value="history">History</Tab>
        </TabList>
      </Tabs>
      {/* Activity keeps the hidden tab's state (and pre-warms suspense queries inside it). */}
      <Activity mode={tab === 'overview' ? 'visible' : 'hidden'}>
        <Card>
          <Typography>{task.description}</Typography>
          <Typography level="body-sm">Status: {task.status}</Typography>
        </Card>
      </Activity>
      <Activity mode={tab === 'history' ? 'visible' : 'hidden'}>
        <Card>
          <Typography level="body-sm">Created {new Date(task.createdAt).toLocaleString()}</Typography>
        </Card>
      </Activity>
    </Stack>
  );
};
