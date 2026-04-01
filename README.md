# TaskFlow

TaskFlow is a collaborative Kanban task manager built with React, TypeScript, Tailwind CSS, dnd-kit, and Supabase.

The app supports real task workflows with drag and drop, task creation and editing, comments, activity history, search, filtering, anonymous authentication, and Supabase persistence.

## Live Demo

[TaskFlow on Vercel](https://kanban-task-management-app-nu.vercel.app/)

## Product Snapshot

TaskFlow is designed to feel like a real project management product instead of a static UI demo. Users can move work across a four-stage board, open a task detail panel, discuss work through comments, and review a timeline of task activity.

## Core Features

- Four workflow columns: To Do, In Progress, In Review, Done
- Drag and drop task movement across columns
- Create, edit, and delete tasks
- Right-side task detail panel
- Per-task comments with inline edit and delete
- Activity log for task and comment events
- Search by title
- Filter by priority and status
- Overdue date highlighting
- Supabase-backed persistence
- Anonymous authentication
- RLS-compatible data flow

## Tech Stack

- React 18
- TypeScript
- Tailwind CSS
- Vite
- dnd-kit
- Supabase
- date-fns
- lucide-react

## Architecture

### Frontend

- `src/app/App.tsx`
  Top-level layout, filters, modal state, and task detail panel state
- `src/hooks/useBoardState.ts`
  Central task state, Supabase sync, drag-and-drop persistence, and activity logging
- `src/components/board/*`
  Board, columns, cards, filters, and task actions
- `src/components/tasks/*`
  New task modal and task detail panel

### Data Layer

- `src/lib/supabase.ts`
  Supabase client setup
- `src/lib/task-service.ts`
  Task fetch, create, update, delete, and status sync
- `src/lib/task-collaboration-service.ts`
  Comments and activity service functions

## Supabase Requirements

This project expects:

- Anonymous auth enabled
- A `tasks` table
- A `task_comments` table
- A `task_activity` table
- RLS policies scoped to `auth.uid() = user_id`

### Tasks table fields

- `id`
- `title`
- `description`
- `status`
- `priority`
- `due_date`
- `user_id`
- `created_at`

### Task comments table fields

- `id`
- `task_id`
- `user_id`
- `content`
- `created_at`

### Task activity table fields

- `id`
- `task_id`
- `user_id`
- `action_type`
- `message`
- `created_at`

### Supported activity types

- `task_created`
- `task_updated`
- `task_moved`
- `comment_added`
- `comment_edited`
- `comment_deleted`

## Running Locally

If you want to run the project on your machine:

1. Install dependencies

```bash
npm install
```

2. Create a local `.env` file in the project root

```env
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

3. Start the dev server

```bash
npm run dev
```

## Available Scripts

```bash
npm run dev
npm run build
npm run preview
npm run check
```

## Deployment

This app is deployed on Vercel.

For production deployment, make sure your hosting environment includes:

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`

Also confirm that:

- Supabase anonymous auth is enabled
- all required tables exist
- RLS policies are active for tasks, comments, and activity

## Project Structure

```text
src/
  app/
  components/
    board/
    dashboard/
    layout/
    tasks/
    ui/
  data/
  hooks/
  lib/
  styles/
  types/
```

## Future Improvements

- Real user accounts and profiles
- Persistent card ordering in the database
- Realtime collaboration
- Assignee management
- File attachments
- Rich text comments

## License

This project is currently intended for portfolio and educational use.
