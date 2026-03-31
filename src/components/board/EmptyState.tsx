import { Inbox } from 'lucide-react';

interface EmptyStateProps {
  className: string;
}

export function EmptyState({ className }: EmptyStateProps) {
  return (
    <div
      className={`flex min-h-[180px] flex-1 flex-col items-center justify-center rounded-[1.35rem] border border-dashed px-5 text-center ${className}`}
    >
      <div className="rounded-2xl bg-white/80 p-3 shadow-[0_16px_35px_-28px_rgba(15,23,42,0.35)]">
        <Inbox className="h-5 w-5" />
      </div>
      <p className="mt-4 text-sm font-semibold text-slate-900">No tasks yet</p>
      <p className="mt-1 max-w-[14rem] text-sm text-slate-500">
        Add the first card here to keep the workflow moving.
      </p>
    </div>
  );
}
