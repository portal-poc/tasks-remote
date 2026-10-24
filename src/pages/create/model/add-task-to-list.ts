import type { Task } from '@/shared/api';

/** No cache → keep it absent: the list then honestly suspends with the delayed fallback. */
export const addTaskToList = (list: Task[] | undefined, task: Task): Task[] | undefined => {
  if (!list) {
    return list;
  }
  return [task, ...list];
};
