import type { KeyboardEvent as ReactKeyboardEvent, PointerEvent as ReactPointerEvent } from 'react';
import { useEffect, useRef, useState } from 'react';
import { Ellipsis, PencilLine, Trash2 } from 'lucide-react';

interface TaskCardActionsProps {
  taskTitle: string;
  onEdit: () => void;
  onDelete: () => Promise<void>;
}

function stopCardInteraction(event: ReactPointerEvent | ReactKeyboardEvent) {
  event.stopPropagation();
}

export function TaskCardActions({ taskTitle, onEdit, onDelete }: TaskCardActionsProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isConfirmingDelete, setIsConfirmingDelete] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setIsConfirmingDelete(false);
      setIsDeleting(false);
      setActionError(null);
      return;
    }

    function handlePointerDown(event: PointerEvent) {
      if (containerRef.current?.contains(event.target as Node)) {
        return;
      }

      setIsOpen(false);
      setIsConfirmingDelete(false);
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsOpen(false);
        setIsConfirmingDelete(false);
      }
    }

    window.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  async function handleDeleteConfirm() {
    setIsDeleting(true);
    setActionError(null);

    try {
      await onDelete();
      setIsOpen(false);
      setIsConfirmingDelete(false);
    } catch (error) {
      setActionError(error instanceof Error ? error.message : 'Unable to delete this task right now.');
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <div
      ref={containerRef}
      className="relative flex flex-col items-end gap-2"
      onPointerDown={stopCardInteraction}
      onKeyDown={stopCardInteraction}
    >
      <button
        type="button"
        aria-label={`Open actions for ${taskTitle}`}
        title="Task actions"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => {
          setIsOpen((currentIsOpen) => !currentIsOpen);
          setIsConfirmingDelete(false);
          setActionError(null);
        }}
        className={`inline-flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200/90 bg-slate-50/95 text-slate-500 shadow-[0_16px_28px_-24px_rgba(15,23,42,0.28)] ring-1 ring-white/70 transition-[transform,box-shadow,border-color,background-color,color,ring-color] duration-200 ease-out hover:-translate-y-0.5 hover:border-indigo-200 hover:bg-indigo-50/95 hover:text-indigo-600 hover:ring-indigo-100 hover:shadow-[0_20px_34px_-22px_rgba(79,70,229,0.28)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-100 ${
          isOpen
            ? 'border-indigo-200 bg-indigo-50/95 text-indigo-600 ring-indigo-100 shadow-[0_20px_34px_-22px_rgba(79,70,229,0.28)]'
            : ''
        }`}
      >
        <Ellipsis className="h-4 w-4" />
      </button>

      {isOpen ? (
        <div
          role="menu"
          aria-label={`Actions for ${taskTitle}`}
          className="absolute right-0 top-10 z-20 w-52 rounded-2xl border border-white/80 bg-white/95 p-2 shadow-[0_26px_55px_-26px_rgba(15,23,42,0.28)] backdrop-blur-xl"
        >
          {isConfirmingDelete ? (
            <div className="space-y-3 px-1 py-1">
              <div>
                <p className="text-sm font-semibold text-slate-900">Delete this task?</p>
                <p className="mt-1 text-xs leading-5 text-slate-500">
                  This will permanently remove &quot;{taskTitle}&quot;.
                </p>
              </div>
              {actionError ? <p className="text-xs leading-5 text-red-600">{actionError}</p> : null}

              <div className="flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setIsConfirmingDelete(false);
                    setActionError(null);
                  }}
                  className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 transition duration-200 hover:border-slate-300 hover:text-slate-900"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={() => void handleDeleteConfirm()}
                  disabled={isDeleting}
                  className="inline-flex items-center justify-center rounded-xl bg-red-600 px-3 py-2 text-xs font-medium text-white transition duration-200 hover:bg-red-700 disabled:cursor-not-allowed disabled:bg-red-300"
                >
                  {isDeleting ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-1">
              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setIsOpen(false);
                  setActionError(null);
                  onEdit();
                }}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-700 transition duration-200 hover:bg-slate-100/90 hover:text-slate-950"
              >
                <PencilLine className="h-4 w-4 text-slate-400" />
                Edit task
              </button>

              <button
                type="button"
                role="menuitem"
                onClick={() => {
                  setIsConfirmingDelete(true);
                  setActionError(null);
                }}
                className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-red-600 transition duration-200 hover:bg-red-50 hover:text-red-700"
              >
                <Trash2 className="h-4 w-4" />
                Delete task
              </button>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
