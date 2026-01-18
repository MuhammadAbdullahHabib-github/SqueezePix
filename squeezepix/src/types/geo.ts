/**
 * Geo-tagging types for city search and location metadata
 */

export interface GeoCity {
  geonameId: number;
  name: string;
  adminName1: string;  // State/Province
  countryName: string;
  countryCode: string;
  lat: string;
  lng: string;
  population: number;
}

export interface GeoLocation {
  latitude: number;
  longitude: number;
  cityName: string;
  adminRegion: string;
  country: string;
  population?: number;
}

export interface CitySearchResult {
  cities: GeoCity[];
  totalCount: number;
  query: string;
}

export interface GeoNamesResponse {
  totalResultsCount: number;
  geonames: GeoCity[];
  status?: {
    message: string;
    value: number;
  };
}

export interface RecentCity {
  city: GeoCity;
  usedAt: string;
}

export const MAX_RECENT_CITIES = 5;
