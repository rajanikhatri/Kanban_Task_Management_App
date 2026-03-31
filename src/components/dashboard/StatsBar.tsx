import { AlertTriangle, CheckCircle2, LoaderCircle, ScanSearch, Shapes } from 'lucide-react';

import type { BoardStats } from '@/lib/task-utils';

interface StatsBarProps {
  stats: BoardStats;
}

interface StatCardProps {
  label: string;
  value: number;
  helper: string;
  icon: typeof Shapes;
  iconClassName: string;
}

function StatCard({ label, value, helper, icon: Icon, iconClassName }: StatCardProps) {
  return (
    <article className="rounded-[1.6rem] border border-white/70 bg-[var(--tf-app-surface)] p-4 shadow-[var(--tf-card-shadow)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_26px_55px_-34px_rgba(15,23,42,0.35)]">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-sm font-medium text-slate-500">{label}</p>
          <p className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">{value}</p>
        </div>
        <div className={`rounded-2xl p-3 ${iconClassName}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <p className="mt-3 text-sm text-slate-500">{helper}</p>
    </article>
  );
}

export function StatsBar({ stats }: StatsBarProps) {
  const cards = [
    {
      label: 'Total Tasks',
      value: stats.total,
      helper: 'Across the current board',
      icon: Shapes,
      iconClassName: 'bg-slate-100 text-slate-700',
    },
    {
      label: 'In Progress',
      value: stats.inProgress,
      helper: 'Tasks actively in motion',
      icon: LoaderCircle,
      iconClassName: 'bg-sky-100 text-sky-700',
    },
    {
      label: 'In Review',
      value: stats.inReview,
      helper: 'Waiting for approval',
      icon: ScanSearch,
      iconClassName: 'bg-violet-100 text-violet-700',
    },
    {
      label: 'Completed',
      value: stats.completed,
      helper: 'Ready to archive',
      icon: CheckCircle2,
      iconClassName: 'bg-emerald-100 text-emerald-700',
    },
  ];

  return (
    <section className="rounded-[2rem] border border-white/70 bg-white/55 p-4 shadow-[var(--tf-shell-shadow)] backdrop-blur-xl sm:p-5">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {cards.map((card) => (
            <StatCard key={card.label} {...card} />
          ))}
        </div>

        <div className="flex items-center gap-3 rounded-[1.5rem] border border-amber-200/80 bg-amber-50/90 px-4 py-3 text-sm text-amber-900 shadow-[0_18px_45px_-36px_rgba(217,119,6,0.65)]">
          <AlertTriangle className="h-4 w-4 shrink-0" />
          <span>
            {stats.overdue} overdue {stats.overdue === 1 ? 'task needs' : 'tasks need'} attention
          </span>
        </div>
      </div>
    </section>
  );
}
