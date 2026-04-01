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
      className={`relative flex flex-col items-end gap-2 transition duration-200 ${
        isOpen ? 'opacity-100' : 'opacity-0 group-hover:opacity-100 group-focus-within:opacity-100'
      }`}
      onPointerDown={stopCardInteraction}
      onKeyDown={stopCardInteraction}
    >
      <button
        type="button"
        aria-label={`Open actions for ${taskTitle}`}
        aria-haspopup="menu"
        aria-expanded={isOpen}
        onClick={() => {
          setIsOpen((currentIsOpen) => !currentIsOpen);
          setIsConfirmingDelete(false);
          setActionError(null);
        }}
        className={`inline-flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200/80 bg-white/90 text-slate-400 shadow-[0_16px_28px_-24px_rgba(15,23,42,0.35)] transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:text-slate-700 hover:shadow-[0_18px_28px_-20px_rgba(15,23,42,0.28)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-200 ${
          isOpen ? 'border-slate-300 text-slate-700 shadow-[0_18px_30px_-22px_rgba(15,23,42,0.24)]' : ''
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
