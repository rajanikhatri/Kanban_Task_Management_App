import { Column } from '@/components/board/Column';
import { groupTasksByStatus } from '@/lib/task-utils';
import type { BoardColumnConfig, Task } from '@/types/task';

interface BoardProps {
  columns: BoardColumnConfig[];
  tasks: Task[];
}

export function Board({ columns, tasks }: BoardProps) {
  const tasksByStatus = groupTasksByStatus(tasks);

  return (
    <section className="rounded-[2rem] border border-white/70 bg-white/55 p-4 shadow-[var(--tf-shell-shadow)] backdrop-blur-xl sm:p-5">
      <div className="-mx-1 overflow-x-auto pb-2">
        <div className="flex min-w-max gap-5 px-1">
          {columns.map((column) => (
            <Column key={column.id} column={column} tasks={tasksByStatus[column.id]} />
          ))}
        </div>
      </div>
    </section>
  );
}
