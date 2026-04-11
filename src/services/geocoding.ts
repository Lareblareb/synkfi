// Free Nominatim geocoding service (OpenStreetMap)
// No API key required, but please respect their usage policy:
// https://operations.osmfoundation.org/policies/nominatim/

export interface GeocodedPlace {
  displayName: string;
  shortName: string;
  latitude: number;
  longitude: number;
  type?: string;
}

const NOMINATIM_BASE = 'https://nominatim.openstreetmap.org';

export const geocodingService = {
  async searchPlaces(
    query: string,
    biasCity = 'Helsinki'
  ): Promise<GeocodedPlace[]> {
    if (!query || query.trim().length < 2) return [];

    try {
      const params = new URLSearchParams({
        q: `${query}, ${biasCity}`,
        format: 'json',
        limit: '5',
        addressdetails: '1',
        'accept-language': 'en',
      });

      const response = await fetch(`${NOMINATIM_BASE}/search?${params}`, {
        headers: {
          'User-Agent': 'SynkApp/1.0',
          'Accept': 'application/json',
        },
      });

      if (!response.ok) {
        console.warn('Nominatim request failed:', response.status);
        return [];
      }

      const data = (await response.json()) as Array<{
        display_name: string;
        lat: string;
        lon: string;
        name?: string;
        type?: string;
        address?: { road?: string; city?: string; suburb?: string };
      }>;

      return data.map((item) => {
        const road = item.address?.road;
        const city = item.address?.city ?? item.address?.suburb ?? biasCity;
        const shortName = road ? `${road}, ${city}` : item.name || item.display_name.split(',')[0];

        return {
          displayName: item.display_name,
          shortName,
          latitude: parseFloat(item.lat),
          longitude: parseFloat(item.lon),
          type: item.type,
        };
      });
    } catch (err) {
      console.warn('Geocoding search failed:', err);
      return [];
    }
  },
};
