import { Plus } from 'lucide-react';

import { EmptyState } from '@/components/board/EmptyState';
import { TaskCard } from '@/components/board/TaskCard';
import type { BoardColumnConfig, Task } from '@/types/task';

interface ColumnProps {
  column: BoardColumnConfig;
  tasks: Task[];
}

export function Column({ column, tasks }: ColumnProps) {
  return (
    <section
      className={`flex w-[20rem] min-w-[20rem] flex-col gap-3 rounded-[1.8rem] border p-3 shadow-[var(--tf-shell-shadow)] ${column.tone.shell}`}
    >
      <header
        className={`flex items-center justify-between rounded-[1.35rem] border border-white/70 px-3.5 py-3 shadow-[0_18px_40px_-36px_rgba(15,23,42,0.32)] ${column.tone.header}`}
      >
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <span className={`h-2.5 w-2.5 rounded-full ${column.tone.dot}`} />
            <h2 className="text-sm font-semibold text-slate-950">{column.title}</h2>
            <span
              className={`inline-flex min-w-7 items-center justify-center rounded-full px-2 py-0.5 text-xs font-semibold ${column.tone.badge}`}
            >
              {tasks.length}
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-500">{column.hint}</p>
        </div>

        <button
          type="button"
          aria-label={`Add task to ${column.title}`}
          className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/80 bg-white/75 text-slate-500 transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_18px_30px_-22px_rgba(15,23,42,0.35)] ${column.tone.button}`}
        >
          <Plus className="h-4 w-4" />
        </button>
      </header>

      <div className="flex min-h-[26rem] flex-1 flex-col gap-3 rounded-[1.35rem] border border-white/60 bg-white/35 p-2.5">
        {tasks.length === 0 ? (
          <EmptyState className={column.tone.empty} />
        ) : (
          tasks.map((task) => <TaskCard key={task.id} task={task} />)
        )}
      </div>
    </section>
  );
}
