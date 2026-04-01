import { useEffect, useState } from 'react';
import { format, parseISO } from 'date-fns';
import {
  ArrowRightLeft,
  CalendarDays,
  Clock3,
  Flag,
  Layers3,
  LoaderCircle,
  MessageSquareText,
  PencilLine,
  SendHorizontal,
  Sparkles,
  Trash2,
  X,
} from 'lucide-react';

import {
  createCommentForTask,
  createTaskActivityForTask,
  deleteCommentForUser,
  fetchActivityForTask,
  fetchCommentsForTask,
  updateCommentForUser,
} from '@/lib/task-collaboration-service';
import {
  formatTaskDueDate,
  formatTaskPriorityLabel,
  formatTaskStatusLabel,
} from '@/lib/task-utils';
import type { Task, TaskActivity, TaskComment } from '@/types/task';

interface TaskDetailPanelProps {
  open: boolean;
  task: Task | null;
  currentUserId: string | null;
  activityRefreshKey: number;
  onClose: () => void;
}

function formatTimelineTimestamp(timestamp: string): string {
  return format(parseISO(timestamp), 'MMM d, h:mm a');
}

function getActivityIcon(actionType: TaskActivity['actionType']) {
  switch (actionType) {
    case 'task_created':
      return Sparkles;
    case 'task_updated':
      return PencilLine;
    case 'task_moved':
      return ArrowRightLeft;
    case 'comment_added':
      return MessageSquareText;
    case 'comment_edited':
      return PencilLine;
    case 'comment_deleted':
      return Trash2;
    default:
      return Clock3;
  }
}

function getActivityTone(actionType: TaskActivity['actionType']): string {
  switch (actionType) {
    case 'task_created':
      return 'bg-emerald-100 text-emerald-700';
    case 'task_updated':
      return 'bg-indigo-100 text-indigo-700';
    case 'task_moved':
      return 'bg-sky-100 text-sky-700';
    case 'comment_added':
      return 'bg-violet-100 text-violet-700';
    case 'comment_edited':
      return 'bg-amber-100 text-amber-700';
    case 'comment_deleted':
      return 'bg-rose-100 text-rose-700';
    default:
      return 'bg-slate-100 text-slate-700';
  }
}

export function TaskDetailPanel({
  open,
  task,
  currentUserId,
  activityRefreshKey,
  onClose,
}: TaskDetailPanelProps) {
  const [comments, setComments] = useState<TaskComment[]>([]);
  const [activity, setActivity] = useState<TaskActivity[]>([]);
  const [commentInput, setCommentInput] = useState('');
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentInput, setEditingCommentInput] = useState('');
  const [confirmingDeleteCommentId, setConfirmingDeleteCommentId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [isSavingCommentId, setIsSavingCommentId] = useState<string | null>(null);
  const [isDeletingCommentId, setIsDeletingCommentId] = useState<string | null>(null);
  const [panelError, setPanelError] = useState<string | null>(null);

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
    if (!open || !task) {
      return;
    }

    let isCancelled = false;
    const taskId = task.id;

    async function loadTaskDetails() {
      setIsLoading(true);
      setPanelError(null);
      setComments([]);
      setActivity([]);
      setCommentInput('');
      setEditingCommentId(null);
      setEditingCommentInput('');
      setConfirmingDeleteCommentId(null);

      try {
        const [fetchedComments, fetchedActivity] = await Promise.all([
          fetchCommentsForTask(taskId),
          fetchActivityForTask(taskId),
        ]);

        if (isCancelled) {
          return;
        }

        setComments(fetchedComments);
        setActivity(fetchedActivity);
      } catch (loadError) {
        if (isCancelled) {
          return;
        }

        setPanelError(loadError instanceof Error ? loadError.message : 'Unable to load task details right now.');
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }

    void loadTaskDetails();

    return () => {
      isCancelled = true;
    };
  }, [activityRefreshKey, open, task]);

  useEffect(() => {
    if (!open) {
      setComments([]);
      setActivity([]);
      setCommentInput('');
      setEditingCommentId(null);
      setEditingCommentInput('');
      setConfirmingDeleteCommentId(null);
      setPanelError(null);
      setIsLoading(false);
      setIsSubmittingComment(false);
      setIsSavingCommentId(null);
      setIsDeletingCommentId(null);
    }
  }, [open]);

  function getCommentAuthorLabel(comment: TaskComment): string {
    return currentUserId === comment.userId ? 'You' : 'Teammate';
  }

  async function recordCommentActivity(
    actionType: TaskActivity['actionType'],
    message: string,
    errorMessage: string,
  ) {
    if (!task || !currentUserId) {
      return;
    }

    try {
      const createdActivity = await createTaskActivityForTask(task.id, currentUserId, actionType, message);

      setActivity((currentActivity) => [createdActivity, ...currentActivity]);
    } catch (activityError) {
      setPanelError(
        activityError instanceof Error ? `${errorMessage} ${activityError.message}` : errorMessage,
      );
    }
  }

  function handleStartCommentEdit(comment: TaskComment) {
    setEditingCommentId(comment.id);
    setEditingCommentInput(comment.content);
    setConfirmingDeleteCommentId(null);
    setPanelError(null);
  }

  function handleCancelCommentEdit() {
    setEditingCommentId(null);
    setEditingCommentInput('');
  }

  async function handleCommentSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!task || !currentUserId || !commentInput.trim()) {
      return;
    }

    setIsSubmittingComment(true);
    setPanelError(null);

    try {
      const createdComment = await createCommentForTask(task.id, currentUserId, commentInput.trim());

      setComments((currentComments) => [...currentComments, createdComment]);
      setCommentInput('');
      await recordCommentActivity(
        'comment_added',
        'Added a comment',
        'Comment saved, but activity could not be recorded.',
      );
    } catch (commentError) {
      setPanelError(
        commentError instanceof Error ? commentError.message : 'Unable to save this comment right now.',
      );
    } finally {
      setIsSubmittingComment(false);
    }
  }

  async function handleCommentEditSave(comment: TaskComment) {
    if (!task || !currentUserId) {
      return;
    }

    const nextContent = editingCommentInput.trim();

    if (!nextContent) {
      setPanelError('Comment content cannot be empty.');
      return;
    }

    if (nextContent === comment.content.trim()) {
      handleCancelCommentEdit();
      return;
    }

    const previousComments = comments;

    setIsSavingCommentId(comment.id);
    setPanelError(null);
    setComments((currentComments) =>
      currentComments.map((currentComment) =>
        currentComment.id === comment.id ? { ...currentComment, content: nextContent } : currentComment,
      ),
    );

    try {
      const updatedComment = await updateCommentForUser(comment.id, currentUserId, nextContent);

      setComments((currentComments) =>
        currentComments.map((currentComment) =>
          currentComment.id === comment.id ? updatedComment : currentComment,
        ),
      );
      handleCancelCommentEdit();
      await recordCommentActivity(
        'comment_edited',
        'Edited a comment',
        'Comment updated, but activity could not be recorded.',
      );
    } catch (commentError) {
      setComments(previousComments);
      setPanelError(
        commentError instanceof Error ? commentError.message : 'Unable to update this comment right now.',
      );
    } finally {
      setIsSavingCommentId(null);
    }
  }

  async function handleCommentDelete(comment: TaskComment) {
    if (!task || !currentUserId) {
      return;
    }

    const previousComments = comments;

    setIsDeletingCommentId(comment.id);
    setPanelError(null);
    setComments((currentComments) =>
      currentComments.filter((currentComment) => currentComment.id !== comment.id),
    );

    try {
      await deleteCommentForUser(comment.id, currentUserId);
      setConfirmingDeleteCommentId(null);

      if (editingCommentId === comment.id) {
        handleCancelCommentEdit();
      }

      await recordCommentActivity(
        'comment_deleted',
        'Deleted a comment',
        'Comment deleted, but activity could not be recorded.',
      );
    } catch (commentError) {
      setComments(previousComments);
      setPanelError(
        commentError instanceof Error ? commentError.message : 'Unable to delete this comment right now.',
      );
    } finally {
      setIsDeletingCommentId(null);
    }
  }

  if (!open || !task) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/22 backdrop-blur-sm" onClick={onClose}>
      <aside
        role="dialog"
        aria-modal="true"
        aria-labelledby="task-detail-title"
        className="absolute inset-y-0 right-0 flex h-full w-full max-w-[30rem] flex-col border-l border-white/80 bg-[linear-gradient(180deg,rgba(255,255,255,0.92),rgba(244,247,252,0.96))] shadow-[0_28px_90px_-42px_rgba(15,23,42,0.45)]"
        onClick={(event) => event.stopPropagation()}
      >
        <header className="flex items-start justify-between gap-4 border-b border-slate-200/80 px-5 py-5 sm:px-6">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-400">
              Task Detail
            </p>
            <h2 id="task-detail-title" className="mt-1.5 text-xl font-semibold tracking-tight text-slate-950">
              {task.title}
            </h2>
            <p className="mt-2 text-sm text-slate-500">
              View context, discuss the work, and review the task history.
            </p>
          </div>

          <button
            type="button"
            aria-label="Close task detail panel"
            onClick={onClose}
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border border-slate-200 bg-white/85 text-slate-500 transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:text-slate-950 hover:shadow-[0_18px_30px_-22px_rgba(15,23,42,0.24)]"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        <div className="flex-1 space-y-6 overflow-y-auto px-5 py-5 sm:px-6">
          <section className="rounded-[1.6rem] border border-white/80 bg-white/80 p-4 shadow-[0_18px_42px_-34px_rgba(15,23,42,0.24)]">
            <div className="flex flex-wrap gap-2">
              <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
                <Layers3 className="h-3.5 w-3.5" />
                {formatTaskStatusLabel(task.status)}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
                <Flag className="h-3.5 w-3.5" />
                {formatTaskPriorityLabel(task.priority)}
              </span>
              <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-semibold text-slate-600">
                <CalendarDays className="h-3.5 w-3.5" />
                {task.dueDate ? `Due ${formatTaskDueDate(task.dueDate)}` : 'No due date'}
              </span>
            </div>

            <div className="mt-4 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.22em] text-slate-400">
                Description
              </p>
              <p className="text-sm leading-6 text-slate-600">
                {task.description?.trim() || 'No description provided yet.'}
              </p>
            </div>
          </section>

          {panelError ? (
            <section className="rounded-[1.4rem] border border-red-200/80 bg-red-50/90 px-4 py-3 text-sm text-red-700 shadow-[0_18px_35px_-32px_rgba(220,38,38,0.26)]">
              {panelError}
            </section>
          ) : null}

          <section className="rounded-[1.6rem] border border-white/80 bg-white/80 p-4 shadow-[0_18px_42px_-34px_rgba(15,23,42,0.24)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-950">Comments</p>
                <p className="mt-1 text-sm text-slate-500">Discuss details and leave updates on this task.</p>
              </div>
              <MessageSquareText className="h-5 w-5 text-slate-300" />
            </div>

            <div className="mt-4 space-y-3">
              {isLoading ? (
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                  Loading comments...
                </div>
              ) : comments.length > 0 ? (
                comments.map((comment) => {
                  const isCommentOwner = currentUserId === comment.userId;
                  const isEditingComment = editingCommentId === comment.id;
                  const isConfirmingDelete = confirmingDeleteCommentId === comment.id;
                  const isSavingComment = isSavingCommentId === comment.id;
                  const isDeletingComment = isDeletingCommentId === comment.id;

                  return (
                    <article
                      key={comment.id}
                      className="rounded-[1.25rem] border border-slate-200/80 bg-slate-50/80 px-4 py-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {getCommentAuthorLabel(comment)}
                          </p>
                          <time className="mt-1 block text-xs text-slate-400">
                            {formatTimelineTimestamp(comment.createdAt)}
                          </time>
                        </div>

                        {isCommentOwner ? (
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => handleStartCommentEdit(comment)}
                              disabled={isDeletingComment}
                              className="text-xs font-medium text-slate-500 transition duration-200 hover:text-slate-950 disabled:cursor-not-allowed disabled:text-slate-300"
                            >
                              Edit
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setConfirmingDeleteCommentId(comment.id);
                                setEditingCommentId(null);
                                setEditingCommentInput('');
                                setPanelError(null);
                              }}
                              disabled={isDeletingComment}
                              className="text-xs font-medium text-rose-500 transition duration-200 hover:text-rose-700 disabled:cursor-not-allowed disabled:text-rose-200"
                            >
                              Delete
                            </button>
                          </div>
                        ) : null}
                      </div>

                      {isEditingComment ? (
                        <div className="mt-3 space-y-3">
                          <textarea
                            value={editingCommentInput}
                            onChange={(event) => setEditingCommentInput(event.target.value)}
                            rows={3}
                            disabled={isSavingComment}
                            className="w-full rounded-[1.1rem] border border-slate-200 bg-white/90 px-3.5 py-3 text-sm text-slate-950 outline-none transition duration-200 placeholder:text-slate-400 focus:border-slate-300 focus:ring-2 focus:ring-slate-200/80 disabled:cursor-not-allowed disabled:bg-slate-100"
                          />

                          <div className="flex items-center justify-end gap-2">
                            <button
                              type="button"
                              onClick={handleCancelCommentEdit}
                              disabled={isSavingComment}
                              className="inline-flex items-center justify-center rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-600 transition duration-200 hover:border-slate-300 hover:text-slate-950 disabled:cursor-not-allowed disabled:text-slate-300"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => void handleCommentEditSave(comment)}
                              disabled={
                                isSavingComment ||
                                !editingCommentInput.trim() ||
                                editingCommentInput.trim() === comment.content.trim()
                              }
                              className="inline-flex items-center gap-2 rounded-xl bg-slate-950 px-3 py-2 text-xs font-medium text-white transition duration-200 hover:bg-indigo-600 disabled:cursor-not-allowed disabled:bg-slate-300"
                            >
                              {isSavingComment ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : null}
                              {isSavingComment ? 'Saving...' : 'Save'}
                            </button>
                          </div>
                        </div>
                      ) : (
                        <p className="mt-2 text-sm leading-6 text-slate-600">{comment.content}</p>
                      )}

                      {isConfirmingDelete && !isEditingComment ? (
                        <div className="mt-3 flex items-center justify-between gap-3 rounded-[1rem] border border-rose-200/80 bg-rose-50/85 px-3 py-2.5">
                          <p className="text-xs font-medium text-rose-700">Delete this comment?</p>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setConfirmingDeleteCommentId(null)}
                              disabled={isDeletingComment}
                              className="inline-flex items-center justify-center rounded-lg border border-rose-200 bg-white px-2.5 py-1.5 text-xs font-medium text-rose-700 transition duration-200 hover:border-rose-300 disabled:cursor-not-allowed disabled:text-rose-300"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={() => void handleCommentDelete(comment)}
                              disabled={isDeletingComment}
                              className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 px-2.5 py-1.5 text-xs font-medium text-white transition duration-200 hover:bg-rose-700 disabled:cursor-not-allowed disabled:bg-rose-300"
                            >
                              {isDeletingComment ? <LoaderCircle className="h-3.5 w-3.5 animate-spin" /> : null}
                              {isDeletingComment ? 'Deleting...' : 'Delete'}
                            </button>
                          </div>
                        </div>
                      ) : null}
                    </article>
                  );
                })
              ) : (
                <div className="rounded-[1.25rem] border border-dashed border-slate-200 bg-slate-50/70 px-4 py-5 text-sm text-slate-500">
                  No comments yet. Start the discussion here.
                </div>
              )}
            </div>

            <form className="mt-4 space-y-3" onSubmit={handleCommentSubmit}>
              <label htmlFor="task-comment" className="sr-only">
                Add a comment
              </label>
              <textarea
                id="task-comment"
                value={commentInput}
                onChange={(event) => setCommentInput(event.target.value)}
                placeholder="Add a comment"
                rows={3}
                disabled={!currentUserId || isSubmittingComment}
                className="w-full rounded-[1.25rem] border border-slate-200 bg-white/90 px-4 py-3 text-sm text-slate-950 outline-none transition duration-200 placeholder:text-slate-400 focus:border-slate-300 focus:ring-2 focus:ring-slate-200/80 disabled:cursor-not-allowed disabled:bg-slate-100"
              />

              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!currentUserId || !commentInput.trim() || isSubmittingComment}
                  className="inline-flex items-center gap-2 rounded-2xl bg-slate-950 px-4 py-2.5 text-sm font-medium text-white shadow-[0_20px_40px_-28px_rgba(15,23,42,0.9)] transition duration-200 hover:-translate-y-0.5 hover:bg-indigo-600 hover:shadow-[0_26px_55px_-25px_rgba(79,70,229,0.75)] disabled:cursor-not-allowed disabled:translate-y-0 disabled:bg-slate-300 disabled:shadow-none"
                >
                  <SendHorizontal className="h-4 w-4" />
                  {isSubmittingComment ? 'Posting...' : 'Add Comment'}
                </button>
              </div>
            </form>
          </section>

          <section className="rounded-[1.6rem] border border-white/80 bg-white/80 p-4 shadow-[0_18px_42px_-34px_rgba(15,23,42,0.24)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-slate-950">Activity</p>
                <p className="mt-1 text-sm text-slate-500">Track how this task has changed over time.</p>
              </div>
              <Clock3 className="h-5 w-5 text-slate-300" />
            </div>

            <div className="mt-4 space-y-3">
              {isLoading ? (
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                  Loading activity...
                </div>
              ) : activity.length > 0 ? (
                activity.map((activityItem) => {
                  const ActivityIcon = getActivityIcon(activityItem.actionType);

                  return (
                    <article
                      key={activityItem.id}
                      className="flex gap-3 rounded-[1.25rem] border border-slate-200/80 bg-slate-50/80 px-4 py-3"
                    >
                      <div
                        className={`mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-2xl ${getActivityTone(activityItem.actionType)}`}
                      >
                        <ActivityIcon className="h-4 w-4" />
                      </div>

                      <div className="min-w-0">
                        <p className="text-sm font-medium leading-6 text-slate-700">{activityItem.message}</p>
                        <time className="mt-1 block text-xs text-slate-400">
                          {formatTimelineTimestamp(activityItem.createdAt)}
                        </time>
                      </div>
                    </article>
                  );
                })
              ) : (
                <div className="rounded-[1.25rem] border border-dashed border-slate-200 bg-slate-50/70 px-4 py-5 text-sm text-slate-500">
                  No activity recorded yet.
                </div>
              )}
            </div>
          </section>
        </div>
      </aside>
    </div>
  );
}
