'use client';

import React, { useState, useEffect } from 'react';
import PropertyCard from '@/components/PropertyCard';
import { useFetchState } from '@/hooks/useFetchState';
import { useApi } from '@/hooks/useApi';

// Define the shape of a property object
interface Property {
  id: string;
  title: string;
  price: number;
  streetAddress1: string;
  streetAddress2?: string;
  city: string;
  state: string;
  zipcode: string;
  bedrooms: number;
  bathrooms: number;
  description: string;
  status: 'For Sale' | 'For Rent';
}

const PropertyListingsClient: React.FC = () => {
  const { data: properties, handle: fetchProperties, isLoading } = useFetchState<Property[]>([]);
  const { request } = useApi();

  useEffect(() => {
    fetchProperties(async () => {
      const res = await request('/properties');
      return res;
    });
  }, [fetchProperties, request]);

  if (isLoading) {
    return <div className="text-center p-8">Loading properties...</div>;
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-6 text-center">Available Properties</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map((property) => (
          <PropertyCard key={property.id} property={property} />
        ))}
      </div>
    </div>
  );
};

export default PropertyListingsClient; 