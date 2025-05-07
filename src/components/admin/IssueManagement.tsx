import { useState } from 'react';
import { Issue, IssueFilter, IssuePriority, IssueStatus } from '@/lib/types/issue';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { format } from 'date-fns';
import { CalendarIcon, Filter, Search } from 'lucide-react';

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

export function IssueManagement() {
  const [filter, setFilter] = useState<IssueFilter>({});
  const [dateRange, setDateRange] = useState<{ start?: Date; end?: Date }>({});

  // Mock data - replace with actual data fetching
  const issues: Issue[] = [];

  const handleFilterChange = (key: keyof IssueFilter, value: any) => {
    setFilter(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Issue Management</h1>
        <Button>Create New Issue</Button>
      </div>

      {/* Filters */}
      <div className="flex gap-4 flex-wrap">
        <div className="flex-1 min-w-[200px]">
          <Input
            placeholder="Search issues..."
            value={filter.search || ''}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="w-full"
            icon={<Search className="h-4 w-4" />}
          />
        </div>

        <Select
          value={filter.status?.[0]}
          onValueChange={(value) => handleFilterChange('status', [value])}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="resolved">Resolved</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={filter.priority?.[0]}
          onValueChange={(value) => handleFilterChange('priority', [value])}
        >
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="critical">Critical</SelectItem>
          </SelectContent>
        </Select>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="w-[240px] justify-start text-left font-normal">
              <CalendarIcon className="mr-2 h-4 w-4" />
              {dateRange.start ? (
                dateRange.end ? (
                  <>
                    {format(dateRange.start, "LLL dd, y")} -{" "}
                    {format(dateRange.end, "LLL dd, y")}
                  </>
                ) : (
                  format(dateRange.start, "LLL dd, y")
                )
              ) : (
                <span>Pick a date range</span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-auto p-0" align="start">
            <Calendar
              initialFocus
              mode="range"
              defaultMonth={dateRange.start}
              selected={dateRange}
              onSelect={(range) => {
                setDateRange(range || {});
                handleFilterChange('dateRange', range);
              }}
              numberOfMonths={2}
            />
          </PopoverContent>
        </Popover>
      </div>

      {/* Issues Table */}
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead>Assigned To</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {issues.map((issue) => (
              <TableRow key={issue.id}>
                <TableCell className="font-medium">{issue.id}</TableCell>
                <TableCell>{issue.title}</TableCell>
                <TableCell>
                  <Badge className={statusColors[issue.status]}>
                    {issue.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge className={priorityColors[issue.priority]}>
                    {issue.priority}
                  </Badge>
                </TableCell>
                <TableCell>{issue.assignedTo || 'Unassigned'}</TableCell>
                <TableCell>{format(issue.createdAt, 'MMM dd, yyyy')}</TableCell>
                <TableCell>
                  <Button variant="ghost" size="sm">
                    View
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
} 