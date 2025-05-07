import { createClient } from '@supabase/supabase-js';

// Get these values from your Supabase project settings
// Project URL: Go to Project Settings -> API -> Project URL
// Anon Key: Go to Project Settings -> API -> anon public
const supabaseUrl = 'https://ugidurlpsftadqifzkwp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVnaWR1cmxwc2Z0YWRxaWZ6a3dwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDY0NjM5MjUsImV4cCI6MjA2MjAzOTkyNX0.0dqpzjC_OtWAhHLRXf10xFiCHlqmLoiy_LGiopaKCek';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Types for issues
export type IssueStatus = 'reported' | 'in_progress' | 'resolved' | 'closed';
export type IssuePriority = 'low' | 'medium' | 'high' | 'critical';
export type IssueCategory = 'road' | 'water' | 'electricity' | 'waste' | 'other';

export interface Issue {
  id: string;
  title: string;
  description: string;
  status: IssueStatus;
  priority: IssuePriority;
  category: IssueCategory;
  location: {
    latitude: number;
    longitude: number;
    address: string;
  };
  images: string[];
  created_at: string;
  updated_at: string;
  user_id: string;
  assigned_to?: string;
  resolution_notes?: string;
  votes: number;
}

export interface IssueComment {
  id: string;
  issue_id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
} 