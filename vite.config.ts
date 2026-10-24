import { createRemoteViteConfig } from '@portal/vite-config';

/**
 * DEMO ONLY: `DEMO_REQUIRE_ROUTER=^9.0.0` simulates a release built against a router major the host does not have yet
 * (shows the CI gate, the registry gate and the host's runtime fallback to the bridge build). Not part of the template.
 */
const demoRouterRange = process.env['DEMO_REQUIRE_ROUTER'];

// The MF section (name, exposes, shared, bridge variant) and the build tooling come from the platform preset.
export default createRemoteViteConfig({
  name: 'tasks',
  port: 5174,
  configUrl: import.meta.url,
  ...(demoRouterRange
    ? { unsafeSharedOverride: (shared) => ({ ...shared, 'react-router': { singleton: true, requiredVersion: demoRouterRange } }) }
    : {}),
});
