# TaskFlow

TaskFlow is a production-style Kanban task manager built with React, TypeScript, Tailwind CSS, dnd-kit, and Supabase. It supports task creation, editing, deletion, drag-and-drop workflow updates, comments, activity history, search, filtering, and anonymous authentication.

## Overview

TaskFlow is designed to feel like a modern task management product instead of a static UI demo. Tasks are persisted in Supabase, organized across four workflow columns, and enriched with collaboration features through comments and activity tracking.

## Features

- Four-column Kanban board: To Do, In Progress, In Review, Done
- Drag-and-drop task movement across columns
- Create, edit, and delete tasks
- Right-side task detail panel
- Task comments with inline edit and delete
- Task activity timeline for create, edit, move, and comment events
- Search by title
- Filter by priority and status
- Overdue task highlighting
- Supabase persistence
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

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create a local `.env` file in the project root:

```env
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

3. Start the development server:

```bash
npm run dev
```

4. Open the local app in your browser using the Vite URL shown in the terminal.

## Supabase Setup

Before running the app, make sure Supabase is configured correctly.

### 1. Enable anonymous auth

In the Supabase dashboard:

1. Open your project
2. Go to `Authentication`
3. Enable anonymous sign-ins

### 2. Required tables

This app expects these tables:

- `tasks`
- `task_comments`
- `task_activity`

### 3. Tasks table fields

The `tasks` table should support:

- `id`
- `title`
- `description`
- `status`
- `priority`
- `due_date`
- `user_id`
- `created_at`

### 4. Comments table fields

The `task_comments` table should support:

- `id`
- `task_id`
- `user_id`
- `content`
- `created_at`

### 5. Activity table fields

The `task_activity` table should support:

- `id`
- `task_id`
- `user_id`
- `action_type`
- `message`
- `created_at`

If `task_activity.action_type` uses a check constraint, include these values:

- `task_created`
- `task_updated`
- `task_moved`
- `comment_added`
- `comment_edited`
- `comment_deleted`

### 6. Row Level Security

RLS should allow authenticated users to access only their own data.

At minimum, add policies so users can:

- select their own tasks, comments, and activity records
- insert their own tasks, comments, and activity records
- update their own tasks and comments
- delete their own tasks and comments

Use `auth.uid() = user_id` style policies for each table.

## Available Scripts

```bash
npm run dev
npm run build
npm run preview
npm run check
```

## Project Structure

```text
src/
  app/
    App.tsx
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

## Main Product Areas

- `src/app/App.tsx`
  Top-level layout, modal state, detail panel state, and filter state
- `src/hooks/useBoardState.ts`
  Central task state, Supabase sync, drag-and-drop persistence, and activity logging
- `src/components/board/*`
  Board, columns, cards, filters, and task actions
- `src/components/tasks/*`
  New task modal and task detail panel
- `src/lib/task-service.ts`
  Task fetch/create/update/delete logic
- `src/lib/task-collaboration-service.ts`
  Comments and activity service layer
- `src/lib/supabase.ts`
  Supabase client setup

## Deployment

TaskFlow is ready to deploy on Vercel.

For production deployment:

1. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` in Vercel project settings
2. Make sure your Supabase project has anonymous auth enabled
3. Confirm your production database tables and RLS policies are in place

## Future Improvements

- Real user profiles instead of anonymous sessions
- Assignee management
- Persistent task ordering
- Realtime collaboration
- Rich text comments
- File attachments


