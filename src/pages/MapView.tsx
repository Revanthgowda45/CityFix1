import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useReports, Report } from '@/contexts/ReportContext';
import { formatDistanceToNow } from 'date-fns';
import { MapPin, Filter, AlertTriangle, Loader2 } from 'lucide-react';
import OpenStreetMap from '@/components/OpenStreetMap';
import MapSearch from '@/components/MapSearch';
import { useToast } from '@/components/ui/use-toast';
import { cn } from '@/lib/utils';

const MapView = () => {
  const { reports, isLoading } = useReports();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [filteredReports, setFilteredReports] = useState<Report[]>(reports);
  const [isMapLoading, setIsMapLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  const selectedReport = selectedId 
    ? reports.find(report => report.id === selectedId)
    : null;
  
  const handleReportSelect = (reportId: string) => {
    setSelectedId(reportId);
    navigate(`/issue/${reportId}`);
  };
  
  const handleSearch = (searchResults: Report[]) => {
    setFilteredReports(searchResults);
    if (searchResults.length === 0) {
      toast({
        title: "No results found",
        description: "Try adjusting your search criteria.",
      });
    }
  };

  const getStatusColor = (status: Report['status']) => {
    const colors: Record<string, string> = {
      'reported': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100',
      'under_review': 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100',
      'in_progress': 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-100',
      'resolved': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100',
      'closed': 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100',
    };
    return colors[status] || 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100';
  };

  return (
    <div className="container py-12">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Issues Map</h1>
          <p className="text-muted-foreground mt-1">
            Explore reported issues in your community
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Filters */}
        <div className="lg:col-span-3">
          <Card>
            <CardContent className="p-4">
              <MapSearch onSearch={handleSearch} />
            </CardContent>
          </Card>
        </div>
        
        {/* Map view with OpenStreetMap */}
        <div className="lg:col-span-2 relative min-h-[600px]">
          {isMapLoading && (
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm z-10 flex items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-urban-600" />
                <p className="text-sm text-muted-foreground">Loading map...</p>
              </div>
            </div>
          )}
          <div className="w-full h-full min-h-[600px] relative">
            <OpenStreetMap 
              reports={filteredReports}
              height="600px"
              onLoad={() => setIsMapLoading(false)}
            />
          </div>
        </div>

        {/* Selected report or list */}
        <div>
          {isLoading ? (
            <Card className="h-[600px] flex items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-urban-600" />
                <p className="text-sm text-muted-foreground">Loading reports...</p>
              </div>
            </Card>
          ) : selectedReport ? (
            <Card className="h-[600px] overflow-y-auto">
              <div className="relative h-48">
                {selectedReport.images && selectedReport.images.length > 0 ? (
                  <img 
                    src={selectedReport.images[0]} 
                    alt={`Issue: ${selectedReport.title}`}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="w-full h-full bg-muted flex items-center justify-center">
                    <MapPin className="h-10 w-10 text-muted-foreground opacity-50" aria-hidden="true" />
                  </div>
                )}
                <div className="absolute top-4 right-4">
                  <Badge 
                    variant="secondary" 
                    className={getStatusColor(selectedReport.status)}
                    aria-label={`Status: ${selectedReport.status}`}
                  >
                    {selectedReport.status.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
              <CardContent className="p-6">
                <h2 className="text-xl font-semibold mb-2">{selectedReport.title}</h2>
                <p className="text-muted-foreground mb-4">{selectedReport.description}</p>
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    <span className="text-sm">{selectedReport.location.address}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
                    <span className="text-sm capitalize">{selectedReport.category.replace('_', ' ')}</span>
                  </div>
                </div>
                <div className="mt-6">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => navigate(`/issue/${selectedReport.id}`)}
                    aria-label={`View details for ${selectedReport.title}`}
                  >
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="h-[600px] overflow-y-auto">
              <CardContent className="p-4">
                <h3 className="font-semibold mb-4">All Reports</h3>
                {filteredReports.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-[500px] text-center">
                    <MapPin className="h-12 w-12 text-muted-foreground opacity-50 mb-4" aria-hidden="true" />
                    <p className="text-muted-foreground">No reports found</p>
                    <p className="text-sm text-muted-foreground mt-1">Try adjusting your search criteria</p>
                  </div>
                ) : (
                  <div className="space-y-4" role="list">
                    {filteredReports.map(report => (
                      <div 
                        key={report.id}
                        className={cn(
                          "p-4 border rounded-lg transition-colors",
                          "hover:bg-muted/50 cursor-pointer focus:outline-none focus:ring-2 focus:ring-urban-500"
                        )}
                        onClick={() => handleReportSelect(report.id)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            handleReportSelect(report.id);
                          }
                        }}
                        role="listitem"
                        tabIndex={0}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <h4 className="font-medium">{report.title}</h4>
                          <Badge 
                            variant="outline" 
                            className={getStatusColor(report.status)}
                            aria-label={`Status: ${report.status}`}
                          >
                            {report.status.replace('_', ' ')}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                          {report.description}
                        </p>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <span>{report.location.address}</span>
                          <span>{formatDistanceToNow(new Date(report.createdAt), { addSuffix: true })}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};

export default MapView;
