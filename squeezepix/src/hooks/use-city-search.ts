'use client';

import { useState, useEffect, useCallback } from 'react';
import { useDebounce } from './use-debounce';
import { searchCities, GeoNamesError } from '@/lib/geo/geonames';
import { getRecentCities, addRecentCity } from '@/lib/geo/cache';
import type { GeoCity } from '@/lib/geo/types';

export interface UseCitySearchResult {
  query: string;
  setQuery: (query: string) => void;
  cities: GeoCity[];
  recentCities: GeoCity[];
  isLoading: boolean;
  error: string | null;
  selectCity: (city: GeoCity) => void;
  clearError: () => void;
}

/**
 * Hook for searching cities with debounce and caching
 * @param debounceMs - Debounce delay in milliseconds (default: 100ms)
 */
export function useCitySearch(debounceMs: number = 100): UseCitySearchResult {
  const [query, setQuery] = useState('');
  const [cities, setCities] = useState<GeoCity[]>([]);
  const [recentCities, setRecentCities] = useState<GeoCity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debouncedQuery = useDebounce(query, debounceMs);

  // Load recent cities on mount
  useEffect(() => {
    setRecentCities(getRecentCities());
  }, []);

  // Search cities when debounced query changes
  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setCities([]);
      setError(null);
      return;
    }

    let cancelled = false;

    const search = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const results = await searchCities(debouncedQuery);
        if (!cancelled) {
          setCities(results);
        }
      } catch (err) {
        if (!cancelled) {
          if (err instanceof GeoNamesError) {
            setError(err.message);
          } else {
            setError('Failed to search cities. Please try again.');
          }
          setCities([]);
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    };

    search();

    return () => {
      cancelled = true;
    };
  }, [debouncedQuery]);

  const selectCity = useCallback((city: GeoCity) => {
    addRecentCity(city);
    setRecentCities(getRecentCities());
    setQuery('');
    setCities([]);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    query,
    setQuery,
    cities,
    recentCities,
    isLoading,
    error,
    selectCity,
    clearError,
  };
}
