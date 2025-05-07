import { useState } from 'react';
import { Issue, IssuePriority, IssueStatus } from '@/lib/types/issue';
import { IssueManagement } from '@/components/admin/IssueManagement';
import { IssueDetails } from '@/components/admin/IssueDetails';
import { IssueForm } from '@/components/admin/IssueForm';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

type View = 'list' | 'details' | 'create' | 'edit';

export function IssuesPage() {
  const [view, setView] = useState<View>('list');
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);

  const handleViewIssue = (issue: Issue) => {
    setSelectedIssue(issue);
    setView('details');
  };

  const handleCreateIssue = () => {
    setSelectedIssue(null);
    setView('create');
  };

  const handleEditIssue = (issue: Issue) => {
    setSelectedIssue(issue);
    setView('edit');
  };

  const handleIssueSubmit = (issueData: Partial<Issue>) => {
    // Implement issue creation/update logic
    console.log('Submitting issue:', issueData);
    setView('list');
  };

  const handleStatusChange = (status: IssueStatus) => {
    if (selectedIssue) {
      // Implement status update logic
      console.log('Updating status:', status);
    }
  };

  const handlePriorityChange = (priority: IssuePriority) => {
    if (selectedIssue) {
      // Implement priority update logic
      console.log('Updating priority:', priority);
    }
  };

  const handleAssign = (userId: string) => {
    if (selectedIssue) {
      // Implement assignment logic
      console.log('Assigning to:', userId);
    }
  };

  const handleComment = (content: string) => {
    if (selectedIssue) {
      // Implement comment logic
      console.log('Adding comment:', content);
    }
  };

  return (
    <div className="container mx-auto py-6">
      {view === 'list' && (
        <IssueManagement
          onViewIssue={handleViewIssue}
          onCreateIssue={handleCreateIssue}
        />
      )}

      {view === 'details' && selectedIssue && (
        <IssueDetails
          issue={selectedIssue}
          onStatusChange={handleStatusChange}
          onPriorityChange={handlePriorityChange}
          onAssign={handleAssign}
          onComment={handleComment}
        />
      )}

      <Dialog
        open={view === 'create' || view === 'edit'}
        onOpenChange={(open) => {
          if (!open) setView('list');
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {view === 'create' ? 'Create New Issue' : 'Edit Issue'}
            </DialogTitle>
          </DialogHeader>
          <IssueForm
            issue={selectedIssue || undefined}
            onSubmit={handleIssueSubmit}
            onCancel={() => setView('list')}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
} 