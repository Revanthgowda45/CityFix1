import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { useReports } from '@/contexts/ReportContext';
import { useAuth } from '@/contexts/AuthContext';
import PhotoUpload from '@/components/PhotoUpload';
import { MapPin } from 'lucide-react';

const reportSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters'),
  category: z.enum([
    'pothole',
    'streetlight',
    'garbage',
    'graffiti',
    'road_damage',
    'flooding',
    'sign_damage',
    'other'
  ]),
  severity: z.enum(['low', 'medium', 'high']),
  location: z.object({
    address: z.string().min(1, 'Location is required'),
    coordinates: z.object({
      lat: z.number(),
      lng: z.number()
    })
  })
});

type ReportFormData = z.infer<typeof reportSchema>;

const ReportForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { addReport } = useReports();
  const { currentUser } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);

  const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<ReportFormData>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      severity: 'medium',
      category: 'other'
    }
  });

  const handlePhotoSelect = (photo: File) => {
    setSelectedPhoto(photo);
  };

  const onSubmit = async (data: ReportFormData) => {
    if (!currentUser) {
      toast({
        title: "Authentication required",
        description: "Please log in to submit a report.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      // Here you would typically upload the photo to your storage service
      // and get back a URL. For now, we'll just use a placeholder.
      const photoUrl = selectedPhoto ? URL.createObjectURL(selectedPhoto) : '';

      await addReport({
        title: data.title,
        description: data.description,
        category: data.category,
        severity: data.severity,
        location: data.location,
        images: photoUrl ? [photoUrl] : [],
        status: 'reported',
        reportedBy: {
          id: currentUser.id,
          name: currentUser.name || 'Anonymous'
        }
      });

      toast({
        title: "Report submitted",
        description: "Your report has been submitted successfully.",
      });

      navigate('/map');
    } catch (error) {
      toast({
        title: "Submission failed",
        description: "Failed to submit the report. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container py-4 sm:py-8">
      <Card className="mx-2 sm:mx-0">
        <CardHeader className="px-4 sm:px-6">
          <CardTitle className="text-xl sm:text-2xl">Report an Issue</CardTitle>
          <CardDescription className="text-sm sm:text-base">
            Help improve your community by reporting local issues
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">
                Title
              </label>
              <Input
                id="title"
                {...register('title')}
                placeholder="Brief description of the issue"
                className="h-10 sm:h-11"
              />
              {errors.title && (
                <p className="text-sm text-red-500">{errors.title.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label htmlFor="description" className="text-sm font-medium">
                Description
              </label>
              <Textarea
                id="description"
                {...register('description')}
                placeholder="Detailed description of the issue"
                rows={4}
                className="min-h-[100px] sm:min-h-[120px]"
              />
              {errors.description && (
                <p className="text-sm text-red-500">{errors.description.message}</p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="category" className="text-sm font-medium">
                  Category
                </label>
                <Select
                  onValueChange={(value) => setValue('category', value as any)}
                  defaultValue={watch('category')}
                >
                  <SelectTrigger className="h-10 sm:h-11">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pothole">Pothole</SelectItem>
                    <SelectItem value="streetlight">Street Light</SelectItem>
                    <SelectItem value="garbage">Garbage</SelectItem>
                    <SelectItem value="graffiti">Graffiti</SelectItem>
                    <SelectItem value="road_damage">Road Damage</SelectItem>
                    <SelectItem value="flooding">Flooding</SelectItem>
                    <SelectItem value="sign_damage">Sign Damage</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
                {errors.category && (
                  <p className="text-sm text-red-500">{errors.category.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="severity" className="text-sm font-medium">
                  Severity
                </label>
                <Select
                  onValueChange={(value) => setValue('severity', value as any)}
                  defaultValue={watch('severity')}
                >
                  <SelectTrigger className="h-10 sm:h-11">
                    <SelectValue placeholder="Select severity" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
                {errors.severity && (
                  <p className="text-sm text-red-500">{errors.severity.message}</p>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">
                Photo
              </label>
              <PhotoUpload
                onPhotoSelect={handlePhotoSelect}
                maxSize={5}
                allowedTypes={['image/jpeg', 'image/png', 'image/webp']}
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="location" className="text-sm font-medium">
                Location
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="location"
                  {...register('location.address')}
                  placeholder="Enter location or click on the map"
                  className="pl-9 h-10 sm:h-11"
                />
              </div>
              {errors.location?.address && (
                <p className="text-sm text-red-500">{errors.location.address.message}</p>
              )}
            </div>

            <div className="flex flex-col sm:flex-row justify-end gap-3 sm:gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/map')}
                className="w-full sm:w-auto h-10 sm:h-11"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto h-10 sm:h-11"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Report'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default ReportForm; 