import { z } from 'zod';

/**
 * The single place where tasks-bff types/schemas live. Today: hand-written. Later: re-export from the backend's
 * generated package (`@portal-api/tasks-bff`) — only this file changes.
 */
const taskStatusSchema = z.enum(['todo', 'in-progress', 'done']);

export const taskSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  status: taskStatusSchema,
  createdAt: z.string(),
  bookmarked: z.boolean(),
});

export const taskListSchema = z.array(taskSchema);

export const createTaskInputSchema = z.object({
  title: z.string().trim().min(3, 'At least 3 characters'),
  description: z.string().max(500),
  status: taskStatusSchema,
});

export type Task = z.output<typeof taskSchema>;
export type TaskStatus = z.output<typeof taskStatusSchema>;
export type CreateTaskInput = z.output<typeof createTaskInputSchema>;
