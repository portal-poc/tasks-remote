import babel from '@rolldown/plugin-babel';
import { federation } from '@module-federation/vite';
import { createSharedConfig, REMOTE_EXPOSES, toBridgeRemoteName } from '@portal/mf-shared';
import react, { reactCompilerPreset } from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';

const PORT = 5174;
const REMOTE_NAME = 'tasks';

/**
 * DEMO ONLY: `DEMO_REQUIRE_ROUTER=^9.0.0` simulates a release built against a router major the host does not have yet
 * (shows the CI gate, the registry gate and the host's runtime fallback to the bridge build). Not part of the template.
 */
const demoRouterRange = process.env['DEMO_REQUIRE_ROUTER'];
const sharedConfig = demoRouterRange
  ? { ...createSharedConfig(), 'react-router': { singleton: true as const, requiredVersion: demoRouterRange } }
  : createSharedConfig();

/**
 * Module Federation section = integration contract (name, exposes, shared). Everything else is internal.
 * `--mode bridge` builds the isolated variant (no shared deps, own React/router/DS) into `dist-bridge`.
 */
export default defineConfig(({ mode }) => ({
  base: './',
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  server: { port: PORT, origin: `http://localhost:${PORT}`, cors: true },
  preview: { port: PORT, cors: true },
  build: { target: 'es2023', outDir: mode === 'bridge' ? 'dist-bridge' : 'dist' },
  plugins: [
    react(),
    babel({ presets: [reactCompilerPreset()] }),
    federation({
      name: mode === 'bridge' ? toBridgeRemoteName(REMOTE_NAME) : REMOTE_NAME,
      filename: 'remoteEntry.js',
      manifest: true,
      dts: false,
      exposes: {
        [REMOTE_EXPOSES.RemoteRoot]: './src/app/exposes/RemoteRoot.tsx',
        [REMOTE_EXPOSES.RemoteBridge]: './src/app/exposes/RemoteBridge.tsx',
        [REMOTE_EXPOSES.runtime]: './src/app/exposes/runtime.ts',
        [REMOTE_EXPOSES.preload]: './src/app/exposes/preload.ts',
      },
      shared: mode === 'bridge' ? {} : sharedConfig,
    }),
  ],
}));
