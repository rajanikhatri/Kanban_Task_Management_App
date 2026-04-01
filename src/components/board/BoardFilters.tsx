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
  const hasSearchQuery = Boolean(filters.searchQuery.trim());
  const hasPriorityFilter = filters.priority !== 'all';
  const hasStatusFilter = filters.status !== 'all';
  const taskCountLabel = hasActiveFilters
    ? `Showing ${visibleTaskCount} of ${totalTaskCount} tasks`
    : `${totalTaskCount} ${totalTaskCount === 1 ? 'task' : 'tasks'} on this board`;
  const baseControlClassName =
    'w-full rounded-2xl border bg-white/85 text-sm outline-none transition-[border-color,background-color,box-shadow,transform,color] duration-200 ease-out hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white focus:border-slate-300 focus:ring-2 focus:ring-slate-200/80';

  return (
    <section className="rounded-[2rem] border border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.78),rgba(244,247,252,0.92))] p-4 shadow-[0_24px_60px_-42px_rgba(15,23,42,0.32),inset_0_1px_0_rgba(255,255,255,0.75)] backdrop-blur-xl sm:p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="grid flex-1 gap-3 md:grid-cols-[minmax(0,1.4fr)_minmax(0,220px)_minmax(0,220px)]">
          <label className="relative block">
            <span className="sr-only">Search tasks</span>
            <Search
              className={`pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 transition duration-200 ${
                hasSearchQuery ? 'text-sky-500' : 'text-slate-400'
              }`}
            />
            <input
              type="search"
              value={filters.searchQuery}
              onChange={(event) => onSearchQueryChange(event.target.value)}
              placeholder="Search tasks"
              className={`${baseControlClassName} py-3 pl-11 pr-4 text-slate-950 placeholder:text-slate-400 ${
                hasSearchQuery
                  ? 'border-sky-200 bg-sky-50/80 shadow-[0_18px_34px_-26px_rgba(14,165,233,0.24)] focus:border-sky-300 focus:ring-sky-100/90'
                  : 'border-slate-200'
              }`}
            />
          </label>

          <label className="relative block">
            <span className="sr-only">Filter by priority</span>
            <Flag
              className={`pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 transition duration-200 ${
                hasPriorityFilter ? 'text-indigo-500' : 'text-slate-400'
              }`}
            />
            <select
              value={filters.priority}
              onChange={(event) => onPriorityChange(event.target.value as TaskPriorityFilter)}
              className={`${baseControlClassName} appearance-none py-3 pl-11 pr-10 ${
                hasPriorityFilter
                  ? 'border-indigo-200 bg-indigo-50/80 text-indigo-700 shadow-[0_18px_34px_-26px_rgba(79,70,229,0.22)] focus:border-indigo-300 focus:ring-indigo-100/90'
                  : 'border-slate-200 text-slate-700'
              }`}
            >
              <option value="all">All priorities</option>
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
            <ChevronDown
              className={`pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 transition duration-200 ${
                hasPriorityFilter ? 'text-indigo-500' : 'text-slate-400'
              }`}
            />
          </label>

          <label className="relative block">
            <span className="sr-only">Filter by status</span>
            <Layers3
              className={`pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 transition duration-200 ${
                hasStatusFilter ? 'text-violet-500' : 'text-slate-400'
              }`}
            />
            <select
              value={filters.status}
              onChange={(event) => onStatusChange(event.target.value as TaskStatusFilter)}
              className={`${baseControlClassName} appearance-none py-3 pl-11 pr-10 ${
                hasStatusFilter
                  ? 'border-violet-200 bg-violet-50/80 text-violet-700 shadow-[0_18px_34px_-26px_rgba(139,92,246,0.22)] focus:border-violet-300 focus:ring-violet-100/90'
                  : 'border-slate-200 text-slate-700'
              }`}
            >
              <option value="all">All statuses</option>
              {columns.map((column) => (
                <option key={column.id} value={column.id}>
                  {column.title}
                </option>
              ))}
            </select>
            <ChevronDown
              className={`pointer-events-none absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 transition duration-200 ${
                hasStatusFilter ? 'text-violet-500' : 'text-slate-400'
              }`}
            />
          </label>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between lg:flex-col lg:items-end lg:justify-center">
          <p className="rounded-full border border-white/70 bg-white/70 px-3 py-1.5 text-sm text-slate-500 shadow-[0_16px_32px_-26px_rgba(15,23,42,0.18)]">
            {taskCountLabel}
          </p>

          {hasActiveFilters ? (
            <button
              type="button"
              onClick={onReset}
              className="inline-flex items-center gap-2 self-start rounded-2xl border border-slate-200 bg-white/85 px-3.5 py-2 text-sm font-medium text-slate-600 transition-[transform,box-shadow,border-color,background-color,color] duration-200 ease-out hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white hover:text-slate-950 hover:shadow-[0_18px_30px_-22px_rgba(15,23,42,0.24)] sm:self-auto"
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
