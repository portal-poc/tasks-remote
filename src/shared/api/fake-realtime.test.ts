import { describe, expect, it, vi } from 'vitest';
import type { PlatformContract } from '@portal-poc/platform-contract';
import { createRealtimeClient } from '@portal-poc/realtime';
import { createFakeTasksSocket, publishTaskChanged } from './fake-realtime';

const platformWithToken = (token: string) =>
  ({
    auth: { getAccessToken: vi.fn(async () => token), subscribe: () => () => {} },
    telemetry: { logError: vi.fn(), trackEvent: vi.fn() },
  }) as unknown as PlatformContract;

const clientFor = (platform: PlatformContract) =>
  createRealtimeClient({
    platform: () => platform,
    target: () => ({ url: 'wss://tasks-bff.local/ws', scopes: ['api://tasks-bff/Tasks.ReadWrite'] }),
    createSocket: createFakeTasksSocket,
  });

describe('fake tasks-bff socket + @portal-poc/realtime', () => {
  it('pushes a task change to the list topic and to that task only', async () => {
    const client = clientFor(platformWithToken('mock.abc'));
    const list = vi.fn();
    const task7 = vi.fn();
    const task8 = vi.fn();
    client.subscribe('tasks', list);
    client.subscribe('task:7', task7);
    client.subscribe('task:8', task8);
    await vi.waitFor(() => expect(client.getSnapshot().state).toBe('open'));

    publishTaskChanged('7');

    await vi.waitFor(() => expect(list).toHaveBeenCalledWith({ type: 'task.changed', taskId: '7' }));
    await vi.waitFor(() => expect(task7).toHaveBeenCalledOnce());
    expect(task8).not.toHaveBeenCalled();
  });

  it('rejects a socket without a valid token (4401) and keeps retrying', async () => {
    const client = clientFor(platformWithToken('not-a-token'));
    client.subscribe('tasks', vi.fn());

    await vi.waitFor(() => expect(client.getSnapshot().state).toBe('reconnecting'));
  });
});
