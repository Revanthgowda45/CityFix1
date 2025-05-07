import React, { useState, useEffect, useMemo } from 'react';
import { Navigate, Link, useNavigate } from 'react-router-dom';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/contexts/AuthContext';
import { useReports, Report, ReportStatus } from '@/contexts/ReportContext';
import { toast } from '@/components/ui/use-toast';
import { format, formatDistanceToNow } from 'date-fns';
import { 
  Search, 
  Filter, 
  BarChart2,
  Users,
  AlertTriangle,
  CheckCircle,
  Clock,
  MapPin,
  Loader2,
  Download,
  Plus,
  ArrowUpDown,
  ChevronDown,
  FileText,
  Settings,
  Bell,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  X,
  Trash2,
  Check,
  MessageSquare,
  User
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { NotificationsDialog } from '@/components/NotificationsDialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

const ITEMS_PER_PAGE_OPTIONS = [10, 20, 30, 50];

type SortField = 'createdAt' | 'title' | 'status' | 'severity';
type SortDirection = 'asc' | 'desc';

interface DashboardSettings {
  defaultItemsPerPage: number;
  showAnalytics: boolean;
  enableNotifications: boolean;
  autoRefresh: boolean;
  refreshInterval: number;
  defaultSort: SortField;
  defaultSortDirection: SortDirection;
  showSeverity: boolean;
  showCategory: boolean;
  showLocation: boolean;
  showReportedBy: boolean;
}

const DEFAULT_SETTINGS: DashboardSettings = {
  defaultItemsPerPage: 10,
  showAnalytics: true,
  enableNotifications: true,
  autoRefresh: false,
  refreshInterval: 30,
  defaultSort: 'createdAt',
  defaultSortDirection: 'desc',
  showSeverity: true,
  showCategory: true,
  showLocation: true,
  showReportedBy: true,
};

interface SettingsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  settings: DashboardSettings;
  onSettingsChange: (settings: DashboardSettings) => void;
  onSave: () => void;
}

const SettingsDialog: React.FC<SettingsDialogProps> = ({
  open,
  onOpenChange,
  settings,
  onSettingsChange,
  onSave,
}) => {
  const updateSettings = (updates: Partial<DashboardSettings>) => {
    onSettingsChange({ ...settings, ...updates });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] h-[80vh] flex flex-col p-0">
        {/* Fixed Header */}
        <div className="p-6 border-b">
          <DialogTitle className="text-2xl font-bold">Dashboard Settings</DialogTitle>
          <DialogDescription className="text-base mt-2">
            Customize your dashboard experience and preferences
          </DialogDescription>
        </div>

        {/* Scrollable Content */}
        <ScrollArea className="flex-1">
          <div className="p-6 space-y-8">
            {/* Display Settings Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-muted-foreground" />
                <h3 className="text-lg font-semibold">Display Settings</h3>
              </div>
              <div className="grid gap-4 pl-7">
                <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                  <div className="space-y-0.5">
                    <Label htmlFor="show-analytics" className="text-base">Show Analytics Tab</Label>
                    <p className="text-sm text-muted-foreground">Display the analytics dashboard with charts and statistics</p>
                  </div>
                  <Switch
                    id="show-analytics"
                    checked={settings.showAnalytics}
                    onCheckedChange={(checked) => 
                      updateSettings({ showAnalytics: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                  <div className="space-y-0.5">
                    <Label htmlFor="show-severity" className="text-base">Show Severity Column</Label>
                    <p className="text-sm text-muted-foreground">Display the severity level of each issue</p>
                  </div>
                  <Switch
                    id="show-severity"
                    checked={settings.showSeverity}
                    onCheckedChange={(checked) => 
                      updateSettings({ showSeverity: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                  <div className="space-y-0.5">
                    <Label htmlFor="show-category" className="text-base">Show Category Column</Label>
                    <p className="text-sm text-muted-foreground">Display the category of each issue</p>
                  </div>
                  <Switch
                    id="show-category"
                    checked={settings.showCategory}
                    onCheckedChange={(checked) => 
                      updateSettings({ showCategory: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                  <div className="space-y-0.5">
                    <Label htmlFor="show-location" className="text-base">Show Location Column</Label>
                    <p className="text-sm text-muted-foreground">Display the location of each issue</p>
                  </div>
                  <Switch
                    id="show-location"
                    checked={settings.showLocation}
                    onCheckedChange={(checked) => 
                      updateSettings({ showLocation: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                  <div className="space-y-0.5">
                    <Label htmlFor="show-reported-by" className="text-base">Show Reported By Column</Label>
                    <p className="text-sm text-muted-foreground">Display who reported each issue</p>
                  </div>
                  <Switch
                    id="show-reported-by"
                    checked={settings.showReportedBy}
                    onCheckedChange={(checked) => 
                      updateSettings({ showReportedBy: checked })
                    }
                  />
                </div>
              </div>
            </div>

            <Separator />

            {/* Default Settings Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-muted-foreground" />
                <h3 className="text-lg font-semibold">Default Settings</h3>
              </div>
              <div className="grid gap-4 pl-7">
                <div className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                  <Label htmlFor="items-per-page" className="text-base mb-2 block">
                    Items per page
                  </Label>
                  <Select
                    value={settings.defaultItemsPerPage.toString()}
                    onValueChange={(value) => 
                      updateSettings({ defaultItemsPerPage: parseInt(value) })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select items per page" />
                    </SelectTrigger>
                    <SelectContent>
                      {ITEMS_PER_PAGE_OPTIONS.map((option) => (
                        <SelectItem key={option} value={option.toString()}>
                          {option} items
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                  <Label htmlFor="default-sort" className="text-base mb-2 block">
                    Default sort field
                  </Label>
                  <Select
                    value={settings.defaultSort}
                    onValueChange={(value: SortField) => 
                      updateSettings({ defaultSort: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select default sort" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="createdAt">Reported Date</SelectItem>
                      <SelectItem value="title">Issue Title</SelectItem>
                      <SelectItem value="status">Status</SelectItem>
                      <SelectItem value="severity">Severity</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                  <Label htmlFor="sort-direction" className="text-base mb-2 block">
                    Default sort direction
                  </Label>
                  <Select
                    value={settings.defaultSortDirection}
                    onValueChange={(value: SortDirection) => 
                      updateSettings({ defaultSortDirection: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select sort direction" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="asc">Ascending</SelectItem>
                      <SelectItem value="desc">Descending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <Separator />

            {/* Notifications & Updates Section */}
            <div className="space-y-6">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-muted-foreground" />
                <h3 className="text-lg font-semibold">Notifications & Updates</h3>
              </div>
              <div className="grid gap-4 pl-7">
                <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                  <div className="space-y-0.5">
                    <Label htmlFor="enable-notifications" className="text-base">Enable Notifications</Label>
                    <p className="text-sm text-muted-foreground">Receive notifications for new reports and updates</p>
                  </div>
                  <Switch
                    id="enable-notifications"
                    checked={settings.enableNotifications}
                    onCheckedChange={(checked) => 
                      updateSettings({ enableNotifications: checked })
                    }
                  />
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                  <div className="space-y-0.5">
                    <Label htmlFor="auto-refresh" className="text-base">Auto Refresh</Label>
                    <p className="text-sm text-muted-foreground">Automatically refresh the dashboard data</p>
                  </div>
                  <Switch
                    id="auto-refresh"
                    checked={settings.autoRefresh}
                    onCheckedChange={(checked) => 
                      updateSettings({ autoRefresh: checked })
                    }
                  />
                </div>

                <div className="p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                  <Label htmlFor="refresh-interval" className="text-base mb-2 block">
                    Refresh interval
                  </Label>
                  <Select
                    value={settings.refreshInterval.toString()}
                    onValueChange={(value) => 
                      updateSettings({ refreshInterval: parseInt(value) })
                    }
                    disabled={!settings.autoRefresh}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select refresh interval" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="15">Every 15 seconds</SelectItem>
                      <SelectItem value="30">Every 30 seconds</SelectItem>
                      <SelectItem value="60">Every minute</SelectItem>
                      <SelectItem value="300">Every 5 minutes</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
        </ScrollArea>

        {/* Fixed Footer */}
        <div className="p-6 border-t bg-background">
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={onSave}>
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

const AdminDashboard = () => {
  const { currentUser, isAuthenticated } = useAuth();
  const { reports, updateReport, isLoading } = useReports();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('createdAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [settings, setSettings] = useState<DashboardSettings>(DEFAULT_SETTINGS);
  
  // Redirect if not admin
  if (!isAuthenticated || currentUser?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  // Show loading spinner while reports are loading
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen">
        <Loader2 className="animate-spin h-12 w-12 text-muted-foreground mb-4" />
        <p className="text-lg text-muted-foreground">Loading reports...</p>
      </div>
    );
  }

  // Load saved settings on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('adminDashboardSettings');
    if (savedSettings) {
      try {
        const parsedSettings = JSON.parse(savedSettings) as DashboardSettings;
        setSettings(parsedSettings);
        // Apply saved settings
        setItemsPerPage(parsedSettings.defaultItemsPerPage);
        setSortField(parsedSettings.defaultSort);
        setSortDirection(parsedSettings.defaultSortDirection);
      } catch (error) {
        console.error('Error loading saved settings:', error);
      }
    }
  }, []);

  // Handle settings save
  const handleSaveSettings = () => {
    // Apply settings
    setItemsPerPage(settings.defaultItemsPerPage);
    setSortField(settings.defaultSort);
    setSortDirection(settings.defaultSortDirection);
    
    // Save settings to localStorage
    localStorage.setItem('adminDashboardSettings', JSON.stringify(settings));
    
    setIsSettingsOpen(false);
    toast({
      title: "Settings saved",
      description: "Your dashboard settings have been updated.",
    });
  };

  const filteredReports = reports.filter(report => {
    const matchesSearch = 
      report.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      report.location.address.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'all' || report.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || report.category === categoryFilter;
    
    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Sort reports
  const sortedReports = [...filteredReports].sort((a, b) => {
    const aValue = a[sortField as keyof Report];
    const bValue = b[sortField as keyof Report];
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return sortDirection === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }
    
    if (aValue instanceof Date && bValue instanceof Date) {
      return sortDirection === 'asc'
        ? aValue.getTime() - bValue.getTime()
        : bValue.getTime() - aValue.getTime();
    }
    
    return 0;
  });

  // Pagination calculations
  const totalPages = Math.ceil(sortedReports.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedReports = sortedReports.slice(startIndex, endIndex);

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, statusFilter, categoryFilter]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
    setCurrentPage(1); // Reset to first page when changing items per page
  };

  const handleStatusChange = (reportId: string, newStatus: ReportStatus) => {
    updateReport(reportId, { status: newStatus });
    toast({
      title: "Status Updated",
      description: `Report status has been updated to "${newStatus.replace('_', ' ')}".`,
    });
  };

  const getStatusColor = (status: ReportStatus) => {
    switch (status) {
      case 'reported':
        return 'bg-yellow-100 text-yellow-800';
      case 'under_review':
        return 'bg-blue-100 text-blue-800';
      case 'in_progress':
        return 'bg-orange-100 text-orange-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'closed':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };
  
  const formatStatusLabel = (status: ReportStatus) => {
    return status.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase());
  };

  // Analytics data
  const statusData = useMemo(() => {
    const statusCounts = reports.reduce((acc, report) => {
      acc[report.status] = (acc[report.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(statusCounts).map(([status, count]) => ({
      name: formatStatusLabel(status as ReportStatus),
      value: count
    }));
  }, [reports]);

  const categoryData = useMemo(() => {
    const categoryCounts = reports.reduce((acc, report) => {
      acc[report.category] = (acc[report.category] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(categoryCounts).map(([category, count]) => ({
      name: category.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
      value: count
    }));
  }, [reports]);

  return (
    <div className="container py-12">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Manage and respond to reported urban issues
          </p>
        </div>
        <div className="flex gap-3 mt-4 md:mt-0">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsSettingsOpen(true)}
          >
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsNotificationsOpen(true)}
          >
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </Button>
        </div>
      </div>

      <SettingsDialog
        open={isSettingsOpen}
        onOpenChange={setIsSettingsOpen}
        settings={settings}
        onSettingsChange={setSettings}
        onSave={handleSaveSettings}
      />

      <NotificationsDialog
        open={isNotificationsOpen}
        onOpenChange={setIsNotificationsOpen}
      />

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-blue-600 dark:text-blue-400">
              Total Reports
            </CardTitle>
            <CardDescription className="text-2xl font-bold text-blue-700 dark:text-blue-300">
              {reports.length}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-xs text-blue-600 dark:text-blue-400">
                {reports.filter(r => 
                  new Date(r.createdAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                ).length} new this week
              </div>
              <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 dark:from-yellow-950 dark:to-yellow-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-yellow-600 dark:text-yellow-400">
              Pending Review
            </CardTitle>
            <CardDescription className="text-2xl font-bold text-yellow-700 dark:text-yellow-300">
              {reports.filter(r => r.status === 'reported').length}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-xs text-yellow-600 dark:text-yellow-400">
                Requires immediate attention
              </div>
              <AlertTriangle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950 dark:to-orange-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-orange-600 dark:text-orange-400">
              In Progress
            </CardTitle>
            <CardDescription className="text-2xl font-bold text-orange-700 dark:text-orange-300">
              {reports.filter(r => 
                r.status === 'in_progress' || r.status === 'under_review'
              ).length}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-xs text-orange-600 dark:text-orange-400">
                Currently being addressed
              </div>
              <Clock className="h-4 w-4 text-orange-600 dark:text-orange-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950 dark:to-green-900">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-green-600 dark:text-green-400">
              Resolved
            </CardTitle>
            <CardDescription className="text-2xl font-bold text-green-700 dark:text-green-300">
              {reports.filter(r => 
                r.status === 'resolved' || r.status === 'closed'
              ).length}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-xs text-green-600 dark:text-green-400">
                Successfully completed
              </div>
              <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="bg-card border rounded-lg mb-8">
        <div className="p-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search reports by title, description, or location..." 
              className="pl-9 w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="reported">Reported</SelectItem>
                <SelectItem value="under_review">Under Review</SelectItem>
                <SelectItem value="in_progress">In Progress</SelectItem>
                <SelectItem value="resolved">Resolved</SelectItem>
                <SelectItem value="closed">Closed</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                <SelectItem value="pothole">Pothole</SelectItem>
                <SelectItem value="streetlight">Streetlight</SelectItem>
                <SelectItem value="garbage">Garbage</SelectItem>
                <SelectItem value="graffiti">Graffiti</SelectItem>
                <SelectItem value="road_damage">Road Damage</SelectItem>
                <SelectItem value="flooding">Flooding</SelectItem>
                <SelectItem value="sign_damage">Sign Damage</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            
            <Button variant="outline" className="sm:w-auto" onClick={() => {
              setSearchTerm('');
              setStatusFilter('all');
              setCategoryFilter('all');
            }}>
              <Filter className="mr-2 h-4 w-4" />
              Reset
            </Button>
          </div>
        </div>
      </div>

      <Tabs defaultValue="list" className="mb-8">
        <TabsList>
          <TabsTrigger value="list">
            <AlertTriangle className="h-4 w-4 mr-2" />
            List View
          </TabsTrigger>
          <TabsTrigger value="analytics">
            <BarChart2 className="h-4 w-4 mr-2" />
            Analytics
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="list" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Issue Management</CardTitle>
              <CardDescription>
                Review and manage reported urban issues
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[300px]">
                      <div className="flex items-center gap-2">
                        Issue
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => {
                            setSortField('title');
                            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
                          }}
                        >
                          <ArrowUpDown className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>
                      <div className="flex items-center gap-2">
                        Reported
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => {
                            setSortField('createdAt');
                            setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
                          }}
                        >
                          <ArrowUpDown className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedReports.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        No reports match your filters
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedReports.map((report) => (
                      <TableRow key={report.id}>
                        <TableCell className="font-medium">
                          <div className="max-w-sm">
                            <p className="truncate font-medium">
                              <Link 
                                to={`/issue/${report.id}`}
                                className="hover:text-urban-600 hover:underline"
                              >
                                {report.title}
                              </Link>
                            </p>
                            <div className="flex items-center mt-1">
                              <Badge variant="outline" className="capitalize text-xs mr-2">
                                {report.category.replace('_', ' ')}
                              </Badge>
                              <span className="text-xs text-muted-foreground">
                                {report.severity} priority
                              </span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            <MapPin className="h-3 w-3 mr-1 text-muted-foreground" />
                            <span className="text-sm truncate max-w-[200px]">
                              {report.location.address}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-col">
                            <span className="text-sm">
                              {format(new Date(report.createdAt), 'dd MMM yyyy')}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              by {report.reportedBy.name}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant="outline" 
                            className={getStatusColor(report.status)}
                          >
                            {formatStatusLabel(report.status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Select
                            value={report.status}
                            onValueChange={(value) => handleStatusChange(report.id, value as ReportStatus)}
                          >
                            <SelectTrigger className="w-[120px]">
                              <SelectValue placeholder="Update status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="reported">Reported</SelectItem>
                              <SelectItem value="under_review">Under Review</SelectItem>
                              <SelectItem value="in_progress">In Progress</SelectItem>
                              <SelectItem value="resolved">Resolved</SelectItem>
                              <SelectItem value="closed">Closed</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>

              {/* Pagination Controls */}
              <div className="flex items-center justify-between mt-4">
                <div className="flex items-center gap-2">
                  <p className="text-sm text-muted-foreground">
                    Showing {startIndex + 1} to {Math.min(endIndex, sortedReports.length)} of {sortedReports.length} results
                  </p>
                  <Select
                    value={itemsPerPage.toString()}
                    onValueChange={handleItemsPerPageChange}
                  >
                    <SelectTrigger className="h-8 w-[70px]">
                      <SelectValue placeholder={itemsPerPage} />
                    </SelectTrigger>
                    <SelectContent>
                      {ITEMS_PER_PAGE_OPTIONS.map((option) => (
                        <SelectItem key={option} value={option.toString()}>
                          {option}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronsLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>

                  <div className="flex items-center gap-1">
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      // Show pages around current page
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }

                      return (
                        <Button
                          key={pageNum}
                          variant={currentPage === pageNum ? "default" : "outline"}
                          size="sm"
                          onClick={() => handlePageChange(pageNum)}
                          className="w-8 h-8"
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handlePageChange(totalPages)}
                    disabled={currentPage === totalPages}
                  >
                    <ChevronsRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="analytics" className="mt-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Issue Status Distribution</CardTitle>
                <CardDescription>
                  Current distribution of issue statuses
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    >
                      {statusData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Issue Categories</CardTitle>
                <CardDescription>
                  Distribution of issues by category
                </CardDescription>
              </CardHeader>
              <CardContent className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={categoryData}>
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminDashboard;
