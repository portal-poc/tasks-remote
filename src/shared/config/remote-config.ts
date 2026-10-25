import { z } from 'zod';

export const REMOTE_NAME = 'tasks';

const remoteConfigSchema = z.object({
  environments: z.record(
    z.string(),
    z.object({
      bffBaseUrl: z.url(),
      /** The BFF's WebSocket endpoint (`@portal-poc/realtime`); same token scopes as the http client. */
      realtimeUrl: z.url().optional(),
      scopes: z.array(z.string()).min(1),
    }),
  ),
});

type RemoteEnvConfig = z.output<typeof remoteConfigSchema>['environments'][string];

/**
 * Runtime config: built once, deployed to any stand. `config.json` ships inside the remote's immutable version folder
 * (`<nexus>/<name>/<version>/config.json`) and holds every environment keyed by `platform.env.name`.
 * Built chunks live in `assets/`, hence `../`; the dev server serves it from the root.
 */
const CONFIG_URL = import.meta.env.DEV ? '/config.json' : '../config.json';

const loadEnvConfig = async (envName: string): Promise<RemoteEnvConfig> => {
  const url = new URL(/* @vite-ignore */ CONFIG_URL, import.meta.url);
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`${REMOTE_NAME}: ${url.href} → HTTP ${response.status}`);
  }
  const envConfig = remoteConfigSchema.parse(await response.json()).environments[envName];
  if (!envConfig) {
    throw new Error(`${REMOTE_NAME}: no runtime config for environment "${envName}"`);
  }
  return envConfig;
};

const envConfigs = new Map<string, Promise<RemoteEnvConfig>>();

/** The config of one environment (`platform.env.name`), loaded once. */
export const getRemoteEnvConfig = (envName: string): Promise<RemoteEnvConfig> => {
  let promise = envConfigs.get(envName);
  if (!promise) {
    promise = loadEnvConfig(envName);
    envConfigs.set(envName, promise);
  }
  return promise;
};
