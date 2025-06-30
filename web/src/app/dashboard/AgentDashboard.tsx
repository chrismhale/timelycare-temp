"use client";
import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useApi } from '@/hooks/useApi';
import { useFetchState } from '@/hooks/useFetchState';
import Button from '@/components/ui/Button';
import PropertyCard from '@/components/PropertyCard';
import ListingForm, { Listing } from '@/components/ListingForm';
import ConfirmModal from '@/components/ConfirmModal';

interface Property extends Listing {
  id: string;
  imageUrl?: string;
}

const AgentDashboard: React.FC = () => {
  const { data: properties, setData: setProperties, handle: fetchProperties, isLoading } = useFetchState<Property[]>([]);
  const { request } = useApi();
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [deletingPropertyId, setDeletingPropertyId] = useState<string | null>(null);

  useEffect(() => {
    fetchProperties(async () => {
      return await request('/agent/properties');
    });
  }, [fetchProperties, request]);

  const handleFormSuccess = (listing: Listing) => {
    if (editingProperty) {
      setProperties(prev => prev.map(p => (p.id === listing.id ? { ...p, ...listing, id: p.id! } : p)));
    } else {
      if (listing.id) {
        setProperties(prev => [...prev, { ...listing, id: listing.id! }]);
      }
    }
    setIsFormOpen(false);
    setEditingProperty(null);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingPropertyId) return;
    await request(`/properties/${deletingPropertyId}`, {
      method: 'DELETE',
      successMessage: 'Property deleted!',
    });
    setProperties(prev => prev.filter(p => p.id !== deletingPropertyId));
    setDeletingPropertyId(null);
  };

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Your Listings</h1>
        <Button onClick={() => { setEditingProperty(null); setIsFormOpen(true); }}>
          Add New Property
        </Button>
      </div>

      {isLoading ? (
        <p>Loading your properties...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map(p => (
            <PropertyCard key={p.id} property={p}>
              <div className="flex justify-end space-x-2 mt-4">
                <Button onClick={() => { setEditingProperty(p); setIsFormOpen(true); }} variant="outline">Edit</Button>
                <Button onClick={() => p.id && setDeletingPropertyId(p.id)} variant="destructive">Delete</Button>
              </div>
            </PropertyCard>
          ))}
        </div>
      )}

      {isFormOpen && (
        <ListingForm
          property={editingProperty}
          onSuccess={handleFormSuccess}
          onClose={() => setIsFormOpen(false)}
        />
      )}

      {deletingPropertyId && (
        <ConfirmModal
          isOpen={!!deletingPropertyId}
          title="Confirm Deletion"
          message="Are you sure you want to delete this property?"
          onConfirm={handleDeleteConfirm}
          onClose={() => setDeletingPropertyId(null)}
        />
      )}
    </div>
  );
};

export default AgentDashboard; 