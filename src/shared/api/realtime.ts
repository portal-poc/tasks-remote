import { createRealtimeClient } from '@portal-poc/realtime';
import { getRemoteEnvConfig, REMOTE_NAME } from '../config';
import { createFakeTasksSocket } from './fake-realtime';
import { remotePlatform } from './http';
import { tasksKeys } from './query-keys';
import { getRemoteQueryClient } from './query-client';

/**
 * Our realtime connection to tasks-bff (`@portal-poc/realtime`): one socket, authorized with the host's login, open
 * while a page of ours subscribes to something. Events are thin ("task 42 changed"): pages invalidate their own
 * queries. PoC: the fake BFF socket answers (like the fake fetch behind axios).
 */
export const realtime = createRealtimeClient({
  platform: remotePlatform.get,
  target: async () => {
    const { realtimeUrl, scopes } = await getRemoteEnvConfig(remotePlatform.get().env.name);
    if (!realtimeUrl) {
      throw new Error(`${REMOTE_NAME}: no realtimeUrl for environment "${remotePlatform.get().env.name}"`);
    }
    return { url: realtimeUrl, scopes };
  },
  createSocket: createFakeTasksSocket,
  // Disconnected for a while: whatever changed meanwhile is refetched.
  onReconnect: () => {
    void getRemoteQueryClient(remotePlatform.get()).invalidateQueries({ queryKey: tasksKeys.all });
  },
});
