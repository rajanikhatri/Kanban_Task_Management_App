import { getSupabaseClient } from '@/lib/supabase';
import type { NewTaskInput, Task, TaskPriority, TaskStatus } from '@/types/task';

interface TaskRow {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  due_date: string | null;
  user_id: string;
  created_at: string;
}

const taskSelect = 'id,title,description,status,priority,due_date,user_id,created_at';

function mapTaskRow(row: TaskRow): Task {
  return {
    id: row.id,
    title: row.title,
    description: row.description ?? undefined,
    priority: row.priority,
    dueDate: row.due_date ?? undefined,
    assignee: {
      name: 'No Assignee',
      initials: 'NA',
    },
    status: row.status,
    userId: row.user_id,
    createdAt: row.created_at,
  };
}

export async function ensureAnonymousUserId(): Promise<string> {
  const supabase = getSupabaseClient();
  const {
    data: { session },
    error: sessionError,
  } = await supabase.auth.getSession();

  if (sessionError) {
    throw new Error(sessionError.message);
  }

  if (session?.user?.id) {
    return session.user.id;
  }

  const {
    data: { user },
    error,
  } = await supabase.auth.signInAnonymously();

  if (error) {
    throw new Error(error.message);
  }

  if (!user?.id) {
    throw new Error('Anonymous auth did not return a valid user id.');
  }

  return user.id;
}

export async function fetchTasksForUser(userId: string): Promise<Task[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('tasks')
    .select(taskSelect)
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data as TaskRow[]).map(mapTaskRow);
}

export async function createTaskForUser(userId: string, taskInput: NewTaskInput): Promise<Task> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('tasks')
    .insert({
      title: taskInput.title,
      description: taskInput.description ?? null,
      status: taskInput.status,
      priority: taskInput.priority,
      due_date: taskInput.dueDate ?? null,
      user_id: userId,
    })
    .select(taskSelect)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapTaskRow(data as TaskRow);
}

export async function updateTaskForUser(
  taskId: string,
  userId: string,
  taskInput: NewTaskInput,
): Promise<Task> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('tasks')
    .update({
      title: taskInput.title,
      description: taskInput.description ?? null,
      status: taskInput.status,
      priority: taskInput.priority,
      due_date: taskInput.dueDate ?? null,
    })
    .eq('id', taskId)
    .eq('user_id', userId)
    .select(taskSelect)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapTaskRow(data as TaskRow);
}

export async function updateTaskStatusForUser(
  taskId: string,
  userId: string,
  status: TaskStatus,
): Promise<Task> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('tasks')
    .update({ status })
    .eq('id', taskId)
    .eq('user_id', userId)
    .select(taskSelect)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapTaskRow(data as TaskRow);
}

export async function deleteTaskForUser(taskId: string, userId: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { error } = await supabase.from('tasks').delete().eq('id', taskId).eq('user_id', userId);

  if (error) {
    throw new Error(error.message);
  }
}
