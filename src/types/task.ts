export type TaskPriority = 'low' | 'medium' | 'high';
export type TaskStatus = 'todo' | 'inProgress' | 'inReview' | 'done';

export interface Assignee {
  name: string;
  initials: string;
}

export interface Task {
  id: string;
  title: string;
  priority: TaskPriority;
  dueDate: string;
  assignee: Assignee;
  status: TaskStatus;
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
