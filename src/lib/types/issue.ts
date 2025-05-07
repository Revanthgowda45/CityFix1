export type IssuePriority = 'low' | 'medium' | 'high' | 'critical';
export type IssueStatus = 'open' | 'in-progress' | 'resolved' | 'closed';

export interface Issue {
  id: string;
  title: string;
  description: string;
  status: IssueStatus;
  priority: IssuePriority;
  assignedTo: string | null;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  location: {
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  category: string;
  attachments: string[];
  comments: IssueComment[];
}

export interface IssueComment {
  id: string;
  content: string;
  createdAt: Date;
  createdBy: string;
  attachments: string[];
}

export interface IssueFilter {
  status?: IssueStatus[];
  priority?: IssuePriority[];
  assignedTo?: string;
  category?: string;
  dateRange?: {
    start: Date;
    end: Date;
  };
  search?: string;
} 