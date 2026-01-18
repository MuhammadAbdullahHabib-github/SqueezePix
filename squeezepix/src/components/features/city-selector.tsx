'use client';

import { useState, useRef, useEffect } from 'react';
import { useCitySearch } from '@/hooks/use-city-search';
import { formatCityDisplay, formatPopulation, cityToLocation } from '@/lib/geo/types';
import type { GeoCity, GeoLocation } from '@/lib/geo/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface CitySelectorProps {
  value: GeoLocation | null;
  onChange: (location: GeoLocation | null) => void;
  disabled?: boolean;
}

export function CitySelector({ value, onChange, disabled }: CitySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const {
    query,
    setQuery,
    cities,
    recentCities,
    isLoading,
    error,
    selectCity,
    clearError,
  } = useCitySearch(100);

  const [isMapLoading, setIsMapLoading] = useState(false);

  useEffect(() => {
    if (value) {
      setIsMapLoading(true);
    }
  }, [value?.latitude, value?.longitude]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelectCity = (city: GeoCity) => {
    selectCity(city);
    onChange(cityToLocation(city));
    setIsOpen(false);
  };

  const handleClear = () => {
    onChange(null);
    setQuery('');
  };

  const handleInputFocus = () => {
    if (!disabled) {
      setIsOpen(true);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
    if (!isOpen) setIsOpen(true);
    clearError();
  };

  // No separate mode state needed anymore
  const [latInput, setLatInput] = useState('');
  const [lngInput, setLngInput] = useState('');

  // Update manual inputs when value changes externally (e.g. city selection)
  useEffect(() => {
    if (value) {
      setLatInput(value.latitude.toString());
      setLngInput(value.longitude.toString());
    } else {
      setLatInput('');
      setLngInput('');
    }
  }, [value]);

  const handleManualChange = (lat: string, lng: string) => {
    setLatInput(lat);
    setLngInput(lng);

    const latNum = parseFloat(lat);
    const lngNum = parseFloat(lng);

    // Only update the actual location if valid coordinates
    if (!isNaN(latNum) && !isNaN(lngNum) &&
      latNum >= -90 && latNum <= 90 &&
      lngNum >= -180 && lngNum <= 180) {

      // If we are just fine-tuning a city, keep the city name? 
      // Or switch to "Custom"? The user likely wants to adjust.
      // If the coordinates match the current value exactly, don't trigger change?
      if (value && value.latitude === latNum && value.longitude === lngNum) {
        return;
      }

      onChange({
        latitude: latNum,
        longitude: lngNum,
        cityName: value?.cityName || "Custom Coordinates", // Keep city name if it was selected, or default
        countryName: value?.countryName || "Manual Entry",
        adminName: value?.adminName, // Keep admin name
      });
    }
  };

  const showDropdown = isOpen && !disabled && (query.length >= 2);
  const showResults = query.length >= 2;

  return (
    <div className="relative w-full space-y-4">
      {/* 1. City Search Section */}
      <div className="relative">
        {/* Selected City Display or Search Input */}
        {value && value.cityName !== "Custom Coordinates" ? (
          <div className="flex items-center justify-between rounded-md border border-border bg-muted/30 px-3 py-2">
            <div className="flex items-center gap-2">
              <span className="text-base">📍</span>
              <span className="text-sm font-medium">
                {value.cityName}
                {value.adminName && `, ${value.adminName}`}
                {value.countryName && `, ${value.countryName}`}
              </span>
            </div>
            <button
              type="button"
              onClick={handleClear}
              disabled={disabled}
              className="rounded p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground disabled:opacity-50"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ) : (
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              🔍
            </span>
            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={handleInputChange}
              onFocus={handleInputFocus}
              disabled={disabled}
              placeholder="Search for a city..."
              className="w-full rounded-md border border-border bg-background py-2 pl-9 pr-3 text-sm transition-colors placeholder:text-muted-foreground focus:border-foreground focus:outline-none focus:ring-1 focus:ring-foreground/20 disabled:cursor-not-allowed disabled:opacity-50"
            />
            {isLoading && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
              </div>
            )}
          </div>
        )}

        {/* Dropdown */}
        {showDropdown && (
          <div
            ref={dropdownRef}
            className="absolute z-50 mt-1 max-h-80 w-full overflow-auto rounded-lg border border-border bg-background shadow-lg"
          >
            {/* Error Message */}
            {error && (
              <div className="flex items-center gap-2 border-b border-border bg-destructive/10 px-4 py-3 text-sm text-destructive">
                <svg className="h-4 w-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <span>{error}</span>
                <button
                  type="button"
                  onClick={clearError}
                  className="ml-auto text-xs underline hover:no-underline"
                >
                  Dismiss
                </button>
              </div>
            )}

            {/* Search Results */}
            {showResults && cities.length > 0 && (
              <div className="py-1">
                {cities.map((city) => (
                  <CityItem
                    key={city.geonameId}
                    city={city}
                    onClick={() => handleSelectCity(city)}
                  />
                ))}
              </div>
            )}

            {/* No Results */}
            {showResults && !isLoading && cities.length === 0 && !error && (
              <div className="px-4 py-3 text-center text-sm text-muted-foreground">
                No cities found for "{query}"
              </div>
            )}

            {/* Recent Cities */}
            {!showResults && recentCities.length > 0 && (
              <div className="py-1">
                <div className="px-4 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                  Recent
                </div>
                {recentCities.map((city) => (
                  <CityItem
                    key={city.geonameId}
                    city={city}
                    onClick={() => handleSelectCity(city)}
                  />
                ))}
              </div>
            )}

            {/* Empty State */}
            {!showResults && recentCities.length === 0 && (
              <div className="px-4 py-3 text-center text-sm text-muted-foreground">
                Type at least 2 characters to search
              </div>
            )}
          </div>
        )}
      </div>

      {/* 2. Manual Coordinates Section (Always Visible) */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Latitude</label>
          <Input
            type="text"
            placeholder="e.g. 34.0522"
            value={latInput}
            onChange={(e) => handleManualChange(e.target.value, lngInput)}
            className="h-9"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-muted-foreground">Longitude</label>
          <Input
            type="text"
            placeholder="e.g. -118.2437"
            value={lngInput}
            onChange={(e) => handleManualChange(latInput, e.target.value)}
            className="h-9"
          />
        </div>
      </div>

      {/* Map Preview */}
      {value && (
        <div className="mt-3 overflow-hidden rounded-lg border border-border shadow-sm bg-muted/10 h-80 relative">
          {isMapLoading && (
            <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-muted/20 backdrop-blur-[1px]">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent shadow-sm" />
              <p className="mt-2 text-xs font-medium text-muted-foreground animate-pulse">Loading Map...</p>
            </div>
          )}
          <div className={`relative h-full w-full overflow-hidden transition-opacity duration-500 ${isMapLoading ? 'opacity-0' : 'opacity-100'}`}>
            <iframe
              src={`https://maps.google.com/maps?q=${value.latitude},${value.longitude}&z=4&output=embed&iwloc=near`}
              className="absolute inset-0 h-[calc(100%+250px)] w-full border-0"
              style={{ marginTop: '-150px' }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title={`Map of ${value.cityName}`}
              onLoad={() => setIsMapLoading(false)}
            />
          </div>
        </div>
      )}
    </div>
  );
}

interface CityItemProps {
  city: GeoCity;
  onClick: () => void;
}

function CityItem({ city, onClick }: CityItemProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex w-full items-start gap-3 px-4 py-2 text-left transition-colors hover:bg-muted"
    >
      <span className="mt-0.5 text-base">📍</span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-foreground">{city.name}</p>
        <p className="truncate text-xs text-muted-foreground">
          {city.adminName1 && `${city.adminName1}, `}
          {city.countryName}
          {city.population > 0 && ` • Pop: ${formatPopulation(city.population)}`}
        </p>
      </div>
    </button>
  );
}
