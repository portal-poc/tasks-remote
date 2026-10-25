import { create } from 'axios';
import { attachPlatformAuth, createPlatformBinding } from '@portal-poc/http';
import { getRemoteEnvConfig, REMOTE_NAME } from '../config';
import { fakeTasksFetch } from './fake-backend';

/** The platform this remote is mounted with: bound by `RemoteRoot` (every mode) and `preload`. */
export const remotePlatform = createPlatformBinding(REMOTE_NAME);

/**
 * The remote's http client: a module-level axios instance bound to the host's login (bearer token per request, retry
 * after 401, login through the host). Import it anywhere; the BFF address and scopes come from `config.json`.
 * PoC: every environment is answered by the fake tasks-bff (a fake `fetch` behind axios' fetch adapter).
 */
export const http = attachPlatformAuth(create({ timeout: 15_000, adapter: 'fetch', env: { fetch: fakeTasksFetch } }), {
  platform: remotePlatform.get,
  target: async () => {
    const { bffBaseUrl, scopes } = await getRemoteEnvConfig(remotePlatform.get().env.name);
    return { baseUrl: bffBaseUrl, scopes };
  },
  clientVersion: `${REMOTE_NAME}@${PORTAL_APP_VERSION}`,
});
