import { format, isBefore, parseISO, startOfToday } from 'date-fns';

import type { Task, TaskFilters, TaskPriority, TaskStatus } from '@/types/task';

export interface BoardStats {
  total: number;
  inProgress: number;
  inReview: number;
  completed: number;
  overdue: number;
}

export const initialTaskFilters: TaskFilters = {
  searchQuery: '',
  priority: 'all',
  status: 'all',
};

export const taskStatusLabels: Record<TaskStatus, string> = {
  todo: 'To Do',
  inProgress: 'In Progress',
  inReview: 'In Review',
  done: 'Done',
};

export const taskPriorityLabels: Record<TaskPriority, string> = {
  low: 'Low',
  medium: 'Medium',
  high: 'High',
};

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

export function filterTasks(tasks: Task[], filters: TaskFilters): Task[] {
  const normalizedQuery = filters.searchQuery.trim().toLowerCase();

  return tasks.filter((task) => {
    const matchesQuery = !normalizedQuery || task.title.toLowerCase().includes(normalizedQuery);
    const matchesPriority = filters.priority === 'all' || task.priority === filters.priority;
    const matchesStatus = filters.status === 'all' || task.status === filters.status;

    return matchesQuery && matchesPriority && matchesStatus;
  });
}

export function hasActiveTaskFilters(filters: TaskFilters): boolean {
  return Boolean(filters.searchQuery.trim()) || filters.priority !== 'all' || filters.status !== 'all';
}

export function formatTaskStatusLabel(status: TaskStatus): string {
  return taskStatusLabels[status];
}

export function formatTaskPriorityLabel(priority: TaskPriority): string {
  return taskPriorityLabels[priority];
}

export function formatTaskDueDate(dueDate: string): string {
  return format(parseISO(dueDate), 'MMM d');
}

export function isTaskOverdue(task: Task): boolean {
  if (!task.dueDate) {
    return false;
  }

  return task.status !== 'done' && isBefore(parseISO(task.dueDate), startOfToday());
}
