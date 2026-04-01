import { useDeferredValue, useEffect, useState } from 'react';

import { Board } from '@/components/board/Board';
import { BoardFilters } from '@/components/board/BoardFilters';
import { StatsBar } from '@/components/dashboard/StatsBar';
import { Navbar } from '@/components/layout/Navbar';
import { NewTaskModal } from '@/components/tasks/NewTaskModal';
import { TaskDetailPanel } from '@/components/tasks/TaskDetailPanel';
import { boardColumns } from '@/data/boardColumns';
import { useBoardState } from '@/hooks/useBoardState';
import {
  filterTasks,
  getBoardStats,
  hasActiveTaskFilters,
  initialTaskFilters,
} from '@/lib/task-utils';
import type { Task, TaskFilters, TaskPriorityFilter, TaskStatusFilter } from '@/types/task';

export default function App() {
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [filters, setFilters] = useState<TaskFilters>(initialTaskFilters);
  const {
    tasks,
    activeTask,
    currentUserId,
    isLoading,
    error,
    taskMutationVersion,
    canManageTasks,
    refreshTasks,
    addTask,
    editTask,
    deleteTask,
    handleDragStart,
    handleDragCancel,
    handleDragEnd,
  } = useBoardState();
  const deferredSearchQuery = useDeferredValue(filters.searchQuery);
  const stats = getBoardStats(tasks);
  const filteredTasks = filterTasks(tasks, {
    ...filters,
    searchQuery: deferredSearchQuery,
  });
  const hasActiveFilters = hasActiveTaskFilters(filters);
  const selectedTask = selectedTaskId ? tasks.find((task) => task.id === selectedTaskId) ?? null : null;
  const shouldRenderBoard = tasks.length > 0 || (!isLoading && !error);
  const emptyStateTitle = hasActiveFilters ? 'No matching tasks' : undefined;
  const emptyStateDescription = hasActiveFilters
    ? 'Try adjusting the search or filters to see more work.'
    : undefined;

  useEffect(() => {
    if (selectedTaskId && !tasks.some((task) => task.id === selectedTaskId)) {
      setSelectedTaskId(null);
    }
  }, [selectedTaskId, tasks]);

  function handleOpenCreateTaskModal() {
    setEditingTask(null);
    setIsTaskModalOpen(true);
  }

  function handleOpenEditTaskModal(task: Task) {
    setEditingTask(task);
    setIsTaskModalOpen(true);
  }

  function handleOpenTaskDetailPanel(task: Task) {
    setSelectedTaskId(task.id);
  }

  function handleCloseTaskModal() {
    setIsTaskModalOpen(false);
    setEditingTask(null);
  }

  function handleCloseTaskDetailPanel() {
    setSelectedTaskId(null);
  }

  function handleSearchQueryChange(value: string) {
    setFilters((currentFilters) => ({
      ...currentFilters,
      searchQuery: value,
    }));
  }

  function handlePriorityFilterChange(value: TaskPriorityFilter) {
    setFilters((currentFilters) => ({
      ...currentFilters,
      priority: value,
    }));
  }

  function handleStatusFilterChange(value: TaskStatusFilter) {
    setFilters((currentFilters) => ({
      ...currentFilters,
      status: value,
    }));
  }

  function handleResetFilters() {
    setFilters(initialTaskFilters);
  }

  return (
    <div className="min-h-screen text-slate-900">
      <Navbar
        onNewTaskClick={handleOpenCreateTaskModal}
        newTaskDisabled={isLoading || !canManageTasks}
      />
      <main className="mx-auto flex w-full max-w-[1600px] flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <section className="px-1 pt-1">
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-slate-400">
            Board View
          </p>
          <h1 className="mt-1.5 text-2xl font-semibold tracking-tight text-slate-950 sm:text-[2rem]">
            Move work from backlog to completion
          </h1>
        </section>

        {error ? (
          <section className="rounded-[1.5rem] border border-red-200/80 bg-red-50/90 px-4 py-3 text-sm text-red-700 shadow-[0_18px_35px_-32px_rgba(220,38,38,0.35)]">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-semibold text-red-800">Unable to sync tasks with Supabase</p>
                <p className="mt-1 text-red-700/90">{error}</p>
                {!currentUserId ? (
                  <p className="mt-1 text-red-700/90">
                    Make sure anonymous sign-ins are enabled in Supabase Auth settings so the app
                    can create a session automatically.
                  </p>
                ) : null}
              </div>

              <button
                type="button"
                onClick={() => void refreshTasks()}
                className="inline-flex items-center justify-center rounded-2xl border border-red-200 bg-white/80 px-4 py-2.5 text-sm font-medium text-red-700 transition duration-200 hover:-translate-y-0.5 hover:border-red-300 hover:bg-white hover:shadow-[0_18px_30px_-24px_rgba(220,38,38,0.22)]"
              >
                Retry
              </button>
            </div>
          </section>
        ) : null}

        {isLoading && tasks.length === 0 ? (
          <section className="rounded-[2rem] border border-white/70 bg-white/55 p-6 text-sm text-slate-500 shadow-[var(--tf-shell-shadow)] backdrop-blur-xl">
            Loading tasks from Supabase...
          </section>
        ) : shouldRenderBoard ? (
          <>
            <StatsBar stats={stats} />
            <BoardFilters
              columns={boardColumns}
              filters={filters}
              totalTaskCount={tasks.length}
              visibleTaskCount={filteredTasks.length}
              hasActiveFilters={hasActiveFilters}
              onSearchQueryChange={handleSearchQueryChange}
              onPriorityChange={handlePriorityFilterChange}
              onStatusChange={handleStatusFilterChange}
              onReset={handleResetFilters}
            />
            <Board
              columns={boardColumns}
              tasks={filteredTasks}
              activeTask={activeTask}
              onOpenTask={handleOpenTaskDetailPanel}
              onEditTask={handleOpenEditTaskModal}
              onDeleteTask={deleteTask}
              emptyStateTitle={emptyStateTitle}
              emptyStateDescription={emptyStateDescription}
              onDragStart={handleDragStart}
              onDragCancel={handleDragCancel}
              onDragEnd={handleDragEnd}
            />
          </>
        ) : (
          <section className="rounded-[2rem] border border-white/70 bg-white/55 p-6 text-sm text-slate-500 shadow-[var(--tf-shell-shadow)] backdrop-blur-xl">
            TaskFlow could not load board data from Supabase yet.
          </section>
        )}
      </main>
      <NewTaskModal
        open={isTaskModalOpen}
        columns={boardColumns}
        editingTask={editingTask}
        onClose={handleCloseTaskModal}
        onCreateTask={addTask}
        onUpdateTask={editTask}
      />
      <TaskDetailPanel
        open={Boolean(selectedTask)}
        task={selectedTask}
        currentUserId={currentUserId}
        activityRefreshKey={taskMutationVersion}
        onClose={handleCloseTaskDetailPanel}
      />
    </div>
  );
}
