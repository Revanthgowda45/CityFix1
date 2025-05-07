
import React, { useState } from 'react';
import { FormControl, FormDescription, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Upload, Image } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PhotoUploadFieldProps {
  value: string;
  onChange: (value: string) => void;
  description?: string;
  label?: string;
}

const PhotoUploadField = ({
  value,
  onChange,
  description = "Enter a URL to an image of the issue (or upload directly in a production app)",
  label = "Photo"
}: PhotoUploadFieldProps) => {
  const [previewImage, setPreviewImage] = useState<string>(value);
  const [isValidImage, setIsValidImage] = useState<boolean>(!!value);

  const handleImageUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    onChange(url);
    setPreviewImage(url);
    
    // Reset validity when the URL changes
    setIsValidImage(false);
  };

  const handleImageLoad = () => {
    setIsValidImage(true);
  };

  const handleImageError = () => {
    setIsValidImage(false);
  };

  return (
    <FormItem>
      <FormLabel>{label}</FormLabel>
      <FormControl>
        <div className="space-y-4">
          <div className="flex">
            <div className="relative flex-1">
              <Input 
                placeholder="https://example.com/image.jpg" 
                value={value}
                onChange={handleImageUrlChange}
              />
              <Upload className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            </div>
          </div>
          
          {previewImage && (
            <div className={cn(
              "relative w-full h-40 bg-muted/30 dark:bg-muted/10 rounded-md overflow-hidden transition-opacity duration-200",
              !isValidImage && previewImage ? "opacity-30" : "opacity-100"
            )}>
              <img
                src={previewImage}
                alt="Issue preview"
                className="w-full h-full object-cover"
                onLoad={handleImageLoad}
                onError={handleImageError}
              />
              
              {!isValidImage && previewImage && (
                <div className="absolute inset-0 flex flex-col items-center justify-center p-4">
                  <Image className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground text-center">
                    Invalid image URL
                  </p>
                </div>
              )}
            </div>
          )}

          {!previewImage && (
            <Button 
              variant="outline" 
              type="button" 
              className="w-full h-40 border-dashed flex flex-col gap-2"
            >
              <Upload className="h-8 w-8 text-muted-foreground" />
              <span className="text-muted-foreground">
                Paste a URL to see a preview
              </span>
            </Button>
          )}
        </div>
      </FormControl>
      <FormDescription>{description}</FormDescription>
      <FormMessage />
    </FormItem>
  );
};

export default PhotoUploadField;
