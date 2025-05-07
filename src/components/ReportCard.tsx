import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Report, ReportStatus } from '@/contexts/ReportContext';
import { formatDistanceToNow } from 'date-fns';
import { MapPin, ThumbsUp, MessageSquare, Loader2, ArrowRight } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

interface ReportCardProps {
  report: Report;
  onUpvote: (reportId: string) => void;
}

const getStatusColor = (status: ReportStatus) => {
  switch (status) {
    case 'reported':
      return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200';
    case 'under_review':
      return 'bg-blue-100 text-blue-800 hover:bg-blue-200';
    case 'in_progress':
      return 'bg-orange-100 text-orange-800 hover:bg-orange-200';
    case 'resolved':
      return 'bg-green-100 text-green-800 hover:bg-green-200';
    case 'closed':
      return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
    default:
      return 'bg-gray-100 text-gray-800 hover:bg-gray-200';
  }
};

const getSeverityColor = (severity: string) => {
  switch (severity) {
    case 'low':
      return 'bg-blue-100 text-blue-800';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800';
    case 'high':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-gray-100 text-gray-800';
  }
};

const getCategoryIcon = (category: string) => {
  // In a real app, you would use different icons for categories
  return <MapPin className="h-4 w-4" />;
};

const formatStatusLabel = (status: ReportStatus) => {
  return status.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase());
};

const ReportCard: React.FC<ReportCardProps> = ({ report, onUpvote }) => {
  const { isAuthenticated, currentUser } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isUpvoting, setIsUpvoting] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  
  const {
    id,
    title,
    description,
    category,
    location,
    images,
    status,
    severity,
    reportedBy,
    createdAt,
    upvotes,
    upvotedBy = [],
    comments,
  } = report;

  const hasUpvoted = currentUser ? upvotedBy.includes(currentUser.id) : false;

  const handleUpvote = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!isAuthenticated || hasUpvoted || isUpvoting) return;
    
    try {
      setIsUpvoting(true);
      await onUpvote(id);
      toast({
        title: "Upvoted successfully",
        description: "Your upvote has been recorded.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upvote. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpvoting(false);
    }
  };

  const handleCardClick = () => {
    navigate(`/issue/${id}`);
  };

  const truncateDescription = (text: string, maxLength: number = 100) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <Card 
      className={cn(
        "group relative overflow-hidden transition-all duration-200",
        "hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]",
        "border border-border/50 hover:border-border",
        "cursor-pointer"
      )}
      role="article"
      onClick={handleCardClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {images && images.length > 0 && (
        <div className="w-full h-48 relative overflow-hidden">
          <img 
            src={images[0]} 
            alt={`Issue: ${title}`}
            className={cn(
              "w-full h-full object-cover transition-transform duration-300",
              isHovered && "scale-110"
            )}
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          <div className="absolute bottom-2 right-2">
            <Badge 
              variant="secondary" 
              className={cn(
                getSeverityColor(severity),
                "backdrop-blur-sm bg-opacity-90"
              )}
              aria-label={`Severity: ${severity}`}
            >
              {severity.charAt(0).toUpperCase() + severity.slice(1)} Priority
            </Badge>
          </div>
        </div>
      )}
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-2">
          <Badge 
            variant="outline" 
            className={cn(
              getStatusColor(status),
              "transition-colors duration-200"
            )}
            aria-label={`Status: ${formatStatusLabel(status)}`}
          >
            {formatStatusLabel(status)}
          </Badge>
          <Badge 
            variant="outline" 
            className="capitalize"
            aria-label={`Category: ${category}`}
          >
            {category.replace('_', ' ')}
          </Badge>
        </div>
        <CardTitle className="text-xl mt-2 group-hover:text-primary transition-colors duration-200">
          {title}
        </CardTitle>
        <CardDescription className="flex items-center mt-1">
          <MapPin className="h-3 w-3 mr-1" aria-hidden="true" />
          <span>{location.address}</span>
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground line-clamp-2">
          {truncateDescription(description)}
        </p>
      </CardContent>
      <CardFooter className="flex justify-between pt-3 border-t">
        <div className="flex items-center">
          <Avatar className="h-6 w-6 mr-2">
            <AvatarFallback aria-label={`Avatar of ${reportedBy.name}`}>
              {reportedBy.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs text-muted-foreground">
            Posted by {reportedBy.name} · {formatDistanceToNow(new Date(createdAt), { addSuffix: true })}
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <div className="flex items-center text-muted-foreground" aria-label={`${comments.length} comments`}>
            <MessageSquare className="h-4 w-4 mr-1" aria-hidden="true" />
            <span className="text-xs">{comments.length}</span>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className={cn(
              "flex items-center text-muted-foreground hover:text-primary transition-colors duration-200",
              hasUpvoted && "opacity-50 cursor-not-allowed"
            )}
            onClick={handleUpvote}
            disabled={!isAuthenticated || hasUpvoted || isUpvoting}
            aria-label={hasUpvoted ? 'Already upvoted' : `Upvote (${upvotes} upvotes)`}
          >
            {isUpvoting ? (
              <Loader2 className="h-4 w-4 mr-1 animate-spin" />
            ) : (
              <ThumbsUp className="h-4 w-4 mr-1" />
            )}
            <span className="text-xs">{upvotes}</span>
          </Button>
        </div>
      </CardFooter>
      <div className="absolute right-4 top-4 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <ArrowRight className="h-5 w-5 text-muted-foreground" />
      </div>
    </Card>
  );
};

export default ReportCard;
