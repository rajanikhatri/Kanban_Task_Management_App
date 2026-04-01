import type { CSSProperties, HTMLAttributes } from 'react';

export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskStatus = 'todo' | 'inProgress' | 'inReview' | 'done';

export interface Assignee {
  name: string;
  initials: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  priority: TaskPriority;
  dueDate?: string;
  assignee: Assignee;
  status: TaskStatus;
  userId?: string;
  createdAt?: string;
}

export interface NewTaskInput {
  title: string;
  description?: string;
  priority: TaskPriority;
  dueDate?: string;
  status: TaskStatus;
}

export interface TaskCardDragProps {
  cardRef?: (node: HTMLElement | null) => void;
  dragProps?: HTMLAttributes<HTMLElement>;
  dragStyle?: CSSProperties;
  isDragging?: boolean;
  isDragOverlay?: boolean;
}

export interface ColumnTone {
  shell: string;
  header: string;
  badge: string;
  dot: string;
  button: string;
  empty: string;
}

export interface BoardColumnConfig {
  id: TaskStatus;
  title: string;
  hint: string;
  tone: ColumnTone;
}

export interface TaskDragData {
  type: 'task';
  taskId: string;
  status: TaskStatus;
}

export interface ColumnDragData {
  type: 'column';
  status: TaskStatus;
}
