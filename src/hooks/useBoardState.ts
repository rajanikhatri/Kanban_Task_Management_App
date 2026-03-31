import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { useState } from 'react';

import { groupTasksByStatus } from '@/lib/task-utils';
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

function createTaskId(): string {
  return globalThis.crypto?.randomUUID?.() ?? `task-${Date.now()}`;
}

export function useBoardState(initialTasks: Task[]) {
  const [tasks, setTasks] = useState(initialTasks);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);

  const activeTask = activeTaskId ? tasks.find((task) => task.id === activeTaskId) ?? null : null;

  function handleDragStart(event: DragStartEvent) {
    if (isTaskDragData(event.active.data.current)) {
      setActiveTaskId(String(event.active.id));
    }
  }

  function handleDragCancel() {
    setActiveTaskId(null);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;

    setActiveTaskId(null);

    if (!over || active.id === over.id) {
      return;
    }

    setTasks((currentTasks) => {
      const activeTask = currentTasks.find((task) => task.id === String(active.id));

      if (!activeTask) {
        return currentTasks;
      }

      const sourceStatus = activeTask.status;
      const targetStatus = getTaskStatusFromDropTarget(over.data.current);

      if (!targetStatus) {
        return currentTasks;
      }

      const tasksByStatus = groupTasksByStatus(currentTasks);

      if (sourceStatus === targetStatus && isTaskDragData(over.data.current)) {
        const columnTasks = tasksByStatus[sourceStatus];
        const activeIndex = columnTasks.findIndex((task) => task.id === String(active.id));
        const overIndex = columnTasks.findIndex((task) => task.id === String(over.id));

        if (activeIndex < 0 || overIndex < 0 || activeIndex === overIndex) {
          return currentTasks;
        }

        tasksByStatus[sourceStatus] = arrayMove(columnTasks, activeIndex, overIndex);

        return flattenTasksByStatus(tasksByStatus);
      }

      if (sourceStatus === targetStatus) {
        const columnTasks = [...tasksByStatus[sourceStatus]];
        const activeIndex = columnTasks.findIndex((task) => task.id === String(active.id));

        if (activeIndex < 0) {
          return currentTasks;
        }

        const [movedTask] = columnTasks.splice(activeIndex, 1);
        columnTasks.push(movedTask);
        tasksByStatus[sourceStatus] = columnTasks;

        return flattenTasksByStatus(tasksByStatus);
      }

      const sourceTasks = [...tasksByStatus[sourceStatus]];
      const targetTasks = [...tasksByStatus[targetStatus]];
      const activeIndex = sourceTasks.findIndex((task) => task.id === String(active.id));

      if (activeIndex < 0) {
        return currentTasks;
      }

      const [movedTask] = sourceTasks.splice(activeIndex, 1);
      const updatedTask = { ...movedTask, status: targetStatus };
      const targetIndex = isTaskDragData(over.data.current)
        ? targetTasks.findIndex((task) => task.id === String(over.id))
        : targetTasks.length;

      targetTasks.splice(targetIndex >= 0 ? targetIndex : targetTasks.length, 0, updatedTask);

      tasksByStatus[sourceStatus] = sourceTasks;
      tasksByStatus[targetStatus] = targetTasks;

      return flattenTasksByStatus(tasksByStatus);
    });
  }

  function addTask(taskInput: NewTaskInput) {
    setTasks((currentTasks) => {
      const tasksByStatus = groupTasksByStatus(currentTasks);
      const newTask: Task = {
        id: createTaskId(),
        title: taskInput.title,
        description: taskInput.description,
        priority: taskInput.priority,
        dueDate: taskInput.dueDate,
        assignee: {
          name: 'No Assignee',
          initials: 'NA',
        },
        status: taskInput.status,
      };

      tasksByStatus[taskInput.status] = [...tasksByStatus[taskInput.status], newTask];

      return flattenTasksByStatus(tasksByStatus);
    });
  }

  return {
    tasks,
    activeTask,
    addTask,
    handleDragStart,
    handleDragCancel,
    handleDragEnd,
  };
}
