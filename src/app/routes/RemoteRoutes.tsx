import { Outlet, Route, Routes } from 'react-router';
import { Chip, Stack, Typography } from '@portal-poc/ds';
import { useRealtimeSnapshot } from '@portal-poc/realtime';
import { TaskCreatePage } from '@/pages/create';
import { TaskDetailsPage } from '@/pages/details';
import { TaskListPage } from '@/pages/list';
import { realtime } from '@/shared/api';
import { QueryBoundary } from '@/shared/ui';

const STATE_COLOR = { idle: 'neutral', connecting: 'warning', open: 'success', reconnecting: 'warning' } as const;

/** Our socket to tasks-bff: open only while a page subscribes, with exactly the topics pages asked for. */
const RealtimeIndicator = () => {
  const { state, topics } = useRealtimeSnapshot(realtime);
  return (
    <Chip size="sm" variant="soft" color={STATE_COLOR[state]}>
      realtime: {state}
      {topics.length > 0 ? ` · ${topics.join(', ')}` : ''}
    </Chip>
  );
};

const RemoteLayout = () => (
  <Stack gap={2} sx={{ p: 2 }}>
    <Stack direction="row" gap={2} alignItems="center">
      <Typography level="h3">Tasks</Typography>
      <RealtimeIndicator />
    </Stack>
    <QueryBoundary>
      <Outlet />
    </QueryBoundary>
  </Stack>
);

/**
 * One route tree for every mode. Relative paths only: integrated → under the host's `<name>/*` route,
 * standalone → own data router at `/`, bridge → own data router with `platform.bridge.basename`.
 */
export const RemoteRoutes = () => (
  <Routes>
    <Route element={<RemoteLayout />}>
      <Route index element={<TaskListPage />} />
      <Route path="new" element={<TaskCreatePage />} />
      <Route path=":taskId" element={<TaskDetailsPage />} />
    </Route>
  </Routes>
);
