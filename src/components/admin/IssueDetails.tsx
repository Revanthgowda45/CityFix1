import { Issue, IssueComment, IssuePriority, IssueStatus } from '@/lib/types/issue';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MapPin, MessageSquare, Paperclip } from 'lucide-react';

interface IssueDetailsProps {
  issue: Issue;
  onStatusChange: (status: IssueStatus) => void;
  onPriorityChange: (priority: IssuePriority) => void;
  onAssign: (userId: string) => void;
  onComment: (content: string) => void;
}

const priorityColors: Record<IssuePriority, string> = {
  low: 'bg-blue-100 text-blue-800',
  medium: 'bg-yellow-100 text-yellow-800',
  high: 'bg-orange-100 text-orange-800',
  critical: 'bg-red-100 text-red-800',
};

const statusColors: Record<IssueStatus, string> = {
  'open': 'bg-green-100 text-green-800',
  'in-progress': 'bg-blue-100 text-blue-800',
  'resolved': 'bg-purple-100 text-purple-800',
  'closed': 'bg-gray-100 text-gray-800',
};

export function IssueDetails({
  issue,
  onStatusChange,
  onPriorityChange,
  onAssign,
  onComment,
}: IssueDetailsProps) {
  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-2xl font-bold">{issue.title}</h1>
          <p className="text-gray-500">ID: {issue.id}</p>
        </div>
        <div className="flex gap-2">
          <Select
            value={issue.status}
            onValueChange={onStatusChange}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={issue.priority}
            onValueChange={onPriorityChange}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
              <SelectItem value="critical">Critical</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold mb-2">Description</h2>
            <p className="text-gray-700">{issue.description}</p>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">Location</h2>
            <div className="flex items-center gap-2 text-gray-700">
              <MapPin className="h-4 w-4" />
              <span>{issue.location.address}</span>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">Attachments</h2>
            <div className="flex gap-2">
              {issue.attachments.map((attachment, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Paperclip className="h-4 w-4" />
                  Attachment {index + 1}
                </Button>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <h2 className="text-lg font-semibold mb-2">Details</h2>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-500">Created</span>
                <span>{format(issue.createdAt, 'MMM dd, yyyy HH:mm')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Updated</span>
                <span>{format(issue.updatedAt, 'MMM dd, yyyy HH:mm')}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Created By</span>
                <span>{issue.createdBy}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Category</span>
                <span>{issue.category}</span>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-lg font-semibold mb-2">Assignment</h2>
            <Select
              value={issue.assignedTo || ''}
              onValueChange={onAssign}
            >
              <SelectTrigger>
                <SelectValue placeholder="Assign to..." />
              </SelectTrigger>
              <SelectContent>
                {/* Add your user list here */}
                <SelectItem value="user1">John Doe</SelectItem>
                <SelectItem value="user2">Jane Smith</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="border-t pt-6">
        <h2 className="text-lg font-semibold mb-4">Comments</h2>
        <div className="space-y-4">
          {issue.comments.map((comment) => (
            <div key={comment.id} className="flex gap-4">
              <Avatar>
                <AvatarImage src={`https://avatar.vercel.sh/${comment.createdBy}`} />
                <AvatarFallback>{comment.createdBy[0]}</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{comment.createdBy}</span>
                  <span className="text-gray-500">
                    {format(comment.createdAt, 'MMM dd, yyyy HH:mm')}
                  </span>
                </div>
                <p className="mt-1">{comment.content}</p>
                {comment.attachments.length > 0 && (
                  <div className="flex gap-2 mt-2">
                    {comment.attachments.map((attachment, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        className="flex items-center gap-2"
                      >
                        <Paperclip className="h-4 w-4" />
                        Attachment {index + 1}
                      </Button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6">
          <Textarea
            placeholder="Add a comment..."
            className="mb-2"
          />
          <div className="flex justify-between items-center">
            <Button variant="outline" size="sm">
              <Paperclip className="h-4 w-4 mr-2" />
              Attach Files
            </Button>
            <Button onClick={() => onComment('New comment')}>
              Add Comment
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 