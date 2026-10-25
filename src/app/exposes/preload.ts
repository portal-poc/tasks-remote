import { matchPath } from 'react-router';
import type { PlatformContract } from '@portal-poc/platform-contract';
import { DEFAULT_TASK_FILTERS, getRemoteQueryClient, remotePlatform, taskDetailsOptions, tasksListOptions } from '@/shared/api';

/**
 * `./preload` (section 13): the host calls it when the user is about to open one of our pages (hover / focus on a
 * link), with the path inside this remote. We prefetch what that page shows first into THE QueryClient RemoteRoot
 * uses (one `query-client` module for both exposes), so the click renders from cache instead of waiting.
 * Keep it tiny: the query factories and the http client only, no UI.
 */
export const preload = async (platform: PlatformContract, { path }: { path: string }): Promise<void> => {
  // May run before RemoteRoot mounts: the http client needs the platform already.
  remotePlatform.bind(platform);
  const queryClient = getRemoteQueryClient(platform);
  // Mirrors RemoteRoutes: index → the list with default filters, `:taskId` → the task (not `new`, a form).
  if (matchPath({ path: '/', end: true }, path)) {
    await queryClient.prefetchQuery(tasksListOptions(DEFAULT_TASK_FILTERS));
    return;
  }
  const details = matchPath('/:taskId', path);
  if (details?.params.taskId && details.params.taskId !== 'new') {
    await queryClient.prefetchQuery(taskDetailsOptions(details.params.taskId));
  }
};
