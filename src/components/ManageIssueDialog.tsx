import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import { useReports } from '@/contexts/ReportContext';

interface ManageIssueDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  issueId: string;
  currentStatus: string;
}

const ManageIssueDialog: React.FC<ManageIssueDialogProps> = ({
  open,
  onOpenChange,
  issueId,
  currentStatus
}) => {
  const { updateReport } = useReports();
  const [status, setStatus] = React.useState(currentStatus);
  const [adminNotes, setAdminNotes] = React.useState('');
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const handleStatusChange = async (newStatus: string) => {
    setIsSubmitting(true);
    try {
      await updateReport(issueId, {
        status: newStatus,
        adminNotes: adminNotes.trim() ? adminNotes : undefined
      });
      
      toast({
        title: "Status Updated",
        description: `Issue status has been updated to "${newStatus.replace('_', ' ')}".`,
      });
      
      setStatus(newStatus);
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating issue:', error);
      toast({
        title: "Error",
        description: "Failed to update issue status. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Manage Issue</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={handleStatusChange}>
              <SelectTrigger id="status">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="reported">Reported</SelectItem>
                <SelectItem value="under_review">Under Review</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="adminNotes">Admin Notes</Label>
            <Textarea
              id="adminNotes"
              placeholder="Add internal notes about this issue..."
              value={adminNotes}
              onChange={(e) => setAdminNotes(e.target.value)}
              className="min-h-[100px]"
            />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            onClick={() => handleStatusChange(status)}
            disabled={isSubmitting}
          >
            {isSubmitting ? "Updating..." : "Update Status"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ManageIssueDialog; 