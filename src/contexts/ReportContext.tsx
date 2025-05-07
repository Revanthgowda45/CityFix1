import React, { createContext, useState, useContext, useEffect } from 'react';
import { createIssue, getIssues, updateIssue, deleteIssue, subscribeToIssues, voteOnIssue, createComment, getComments } from '@/lib/issues';
import type { IssueCategory, IssuePriority } from '@/lib/supabase';

export interface Report {
  id: string;
  title: string;
  description: string;
  category: ReportCategory;
  location: {
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  images: string[];
  status: ReportStatus;
  severity: ReportSeverity;
  reportedBy: {
    id: string;
    name: string;
  };
  createdAt: string;
  updatedAt: string;
  upvotes: number;
  upvotedBy: string[];
  comments: ReportComment[];
  assignedTo?: {
    id: string;
    name: string;
  };
}

export interface ReportComment {
  id: string;
  text: string;
  createdAt: string;
  user: {
    id: string;
    name: string;
    role: 'citizen' | 'admin';
  };
}

export type ReportCategory = 
  'pothole' | 
  'streetlight' | 
  'garbage' | 
  'graffiti' | 
  'road_damage' | 
  'flooding' | 
  'sign_damage' | 
  'other';

export type ReportStatus = 
  'reported' | 
  'under_review' | 
  'in_progress' | 
  'resolved' | 
  'closed';

export type ReportSeverity = 
  'low' | 
  'medium' | 
  'high';

interface ReportContextType {
  reports: Report[];
  addReport: (report: Omit<Report, 'id' | 'createdAt' | 'updatedAt' | 'upvotes' | 'comments'>) => void;
  updateReport: (id: string, updates: Partial<Report>) => void;
  deleteReport: (id: string) => void;
  getReportById: (id: string) => Promise<Report | undefined>;
  upvoteReport: (id: string, userId: string) => void;
  addComment: (reportId: string, comment: Omit<ReportComment, 'id' | 'createdAt'>) => void;
  isLoading: boolean;
}

const ReportContext = createContext<ReportContextType | undefined>(undefined);

export const useReports = (): ReportContextType => {
  const context = useContext(ReportContext);
  if (!context) {
    throw new Error('useReports must be used within a ReportProvider');
  }
  return context;
};

// Sample data for demo purposes
const sampleReports: Report[] = [
  {
    id: '1',
    title: 'Large pothole on Main Street',
    description: 'There is a large pothole in the middle of Main Street near the intersection with Oak Avenue that is causing damage to vehicles.',
    category: 'pothole',
    location: {
      address: '123 Main St, Anytown',
      coordinates: {
        lat: 40.7128,
        lng: -74.006,
      },
    },
    images: ['https://example.com/pothole1.jpg'],
    status: 'reported',
    severity: 'high',
    reportedBy: {
      id: '1',
      name: 'John Doe',
    },
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
    upvotes: 5,
    upvotedBy: ['2', '3', '4', '5', '6'],
    comments: [],
  },
  {
    id: '2',
    title: 'Broken streetlight on Oak Avenue',
    description: 'Streetlight is not working at the corner of Oak Avenue and Pine Street.',
    category: 'streetlight',
    location: {
      address: '456 Oak Ave, Anytown',
      coordinates: {
        lat: 40.7129,
        lng: -74.007,
      },
    },
    images: ['https://example.com/streetlight1.jpg'],
    status: 'under_review',
    severity: 'medium',
    reportedBy: {
      id: '2',
      name: 'Jane Smith',
    },
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
    upvotes: 3,
    upvotedBy: ['1', '3', '4'],
    comments: [],
  },
  {
    id: '3',
    title: 'Garbage pileup in alley',
    description: 'Large amount of garbage has accumulated in the alley behind 789 Market Street.',
    category: 'garbage',
    location: {
      address: '789 Market St, Anytown',
      coordinates: {
        lat: 40.7130,
        lng: -74.008,
      },
    },
    images: ['https://example.com/garbage1.jpg'],
    status: 'in_progress',
    severity: 'low',
    reportedBy: {
      id: '3',
      name: 'Bob Johnson',
    },
    createdAt: '2024-01-03T00:00:00Z',
    updatedAt: '2024-01-03T00:00:00Z',
    upvotes: 2,
    upvotedBy: ['1', '4'],
    comments: [],
  }
];

interface ReportProviderProps {
  children: React.ReactNode;
}

export const ReportProvider: React.FC<ReportProviderProps> = ({ children }) => {
  const [reports, setReports] = useState<Report[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const issues = await getIssues();
        const formattedReports = issues.map(issue => ({
          id: issue.id,
          title: issue.title,
          description: issue.description,
          category: issue.category as ReportCategory,
          location: {
            address: issue.location.address,
            coordinates: {
              lat: issue.location.latitude,
              lng: issue.location.longitude,
            },
          },
          images: issue.images || [],
          status: issue.status as ReportStatus,
          severity: issue.priority as ReportSeverity,
          reportedBy: {
            id: issue.user_id,
            name: 'Anonymous', // We'll update this later when we have user profiles
          },
          createdAt: issue.created_at,
          updatedAt: issue.updated_at,
          upvotes: issue.votes || 0,
          upvotedBy: [], // We'll implement this later
          comments: [], // We'll implement this later
          assignedTo: issue.assigned_to ? {
            id: issue.assigned_to,
            name: 'Anonymous', // We'll update this later when we have user profiles
          } : undefined,
        }));
        setReports(formattedReports);
      } catch (error) {
        console.error('Error fetching reports:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchReports();

    // Subscribe to real-time updates
    const subscription = subscribeToIssues(async (payload) => {
      // Refresh the reports list when there are changes
      await fetchReports();
    });

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const reportCategoryToIssueCategory = (category: ReportCategory): IssueCategory => {
    switch (category) {
      case 'pothole':
      case 'road_damage':
        return 'road';
      case 'streetlight':
        return 'electricity';
      case 'garbage':
      case 'flooding':
      case 'sign_damage':
        return 'waste';
      case 'graffiti':
        return 'other';
      case 'other':
        return 'other';
      default:
        return 'other';
    }
  };

  const reportSeverityToPriority = (severity: ReportSeverity): IssuePriority => {
    switch (severity) {
      case 'low': return 'low';
      case 'medium': return 'medium';
      case 'high': return 'high';
      default: return 'medium';
    }
  };

  const addReport = async (report: Omit<Report, 'id' | 'createdAt' | 'updatedAt' | 'upvotes' | 'upvotedBy' | 'comments'>) => {
    const supabaseIssue = {
      title: report.title,
      description: report.description,
      category: reportCategoryToIssueCategory(report.category),
      status: report.status === 'under_review' ? 'reported' : report.status, // fallback if needed
      priority: reportSeverityToPriority(report.severity),
      location: {
        latitude: report.location.coordinates.lat,
        longitude: report.location.coordinates.lng,
        address: report.location.address,
      },
      images: report.images,
      user_id: report.reportedBy.id,
    };
    const createdIssue = await createIssue(supabaseIssue);
    
    // Add the new report to the local state
    const newReport: Report = {
      id: createdIssue.id,
      title: createdIssue.title,
      description: createdIssue.description,
      category: report.category,
      location: {
        address: createdIssue.location.address,
        coordinates: {
          lat: createdIssue.location.latitude,
          lng: createdIssue.location.longitude,
        },
      },
      images: createdIssue.images,
      status: createdIssue.status as ReportStatus,
      severity: report.severity,
      reportedBy: report.reportedBy,
      createdAt: createdIssue.created_at,
      updatedAt: createdIssue.updated_at,
      upvotes: createdIssue.votes || 0,
      upvotedBy: [],
      comments: [],
      assignedTo: createdIssue.assigned_to ? {
        id: createdIssue.assigned_to,
        name: 'Anonymous', // We'll update this later when we have user profiles
      } : undefined,
    };
    
    setReports(prevReports => [...prevReports, newReport]);
    return newReport;
  };

  const updateReport = async (id: string, updates: Partial<Report>) => {
    // Prepare updates for Supabase
    const supabaseUpdates: any = {};
    if (updates.title) supabaseUpdates.title = updates.title;
    if (updates.description) supabaseUpdates.description = updates.description;
    if (updates.category) supabaseUpdates.category = reportCategoryToIssueCategory(updates.category);
    if (updates.severity) supabaseUpdates.priority = reportSeverityToPriority(updates.severity);
    if (updates.location) {
      supabaseUpdates.location = {
        latitude: updates.location.coordinates.lat,
        longitude: updates.location.coordinates.lng,
        address: updates.location.address,
      };
    }
    if (updates.images) supabaseUpdates.images = updates.images;
    if (updates.status) supabaseUpdates.status = updates.status;
    await updateIssue(id, supabaseUpdates);
    setReports(
      reports.map((report) => 
        report.id === id
          ? { ...report, ...updates, updatedAt: new Date().toISOString() }
          : report
      )
    );
  };

  const deleteReport = async (id: string) => {
    await deleteIssue(id);
    setReports(reports.filter((report) => report.id !== id));
  };

  const getReportById = async (id: string) => {
    const report = reports.find((report) => report.id === id);
    if (!report) return undefined;

    try {
      // Fetch comments for this report
      const comments = await getComments(id);
      
      // Transform the comments to match our ReportComment interface
      const transformedComments = comments.map(comment => ({
        id: comment.id,
        text: comment.content,
        createdAt: comment.created_at,
        user: {
          id: comment.user.id,
          name: comment.user.name,
          role: comment.user.role as 'citizen' | 'admin' || 'citizen' // Use the role from the database or default to citizen
        }
      }));

      // Return the report with its comments
      return {
        ...report,
        comments: transformedComments
      };
    } catch (error) {
      console.error('Error fetching comments:', error);
      return report; // Return report without comments if there's an error
    }
  };

  const upvoteReport = async (id: string, userId: string) => {
    // Call Supabase to persist the upvote
    try {
      await voteOnIssue(id, userId);
    } catch (error) {
      console.error('Error upvoting issue in Supabase:', error);
    }
    setReports(
      reports.map((report) => {
        if (report.id === id) {
          // Check if user has already upvoted
          if (report.upvotedBy.includes(userId)) {
            return report; // Return unchanged report if user already upvoted
          }
          // Add user to upvotedBy array and increment upvotes
          return {
            ...report,
            upvotes: report.upvotes + 1,
            upvotedBy: [...report.upvotedBy, userId],
            updatedAt: new Date().toISOString()
          };
        }
        return report;
      })
    );
  };

  const addComment = async (reportId: string, commentData: Omit<ReportComment, 'id' | 'createdAt'>) => {
    try {
      // Store comment in Supabase
      const comment = await createComment({
        issue_id: reportId,
        user_id: commentData.user.id,
        content: commentData.text
      });

      const now = new Date().toISOString();
      const newComment: ReportComment = {
        ...commentData,
        id: comment.id,
        createdAt: comment.created_at,
      };

      setReports(
        reports.map((report) => 
          report.id === reportId
            ? { 
                ...report, 
                comments: [...report.comments, newComment], 
                updatedAt: now 
              }
            : report
        )
      );
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  };

  return (
    <ReportContext.Provider
      value={{
        reports,
        addReport,
        updateReport,
        deleteReport,
        getReportById,
        upvoteReport,
        addComment,
        isLoading,
      }}
    >
      {children}
    </ReportContext.Provider>
  );
};
