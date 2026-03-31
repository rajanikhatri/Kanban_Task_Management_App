import { Grip, MoveHorizontal } from 'lucide-react';

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
      <div className="mb-5 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="flex items-center gap-2 text-sm font-medium text-slate-500">
            <Grip className="h-4 w-4" />
            Board View
          </p>
          <h2 className="mt-1 text-xl font-semibold text-slate-950">
            Move work from backlog to completion
          </h2>
        </div>

        <div className="inline-flex items-center gap-2 self-start rounded-full border border-slate-200 bg-white/80 px-3 py-2 text-sm text-slate-500 shadow-[0_18px_35px_-30px_rgba(15,23,42,0.35)]">
          <MoveHorizontal className="h-4 w-4" />
          Horizontal scroll keeps the board responsive on smaller screens.
        </div>
      </div>

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
