import { IconButton } from '@portal/ds';
import type { Task } from '@/shared/api';
import { useToggleBookmark } from '../api/use-toggle-bookmark';

export const BookmarkToggle = ({ task }: { task: Task }) => {
  const toggle = useToggleBookmark();
  const handleClick = () => {
    toggle.mutate({ task, bookmarked: !task.bookmarked });
  };
  return (
    <IconButton
      variant="plain"
      disabled={toggle.isPending}
      onClick={handleClick}
      aria-pressed={task.bookmarked}
      aria-label={task.bookmarked ? 'Remove bookmark' : 'Add bookmark'}
    >
      {task.bookmarked ? '★' : '☆'}
    </IconButton>
  );
};
