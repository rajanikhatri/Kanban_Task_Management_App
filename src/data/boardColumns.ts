import type { BoardColumnConfig } from '@/types/task';

export const boardColumns: BoardColumnConfig[] = [
  {
    id: 'todo',
    title: 'To Do',
    hint: 'Prioritized and ready to start',
    tone: {
      shell: 'border-slate-200/80 bg-slate-100/70',
      header: 'bg-white/80 text-slate-700',
      badge: 'bg-slate-900 text-white',
      dot: 'bg-slate-500',
      button: 'hover:bg-slate-900 hover:text-white',
      empty: 'border-slate-300/80 bg-white/60 text-slate-500',
    },
  },
  {
    id: 'inProgress',
    title: 'In Progress',
    hint: 'Work currently moving forward',
    tone: {
      shell: 'border-sky-200/80 bg-sky-100/70',
      header: 'bg-white/75 text-sky-700',
      badge: 'bg-sky-600 text-white',
      dot: 'bg-sky-500',
      button: 'hover:bg-sky-600 hover:text-white',
      empty: 'border-sky-200/90 bg-white/60 text-sky-700',
    },
  },
  {
    id: 'inReview',
    title: 'In Review',
    hint: 'Awaiting feedback and approval',
    tone: {
      shell: 'border-violet-200/80 bg-violet-100/70',
      header: 'bg-white/75 text-violet-700',
      badge: 'bg-violet-600 text-white',
      dot: 'bg-violet-500',
      button: 'hover:bg-violet-600 hover:text-white',
      empty: 'border-violet-200/90 bg-white/60 text-violet-700',
    },
  },
  {
    id: 'done',
    title: 'Done',
    hint: 'Completed and archived work',
    tone: {
      shell: 'border-emerald-200/80 bg-emerald-100/70',
      header: 'bg-white/75 text-emerald-700',
      badge: 'bg-emerald-600 text-white',
      dot: 'bg-emerald-500',
      button: 'hover:bg-emerald-600 hover:text-white',
      empty: 'border-emerald-200/90 bg-white/60 text-emerald-700',
    },
  },
];
