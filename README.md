# tasks-remote

Remote "tasks" (FSD 2.1, pages first). Exposes `./RemoteRoot`, `./RemoteBridge`, `./runtime`, `./preload`.

```sh
pnpm dev             # :5174 — serves remoteEntry for the host AND the standalone app
pnpm dev:standalone  # same, opens the standalone app
pnpm build && pnpm verify
```

Backend: PoC fake `fetch` with hard-coded data (`src/shared/api/fake-backend.ts`); delay via
`localStorage['portal.mock.delayMs']` (host demo panel). Runtime config: `public/config.json`.
