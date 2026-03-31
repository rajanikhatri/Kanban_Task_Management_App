import type { Task } from '@/types/task';

export const mockTasks: Task[] = [
  {
    id: 'task-01',
    title: 'Design the Q2 launch hero section and supporting visual system',
    priority: 'high',
    dueDate: '2026-04-02',
    assignee: {
      name: 'Sarah Chen',
      initials: 'SC',
    },
    status: 'todo',
  },
  {
    id: 'task-02',
    title: 'Audit onboarding copy and simplify the account setup checklist',
    priority: 'medium',
    dueDate: '2026-04-05',
    assignee: {
      name: 'Mike Johnson',
      initials: 'MJ',
    },
    status: 'todo',
  },
  {
    id: 'task-03',
    title: 'Plan the analytics dashboard QA pass for tablet breakpoints',
    priority: 'low',
    dueDate: '2026-04-08',
    assignee: {
      name: 'Riley Kim',
      initials: 'RK',
    },
    status: 'todo',
  },
  {
    id: 'task-04',
    title: 'Fix the mobile navigation accessibility regression in settings',
    priority: 'high',
    dueDate: '2026-03-30',
    assignee: {
      name: 'Alex Park',
      initials: 'AP',
    },
    status: 'inProgress',
  },
  {
    id: 'task-05',
    title: 'Implement task filtering states for upcoming project views',
    priority: 'medium',
    dueDate: '2026-04-04',
    assignee: {
      name: 'Jordan Lee',
      initials: 'JL',
    },
    status: 'inProgress',
  },
  {
    id: 'task-06',
    title: 'Draft the migration notes for the notification preferences update',
    priority: 'medium',
    dueDate: '2026-04-03',
    assignee: {
      name: 'Chris Taylor',
      initials: 'CT',
    },
    status: 'inReview',
  },
  {
    id: 'task-07',
    title: 'Prepare success metrics for the release retrospective meeting',
    priority: 'low',
    dueDate: '2026-04-06',
    assignee: {
      name: 'Morgan Blake',
      initials: 'MB',
    },
    status: 'inReview',
  },
];
