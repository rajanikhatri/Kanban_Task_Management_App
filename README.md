# TaskFlow

TaskFlow is a Kanban-style task board built with React, TypeScript, Tailwind CSS, dnd-kit, and Supabase.

## Local Setup

1. Install dependencies with `npm install`.
2. Add a local `.env` file with:

```env
VITE_SUPABASE_URL=your-project-url
VITE_SUPABASE_ANON_KEY=your-anon-key
```

3. Make sure Supabase anonymous sign-ins are enabled and your `tasks` table plus RLS policies are configured.
4. Start the app with `npm run dev`.
  
