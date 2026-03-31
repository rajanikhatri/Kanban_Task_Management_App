import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { TaskCard } from '@/components/board/TaskCard';
import type { Task } from '@/types/task';

interface SortableTaskCardProps {
  task: Task;
}

export function SortableTaskCard({ task }: SortableTaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: {
      type: 'task',
      taskId: task.id,
      status: task.status,
    },
  });

  return (
    <TaskCard
      task={task}
      cardRef={setNodeRef}
      dragProps={{ ...attributes, ...listeners }}
      dragStyle={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
      isDragging={isDragging}
    />
  );
}
