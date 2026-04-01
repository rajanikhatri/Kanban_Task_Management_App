import { getSupabaseClient } from '@/lib/supabase';
import type { TaskActivity, TaskActivityActionType, TaskComment } from '@/types/task';

interface TaskCommentRow {
  id: string;
  task_id: string;
  user_id: string;
  content: string;
  created_at: string;
}

interface TaskActivityRow {
  id: string;
  task_id: string;
  user_id: string;
  action_type: TaskActivityActionType;
  message: string;
  created_at: string;
}

const taskCommentSelect = 'id,task_id,user_id,content,created_at';
const taskActivitySelect = 'id,task_id,user_id,action_type,message,created_at';

function mapTaskCommentRow(row: TaskCommentRow): TaskComment {
  return {
    id: row.id,
    taskId: row.task_id,
    userId: row.user_id,
    content: row.content,
    createdAt: row.created_at,
  };
}

function mapTaskActivityRow(row: TaskActivityRow): TaskActivity {
  return {
    id: row.id,
    taskId: row.task_id,
    userId: row.user_id,
    actionType: row.action_type,
    message: row.message,
    createdAt: row.created_at,
  };
}

export async function fetchCommentsForTask(taskId: string): Promise<TaskComment[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('task_comments')
    .select(taskCommentSelect)
    .eq('task_id', taskId)
    .order('created_at', { ascending: true });

  if (error) {
    throw new Error(error.message);
  }

  return (data as TaskCommentRow[]).map(mapTaskCommentRow);
}

export async function createCommentForTask(
  taskId: string,
  userId: string,
  content: string,
): Promise<TaskComment> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('task_comments')
    .insert({
      task_id: taskId,
      user_id: userId,
      content,
    })
    .select(taskCommentSelect)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapTaskCommentRow(data as TaskCommentRow);
}

export async function updateCommentForUser(
  commentId: string,
  userId: string,
  content: string,
): Promise<TaskComment> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('task_comments')
    .update({
      content,
    })
    .eq('id', commentId)
    .eq('user_id', userId)
    .select(taskCommentSelect)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error('Comment not found or you do not have permission to edit it.');
  }

  return mapTaskCommentRow(data as TaskCommentRow);
}

export async function deleteCommentForUser(commentId: string, userId: string): Promise<void> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('task_comments')
    .delete()
    .eq('id', commentId)
    .eq('user_id', userId)
    .select('id')
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  if (!data) {
    throw new Error('Comment not found or you do not have permission to delete it.');
  }
}

export async function fetchActivityForTask(taskId: string): Promise<TaskActivity[]> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('task_activity')
    .select(taskActivitySelect)
    .eq('task_id', taskId)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data as TaskActivityRow[]).map(mapTaskActivityRow);
}

export async function createTaskActivityForTask(
  taskId: string,
  userId: string,
  actionType: TaskActivityActionType,
  message: string,
): Promise<TaskActivity> {
  const supabase = getSupabaseClient();
  const { data, error } = await supabase
    .from('task_activity')
    .insert({
      task_id: taskId,
      user_id: userId,
      action_type: actionType,
      message,
    })
    .select(taskActivitySelect)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapTaskActivityRow(data as TaskActivityRow);
}
