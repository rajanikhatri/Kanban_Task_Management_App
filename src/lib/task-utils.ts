import { format, isBefore, parseISO, startOfToday } from 'date-fns';

import type { Task, TaskStatus } from '@/types/task';

export interface BoardStats {
  total: number;
  inProgress: number;
  inReview: number;
  completed: number;
  overdue: number;
}

export function groupTasksByStatus(tasks: Task[]): Record<TaskStatus, Task[]> {
  const groupedTasks: Record<TaskStatus, Task[]> = {
    todo: [],
    inProgress: [],
    inReview: [],
    done: [],
  };

  tasks.forEach((task) => {
    groupedTasks[task.status].push(task);
  });

  Object.values(groupedTasks).forEach((group) => {
    group.sort((firstTask, secondTask) => {
      return parseISO(firstTask.dueDate).getTime() - parseISO(secondTask.dueDate).getTime();
    });
  });

  return groupedTasks;
}

export function getBoardStats(tasks: Task[]): BoardStats {
  const groupedTasks = groupTasksByStatus(tasks);

  return {
    total: tasks.length,
    inProgress: groupedTasks.inProgress.length,
    inReview: groupedTasks.inReview.length,
    completed: groupedTasks.done.length,
    overdue: tasks.filter(isTaskOverdue).length,
  };
}

export function formatTaskDueDate(dueDate: string): string {
  return format(parseISO(dueDate), 'MMM d');
}

export function isTaskOverdue(task: Task): boolean {
  return task.status !== 'done' && isBefore(parseISO(task.dueDate), startOfToday());
}
