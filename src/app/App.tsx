import { Board } from '@/components/board/Board';
import { StatsBar } from '@/components/dashboard/StatsBar';
import { Navbar } from '@/components/layout/Navbar';
import { boardColumns } from '@/data/boardColumns';
import { mockTasks } from '@/data/mockTasks';
import { getBoardStats } from '@/lib/task-utils';

export default function App() {
  const stats = getBoardStats(mockTasks);
  const activeOwners = new Set(mockTasks.map((task) => task.assignee.name)).size;

  return (
    <div className="min-h-screen text-slate-900">
      <Navbar />
      <main className="mx-auto flex w-full max-w-[1600px] flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <section className="grid gap-4 rounded-[2rem] border border-white/70 bg-[var(--tf-app-surface)] p-6 shadow-[var(--tf-shell-shadow)] backdrop-blur-xl lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div className="max-w-3xl">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
              TaskFlow Workspace
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
              A clean Kanban board for focused, production-ready task management.
            </h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
              This rebuild keeps the exported design direction, but replaces the generated structure
              with reusable React components, typed data, and a Tailwind-first layout that is ready
              for drag-and-drop and backend integration.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="rounded-[1.5rem] bg-slate-950 px-5 py-4 text-white shadow-[0_24px_60px_-32px_rgba(15,23,42,0.9)]">
              <p className="text-xs font-medium uppercase tracking-[0.24em] text-slate-300">
                Active Owners
              </p>
              <p className="mt-1 text-3xl font-semibold">{activeOwners}</p>
            </div>

            <div className="rounded-[1.5rem] border border-amber-200/80 bg-amber-50/90 px-5 py-4 text-amber-950 shadow-[0_18px_45px_-34px_rgba(217,119,6,0.7)]">
              <p className="text-xs font-medium uppercase tracking-[0.24em] text-amber-700">
                Needs Attention
              </p>
              <p className="mt-1 text-3xl font-semibold">{stats.overdue}</p>
              <p className="text-xs text-amber-700">Overdue tasks</p>
            </div>
          </div>
        </section>

        <StatsBar stats={stats} />
        <Board columns={boardColumns} tasks={mockTasks} />
      </main>
    </div>
  );
}
