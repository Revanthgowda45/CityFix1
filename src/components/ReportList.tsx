
import React from 'react';
import { useReports, Report } from '@/contexts/ReportContext';
import { useAuth } from '@/contexts/AuthContext';
import ReportCard from './ReportCard';
import { toast } from '@/components/ui/use-toast';

interface ReportListProps {
  reports?: Report[];
  title?: string;
  emptyMessage?: string;
}

const ReportList: React.FC<ReportListProps> = ({ 
  reports,
  title = "Recent Reports",
  emptyMessage = "No reports found"
}) => {
  const { upvoteReport } = useReports();
  const { currentUser, isAuthenticated } = useAuth();
  
  const reportsList = reports || [];

  const handleUpvote = (reportId: string) => {
    if (!isAuthenticated || !currentUser) {
      toast({
        title: "Authentication required",
        description: "Please sign in to upvote reports",
        variant: "destructive"
      });
      return;
    }
    
    upvoteReport(reportId, currentUser.id);
    toast({
      title: "Report upvoted",
      description: "Thank you for your feedback!"
    });
  };

  return (
    <div>
      {title && <h2 className="text-2xl font-semibold mb-6">{title}</h2>}
      {reportsList.length === 0 ? (
        <p className="text-center py-10 text-muted-foreground">{emptyMessage}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {reportsList.map(report => (
            <ReportCard 
              key={report.id} 
              report={report} 
              onUpvote={handleUpvote}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ReportList;
