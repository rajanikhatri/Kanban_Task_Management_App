import { ChevronDown, Flag, Layers3, Search, X } from 'lucide-react';

import type { BoardColumnConfig, TaskFilters, TaskPriorityFilter, TaskStatusFilter } from '@/types/task';

interface BoardFiltersProps {
  columns: BoardColumnConfig[];
  filters: TaskFilters;
  totalTaskCount: number;
  visibleTaskCount: number;
  hasActiveFilters: boolean;
  onSearchQueryChange: (value: string) => void;
  onPriorityChange: (value: TaskPriorityFilter) => void;
  onStatusChange: (value: TaskStatusFilter) => void;
  onReset: () => void;
}

export function BoardFilters({
  columns,
  filters,
  totalTaskCount,
  visibleTaskCount,
  hasActiveFilters,
  onSearchQueryChange,
  onPriorityChange,
  onStatusChange,
  onReset,
}: BoardFiltersProps) {
  const taskCountLabel = hasActiveFilters
    ? `Showing ${visibleTaskCount} of ${totalTaskCount} tasks`
    : `${totalTaskCount} ${totalTaskCount === 1 ? 'task' : 'tasks'} on this board`;

  return (
    <section className="rounded-[2rem] border border-white/70 bg-white/55 p-4 shadow-[var(--tf-shell-shadow)] backdrop-blur-xl sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="grid flex-1 gap-3 md:grid-cols-[minmax(0,1.4fr)_minmax(0,220px)_minmax(0,220px)]">
          <label className="relative block">
            <span className="sr-only">Search tasks</span>
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              type="search"
              value={filters.searchQuery}
              onChange={(event) => onSearchQueryChange(event.target.value)}
              placeholder="Search tasks"
              className="w-full rounded-2xl border border-slate-200 bg-white/80 py-3 pl-11 pr-4 text-sm text-slate-950 outline-none transition duration-200 placeholder:text-slate-400 focus:border-slate-300 focus:ring-2 focus:ring-slate-200/80"
            />
          </label>

          <label className="relative block">
            <span className="sr-only">Filter by priority</span>
            <Flag className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <select
              value={filters.priority}
              onChange={(event) => onPriorityChange(event.target.value as TaskPriorityFilter)}
              className="w-full appearance-none rounded-2xl border border-slate-200 bg-white/80 py-3 pl-11 pr-10 text-sm text-slate-700 outline-none transition duration-200 focus:border-slate-300 focus:ring-2 focus:ring-slate-200/80"
            >
              <option value="all">All priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </label>

          <label className="relative block">
            <span className="sr-only">Filter by status</span>
            <Layers3 className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <select
              value={filters.status}
              onChange={(event) => onStatusChange(event.target.value as TaskStatusFilter)}
              className="w-full appearance-none rounded-2xl border border-slate-200 bg-white/80 py-3 pl-11 pr-10 text-sm text-slate-700 outline-none transition duration-200 focus:border-slate-300 focus:ring-2 focus:ring-slate-200/80"
            >
              <option value="all">All statuses</option>
              {columns.map((column) => (
                <option key={column.id} value={column.id}>
                  {column.title}
                </option>
              ))}
            </select>
            <ChevronDown className="pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          </label>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between lg:flex-col lg:items-end lg:justify-center">
          <p className="text-sm text-slate-500">{taskCountLabel}</p>

          {hasActiveFilters ? (
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-2 self-start rounded-2xl border border-slate-200 bg-white/80 px-3.5 py-2 text-sm font-medium text-slate-600 transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:text-slate-950 hover:shadow-[0_18px_30px_-22px_rgba(15,23,42,0.24)] sm:self-auto"
            >
              <X className="h-4 w-4" />
              Clear filters
            </button>
          ) : null}
        </div>
      </div>
    </section>
  );
}
