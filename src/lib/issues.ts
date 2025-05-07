import { supabase } from './supabase';
import type { Issue, IssueComment, IssueStatus, IssuePriority, IssueCategory } from './supabase';

// Issue Functions
export const createIssue = async (issue: Omit<Issue, 'id' | 'created_at' | 'updated_at' | 'votes'>) => {
  const { data, error } = await supabase
    .from('issues')
    .insert([issue])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getIssues = async (filters?: {
  status?: IssueStatus;
  category?: IssueCategory;
  priority?: IssuePriority;
  userId?: string;
}) => {
  let query = supabase
    .from('issues')
    .select('*')
    .order('created_at', { ascending: false });

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }
  if (filters?.category) {
    query = query.eq('category', filters.category);
  }
  if (filters?.priority) {
    query = query.eq('priority', filters.priority);
  }
  if (filters?.userId) {
    query = query.eq('user_id', filters.userId);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data;
};

export const getIssueById = async (id: string) => {
  const { data, error } = await supabase
    .from('issues')
    .select(`
      *,
      user:profiles(name, avatar_url),
      assigned_to:profiles(name, avatar_url)
    `)
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
};

export const updateIssue = async (id: string, updates: Partial<Issue>) => {
  const { data, error } = await supabase
    .from('issues')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteIssue = async (id: string) => {
  const { error } = await supabase
    .from('issues')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

export const voteOnIssue = async (id: string, userId: string) => {
  const { data, error } = await supabase.rpc('vote_on_issue', {
    issue_id: id,
    user_id: userId
  });

  if (error) throw error;
  return data;
};

// Comment Functions
export const createComment = async (comment: Omit<IssueComment, 'id' | 'created_at' | 'updated_at'>) => {
  const { data, error } = await supabase
    .from('issue_comments')
    .insert([comment])
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const getComments = async (issueId: string) => {
  const { data, error } = await supabase
    .from('issue_comments')
    .select(`
      *,
      user:profiles(name, avatar_url)
    `)
    .eq('issue_id', issueId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data;
};

export const updateComment = async (id: string, content: string) => {
  const { data, error } = await supabase
    .from('issue_comments')
    .update({ content })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
};

export const deleteComment = async (id: string) => {
  const { error } = await supabase
    .from('issue_comments')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

// Real-time subscriptions
export const subscribeToIssues = (callback: (payload: any) => void) => {
  return supabase
    .channel('issues_changes')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'issues' }, callback)
    .subscribe();
};

export const subscribeToComments = (issueId: string, callback: (payload: any) => void) => {
  return supabase
    .channel(`comments_changes_${issueId}`)
    .on('postgres_changes', 
      { 
        event: '*', 
        schema: 'public', 
        table: 'issue_comments',
        filter: `issue_id=eq.${issueId}`
      }, 
      callback
    )
    .subscribe();
}; 