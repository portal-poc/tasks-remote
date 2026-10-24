import type { CreateTaskInput, Task } from './contracts';

/**
 * PoC stand-in for tasks-bff: a fake `fetch` injected into the real http client (bearer + zod still run).
 * Hard-coded data; delay from the host demo panel (`localStorage['portal.mock.delayMs']`).
 * Bookmarks live in localStorage so the host widget (host-bff stand-in) sees them too.
 */
type StoredTask = Omit<Task, 'bookmarked'>;

export type StoredBookmark = { taskId: string; title: string; path: string };

const DELAY_KEY = 'portal.mock.delayMs';
const BOOKMARKS_KEY = 'portal.mock.bookmarks';

const tasks: StoredTask[] = [
  { id: '3', title: 'Review KYC escalation', description: 'Check documents of the flagged client.', status: 'in-progress', createdAt: '2026-10-20T09:00:00Z' },
  { id: '2', title: 'Approve credit limit change', description: 'Corporate client, +15%.', status: 'todo', createdAt: '2026-10-19T12:30:00Z' },
  { id: '1', title: 'Close quarterly report', description: 'Q3 numbers are final.', status: 'done', createdAt: '2026-10-18T08:15:00Z' },
];

const readDelay = (): number => {
  try {
    return Number(localStorage.getItem(DELAY_KEY) ?? 400) || 0;
  } catch {
    return 400;
  }
};

const readUserId = (authorization: string | null): string | null => {
  const token = authorization?.replace(/^Bearer /, '');
  if (!token?.startsWith('mock.')) {
    return null;
  }
  try {
    const payload: unknown = JSON.parse(atob(token.slice(5).replaceAll('-', '+').replaceAll('_', '/')));
    return typeof payload === 'object' && payload !== null && 'sub' in payload ? String(payload.sub) : null;
  } catch {
    return null;
  }
};

const bookmarksKey = (userId: string) => `${BOOKMARKS_KEY}.${userId}`;

export const readBookmarks = (userId: string): StoredBookmark[] => {
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(bookmarksKey(userId)) ?? '[]');
    return Array.isArray(parsed) ? (parsed as StoredBookmark[]) : [];
  } catch {
    return [];
  }
};

const writeBookmarks = (userId: string, bookmarks: StoredBookmark[]) => {
  localStorage.setItem(bookmarksKey(userId), JSON.stringify(bookmarks));
};

const withBookmark = (userId: string) => (task: StoredTask): Task => ({
  ...task,
  bookmarked: readBookmarks(userId).some((bookmark) => bookmark.taskId === task.id),
});

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json' } });

const sleep = (ms: number, signal: AbortSignal | null | undefined) =>
  new Promise<void>((resolve, reject) => {
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener('abort', () => {
      clearTimeout(timer);
      reject(new DOMException('Aborted', 'AbortError'));
    });
  });

/** Simulates a task created by someone else (scenario 5: arrives through a background refetch). */
export const insertTaskFromColleague = () => {
  const id = String(Date.now());
  tasks.unshift({ id, title: `Colleague task #${id.slice(-4)}`, description: 'Created elsewhere.', status: 'todo', createdAt: new Date().toISOString() });
};

const createTask = (input: CreateTaskInput): StoredTask => {
  const task = { ...input, id: String(Date.now()), createdAt: new Date().toISOString() };
  tasks.unshift(task);
  return task;
};

const toggleBookmark = (userId: string, taskId: string, bookmarked: boolean) => {
  const task = tasks.find((candidate) => candidate.id === taskId);
  const rest = readBookmarks(userId).filter((bookmark) => bookmark.taskId !== taskId);
  writeBookmarks(userId, bookmarked && task ? [...rest, { taskId, title: task.title, path: `/tasks/${taskId}` }] : rest);
};

const route = async (method: string, url: URL, userId: string, body: unknown): Promise<Response> => {
  const decorate = withBookmark(userId);
  const [, resource, id] = url.pathname.replace(/^\/api/, '').split('/');
  if (resource === 'tasks' && method === 'GET' && !id) {
    const status = url.searchParams.get('status');
    return json(tasks.filter((task) => !status || task.status === status).map(decorate));
  }
  if (resource === 'tasks' && method === 'GET' && id) {
    const task = tasks.find((candidate) => candidate.id === id);
    return task ? json(decorate(task)) : json({ error: 'not found' }, 404);
  }
  if (resource === 'tasks' && method === 'POST') {
    return json(decorate(createTask(body as CreateTaskInput)), 201);
  }
  if (resource === 'bookmarks' && id && (method === 'PUT' || method === 'DELETE')) {
    toggleBookmark(userId, id, method === 'PUT');
    return new Response(null, { status: 204 });
  }
  return json({ error: 'not found' }, 404);
};

export const fakeTasksFetch: typeof fetch = async (input, init) => {
  const request = new Request(input, init);
  await sleep(readDelay(), init?.signal);
  const userId = readUserId(request.headers.get('authorization'));
  if (!userId) {
    return json({ error: 'unauthorized' }, 401);
  }
  const body: unknown = request.method === 'GET' ? undefined : await request.json().catch(() => undefined);
  return route(request.method, new URL(request.url), userId, body);
};
