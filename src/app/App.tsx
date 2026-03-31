import { useState } from 'react';

import { Board } from '@/components/board/Board';
import { StatsBar } from '@/components/dashboard/StatsBar';
import { Navbar } from '@/components/layout/Navbar';
import { NewTaskModal } from '@/components/tasks/NewTaskModal';
import { boardColumns } from '@/data/boardColumns';
import { mockTasks } from '@/data/mockTasks';
import { useBoardState } from '@/hooks/useBoardState';
import { getBoardStats } from '@/lib/task-utils';

export default function App() {
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false);
  const { tasks, activeTask, addTask, handleDragStart, handleDragCancel, handleDragEnd } =
    useBoardState(mockTasks);
  const stats = getBoardStats(tasks);

  return (
    <div className="min-h-screen text-slate-900">
      <Navbar onNewTaskClick={() => setIsNewTaskModalOpen(true)} />
      <main className="mx-auto flex w-full max-w-[1600px] flex-col gap-4 px-4 py-4 sm:px-6 lg:px-8">
        <section className="px-1 pt-1">
          <p className="text-xs font-semibold uppercase tracking-[0.26em] text-slate-400">
            Board View
          </p>
          <h1 className="mt-1.5 text-2xl font-semibold tracking-tight text-slate-950 sm:text-[2rem]">
            Move work from backlog to completion
          </h1>
        </section>

        <StatsBar stats={stats} />
        <Board
          columns={boardColumns}
          tasks={tasks}
          activeTask={activeTask}
          onDragStart={handleDragStart}
          onDragCancel={handleDragCancel}
          onDragEnd={handleDragEnd}
        />
      </main>
      <NewTaskModal
        open={isNewTaskModalOpen}
        columns={boardColumns}
        onClose={() => setIsNewTaskModalOpen(false)}
        onCreateTask={addTask}
      />
    </div>
  );
}
