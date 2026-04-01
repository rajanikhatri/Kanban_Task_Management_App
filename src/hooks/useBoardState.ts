import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { useCallback, useEffect, useState } from 'react';

import { createTaskActivityForTask } from '@/lib/task-collaboration-service';
import {
  formatTaskDueDate,
  formatTaskPriorityLabel,
  formatTaskStatusLabel,
  groupTasksByStatus,
} from '@/lib/task-utils';
import {
  createTaskForUser,
  deleteTaskForUser,
  ensureAnonymousUserId,
  fetchTasksForUser,
  updateTaskForUser,
  updateTaskStatusForUser,
} from '@/lib/task-service';
import type { ColumnDragData, NewTaskInput, Task, TaskDragData, TaskStatus } from '@/types/task';

const taskStatusOrder: TaskStatus[] = ['todo', 'inProgress', 'inReview', 'done'];

function flattenTasksByStatus(tasksByStatus: Record<TaskStatus, Task[]>): Task[] {
  return taskStatusOrder.flatMap((status) => tasksByStatus[status]);
}

function isTaskDragData(data: unknown): data is TaskDragData {
  return typeof data === 'object' && data !== null && 'type' in data && data.type === 'task';
}

function isColumnDragData(data: unknown): data is ColumnDragData {
  return typeof data === 'object' && data !== null && 'type' in data && data.type === 'column';
}

function getTaskStatusFromDropTarget(data: unknown): TaskStatus | null {
  if (isTaskDragData(data) || isColumnDragData(data)) {
    return data.status;
  }

  return null;
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : 'Something went wrong while syncing tasks.';
}

function updateTaskInCollection(currentTasks: Task[], updatedTask: Task): Task[] {
  const existingTask = currentTasks.find((task) => task.id === updatedTask.id);

  if (!existingTask) {
    return currentTasks;
  }

  if (existingTask.status === updatedTask.status) {
    return currentTasks.map((task) => (task.id === updatedTask.id ? updatedTask : task));
  }

  const tasksByStatus = groupTasksByStatus(currentTasks.filter((task) => task.id !== updatedTask.id));

  tasksByStatus[updatedTask.status] = [...tasksByStatus[updatedTask.status], updatedTask];

  return flattenTasksByStatus(tasksByStatus);
}

interface MoveTaskResult {
  nextTasks: Task[];
  taskId: string;
  sourceStatus: TaskStatus;
  targetStatus: TaskStatus;
  shouldPersistStatus: boolean;
}

function moveTask(
  currentTasks: Task[],
  activeTaskId: string,
  overId: string,
  overData: unknown,
): MoveTaskResult | null {
  const activeTask = currentTasks.find((task) => task.id === activeTaskId);

  if (!activeTask) {
    return null;
  }

  const sourceStatus = activeTask.status;
  const targetStatus = getTaskStatusFromDropTarget(overData);

  if (!targetStatus) {
    return null;
  }

  const tasksByStatus = groupTasksByStatus(currentTasks);

  if (sourceStatus === targetStatus && isTaskDragData(overData)) {
    const columnTasks = tasksByStatus[sourceStatus];
    const activeIndex = columnTasks.findIndex((task) => task.id === activeTaskId);
    const overIndex = columnTasks.findIndex((task) => task.id === overId);

    if (activeIndex < 0 || overIndex < 0 || activeIndex === overIndex) {
      return null;
    }

    tasksByStatus[sourceStatus] = arrayMove(columnTasks, activeIndex, overIndex);

    return {
      nextTasks: flattenTasksByStatus(tasksByStatus),
      taskId: activeTaskId,
      sourceStatus,
      targetStatus,
      shouldPersistStatus: false,
    };
  }

  if (sourceStatus === targetStatus) {
    const columnTasks = [...tasksByStatus[sourceStatus]];
    const activeIndex = columnTasks.findIndex((task) => task.id === activeTaskId);

    if (activeIndex < 0) {
      return null;
    }

    const [movedTask] = columnTasks.splice(activeIndex, 1);
    columnTasks.push(movedTask);
    tasksByStatus[sourceStatus] = columnTasks;

    return {
      nextTasks: flattenTasksByStatus(tasksByStatus),
      taskId: activeTaskId,
      sourceStatus,
      targetStatus,
      shouldPersistStatus: false,
    };
  }

  const sourceTasks = [...tasksByStatus[sourceStatus]];
  const targetTasks = [...tasksByStatus[targetStatus]];
  const activeIndex = sourceTasks.findIndex((task) => task.id === activeTaskId);

  if (activeIndex < 0) {
    return null;
  }

  const [movedTask] = sourceTasks.splice(activeIndex, 1);
  const updatedTask = { ...movedTask, status: targetStatus };
  const targetIndex = isTaskDragData(overData)
    ? targetTasks.findIndex((task) => task.id === overId)
    : targetTasks.length;

  targetTasks.splice(targetIndex >= 0 ? targetIndex : targetTasks.length, 0, updatedTask);

  tasksByStatus[sourceStatus] = sourceTasks;
  tasksByStatus[targetStatus] = targetTasks;

  return {
    nextTasks: flattenTasksByStatus(tasksByStatus),
    taskId: activeTaskId,
    sourceStatus,
    targetStatus,
    shouldPersistStatus: true,
  };
}

function bumpVersion(currentVersion: number): number {
  return currentVersion + 1;
}

function formatDueDateChangeMessage(previousDueDate?: string, nextDueDate?: string): string | null {
  const previousValue = previousDueDate ?? '';
  const nextValue = nextDueDate ?? '';

  if (previousValue === nextValue) {
    return null;
  }

  if (!previousDueDate && nextDueDate) {
    return `added a due date of ${formatTaskDueDate(nextDueDate)}`;
  }

  if (previousDueDate && !nextDueDate) {
    return `removed the due date of ${formatTaskDueDate(previousDueDate)}`;
  }

  if (previousDueDate && nextDueDate) {
    return `changed the due date from ${formatTaskDueDate(previousDueDate)} to ${formatTaskDueDate(nextDueDate)}`;
  }

  return null;
}

function buildTaskUpdateMessage(previousTask: Task, taskInput: NewTaskInput): string | null {
  const changes: string[] = [];

  if (previousTask.title !== taskInput.title) {
    changes.push(`renamed the task from "${previousTask.title}" to "${taskInput.title}"`);
  }

  const previousDescription = previousTask.description ?? '';
  const nextDescription = taskInput.description ?? '';

  if (previousDescription !== nextDescription) {
    if (!previousDescription && nextDescription) {
      changes.push('added a description');
    } else if (previousDescription && !nextDescription) {
      changes.push('cleared the description');
    } else {
      changes.push('updated the description');
    }
  }

  if (previousTask.priority !== taskInput.priority) {
    changes.push(
      `changed priority from ${formatTaskPriorityLabel(previousTask.priority)} to ${formatTaskPriorityLabel(taskInput.priority)}`,
    );
  }

  const dueDateChangeMessage = formatDueDateChangeMessage(previousTask.dueDate, taskInput.dueDate);

  if (dueDateChangeMessage) {
    changes.push(dueDateChangeMessage);
  }

  if (previousTask.status !== taskInput.status) {
    changes.push(
      `changed status from ${formatTaskStatusLabel(previousTask.status)} to ${formatTaskStatusLabel(taskInput.status)}`,
    );
  }

  return changes.length > 0 ? `Updated task: ${changes.join('; ')}` : null;
}

export function useBoardState() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [taskMutationVersion, setTaskMutationVersion] = useState(0);

  const activeTask = activeTaskId ? tasks.find((task) => task.id === activeTaskId) ?? null : null;

  const refreshTasks = useCallback(async () => {
    setIsLoading(true);

    try {
      const userId = await ensureAnonymousUserId();
      const fetchedTasks = await fetchTasksForUser(userId);

      setCurrentUserId(userId);
      setTasks(fetchedTasks);
      setError(null);
    } catch (fetchError) {
      setCurrentUserId(null);
      setTasks([]);
      setError(getErrorMessage(fetchError));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refreshTasks();
  }, [refreshTasks]);

  function handleDragStart(event: DragStartEvent) {
    if (isTaskDragData(event.active.data.current)) {
      setActiveTaskId(String(event.active.id));
    }
  }

  function handleDragCancel() {
    setActiveTaskId(null);
  }

  async function recordActivity(taskId: string, actionType: 'task_created' | 'task_updated' | 'task_moved', message: string) {
    if (!currentUserId) {
      return;
    }

    try {
      await createTaskActivityForTask(taskId, currentUserId, actionType, message);
    } catch (activityError) {
      setError(`The task was updated, but its activity log could not be recorded. ${getErrorMessage(activityError)}`);
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    setActiveTaskId(null);

    if (!over || active.id === over.id) {
      return;
    }

    const previousTasks = tasks;
    const moveResult = moveTask(previousTasks, String(active.id), String(over.id), over.data.current);

    if (!moveResult) {
      return;
    }

    setTasks(moveResult.nextTasks);

    if (!moveResult.shouldPersistStatus) {
      return;
    }

    if (!currentUserId) {
      setTasks(previousTasks);
      setError('No Supabase user is available yet. Wait for anonymous auth to finish and try again.');
      return;
    }

    try {
      const updatedTask = await updateTaskStatusForUser(
        moveResult.taskId,
        currentUserId,
        moveResult.targetStatus,
      );

      setTasks((currentTasks) =>
        currentTasks.map((task) =>
          task.id === updatedTask.id
            ? {
                ...task,
                status: updatedTask.status,
                userId: updatedTask.userId,
                createdAt: updatedTask.createdAt,
              }
            : task,
        ),
      );
      setError(null);
      setTaskMutationVersion((currentVersion) => bumpVersion(currentVersion));
      await recordActivity(
        updatedTask.id,
        'task_moved',
        `Moved from ${formatTaskStatusLabel(moveResult.sourceStatus)} to ${formatTaskStatusLabel(updatedTask.status)}`,
      );
    } catch (updateError) {
      setTasks(previousTasks);
      setError(getErrorMessage(updateError));
    }
  }

  async function addTask(taskInput: NewTaskInput) {
    if (!currentUserId) {
      throw new Error('No Supabase user is available yet. Wait for anonymous auth to finish and try again.');
    }

    try {
      const createdTask = await createTaskForUser(currentUserId, taskInput);

      setTasks((currentTasks) => {
        const tasksByStatus = groupTasksByStatus(currentTasks);
        tasksByStatus[createdTask.status] = [...tasksByStatus[createdTask.status], createdTask];

        return flattenTasksByStatus(tasksByStatus);
      });
      setError(null);
      setTaskMutationVersion((currentVersion) => bumpVersion(currentVersion));
      await recordActivity(
        createdTask.id,
        'task_created',
        `Created task in ${formatTaskStatusLabel(createdTask.status)}`,
      );
    } catch (createError) {
      const message = getErrorMessage(createError);
      setError(message);
      throw new Error(message);
    }
  }

  async function editTask(taskId: string, taskInput: NewTaskInput) {
    if (!currentUserId) {
      throw new Error('No Supabase user is available yet. Wait for anonymous auth to finish and try again.');
    }

    const existingTask = tasks.find((task) => task.id === taskId);

    if (!existingTask) {
      throw new Error('Task not found.');
    }

    const optimisticTask: Task = {
      ...existingTask,
      title: taskInput.title,
      description: taskInput.description,
      priority: taskInput.priority,
      dueDate: taskInput.dueDate,
      status: taskInput.status,
    };
    const previousTasks = tasks;

    setTasks((currentTasks) => updateTaskInCollection(currentTasks, optimisticTask));

    try {
      const updatedTask = await updateTaskForUser(taskId, currentUserId, taskInput);

      setTasks((currentTasks) => updateTaskInCollection(currentTasks, updatedTask));
      setError(null);
      setTaskMutationVersion((currentVersion) => bumpVersion(currentVersion));

      const activityMessage = buildTaskUpdateMessage(existingTask, taskInput);

      if (activityMessage) {
        await recordActivity(updatedTask.id, 'task_updated', activityMessage);
      }
    } catch (updateError) {
      setTasks(previousTasks);
      const message = getErrorMessage(updateError);
      setError(message);
      throw new Error(message);
    }
  }

  async function deleteTask(taskId: string) {
    if (!currentUserId) {
      throw new Error('No Supabase user is available yet. Wait for anonymous auth to finish and try again.');
    }

    const existingTask = tasks.find((task) => task.id === taskId);

    if (!existingTask) {
      return;
    }

    const previousTasks = tasks;

    setActiveTaskId((currentActiveTaskId) => (currentActiveTaskId === taskId ? null : currentActiveTaskId));
    setTasks((currentTasks) => currentTasks.filter((task) => task.id !== taskId));

    try {
      await deleteTaskForUser(taskId, currentUserId);
      setError(null);
      setTaskMutationVersion((currentVersion) => bumpVersion(currentVersion));
    } catch (deleteError) {
      setTasks(previousTasks);
      const message = getErrorMessage(deleteError);
      setError(message);
      throw new Error(message);
    }
  }

  return {
    tasks,
    activeTask,
    currentUserId,
    isLoading,
    error,
    taskMutationVersion,
    canManageTasks: Boolean(currentUserId),
    refreshTasks,
    addTask,
    editTask,
    deleteTask,
    handleDragStart,
    handleDragCancel,
    handleDragEnd,
  };
}
