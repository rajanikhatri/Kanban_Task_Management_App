import { LayoutDashboard, Plus } from 'lucide-react';

interface NavbarProps {
  onNewTaskClick: () => void;
  newTaskDisabled?: boolean;
}

export function Navbar({ onNewTaskClick, newTaskDisabled = false }: NavbarProps) {
  return (
    <header className="sticky top-0 z-20 border-b border-white/70 bg-white/80 backdrop-blur-xl">
      <div className="mx-auto flex w-full max-w-[1600px] items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 via-sky-500 to-violet-600 text-white shadow-[0_22px_45px_-24px_rgba(79,70,229,0.9)]">
            <LayoutDashboard className="h-5 w-5" />
          </div>

          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-slate-400">
              TaskFlow
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-lg font-semibold text-slate-950 sm:text-xl">Kanban Workspace</h2>
              <span className="hidden rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-500 sm:inline-flex">
                Product launch sprint
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={onNewTaskClick}
          disabled={newTaskDisabled}
          className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-2.5 text-sm font-medium text-white shadow-[0_20px_40px_-28px_rgba(15,23,42,0.9)] transition duration-200 hover:-translate-y-0.5 hover:bg-indigo-600 hover:shadow-[0_26px_55px_-25px_rgba(79,70,229,0.75)] disabled:cursor-not-allowed disabled:translate-y-0 disabled:bg-slate-300 disabled:text-slate-100 disabled:shadow-none"
        >
          <Plus className="h-4 w-4" />
          New Task
        </button>
      </div>
    </header>
  );
}
