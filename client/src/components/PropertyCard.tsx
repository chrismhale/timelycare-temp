import React from 'react';
import { Link } from 'react-router-dom';
import Button from './ui/Button';

interface PropertyCardProps {
    id: string;
    name: string;
    price: number;
    location?: string;
    address?: string;
    streetAddress1?: string;
    streetAddress2?: string;
    city?: string;
    state?: string;
    zipcode?: string;
    bedrooms: number;
    bathrooms: number;
    imageUrl?: string;
    onEdit?: () => void;
    onDelete?: () => void;
    onInquire?: (property: { id: string; title: string; address: string }) => void;
}

const PropertyCard: React.FC<PropertyCardProps> = (props) => {
    const {
        id,
        name,
        price,
        location,
        address,
        streetAddress1: sa1,
        streetAddress2: sa2,
        city,
        state,
        zipcode,
        bedrooms,
        bathrooms,
        imageUrl,
        onEdit,
        onDelete,
        onInquire,
    } = props as any;

    const hasNewAddress = sa1 || sa2 || city || state || zipcode;
    const displayAddress = hasNewAddress
      ? [sa1, sa2, city, state, zipcode].filter(Boolean).join(', ')
      : location || address;

    return (
        <div className="block border rounded-lg p-4 shadow-md bg-white w-full max-w-md mx-auto mb-4 hover:shadow-lg transition-shadow">
            <img src={imageUrl || 'https://placehold.co/600x300?text=No+Image'} alt={name} className="w-full h-48 object-cover rounded-t-lg" />
            <div className="p-4">
                <h2 className="text-xl font-bold">{name}</h2>
                {displayAddress && <p className="text-gray-700">{displayAddress}</p>}
                <p className="text-sm text-gray-500 mt-2 flex flex-wrap gap-2 items-center">
                    <span>{bedrooms} bed • {bathrooms} bath</span>
                </p>
                <p className="text-lg font-semibold mt-2">
                    {typeof price === 'number' ? `$${price.toLocaleString()}` : 'Price not available'}
                </p>
                <Link to={`/property/${id}`} className="text-blue-600 hover:underline mt-4 inline-block mr-4">View Details</Link>
                {onInquire && (
                  <button
                    type="button"
                    onClick={() => onInquire({ id, title: name, address: displayAddress })}
                    className="ml-0 mt-3 block text-blue-600 hover:text-blue-800 underline font-medium text-sm transition-colors"
                  >
                    Contact an agent
                  </button>
                )}
            </div>
            {(onEdit || onDelete) && (
                <div className="p-4 border-t flex justify-end gap-2">
                    {onEdit && <Button onClick={onEdit}>Edit</Button>}
                    {onDelete && <Button onClick={onDelete}>Delete</Button>}
                </div>
            )}
        </div>
    );
};

export default PropertyCard;
