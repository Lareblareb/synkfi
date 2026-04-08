import * as Location from 'expo-location';

const HELSINKI_LAT = 60.1699;
const HELSINKI_LNG = 24.9384;

export interface UserLocation {
  latitude: number;
  longitude: number;
  locationName: string;
}

export const locationService = {
  async requestPermission(): Promise<boolean> {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted';
  },

  async getCurrentLocation(): Promise<UserLocation> {
    try {
      const hasPermission = await this.requestPermission();
      if (!hasPermission) {
        return {
          latitude: HELSINKI_LAT,
          longitude: HELSINKI_LNG,
          locationName: 'Helsinki, Finland',
        };
      }

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const [address] = await Location.reverseGeocodeAsync({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      const locationName = address
        ? `${address.city ?? address.region ?? 'Helsinki'}, ${address.country ?? 'Finland'}`
        : 'Helsinki, Finland';

      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
        locationName,
      };
    } catch {
      return {
        latitude: HELSINKI_LAT,
        longitude: HELSINKI_LNG,
        locationName: 'Helsinki, Finland',
      };
    }
  },

  calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
  ): number {
    const R = 6371;
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lon2 - lon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  },

  getHelsinkiCenter(): { latitude: number; longitude: number } {
    return { latitude: HELSINKI_LAT, longitude: HELSINKI_LNG };
  },
};
