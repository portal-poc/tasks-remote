import { describe, expect, it } from 'vitest';
import type { Task } from '@/shared/api';
import { addTaskToList } from './add-task-to-list';

const task = (id: string): Task => ({ id, title: id, description: '', status: 'todo', createdAt: '', bookmarked: false });

describe('addTaskToList', () => {
  it('prepends the created task to a cached list', () => {
    expect(addTaskToList([task('1')], task('2'))?.map((item) => item.id)).toEqual(['2', '1']);
  });

  it('keeps an absent cache absent', () => {
    expect(addTaskToList(undefined, task('2'))).toBeUndefined();
  });
});
