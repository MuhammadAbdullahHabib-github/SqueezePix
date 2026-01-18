/**
 * GeoNames API wrapper for city search
 * https://www.geonames.org/export/geonames-search.html
 */

import type { GeoCity } from './types';

const GEONAMES_API = 'https://secure.geonames.org/searchJSON';

// Get username from environment variable
const getUsername = (): string => {
  const username = process.env.NEXT_PUBLIC_GEONAMES_USERNAME;
  if (!username) {
    console.warn('NEXT_PUBLIC_GEONAMES_USERNAME is not set. City search will not work.');
    return '';
  }
  return username;
};

export interface GeoNamesSearchParams {
  query: string;
  maxRows?: number;
  lang?: string;
}

export interface GeoNamesResponse {
  geonames: GeoCity[];
  totalResultsCount: number;
  status?: {
    message: string;
    value: number;
  };
}

export class GeoNamesError extends Error {
  constructor(
    message: string,
    public code?: number
  ) {
    super(message);
    this.name = 'GeoNamesError';
  }
}

/**
 * Search for cities using GeoNames API
 * @param query - Search query (city name)
 * @param options - Search options
 * @returns Array of matching cities sorted by population
 */
export async function searchCities(
  query: string,
  options: Partial<GeoNamesSearchParams> = {}
): Promise<GeoCity[]> {
  const username = getUsername();

  if (!username) {
    throw new GeoNamesError('GeoNames API username not configured');
  }

  if (query.length < 2) {
    return [];
  }

  const params = new URLSearchParams({
    name_startsWith: query,
    maxRows: String(options.maxRows || 10),
    username,
    featureClass: 'P', // Populated places only
    orderby: 'population',
    lang: options.lang || 'en',
  });

  try {
    const response = await fetch(`${GEONAMES_API}?${params}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new GeoNamesError(`HTTP error: ${response.status}`, response.status);
    }

    const data: GeoNamesResponse = await response.json();

    // Check for API error response
    if (data.status) {
      throw new GeoNamesError(data.status.message, data.status.value);
    }

    return data.geonames || [];
  } catch (error) {
    if (error instanceof GeoNamesError) {
      throw error;
    }

    // Network or other error
    throw new GeoNamesError(
      error instanceof Error ? error.message : 'Failed to search cities'
    );
  }
}

/**
 * Get a city by its GeoNames ID
 */
export async function getCityById(geonameId: number): Promise<GeoCity | null> {
  const username = getUsername();

  if (!username) {
    throw new GeoNamesError('GeoNames API username not configured');
  }

  const params = new URLSearchParams({
    geonameId: String(geonameId),
    username,
  });

  try {
    const response = await fetch(
      `https://secure.geonames.org/getJSON?${params}`,
      {
        method: 'GET',
        headers: {
          Accept: 'application/json',
        },
      }
    );

    if (!response.ok) {
      throw new GeoNamesError(`HTTP error: ${response.status}`, response.status);
    }

    const data = await response.json();

    if (data.status) {
      throw new GeoNamesError(data.status.message, data.status.value);
    }

    return data as GeoCity;
  } catch (error) {
    if (error instanceof GeoNamesError) {
      throw error;
    }
    return null;
  }
}

/**
 * Check if GeoNames API is configured
 */
export function isGeoNamesConfigured(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_GEONAMES_USERNAME);
}
