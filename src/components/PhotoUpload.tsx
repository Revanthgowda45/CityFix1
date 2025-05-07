import React, { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { toast } from '@/components/ui/use-toast';
import {
  Camera,
  Upload,
  X,
  Image as ImageIcon,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { uploadImage } from '@/lib/storage';

interface PhotoUploadProps {
  onImagesChange: (images: File[]) => void;
  onUploadComplete?: (urls: string[]) => void;
  maxFiles?: number;
  maxSizeMB?: number;
  className?: string;
}

export const PhotoUpload: React.FC<PhotoUploadProps> = ({
  onImagesChange,
  onUploadComplete,
  maxFiles = 2,
  maxSizeMB = 1.5,
  className,
}) => {
  const [images, setImages] = useState<File[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;

    const newFiles = Array.from(files);
    const validFiles = newFiles.filter(file => {
      const isValidType = file.type.startsWith('image/');
      const isValidSize = file.size <= maxSizeMB * 1024 * 1024;

      if (!isValidType) {
        toast({
          title: "Invalid file type",
          description: "Please upload only image files.",
          variant: "destructive",
        });
      }

      if (!isValidSize) {
        toast({
          title: "File too large",
          description: `Please upload files smaller than ${maxSizeMB}MB.`,
          variant: "destructive",
        });
      }

      return isValidType && isValidSize;
    });

    if (images.length + validFiles.length > maxFiles) {
      toast({
        title: "Too many files",
        description: `You can upload up to ${maxFiles} images.`,
        variant: "destructive",
      });
      return;
    }

    setImages(prev => [...prev, ...validFiles]);
    onImagesChange([...images, ...validFiles]);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    handleFileSelect(e.dataTransfer.files);
  };

  const handleCameraCapture = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      const video = document.createElement('video');
      video.srcObject = stream;
      await video.play();

      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(video, 0, 0);

      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], `camera-${Date.now()}.jpg`, { type: 'image/jpeg' });
          const dataTransfer = new DataTransfer();
          dataTransfer.items.add(file);
          handleFileSelect(dataTransfer.files);
        }
      }, 'image/jpeg');

      stream.getTracks().forEach(track => track.stop());
    } catch (error) {
      toast({
        title: "Camera access denied",
        description: "Please allow camera access to take photos.",
        variant: "destructive",
      });
    }
  };

  const removeImage = (index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    setImages(newImages);
    onImagesChange(newImages);
  };

  const uploadImages = async () => {
    if (images.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      const totalFiles = images.length;
      const uploadedUrls: string[] = [];
      let currentFile = 0;
      let failedUploads = 0;

      // Upload files in parallel with progress tracking
      const uploadPromises = images.map(async (image) => {
        try {
          const url = await uploadImage(image);
          uploadedUrls.push(url);
          currentFile++;
          setUploadProgress((currentFile / totalFiles) * 100);
          return url;
        } catch (error) {
          failedUploads++;
          console.error('Error uploading file:', error);
          // Show specific error message for this file
          toast({
            title: "Upload failed",
            description: error instanceof Error ? error.message : "Failed to upload image",
            variant: "destructive",
          });
          throw error;
        }
      });

      // Wait for all uploads to complete
      await Promise.all(uploadPromises);

      if (failedUploads === 0) {
        if (onUploadComplete) {
          onUploadComplete(uploadedUrls);
        }

        toast({
          title: "Upload complete",
          description: "Your images have been uploaded successfully.",
        });
      } else {
        toast({
          title: "Partial upload",
          description: `${failedUploads} of ${totalFiles} images failed to upload.`,
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "There was an error uploading your images. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      <div
        className={cn(
          "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
          isDragging ? "border-primary bg-primary/5" : "border-muted-foreground/25",
          "hover:border-primary/50 hover:bg-primary/5"
        )}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <div className="flex flex-col items-center gap-2">
          <div className="rounded-full bg-primary/10 p-3">
            <Upload className="h-6 w-6 text-primary" />
          </div>
          <div className="space-y-1">
            <p className="text-sm font-medium">
              Drag and drop your images here
            </p>
            <p className="text-xs text-muted-foreground">
              or click to browse files
            </p>
          </div>
          <div className="flex gap-2 mt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              <ImageIcon className="h-4 w-4 mr-2" />
              Browse Files
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleCameraCapture}
            >
              <Camera className="h-4 w-4 mr-2" />
              Take Photo
            </Button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files)}
          />
          <input
            ref={cameraInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={(e) => handleFileSelect(e.target.files)}
          />
        </div>
      </div>

      {images.length > 0 && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {images.map((image, index) => (
              <Card key={index} className="relative group">
                <div className="aspect-square relative">
                  <img
                    src={URL.createObjectURL(image)}
                    alt={`Upload ${index + 1}`}
                    className="object-cover w-full h-full rounded-t-lg"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeImage(index)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="p-2 text-xs text-muted-foreground truncate">
                  {image.name}
                </div>
              </Card>
            ))}
          </div>

          {isUploading ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Uploading...</span>
                <span>{Math.round(uploadProgress)}%</span>
              </div>
              <Progress value={uploadProgress} />
            </div>
          ) : (
            <Button
              type="button"
              className="w-full"
              onClick={uploadImages}
            >
              Upload {images.length} {images.length === 1 ? 'Image' : 'Images'}
            </Button>
          )}
        </div>
      )}

      <div className="text-xs text-muted-foreground">
        <p>Supported formats: JPG, PNG, GIF</p>
        <p>Maximum file size: {maxSizeMB}MB</p>
        <p>Maximum files: {maxFiles}</p>
      </div>
    </div>
  );
}; 