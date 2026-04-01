import { useEffect, useMemo, useState } from 'react';
import { CalendarDays, Flag, Layers3, X } from 'lucide-react';

import type { BoardColumnConfig, NewTaskInput, TaskPriority, TaskStatus } from '@/types/task';

interface NewTaskModalProps {
  open: boolean;
  columns: BoardColumnConfig[];
  onClose: () => void;
  onCreateTask: (task: NewTaskInput) => Promise<void>;
}

interface FormState {
  title: string;
  description: string;
  priority: TaskPriority;
  dueDate: string;
  status: TaskStatus;
}

const initialFormState: FormState = {
  title: '',
  description: '',
  priority: 'medium',
  dueDate: '',
  status: 'todo',
};

export function NewTaskModal({ open, columns, onClose, onCreateTask }: NewTaskModalProps) {
  const [formState, setFormState] = useState<FormState>(initialFormState);
  const [titleTouched, setTitleTouched] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const titleError = titleTouched && !formState.title.trim() ? 'Title is required.' : '';
  const isSubmitDisabled = !formState.title.trim() || isSubmitting;
  const statusOptions = useMemo(
    () => columns.map((column) => ({ value: column.id, label: column.title })),
    [columns],
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        onClose();
      }
    }

    const previousOverflow = document.body.style.overflow;

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (!open) {
      setFormState(initialFormState);
      setTitleTouched(false);
      setSubmitError(null);
      setIsSubmitting(false);
    }
  }, [open]);

  function handleFieldChange<Key extends keyof FormState>(field: Key, value: FormState[Key]) {
    setFormState((currentState) => ({
      ...currentState,
      [field]: value,
    }));
  }

  function getErrorMessage(error: unknown): string {
    return error instanceof Error ? error.message : 'Unable to create the task right now.';
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTitleTouched(true);
    setSubmitError(null);

    if (!formState.title.trim()) {
      return;
    }

    setIsSubmitting(true);

    try {
      await onCreateTask({
        title: formState.title.trim(),
        description: formState.description.trim() || undefined,
        priority: formState.priority,
        dueDate: formState.dueDate || undefined,
        status: formState.status,
      });

      setFormState(initialFormState);
      setTitleTouched(false);
      setSubmitError(null);
      onClose();
    } catch (submitTaskError) {
      setSubmitError(getErrorMessage(submitTaskError));
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/25 px-4 py-8 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-task-title"
        className="w-full max-w-2xl rounded-[2rem] border border-white/80 bg-[var(--tf-app-surface)] p-6 shadow-[0_32px_90px_-45px_rgba(15,23,42,0.45)] backdrop-blur-xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.26em] text-slate-400">
              Create Task
            </p>
            <h2 id="new-task-title" className="mt-1.5 text-2xl font-semibold tracking-tight text-slate-950">
              Add a new card to the board
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              Capture the work now and place it directly into the right column.
            </p>
          </div>

          <button
            type="button"
            aria-label="Close new task modal"
            onClick={onClose}
            className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-slate-200 bg-white/80 text-slate-500 transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:text-slate-950 hover:shadow-[0_18px_30px_-22px_rgba(15,23,42,0.3)]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label htmlFor="task-title" className="text-sm font-medium text-slate-700">
              Title
            </label>
            <input
              id="task-title"
              type="text"
              value={formState.title}
              onChange={(event) => handleFieldChange('title', event.target.value)}
              onBlur={() => setTitleTouched(true)}
              placeholder="Write a concise task title"
              autoFocus
              className={`w-full rounded-2xl border bg-white/80 px-4 py-3 text-sm text-slate-950 outline-none transition duration-200 placeholder:text-slate-400 ${
                titleError
                  ? 'border-red-300 ring-2 ring-red-100'
                  : 'border-slate-200 focus:border-slate-300 focus:ring-2 focus:ring-slate-200/80'
              }`}
            />
            {titleError ? <p className="text-sm text-red-600">{titleError}</p> : null}
          </div>

          <div className="space-y-2">
            <label htmlFor="task-description" className="text-sm font-medium text-slate-700">
              Description
            </label>
            <textarea
              id="task-description"
              value={formState.description}
              onChange={(event) => handleFieldChange('description', event.target.value)}
              placeholder="Optional notes or context"
              rows={4}
              className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-950 outline-none transition duration-200 placeholder:text-slate-400 focus:border-slate-300 focus:ring-2 focus:ring-slate-200/80"
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="task-priority" className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <Flag className="h-4 w-4 text-slate-400" />
                Priority
              </label>
              <select
                id="task-priority"
                value={formState.priority}
                onChange={(event) =>
                  handleFieldChange('priority', event.target.value as TaskPriority)
                }
                className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-950 outline-none transition duration-200 focus:border-slate-300 focus:ring-2 focus:ring-slate-200/80"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>

            <div className="space-y-2">
              <label htmlFor="task-status" className="flex items-center gap-2 text-sm font-medium text-slate-700">
                <Layers3 className="h-4 w-4 text-slate-400" />
                Status
              </label>
              <select
                id="task-status"
                value={formState.status}
                onChange={(event) => handleFieldChange('status', event.target.value as TaskStatus)}
                className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-950 outline-none transition duration-200 focus:border-slate-300 focus:ring-2 focus:ring-slate-200/80"
              >
                {statusOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <label htmlFor="task-due-date" className="flex items-center gap-2 text-sm font-medium text-slate-700">
              <CalendarDays className="h-4 w-4 text-slate-400" />
              Due Date
            </label>
            <input
              id="task-due-date"
              type="date"
              value={formState.dueDate}
              onChange={(event) => handleFieldChange('dueDate', event.target.value)}
              className="w-full rounded-2xl border border-slate-200 bg-white/80 px-4 py-3 text-sm text-slate-950 outline-none transition duration-200 focus:border-slate-300 focus:ring-2 focus:ring-slate-200/80"
            />
          </div>

          <div className="flex flex-col-reverse gap-3 border-t border-slate-200/80 pt-5 sm:flex-row sm:justify-end">
            {submitError ? (
              <p className="self-start text-sm text-red-600 sm:mr-auto sm:self-center">{submitError}</p>
            ) : null}

            <button
              type="button"
              onClick={onClose}
              className="inline-flex items-center justify-center rounded-2xl border border-slate-200 bg-white/80 px-4 py-2.5 text-sm font-medium text-slate-600 transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:text-slate-950 hover:shadow-[0_18px_30px_-22px_rgba(15,23,42,0.28)]"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitDisabled}
              className="inline-flex items-center justify-center rounded-2xl bg-slate-950 px-4 py-2.5 text-sm font-medium text-white shadow-[0_20px_40px_-28px_rgba(15,23,42,0.9)] transition duration-200 hover:-translate-y-0.5 hover:bg-indigo-600 hover:shadow-[0_26px_55px_-25px_rgba(79,70,229,0.75)] disabled:cursor-not-allowed disabled:translate-y-0 disabled:bg-slate-300 disabled:shadow-none"
            >
              {isSubmitting ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
