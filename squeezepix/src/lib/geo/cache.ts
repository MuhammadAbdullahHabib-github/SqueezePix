/**
 * Recent cities cache utility using localStorage
 */

import type { GeoCity } from './types';

const CACHE_KEY = 'squeezepix-recent-cities';
const MAX_RECENT_CITIES = 5;

export interface RecentCity extends GeoCity {
  lastUsed: number; // timestamp
}

/**
 * Get recent cities from localStorage
 */
export function getRecentCities(): RecentCity[] {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const cached = localStorage.getItem(CACHE_KEY);
    if (!cached) return [];

    const cities: RecentCity[] = JSON.parse(cached);
    // Sort by most recently used
    return cities.sort((a, b) => b.lastUsed - a.lastUsed);
  } catch {
    return [];
  }
}

/**
 * Add a city to recent cities cache
 */
export function addRecentCity(city: GeoCity): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const cities = getRecentCities();

    // Remove if already exists
    const filtered = cities.filter((c) => c.geonameId !== city.geonameId);

    // Add to front with timestamp
    const newCity: RecentCity = {
      ...city,
      lastUsed: Date.now(),
    };

    // Keep only MAX_RECENT_CITIES
    const updated = [newCity, ...filtered].slice(0, MAX_RECENT_CITIES);

    localStorage.setItem(CACHE_KEY, JSON.stringify(updated));
  } catch {
    // Ignore localStorage errors
  }
}

/**
 * Remove a city from recent cities cache
 */
export function removeRecentCity(geonameId: number): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    const cities = getRecentCities();
    const filtered = cities.filter((c) => c.geonameId !== geonameId);
    localStorage.setItem(CACHE_KEY, JSON.stringify(filtered));
  } catch {
    // Ignore localStorage errors
  }
}

/**
 * Clear all recent cities
 */
export function clearRecentCities(): void {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    localStorage.removeItem(CACHE_KEY);
  } catch {
    // Ignore localStorage errors
  }
}

/**
 * Get the most recently used city (for default selection)
 */
export function getLastUsedCity(): RecentCity | null {
  const cities = getRecentCities();
  return cities[0] || null;
}
