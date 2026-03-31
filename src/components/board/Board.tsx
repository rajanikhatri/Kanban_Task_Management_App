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
  onDragStart: (event: DragStartEvent) => void;
  onDragCancel: () => void;
  onDragEnd: (event: DragEndEvent) => void;
}

export function Board({ columns, tasks, activeTask, onDragStart, onDragCancel, onDragEnd }: BoardProps) {
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
      <section className="rounded-[2rem] border border-white/70 bg-white/55 p-4 shadow-[var(--tf-shell-shadow)] backdrop-blur-xl sm:p-5">
        <div className="-mx-1 overflow-x-auto pb-2">
          <div className="flex min-w-max gap-5 px-1">
            {columns.map((column) => (
              <SortableContext
                key={column.id}
                items={tasksByStatus[column.id].map((task) => task.id)}
                strategy={verticalListSortingStrategy}
              >
                <Column column={column} tasks={tasksByStatus[column.id]} />
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
