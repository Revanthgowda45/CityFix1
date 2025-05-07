import React, { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { useAuth } from '@/contexts/AuthContext';
import { useReports, ReportCategory, ReportSeverity, ReportStatus } from '@/contexts/ReportContext';
import { toast } from '@/components/ui/use-toast';
import { AlertCircle, Loader2 } from 'lucide-react';
import LocationPicker from '@/components/LocationPicker';
import { PhotoUpload } from '@/components/PhotoUpload';

const reportSchema = z.object({
  title: z.string().min(5, { message: "Title must be at least 5 characters" }),
  description: z.string().min(20, { message: "Description must be at least 20 characters" }),
  category: z.string(),
  severity: z.string(),
  address: z.string().min(5, { message: "Address must be at least 5 characters" }),
  images: z.array(z.instanceof(File)).optional(),
});

type ReportFormValues = z.infer<typeof reportSchema>;

const ReportIssue = () => {
  const { currentUser, isAuthenticated } = useAuth();
  const { addReport } = useReports();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [coordinates, setCoordinates] = useState<{lat: number, lng: number}>({
    lat: 40.7128, 
    lng: -74.0060
  });
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  
  const form = useForm<ReportFormValues>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      title: '',
      description: '',
      category: 'pothole',
      severity: 'medium',
      address: '',
      images: [],
    },
  });

  const handleLocationSelect = (address: string, lat: number, lng: number) => {
    form.setValue('address', address);
    setCoordinates({ lat, lng });
  };

  const onSubmit = async (data: ReportFormValues) => {
    if (!currentUser) {
      toast({
        title: "Authentication required",
        description: "Please log in to report an issue.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      // Wait for images to be uploaded before submitting the report
      if (data.images && data.images.length > 0) {
        toast({
          title: "Uploading images...",
          description: "Please wait while we upload your images.",
        });
      }

      const newReport = await addReport({
        title: data.title,
        description: data.description,
        category: data.category as ReportCategory,
        severity: data.severity as ReportSeverity,
        location: {
          address: data.address,
          coordinates: coordinates,
        },
        images: imageUrls,
        status: 'reported' as ReportStatus,
        reportedBy: {
          id: currentUser.id,
          name: currentUser.name || 'Anonymous',
        },
        upvotedBy: [],
      });

      toast({
        title: "Issue reported successfully",
        description: "Thank you for helping improve our city!",
      });

      navigate(`/reports/${newReport.id}`);
    } catch (error) {
      console.error('Error submitting report:', error);
      toast({
        title: "Error",
        description: "Failed to submit the report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!isAuthenticated || !currentUser) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="container max-w-2xl py-8">
      <Card>
        <CardHeader>
          <CardTitle>Report an Issue</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Brief description of the issue" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Please provide detailed information about the issue..."
                        className="min-h-[120px]"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <LocationPicker 
                        initialAddress={field.value}
                        onLocationSelect={handleLocationSelect}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="images"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Photos</FormLabel>
                    <FormDescription>
                      Upload up to 2 photos (max 1.5MB each) to help us understand the issue better.
                    </FormDescription>
                    <FormControl>
                      <PhotoUpload
                        onImagesChange={field.onChange}
                        onUploadComplete={setImageUrls}
                        maxFiles={2}
                        maxSizeMB={1.5}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="bg-muted/50 p-4 rounded-md flex items-start space-x-3">
                <AlertCircle className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
                <div className="text-sm text-muted-foreground">
                  <p>By submitting this report, you confirm that:</p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>The information provided is accurate to the best of your knowledge</li>
                    <li>You have permission to share any images submitted</li>
                    <li>This is a public report that local authorities will be able to access</li>
                  </ul>
                </div>
              </div>
              
              <div className="flex gap-4">
                <Button variant="outline" onClick={() => navigate(-1)} className="flex-1">
                  Cancel
                </Button>
                <Button type="submit" className="flex-1" disabled={isLoading}>
                  {isLoading ? "Submitting..." : "Submit Report"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportIssue;
