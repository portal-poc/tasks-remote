import { afterEach, describe, expect, it, vi } from 'vitest';
import { createMockPlatformAuth, createPortalQueryClient, createStandalonePlatform } from '@portal-poc/platform-runtime';
import { REMOTE_NAME } from '../config';
import { remotePlatform } from './http';
import { taskDetailsOptions, tasksListOptions } from './tasks-queries';

const setup = () => {
  const config = { environments: { test: { bffBaseUrl: 'https://tasks-bff.test/api', scopes: ['api://tasks-bff/Tasks.ReadWrite'] } } };
  // config.json is the only thing fetched directly; the BFF calls go through axios' fetch adapter.
  vi.stubGlobal('fetch', vi.fn(async () => Response.json(config)));
  localStorage.setItem('portal.mock.delayMs', '0');
  remotePlatform.bind(
    createStandalonePlatform({
      appName: REMOTE_NAME,
      env: { name: 'test', hostOrigin: 'http://localhost' },
      auth: createMockPlatformAuth(),
      devtools: false,
    }).platform,
  );
  return createPortalQueryClient();
};

/** The data layer without React: the real axios client (bearer token, params, zod parsing) against the fake BFF. */
describe('tasks queries', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('filters the list by status (query params)', async () => {
    const tasks = await setup().fetchQuery(tasksListOptions({ status: 'done' }));

    expect(tasks.map((task) => task.status)).toEqual(['done']);
  });

  it('loads one task', async () => {
    const task = await setup().fetchQuery(taskDetailsOptions('2'));

    expect(task.title).toBe('Approve credit limit change');
  });
});
