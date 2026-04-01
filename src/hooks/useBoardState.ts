import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { useCallback, useEffect, useState } from 'react';

import { groupTasksByStatus } from '@/lib/task-utils';
import {
  createTaskForUser,
  ensureAnonymousUserId,
  fetchTasksForUser,
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

interface MoveTaskResult {
  nextTasks: Task[];
  taskId: string;
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
    targetStatus,
    shouldPersistStatus: true,
  };
}

export function useBoardState() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    } catch (createError) {
      const message = getErrorMessage(createError);
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
    canManageTasks: Boolean(currentUserId),
    refreshTasks,
    addTask,
    handleDragStart,
    handleDragCancel,
    handleDragEnd,
  };
}
