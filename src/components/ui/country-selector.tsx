import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { ChevronDown, ChevronUp, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { CountryCode, countryCodes } from '@/lib/country-codes';
import { Input } from './input';

interface CountrySelectorProps {
  value: CountryCode;
  onChange: (value: CountryCode) => void;
  disabled?: boolean;
}

export function CountrySelector({ value, onChange, disabled = false }: CountrySelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter countries based on search term
  const filteredCountries = searchTerm
    ? countryCodes.filter(country =>
        country.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        country.dial_code.includes(searchTerm)
      )
    : countryCodes;

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <Button
        type="button"
        variant="outline"
        onClick={() => !disabled && setOpen(!open)}
        className={cn(
          "flex items-center justify-between w-[110px] px-3 py-6 h-10 border-input",
          disabled && "opacity-50 cursor-not-allowed"
        )}
        disabled={disabled}
      >
        <div className="flex items-center gap-2 truncate">
          <span className="text-base">{value.flag}</span>
          <span className="text-sm font-medium">{value.dial_code}</span>
        </div>
        {open ? (
          <ChevronUp className="ml-1 h-4 w-4 shrink-0 opacity-50" />
        ) : (
          <ChevronDown className="ml-1 h-4 w-4 shrink-0 opacity-50" />
        )}
      </Button>

      {open && (
        <div className="absolute z-50 mt-1 w-[250px] rounded-md border border-input bg-background shadow-md">
          <div className="p-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search country..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 py-2 h-8 text-sm"
              />
            </div>
          </div>

          <div className="max-h-[300px] overflow-y-auto">
            {filteredCountries.length === 0 ? (
              <div className="py-6 text-center text-sm text-muted-foreground">
                No country found
              </div>
            ) : (
              filteredCountries.map((country) => (
                <div
                  key={country.code}
                  className={cn(
                    "flex items-center justify-between px-3 py-2 cursor-pointer hover:bg-accent hover:text-accent-foreground",
                    value.code === country.code && "bg-accent/50"
                  )}
                  onClick={() => {
                    onChange(country);
                    setOpen(false);
                    setSearchTerm('');
                  }}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-base">{country.flag}</span>
                    <span className="text-sm">{country.name}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{country.dial_code}</span>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
