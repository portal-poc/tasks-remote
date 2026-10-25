import type { RealtimeSocket } from '@portal-poc/realtime';

/**
 * PoC stand-in for tasks-bff's WebSocket endpoint, the same protocol a real one speaks: the first frame authorizes
 * (a mock token; anything else closes with 4401), then `subscribe` / `unsubscribe` per topic, then `event` frames for
 * subscribed topics only. Events published in one tab reach the sockets of every tab (BroadcastChannel): the way a
 * real BFF pushes a colleague's change to everybody.
 */
type Frame = { type: 'auth'; token: string } | { type: 'subscribe' | 'unsubscribe'; topic: string };
type TaskEvent = { topic: string; data: unknown };

const CHANNEL = 'portal.mock.tasks-bff.ws';
const TOKEN_REJECTED = 4401;

const sockets = new Set<FakeTasksSocket>();
const channel = typeof BroadcastChannel === 'undefined' ? null : new BroadcastChannel(CHANNEL);

const deliver = (event: TaskEvent) => {
  for (const socket of sockets) {
    socket.push(event);
  }
};

channel?.addEventListener('message', (message: MessageEvent<TaskEvent>) => deliver(message.data));

type Listeners = { open: Array<() => void>; message: Array<(event: { data: unknown }) => void>; close: Array<(event: { code: number }) => void> };

class FakeTasksSocket implements RealtimeSocket {
  private readonly listeners: Listeners = { open: [], message: [], close: [] };
  private readonly topics = new Set<string>();
  private authorized = false;
  private closed = false;

  constructor() {
    sockets.add(this);
    setTimeout(() => this.listeners.open.forEach((listener) => listener()), 50);
  }

  readonly addEventListener = ((type: keyof Listeners, listener: unknown) => {
    (this.listeners[type] as unknown[]).push(listener);
  }) as RealtimeSocket['addEventListener'];

  send(data: string) {
    const frame = JSON.parse(data) as Frame;
    if (frame.type === 'auth') {
      if (!frame.token.startsWith('mock.')) {
        this.close(TOKEN_REJECTED);
        return;
      }
      this.authorized = true;
      this.reply({ type: 'ready' });
    } else if (this.authorized && frame.type === 'subscribe') {
      this.topics.add(frame.topic);
    } else if (frame.type === 'unsubscribe') {
      this.topics.delete(frame.topic);
    }
  }

  close(code = 1000) {
    if (this.closed) {
      return;
    }
    this.closed = true;
    sockets.delete(this);
    setTimeout(() => this.listeners.close.forEach((listener) => listener({ code })), 0);
  }

  /** Server push: only topics this socket subscribed to. */
  push(event: TaskEvent) {
    if (this.authorized && this.topics.has(event.topic)) {
      this.reply({ type: 'event', ...event });
    }
  }

  private reply(frame: object) {
    setTimeout(() => this.listeners.message.forEach((listener) => listener({ data: JSON.stringify(frame) })), 0);
  }
}

export const createFakeTasksSocket = (_url: string): RealtimeSocket => new FakeTasksSocket();

/** The fake BFF announces a change: thin events (ids), the apps refetch what they show. */
export const publishTaskChanged = (taskId: string) => {
  for (const event of [
    { topic: 'tasks', data: { type: 'task.changed', taskId } },
    { topic: `task:${taskId}`, data: { type: 'task.changed', taskId } },
  ]) {
    deliver(event);
    // BroadcastChannel is same-origin by definition: no targetOrigin.
    // oxlint-disable-next-line unicorn/require-post-message-target-origin
    channel?.postMessage(event);
  }
};
