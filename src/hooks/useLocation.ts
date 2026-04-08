import { useState, useEffect } from 'react';
import { locationService, UserLocation } from '../services/location';

export const useLocation = () => {
  const [location, setLocation] = useState<UserLocation>({
    latitude: 60.1699,
    longitude: 24.9384,
    locationName: 'Helsinki, Finland',
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadLocation();
  }, []);

  const loadLocation = async () => {
    setIsLoading(true);
    try {
      const loc = await locationService.getCurrentLocation();
      setLocation(loc);
    } catch {
      // Falls back to Helsinki defaults
    } finally {
      setIsLoading(false);
    }
  };

  return { location, isLoading, refreshLocation: loadLocation };
};
