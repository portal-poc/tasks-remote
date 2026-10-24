import { Outlet, Route, Routes } from 'react-router';
import { Stack, Typography } from '@portal/ds';
import { TaskCreatePage } from '@/pages/create';
import { TaskDetailsPage } from '@/pages/details';
import { TaskListPage } from '@/pages/list';
import { QueryBoundary } from '@/shared/ui';

const RemoteLayout = () => (
  <Stack gap={2} sx={{ p: 2 }}>
    <Typography level="h3">Tasks</Typography>
    <QueryBoundary>
      <Outlet />
    </QueryBoundary>
  </Stack>
);

/**
 * One route tree for every mode. Relative paths only: integrated → under the host's `tasks/*`,
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
