import type { CSSProperties, HTMLAttributes } from 'react';

import { CalendarDays, Flag } from 'lucide-react';

import { TaskCardActions } from '@/components/board/TaskCardActions';
import { formatTaskDueDate, isTaskOverdue } from '@/lib/task-utils';
import type { Task, TaskCardDragProps, TaskPriority } from '@/types/task';

interface TaskCardProps extends TaskCardDragProps {
  task: Task;
  onEditTask?: (task: Task) => void;
  onDeleteTask?: (taskId: string) => Promise<void>;
  onOpenTask?: (task: Task) => void;
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

function isUnassignedAssignee(task: Task): boolean {
  return (
    task.assignee.name === 'No Assignee' ||
    task.assignee.name === 'Unassigned' ||
    task.assignee.initials === 'NA' ||
    task.assignee.initials === '?'
  );
}

export function TaskCard({
  task,
  cardRef,
  dragProps,
  dragStyle,
  isDragging = false,
  isDragOverlay = false,
  onEditTask,
  onDeleteTask,
  onOpenTask,
}: TaskCardProps) {
  const priorityStyle = priorityStyles[task.priority];
  const isOverdue = isTaskOverdue(task);
  const isUnassigned = isUnassignedAssignee(task);
  const assigneeLabel = isUnassigned ? 'Unassigned' : task.assignee.name;
  const avatarText = isUnassigned ? '?' : task.assignee.initials;
  const avatarClassName = isUnassigned
    ? 'border border-slate-200/90 bg-slate-100 text-slate-500 shadow-[0_14px_28px_-22px_rgba(15,23,42,0.18)]'
    : `bg-gradient-to-br ${getAvatarTone(task.assignee.initials)} text-white shadow-[0_18px_40px_-25px_rgba(15,23,42,0.35)]`;
  const showActions = !isDragOverlay && Boolean(onEditTask && onDeleteTask);
  const overdueDueDateBadgeClassName =
    'inline-flex items-center gap-1.5 rounded-full border border-red-300/90 bg-red-50 px-2.5 py-1 text-xs font-medium text-red-700 ring-1 ring-red-200/90 shadow-[0_12px_22px_-18px_rgba(220,38,38,0.45)]';
  const overdueDueDateContentClassName = 'text-red-700';
  const normalDueDateBadgeClassName =
    'inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-xs font-medium text-slate-500';
  const normalDueDateContentClassName = 'text-slate-500';
  const cardStateClassName = isDragOverlay
    ? 'cursor-grabbing rotate-[1deg] shadow-[0_30px_65px_-26px_rgba(15,23,42,0.34)] ring-2 ring-slate-200/80'
    : isDragging
      ? 'opacity-45 shadow-[0_12px_30px_-28px_rgba(15,23,42,0.28)]'
      : '';

  return (
    <article
      ref={cardRef}
      style={dragStyle as CSSProperties | undefined}
      {...(dragProps as HTMLAttributes<HTMLElement> | undefined)}
      onClick={() => {
        if (!isDragOverlay && !isDragging) {
          onOpenTask?.(task);
        }
      }}
      className={`group cursor-grab rounded-[1.35rem] border border-slate-200/70 border-l-4 ${priorityStyle.rail} bg-white/90 p-4 shadow-[var(--tf-card-shadow)] transition-[transform,box-shadow,border-color,ring-color,background-color,filter,opacity] duration-200 ease-out hover:-translate-y-1.5 hover:border-slate-300/90 hover:bg-white hover:[filter:brightness(1.015)] hover:ring-2 hover:ring-slate-200/90 hover:shadow-[0_42px_82px_-30px_rgba(15,23,42,0.42),0_18px_34px_-24px_rgba(15,23,42,0.18)] active:cursor-grabbing ${cardStateClassName}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-3">
          <div className="space-y-1.5">
            <h3 className="text-sm font-semibold leading-6 text-slate-950">{task.title}</h3>
            <p className="text-xs uppercase tracking-[0.24em] text-slate-400">{assigneeLabel}</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <span
              className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${priorityStyle.badge}`}
            >
              <Flag className="h-3.5 w-3.5" />
              {priorityStyle.label}
            </span>

            {task.dueDate
              ? isOverdue
                ? (
                  <span className={overdueDueDateBadgeClassName}>
                    <CalendarDays className={`h-3.5 w-3.5 ${overdueDueDateContentClassName}`} />
                    <span className={overdueDueDateContentClassName}>
                      Due {formatTaskDueDate(task.dueDate)}
                    </span>
                  </span>
                )
                : (
                  <span className={normalDueDateBadgeClassName}>
                    <CalendarDays className={`h-3.5 w-3.5 ${normalDueDateContentClassName}`} />
                    <span className={normalDueDateContentClassName}>
                      Due {formatTaskDueDate(task.dueDate)}
                    </span>
                  </span>
                )
              : null}
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-2">
          {showActions ? (
            <TaskCardActions
              taskTitle={task.title}
              onEdit={() => onEditTask?.(task)}
              onDelete={() => onDeleteTask?.(task.id) ?? Promise.resolve()}
            />
          ) : null}

          <div
            className={`flex h-10 w-10 items-center justify-center rounded-2xl text-sm font-semibold transition duration-200 group-hover:scale-105 ${avatarClassName}`}
            aria-label={assigneeLabel}
            title={assigneeLabel}
          >
            {avatarText}
          </div>
        </div>
      </div>
    </article>
  );
}
