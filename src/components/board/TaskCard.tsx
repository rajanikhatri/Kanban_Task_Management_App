import { CalendarDays, Flag } from 'lucide-react';

import { formatTaskDueDate, isTaskOverdue } from '@/lib/task-utils';
import type { Task, TaskPriority } from '@/types/task';

interface TaskCardProps {
  task: Task;
}

const priorityStyles: Record<
  TaskPriority,
  {
    label: string;
    badge: string;
    rail: string;
  }
> = {
  high: {
    label: 'High',
    badge: 'border-rose-200 bg-rose-50 text-rose-700',
    rail: 'border-l-rose-500',
  },
  medium: {
    label: 'Medium',
    badge: 'border-amber-200 bg-amber-50 text-amber-700',
    rail: 'border-l-amber-400',
  },
  low: {
    label: 'Low',
    badge: 'border-emerald-200 bg-emerald-50 text-emerald-700',
    rail: 'border-l-emerald-500',
  },
};

function getAvatarTone(initials: string): string {
  const tones = [
    'from-slate-700 to-slate-500',
    'from-sky-600 to-cyan-500',
    'from-violet-600 to-indigo-500',
    'from-emerald-600 to-teal-500',
  ];

  const index = initials.charCodeAt(0) % tones.length;

  return tones[index];
}

export function TaskCard({ task }: TaskCardProps) {
  const priorityStyle = priorityStyles[task.priority];
  const isOverdue = isTaskOverdue(task);

  return (
    <article
      className={`group cursor-grab rounded-[1.35rem] border border-slate-200/70 border-l-4 ${priorityStyle.rail} bg-white/92 p-4 shadow-[var(--tf-card-shadow)] transition-[transform,box-shadow,border-color,ring-color] duration-200 ease-out hover:-translate-y-1.5 hover:border-slate-300/90 hover:ring-2 hover:ring-slate-200/90 hover:shadow-[0_36px_72px_-28px_rgba(15,23,42,0.42),0_14px_30px_-20px_rgba(15,23,42,0.18)] active:cursor-grabbing`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-3">
          <div className="space-y-1.5">
            <h3 className="text-sm font-semibold leading-6 text-slate-950">{task.title}</h3>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{task.assignee.name}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${priorityStyle.badge}`}
            >
              <Flag className="h-3.5 w-3.5" />
              {priorityStyle.label}
            </span>

            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-medium ${
                isOverdue
                  ? 'border-rose-200 bg-rose-50 text-rose-700'
                  : 'border-slate-200 bg-slate-50 text-slate-500'
              }`}
            >
              <CalendarDays className="h-3.5 w-3.5" />
              Due {formatTaskDueDate(task.dueDate)}
            </span>
          </div>
        </div>

        <div
          className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br ${getAvatarTone(task.assignee.initials)} text-sm font-semibold text-white shadow-[0_18px_40px_-25px_rgba(15,23,42,0.35)] transition duration-200 group-hover:scale-105`}
          aria-label={task.assignee.name}
          title={task.assignee.name}
        >
          {task.assignee.initials}
        </div>
      </div>
    </article>
  );
}
