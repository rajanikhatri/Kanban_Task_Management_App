import type { ButtonHTMLAttributes, ReactNode } from 'react';

interface TooltipIconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ReactNode;
  tooltip: string;
}

export function TooltipIconButton({
  icon,
  tooltip,
  className = '',
  'aria-label': ariaLabel,
  ...buttonProps
}: TooltipIconButtonProps) {
  return (
    <div className="group/tooltip relative isolate shrink-0">
      <button
        type="button"
        aria-label={ariaLabel ?? tooltip}
        className={`inline-flex h-9 w-9 items-center justify-center rounded-xl border border-white/80 bg-white/75 text-slate-500 transition duration-200 ease-out hover:-translate-y-0.5 hover:shadow-[0_18px_30px_-22px_rgba(15,23,42,0.35)] focus-visible:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-300/80 focus-visible:ring-offset-2 focus-visible:ring-offset-transparent ${className}`}
        {...buttonProps}
      >
        {icon}
      </button>

      <div
        role="tooltip"
        aria-hidden="true"
        className="pointer-events-none absolute bottom-[calc(100%+0.15rem)] left-1/2 z-20 w-max -translate-x-1/2 translate-y-px scale-95 opacity-0 transition-[opacity,transform] duration-200 ease-[cubic-bezier(0.22,1,0.36,1)] group-hover/tooltip:translate-y-0 group-hover/tooltip:scale-100 group-hover/tooltip:opacity-100 group-focus-within/tooltip:translate-y-0 group-focus-within/tooltip:scale-100 group-focus-within/tooltip:opacity-100 motion-reduce:transition-none"
      >
        <div className="relative inline-flex items-center justify-center whitespace-nowrap rounded-md border border-slate-800/80 bg-slate-950 px-2 py-0.5 text-center text-[11px] font-medium leading-4 text-white shadow-[0_10px_18px_-12px_rgba(15,23,42,0.42)]">
          {tooltip}
          <span className="absolute left-1/2 top-full h-2 w-2 -translate-x-1/2 -translate-y-[45%] rotate-45 rounded-[1px] border-b border-r border-slate-800/80 bg-slate-950" />
        </div>
      </div>
    </div>
  );
}
