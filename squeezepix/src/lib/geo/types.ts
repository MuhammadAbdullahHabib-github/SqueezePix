/**
 * Geo-tagging types for city search and GPS coordinates
 */

export interface GeoCity {
  geonameId: number;
  name: string;
  adminName1: string; // State/Province
  countryName: string;
  countryCode: string;
  lat: string;
  lng: string;
  population: number;
}

export interface GeoLocation {
  latitude: number;
  longitude: number;
  cityName?: string;
  adminName?: string;
  countryName?: string;
}

export interface CitySearchResult {
  cities: GeoCity[];
  isLoading: boolean;
  error: string | null;
}

/**
 * Format city for display
 */
export function formatCityDisplay(city: GeoCity): string {
  const parts = [city.name];
  if (city.adminName1) parts.push(city.adminName1);
  parts.push(city.countryName);
  return parts.join(', ');
}

/**
 * Format city for short display (name + country)
 */
export function formatCityShort(city: GeoCity): string {
  return `${city.name}, ${city.countryName}`;
}

/**
 * Format population number
 */
export function formatPopulation(pop: number): string {
  if (!pop) return 'N/A';
  if (pop >= 1_000_000) {
    return `${(pop / 1_000_000).toFixed(1)}M`;
  }
  if (pop >= 1_000) {
    return `${(pop / 1_000).toFixed(0)}K`;
  }
  return pop.toLocaleString();
}

/**
 * Convert GeoCity to GeoLocation
 */
export function cityToLocation(city: GeoCity): GeoLocation {
  return {
    latitude: parseFloat(city.lat),
    longitude: parseFloat(city.lng),
    cityName: city.name,
    adminName: city.adminName1,
    countryName: city.countryName,
  };
}
