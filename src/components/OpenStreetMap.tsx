import React, { useState, useCallback, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvent, Circle } from 'react-leaflet';
import { Icon } from 'leaflet';
import { useReports, Report } from '@/contexts/ReportContext';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { Button } from '@/components/ui/button';
import { MapPin, Locate, Loader2, Maximize, Minimize } from 'lucide-react';
import 'leaflet/dist/leaflet.css';
import { toast } from '@/components/ui/use-toast';

interface OpenStreetMapProps {
  center?: [number, number];
  zoom?: number;
  height?: string;
  reports?: Report[];
  onLocationSelect?: (lat: number, lng: number, address: string) => void;
  selectedLocation?: [number, number] | null;
  enableManualPin?: boolean;
  onLoad?: () => void;
  showUseMyLocation?: boolean;
}

// Custom marker icons
const createCustomIcon = (color: string) => {
  return new Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${color}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });
};

const LocationMarker = ({ onLocationSelect, enableManualPin }: { onLocationSelect?: (lat: number, lng: number, address: string) => void, enableManualPin?: boolean }) => {
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const map = useMap();

  useEffect(() => {
    // Configure location options
    const locationOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    };

    // Start watching position
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, accuracy } = pos.coords;
        const newPosition: [number, number] = [latitude, longitude];
        setPosition(newPosition);
        setAccuracy(accuracy);
        
        // Only update map view if accuracy is good enough (less than 100 meters)
        if (accuracy < 100) {
          map.flyTo(newPosition, map.getZoom(), {
            duration: 1
          });
        }

        // Only call onLocationSelect if it's provided and we're not in manual pin mode
        if (onLocationSelect && !enableManualPin) {
          onLocationSelect(latitude, longitude, `${latitude}, ${longitude}`);
        }
      },
      (error) => {
        console.error('Location error:', error);
        toast({
          title: "Location Error",
          description: "Unable to get your location. Please check your location settings.",
          variant: "destructive",
        });
      },
      locationOptions
    );

    // Cleanup
    return () => {
      navigator.geolocation.clearWatch(watchId);
    };
  }, [map, onLocationSelect, enableManualPin]);

  if (!position) return null;

  return (
    <>
      <Marker 
        position={position} 
        icon={createCustomIcon('blue')}
        zIndexOffset={1000}
      >
        <Popup>
          <div className="text-sm">
            <p>You are here</p>
            {accuracy && (
              <p className="text-xs text-muted-foreground">
                Accuracy: {Math.round(accuracy)} meters
              </p>
            )}
          </div>
        </Popup>
      </Marker>
      {accuracy && (
        <Circle
          center={position}
          radius={accuracy}
          pathOptions={{
            color: 'blue',
            fillColor: 'blue',
            fillOpacity: 0.1,
            weight: 1
          }}
        />
      )}
    </>
  );
};

// Add a new component for handling manual pinning
const ManualPinHandler = ({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number, address: string) => void }) => {
  const map = useMap();
  
  useMapEvent('click', async (e) => {
    // Prevent any default behavior
    e.originalEvent.preventDefault();
    e.originalEvent.stopPropagation();
    
    const lat = e.latlng.lat;
    const lng = e.latlng.lng;
    
    // Reverse geocode using Nominatim
    let address = `${lat}, ${lng}`;
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      const data = await response.json();
      if (data && data.display_name) {
        address = data.display_name;
      }
    } catch (err) {
      // fallback to coordinates
    }
    
    // Ensure the map is centered on the clicked location
    map.setView([lat, lng], map.getZoom());
    
    // Call onLocationSelect with the precise coordinates
    onLocationSelect(lat, lng, address);
  });
  
  return null;
};

const OpenStreetMap = ({
  center = [40.7128, -74.0060], // Default to New York City
  zoom = 13,
  height = '600px',
  reports,
  onLocationSelect,
  selectedLocation,
  enableManualPin,
  onLoad,
  showUseMyLocation = false
}: OpenStreetMapProps) => {
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const { reports: allReports } = useReports();
  const [isLocating, setIsLocating] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isLiveLocationActive, setIsLiveLocationActive] = useState(false);
  const [manualPinLocation, setManualPinLocation] = useState<[number, number] | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const reportsList = reports || allReports;

  // Add effect to handle center changes
  useEffect(() => {
    if (mapRef.current && center) {
      console.log('Updating map center to:', center);
      mapRef.current.flyTo(center, zoom, {
        duration: 1.5
      });
    }
  }, [center, zoom]);

  // Add effect to handle selected location changes
  useEffect(() => {
    if (mapRef.current && selectedLocation) {
      console.log('Updating map to selected location:', selectedLocation);
      mapRef.current.flyTo(selectedLocation, zoom, {
        duration: 1.5
      });
      setManualPinLocation(selectedLocation);
    }
  }, [selectedLocation, zoom]);

  useEffect(() => {
    if (onLoad) {
      onLoad();
    }
  }, [onLoad]);

  // Fullscreen toggle logic
  const handleFullscreenToggle = () => {
    const container = containerRef.current;
    if (!container) return;
    if (!document.fullscreenElement) {
      container.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'reported':
        return 'red';
      case 'under_review':
        return 'blue';
      case 'in_progress':
        return 'orange';
      case 'resolved':
        return 'green';
      case 'closed':
        return 'gray';
      default:
        return 'gray';
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'pothole':
        return '🕳️';
      case 'streetlight':
        return '💡';
      case 'garbage':
        return '🗑️';
      case 'graffiti':
        return '🖌️';
      case 'road_damage':
        return '🚧';
      case 'flooding':
        return '💧';
      case 'sign_damage':
        return '🚫';
      default:
        return '📍';
    }
  };

  // Handle manual pin selection
  const handleManualPinSelect = (lat: number, lng: number, address: string) => {
    setManualPinLocation([lat, lng]);
    setIsLiveLocationActive(false);
    if (onLocationSelect) {
      onLocationSelect(lat, lng, address);
    }
  };

  // Handle live location activation
  const handleUseMyLocation = async () => {
    if (!navigator.geolocation) {
      toast({
        title: "Geolocation not supported",
        description: "Your browser doesn't support geolocation.",
        variant: "destructive",
      });
      return;
    }

    setIsLocating(true);
    try {
      const position = await new Promise<GeolocationPosition>((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(
          resolve,
          reject,
          {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 0
          }
        );
      });

      const { latitude, longitude } = position.coords;
      
      // Reverse geocode to get address
      let address = `${latitude}, ${longitude}`;
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
        );
        const data = await response.json();
        if (data && data.display_name) {
          address = data.display_name;
        }
      } catch (err) {
        // fallback to coordinates
      }

      // Update map view with smooth animation
      if (mapRef.current) {
        mapRef.current.flyTo([latitude, longitude], 15, {
          duration: 1.5
        });
      }

      // Reset manual pin and activate live location
      setManualPinLocation(null);
      setIsLiveLocationActive(true);

      // Call onLocationSelect if provided
      if (onLocationSelect) {
        onLocationSelect(latitude, longitude, address);
      }

      toast({
        title: "Location found",
        description: "Your location has been set on the map.",
      });
    } catch (error) {
      console.error('Location error:', error);
      toast({
        title: "Location error",
        description: "Failed to get your location. Please check your location settings and try again.",
        variant: "destructive",
      });
      setIsLiveLocationActive(false);
    } finally {
      setIsLocating(false);
    }
  };

  return (
    <div 
      ref={containerRef}
      style={{ 
        height, 
        width: '100%',
        position: 'relative',
        zIndex: 1
      }} 
      className={`rounded-lg overflow-hidden border relative bg-background ${isFullscreen ? 'fixed inset-0 z-50 h-full w-full rounded-none' : ''}`}
    >
      {/* Fullscreen Toggle Button */}
      <Button
        variant="secondary"
        size="icon"
        className={`absolute top-4 right-4 z-30 bg-white hover:bg-gray-100 shadow-lg rounded-full p-2 transition-colors duration-200 ${
          isFullscreen ? 'bg-blue-500 hover:bg-blue-600 text-white' : 'text-gray-700'
        }`}
        onClick={handleFullscreenToggle}
        aria-label={isFullscreen ? 'Exit Fullscreen' : 'Enter Fullscreen'}
      >
        {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
      </Button>
      {/* Use My Location Button */}
      {showUseMyLocation && (
        <Button
          variant="secondary"
          size="icon"
          className={`absolute bottom-4 right-4 z-20 bg-white hover:bg-gray-100 shadow-lg rounded-full p-2 transition-colors duration-200 ${
            isLiveLocationActive 
              ? 'bg-blue-500 hover:bg-blue-600 text-white' 
              : 'text-gray-700'
          }`}
          onClick={handleUseMyLocation}
          disabled={isLocating}
          title={isLiveLocationActive ? "Live Location Active" : "Use My Location"}
        >
          {isLocating ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Locate className="h-5 w-5" />
          )}
        </Button>
      )}
      <MapContainer
        center={center}
        zoom={zoom}
        style={{ 
          height: '100%', 
          width: '100%',
          position: 'relative',
          zIndex: 1
        }}
        className="z-10"
        ref={mapRef}
        zoomControl={true}
        doubleClickZoom={false}
        scrollWheelZoom={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Show manual pin if selected */}
        {manualPinLocation && !isLiveLocationActive && (
          <Marker 
            position={manualPinLocation} 
            icon={createCustomIcon('red')}
            zIndexOffset={1000}
          >
            <Popup>Selected Location</Popup>
          </Marker>
        )}

        {/* Manual pin handler for map click */}
        {enableManualPin && !isLiveLocationActive && (
          <ManualPinHandler onLocationSelect={handleManualPinSelect} />
        )}

        {/* Location marker for current position */}
        {showUseMyLocation && isLiveLocationActive && (
          <LocationMarker onLocationSelect={onLocationSelect} enableManualPin={enableManualPin} />
        )}

        {reportsList.map(report => (
          <Marker
            key={report.id}
            position={[report.location.coordinates.lat, report.location.coordinates.lng]}
            icon={createCustomIcon(getStatusColor(report.status))}
            eventHandlers={{
              click: () => setSelectedReport(report),
            }}
          >
            <Popup>
              <div className="max-w-xs">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{getCategoryIcon(report.category)}</span>
                  <h3 className="font-medium text-sm">{report.title}</h3>
                </div>
                <p className="text-xs text-gray-600 mb-2">{report.location.address}</p>
                <div className="flex items-center justify-between">
                  <Badge variant="outline" className={`text-xs bg-${getStatusColor(report.status)}-100 text-${getStatusColor(report.status)}-800`}>
                    {report.status.replace('_', ' ')}
                  </Badge>
                  <span className="text-xs text-gray-500">
                    {formatDistanceToNow(new Date(report.createdAt), { addSuffix: true })}
                  </span>
                </div>
                <div className="mt-2">
                  <Link 
                    to={`/issue/${report.id}`} 
                    className="text-xs text-primary hover:underline"
                  >
                    View details
                  </Link>
                </div>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default OpenStreetMap; 