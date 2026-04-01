import {
  closestCorners,
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';

import { Column } from '@/components/board/Column';
import { TaskCard } from '@/components/board/TaskCard';
import { groupTasksByStatus } from '@/lib/task-utils';
import type { BoardColumnConfig, Task } from '@/types/task';

interface BoardProps {
  columns: BoardColumnConfig[];
  tasks: Task[];
  activeTask: Task | null;
  onEditTask: (task: Task) => void;
  onDeleteTask: (taskId: string) => Promise<void>;
  emptyStateTitle?: string;
  emptyStateDescription?: string;
  onDragStart: (event: DragStartEvent) => void;
  onDragCancel: () => void;
  onDragEnd: (event: DragEndEvent) => void;
}

export function Board({
  columns,
  tasks,
  activeTask,
  onEditTask,
  onDeleteTask,
  emptyStateTitle,
  emptyStateDescription,
  onDragStart,
  onDragCancel,
  onDragEnd,
}: BoardProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 6,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );
  const tasksByStatus = groupTasksByStatus(tasks);

  return (
    <DndContext
      collisionDetection={closestCorners}
      sensors={sensors}
      onDragStart={onDragStart}
      onDragCancel={onDragCancel}
      onDragEnd={onDragEnd}
    >
      <section className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.72),rgba(244,247,252,0.92))] p-4 shadow-[0_26px_80px_-52px_rgba(15,23,42,0.42),inset_0_1px_0_rgba(255,255,255,0.78)] backdrop-blur-xl sm:p-5">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-white/45 via-white/12 to-transparent" />
        <div className="relative -mx-1 overflow-x-auto pb-2">
          <div className="flex min-w-max gap-5 px-1">
            {columns.map((column) => (
              <SortableContext
                key={column.id}
                items={tasksByStatus[column.id].map((task) => task.id)}
                strategy={verticalListSortingStrategy}
              >
                <Column
                  column={column}
                  tasks={tasksByStatus[column.id]}
                  onEditTask={onEditTask}
                  onDeleteTask={onDeleteTask}
                  emptyStateTitle={emptyStateTitle}
                  emptyStateDescription={emptyStateDescription}
                />
              </SortableContext>
            ))}
          </div>
        </div>
      </section>

      <DragOverlay>
        {activeTask ? <TaskCard task={activeTask} isDragOverlay /> : null}
      </DragOverlay>
    </DndContext>
  );
}
