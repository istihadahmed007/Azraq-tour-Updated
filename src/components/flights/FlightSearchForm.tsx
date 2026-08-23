import React from 'react';
import { FlightSearchForm as CoreFlightSearchForm, FlightSearchParams } from '../FlightSearchForm';

export interface AppFlightSearchFormProps {
  defaultFrom?: string;
  defaultTo?: string;
  onSearch?: (params: FlightSearchParams) => void;
  className?: string;
}

export function FlightSearchForm({
  defaultFrom = 'Dhaka (DAC)',
  defaultTo,
  onSearch,
  className = '',
}: AppFlightSearchFormProps) {
  return (
    <div className={`w-full ${className}`}>
      <CoreFlightSearchForm
        onSearch={onSearch}
        variant="page"
      />
    </div>
  );
}

export default FlightSearchForm;
