import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import ReportList from '@/components/ReportList';
import { useAuth } from '@/contexts/AuthContext';
import { useReports } from '@/contexts/ReportContext';
import { MapPin, AlertTriangle, CheckCircle2, Clock, Map } from 'lucide-react';

const Dashboard = () => {
  const { currentUser } = useAuth();
  const { reports } = useReports();
  const [activeTab, setActiveTab] = useState('my-reports');
  
  if (!currentUser) {
    return (
      <div className="container py-16 flex flex-col items-center">
        <AlertTriangle className="h-16 w-16 text-muted-foreground mb-6" />
        <h1 className="text-2xl font-bold mb-3">Authentication Required</h1>
        <p className="text-muted-foreground mb-6">
          Please log in to access your dashboard.
        </p>
        <Button asChild>
          <Link to="/login">Log In</Link>
        </Button>
      </div>
    );
  }
  
  // Filter reports for the current user
  const userReports = reports.filter(report => report.reportedBy.id === currentUser.id);
  
  // Get reports by status
  const pendingReports = userReports.filter(report => 
    report.status === 'reported' || report.status === 'under_review'
  );
  
  const activeReports = userReports.filter(report => 
    report.status === 'in_progress'
  );
  
  const resolvedReports = userReports.filter(report => 
    report.status === 'resolved' || report.status === 'closed'
  );

  return (
    <div className="container py-12">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Welcome back, {currentUser.name}
          </p>
        </div>
        <Button asChild className="mt-4 md:mt-0">
          <Link to="/report">
            <AlertTriangle className="mr-2 h-4 w-4" />
            Report New Issue
          </Link>
        </Button>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Reports</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingReports.length}</div>
            <p className="text-xs text-muted-foreground">
              {pendingReports.length === 1 ? 'Issue' : 'Issues'} awaiting review
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Reports</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeReports.length}</div>
            <p className="text-xs text-muted-foreground">
              {activeReports.length === 1 ? 'Issue' : 'Issues'} being addressed
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{resolvedReports.length}</div>
            <p className="text-xs text-muted-foreground">
              {resolvedReports.length === 1 ? 'Issue' : 'Issues'} successfully resolved
            </p>
          </CardContent>
        </Card>
      </div>
      
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
          <CardDescription>
            View and manage your reported issues
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="my-reports">My Reports</TabsTrigger>
              <TabsTrigger value="pending">Pending</TabsTrigger>
              <TabsTrigger value="active">In Progress</TabsTrigger>
              <TabsTrigger value="resolved">Resolved</TabsTrigger>
            </TabsList>
            <div className="mt-6">
              <TabsContent value="my-reports">
                <ReportList 
                  reports={userReports} 
                  title="" 
                  emptyMessage="You haven't reported any issues yet."
                />
              </TabsContent>
              <TabsContent value="pending">
                <ReportList 
                  reports={pendingReports} 
                  title="" 
                  emptyMessage="No pending reports."
                />
              </TabsContent>
              <TabsContent value="active">
                <ReportList 
                  reports={activeReports} 
                  title="" 
                  emptyMessage="No reports are currently being addressed."
                />
              </TabsContent>
              <TabsContent value="resolved">
                <ReportList 
                  reports={resolvedReports} 
                  title="" 
                  emptyMessage="No resolved reports yet."
                />
              </TabsContent>
            </div>
          </Tabs>
        </CardContent>
        <CardFooter>
          <Button variant="outline" asChild className="w-full border-urban-500 text-urban-500 hover:bg-urban-50 hover:text-urban-600">
            <Link to="/map" className="flex items-center gap-2">
              <Map className="h-5 w-5" />
              View All Reports on Map
            </Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default Dashboard;
