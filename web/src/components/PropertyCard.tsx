'use client';

import React from 'react';
import Link from 'next/link';
import Button from './ui/Button';

type Property = {
  id?: string;
  title?: string;
  name?: string;
  streetAddress1?: string;
  streetAddress2?: string;
  city?: string;
  state?: string;
  zipcode?: string;
  price?: string | number;
  bedrooms?: string | number;
  bathrooms?: string | number;
  status?: string;
  imageUrl?: string;
  description?: string;
};

interface PropertyCardProps {
  property: Property;
  children?: React.ReactNode;
  onEdit?: () => void;
  onDelete?: () => void;
  onContactAgent?: (property: { id: string; title: string; address: string }) => void;
}

const PropertyCard: React.FC<PropertyCardProps> = ({ property, children, onEdit, onDelete, onContactAgent }) => {
  const {
    id,
    name,
    title,
    price,
    streetAddress1,
    streetAddress2,
    city,
    state,
    zipcode,
    bedrooms,
    bathrooms,
    imageUrl,
  } = property;

  if (!id) {
    return null; // Or some fallback UI
  }

  const propertyName = name || title || 'Untitled Property';
  const displayAddress = [streetAddress1, streetAddress2, city, state, zipcode].filter(Boolean).join(', ');
  const numericPrice = Number(price);
  const numericBedrooms = Number(bedrooms);
  const numericBathrooms = Number(bathrooms);

  const handleContact = () => {
    if (onContactAgent) {
      onContactAgent({ id, title: propertyName, address: displayAddress });
    }
  };

  return (
    <div className="border rounded-lg overflow-hidden shadow-md bg-white hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
      <Link href={`/property/${id}`} className="block">
        <img
          src={imageUrl || 'https://images.unsplash.com/photo-1560185007-5f0c1866ba1e?q=80&w=2100'}
          alt={`Image of ${propertyName}`}
          className="w-full h-48 object-cover"
        />
      </Link>
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-xl font-bold text-gray-800">{propertyName}</h3>
        {displayAddress && <p className="text-gray-600 mt-1 text-sm">{displayAddress}</p>}
        <div className="mt-2 text-gray-700">
          <span>{numericBedrooms} bed</span> &bull; <span>{numericBathrooms} bath</span>
        </div>
        <p className="text-2xl font-semibold mt-4 text-indigo-600">
          {typeof numericPrice === 'number' && !isNaN(numericPrice) ? `$${numericPrice.toLocaleString()}` : 'Contact for price'}
        </p>
        <div className="mt-auto pt-4">
          {children}
          <div className="flex justify-between items-center">
            <Link href={`/property/${id}`} className="text-indigo-600 hover:underline font-medium">
              View Details
            </Link>
            {onContactAgent && (
              <Button onClick={handleContact} size="sm">
                Contact Agent
              </Button>
            )}
          </div>
          {(onEdit || onDelete) && (
            <div className="mt-4 pt-4 border-t flex justify-end gap-2">
              {onEdit && <Button onClick={onEdit} variant="outline" size="sm">Edit</Button>}
              {onDelete && <Button onClick={onDelete} variant="outline" size="sm" className="!border-red-500 !text-red-500 hover:!bg-red-50">Delete</Button>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PropertyCard; 