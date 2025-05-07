import { useState } from 'react';
import { Issue, IssuePriority, IssueStatus } from '@/lib/types/issue';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { MapPin, Paperclip } from 'lucide-react';

interface IssueFormProps {
  issue?: Issue;
  onSubmit: (issue: Partial<Issue>) => void;
  onCancel: () => void;
}

export function IssueForm({ issue, onSubmit, onCancel }: IssueFormProps) {
  const [formData, setFormData] = useState<Partial<Issue>>(
    issue || {
      title: '',
      description: '',
      status: 'open',
      priority: 'medium',
      category: '',
      location: {
        address: '',
        coordinates: {
          lat: 0,
          lng: 0,
        },
      },
      attachments: [],
    }
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const handleChange = (
    field: keyof Issue,
    value: string | IssueStatus | IssuePriority
  ) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleLocationChange = (address: string) => {
    setFormData((prev) => ({
      ...prev,
      location: {
        ...prev.location!,
        address,
      },
    }));
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="title">Title</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => handleChange('title', e.target.value)}
            placeholder="Enter issue title"
            required
          />
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => handleChange('description', e.target.value)}
            placeholder="Enter issue description"
            required
            className="min-h-[100px]"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value: IssueStatus) => handleChange('status', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="open">Open</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="priority">Priority</Label>
            <Select
              value={formData.priority}
              onValueChange={(value: IssuePriority) =>
                handleChange('priority', value)
              }
            >
              <SelectTrigger>
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

        <div>
          <Label htmlFor="category">Category</Label>
          <Input
            id="category"
            value={formData.category}
            onChange={(e) => handleChange('category', e.target.value)}
            placeholder="Enter issue category"
            required
          />
        </div>

        <div>
          <Label htmlFor="location">Location</Label>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 h-4 w-4 text-gray-500" />
            <Input
              id="location"
              value={formData.location?.address}
              onChange={(e) => handleLocationChange(e.target.value)}
              placeholder="Enter issue location"
              className="pl-10"
              required
            />
          </div>
        </div>

        <div>
          <Label>Attachments</Label>
          <div className="mt-2">
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => {
                // Implement file upload logic
              }}
            >
              <Paperclip className="h-4 w-4 mr-2" />
              Add Attachments
            </Button>
          </div>
          {formData.attachments && formData.attachments.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-2">
              {formData.attachments.map((attachment, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 bg-gray-100 px-3 py-1 rounded-full"
                >
                  <Paperclip className="h-4 w-4" />
                  <span>Attachment {index + 1}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-4 w-4 p-0"
                    onClick={() => {
                      // Implement remove attachment logic
                    }}
                  >
                    ×
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit">
          {issue ? 'Update Issue' : 'Create Issue'}
        </Button>
      </div>
    </form>
  );
} 