import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Locate, MapPin, Loader2 } from 'lucide-react';
import OpenStreetMap from './OpenStreetMap';
import { toast } from '@/components/ui/use-toast';

interface LocationPickerProps {
  onLocationSelect: (address: string, lat: number, lng: number) => void;
  initialAddress?: string;
}

const LocationPicker = ({ onLocationSelect, initialAddress = '' }: LocationPickerProps) => {
  const [address, setAddress] = useState(initialAddress);
  const [selectedLocation, setSelectedLocation] = useState<[number, number] | null>(null);
  const [isSearching, setIsSearching] = useState(false);

  const defaultCenter: [number, number] = [40.7128, -74.0060]; // New York City as default

  const handleLocationSelect = (lat: number, lng: number, formattedAddress: string) => {
    setSelectedLocation([lat, lng]);
    setAddress(formattedAddress);
    onLocationSelect(formattedAddress, lat, lng);
  };

  const handleAddressSearch = async () => {
    if (!address.trim()) {
      toast({
        title: "Empty Search",
        description: "Please enter an address to search",
        variant: "destructive",
      });
      return;
    }

    console.log('Starting search for address:', address);
    setIsSearching(true);
    try {
      const searchUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(address)}`;
      console.log('Search URL:', searchUrl);
      
      const response = await fetch(searchUrl, {
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'CityFix/1.0'
        }
      });

      console.log('Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('Search results:', data);

      if (data && data.length > 0) {
        const result = data[0];
        console.log('Selected result:', result);
        const lat = parseFloat(result.lat);
        const lng = parseFloat(result.lon);
        handleLocationSelect(lat, lng, result.display_name);
      } else {
        console.log('No results found');
        toast({
          title: "No Results",
          description: "Could not find the address. Please try a different search term.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error searching address:', error);
      toast({
        title: "Search Error",
        description: error instanceof Error ? error.message : "An error occurred while searching. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSearching(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      console.log('Enter key pressed, triggering search');
      handleAddressSearch();
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search for a location"
            className="pl-10"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isSearching}
          />
        </div>
        <Button 
          variant="outline" 
          onClick={handleAddressSearch}
          disabled={isSearching}
          size="icon"
          className="h-10 w-10"
        >
          {isSearching ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <MapPin className="h-5 w-5" />
          )}
        </Button>
      </div>

      <div className="border rounded-md overflow-hidden">
        <OpenStreetMap
          height="300px"
          center={selectedLocation || defaultCenter}
          zoom={13}
          onLocationSelect={handleLocationSelect}
          selectedLocation={selectedLocation}
          enableManualPin={true}
          showUseMyLocation={true}
        />
        <div className="bg-muted/50 p-2 text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <Search className="h-3 w-3" />
            <span>
              {isSearching 
                ? "Searching for location..." 
                : "Search for an address or click on the map"}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LocationPicker;
