'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useAuth } from '@/context/AuthContext';
import Button from '@/components/ui/Button';
import ListingForm, { Listing } from '@/components/ListingForm';
import ConfirmModal from '@/components/ConfirmModal';
import Modal from '@/components/Modal';

type Property = {
  id: string;
  name?: string;
  title?: string;
  price?: number;
  bedrooms?: number;
  bathrooms?: number;
  status?: 'active' | 'pending' | 'sold';
  streetAddress1?: string;
  streetAddress2?: string;
  city?: string;
  state?: string;
  zipcode?: string;
  description?: string;
};

type Inquiry = {
  id: string;
  name: string;
  email: string;
  message: string;
  propertyId: string;
  createdAt?: string;
};

type SortKey = 'title' | 'price' | 'status';

const AgentDashboardClient = () => {
  const { user, logout } = useAuth();
  const [properties, setProperties] = useState<Property[]>([]);
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [editingListing, setEditingListing] = useState<Listing | null>(null);
  const [deletingProperty, setDeletingProperty] = useState<Property | null>(null);
  const [expandedMessages, setExpandedMessages] = useState<Record<string, boolean>>({});
  const [sortConfig, setSortConfig] = useState<{ key: SortKey; direction: 'asc' | 'desc' } | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [propsRes, inquiriesRes] = await Promise.all([
        fetch('/api/agent-properties'), 
        fetch('/api/inquiries')
      ]);
      
      if (!propsRes.ok || !inquiriesRes.ok) {
        throw new Error('Failed to fetch dashboard data');
      }
      
      const propsData = await propsRes.json();
      const inquiriesData = await inquiriesRes.json();

      setProperties(propsData.properties || []);
      setInquiries(inquiriesData.inquiries || []);
    } catch (error) {
      console.error("Failed to fetch data:", error);
      // Optionally set an error state to show in the UI
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const sortedProperties = useMemo(() => {
    let sortableItems = [...properties];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        const aValue = a[sortConfig.key] ?? '';
        const bValue = b[sortConfig.key] ?? '';
        if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [properties, sortConfig]);

  const propertyIdToTitle = useMemo(() => 
    properties.reduce((acc, p) => {
      acc[p.id] = p.title || p.name || 'Untitled';
      return acc;
    }, {} as Record<string, string>), 
  [properties]);

  const handleSort = (key: SortKey) => {
    setSortConfig(prev => ({ key, direction: prev && prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc' }));
  };
  
  const getSortIndicator = (key: SortKey) => {
    if (!sortConfig || sortConfig.key !== key) return '↕';
    return sortConfig.direction === 'asc' ? '▲' : '▼';
  };
  
  const handleEdit = (prop: Property) => {
    const listingToEdit: Listing = {
        id: prop.id,
        title: prop.title || prop.name || '',
        price: String(prop.price || ''),
        streetAddress1: prop.streetAddress1 || '',
        streetAddress2: prop.streetAddress2 || '',
        city: prop.city || '',
        state: prop.state || '',
        zipcode: prop.zipcode || '',
        bedrooms: String(prop.bedrooms || ''),
        bathrooms: String(prop.bathrooms || ''),
        description: prop.description || '',
        status: prop.status || 'active',
    };
    setEditingListing(listingToEdit);
    setIsFormModalOpen(true);
  };
  
  const handleAddNew = () => {
      setEditingListing(null);
      setIsFormModalOpen(true);
  }

  const handleFormSuccess = () => {
    setIsFormModalOpen(false);
    setEditingListing(null);
    fetchData();
  };

  const handleDelete = async () => {
    if (!deletingProperty) return;
    
    try {
        const response = await fetch(`/api/properties/${deletingProperty.id}`, { method: 'DELETE' });
        if (!response.ok) throw new Error('Failed to delete property');
        
        await fetchData(); // Refetch all data
    } catch(error) {
        console.error('Error deleting property:', error);
        // Handle UI error feedback
    } finally {
        setDeletingProperty(null);
    }
  };

  const toggleMessage = (id: string) => {
    setExpandedMessages(prev => ({ ...prev, [id]: !prev[id] }));
  };

  if (isLoading) return <div className="text-center p-10">Loading dashboard...</div>;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Agent Dashboard</h1>
        {user && (
          <div className="flex items-center gap-4">
            <span className="text-gray-600">Welcome, {user.name}</span>
            <Button onClick={logout} variant="outline" size="sm">Logout</Button>
          </div>
        )}
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="flex justify-between items-center mb-4">
            <h2 id="properties-heading" className="text-2xl font-semibold">My Properties</h2>
            <Button onClick={handleAddNew}>Add New Listing</Button>
        </div>
        <div className="overflow-x-auto">
            <table aria-labelledby="properties-heading" className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('title')}>Title {getSortIndicator('title')}</th>
                        <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('price')}>Price {getSortIndicator('price')}</th>
                        <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider cursor-pointer" onClick={() => handleSort('status')}>Status {getSortIndicator('status')}</th>
                        <th className="px-6 py-3 text-right font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {sortedProperties.map(prop => (
                        <tr key={prop.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-900">{prop.title || prop.name}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-gray-500">${prop.price?.toLocaleString()}</td>
                            <td className="px-6 py-4 whitespace-nowrap"><span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${prop.status === 'active' ? 'bg-green-100 text-green-800' : prop.status === 'pending' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>{prop.status}</span></td>
                            <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                                <Button size="sm" variant="outline" onClick={() => handleEdit(prop)}>Edit</Button>
                                <Button size="sm" variant="outline" className="!border-red-500 !text-red-500 hover:!bg-red-50" onClick={() => setDeletingProperty(prop)}>Delete</Button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <h2 id="inquiries-heading" className="text-2xl font-semibold mb-4">Inquiries for My Properties</h2>
        <div className="overflow-x-auto">
            <table aria-labelledby="inquiries-heading" className="min-w-full divide-y divide-gray-200 text-sm">
                <thead className="bg-gray-50">
                    <tr>
                        <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Property</th>
                        <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Client</th>
                        <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase tracking-wider">Message</th>
                    </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                    {inquiries.map(inq => (
                        <tr key={inq.id}>
                            <td className="px-6 py-4 whitespace-nowrap font-medium text-gray-800">{propertyIdToTitle[inq.propertyId]}</td>
                            <td className="px-6 py-4 whitespace-nowrap">
                                <div className="font-medium text-gray-900">{inq.name}</div>
                                <a href={`mailto:${inq.email}`} className="text-indigo-600 hover:underline">{inq.email}</a>
                            </td>
                            <td className="px-6 py-4 text-gray-500">
                                {expandedMessages[inq.id] || inq.message.length <= 100 ? inq.message : `${inq.message.substring(0, 100)}...`}
                                {inq.message.length > 100 && (
                                    <button onClick={() => toggleMessage(inq.id)} className="text-indigo-600 hover:underline ml-2 text-xs">
                                        {expandedMessages[inq.id] ? 'Show Less' : 'Show More'}
                                    </button>
                                )}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>
        
      <Modal isOpen={isFormModalOpen} onClose={() => { setIsFormModalOpen(false); setEditingListing(null); }}>
          <ListingForm onSuccess={handleFormSuccess} property={editingListing} onClose={() => setIsFormModalOpen(false)}/>
      </Modal>

      <ConfirmModal
        isOpen={!!deletingProperty}
        onConfirm={handleDelete}
        onClose={() => setDeletingProperty(null)}
        title="Delete Property"
        message={`Are you sure you want to delete "${deletingProperty?.title || deletingProperty?.name}"? This action cannot be undone.`}
        confirmText="Delete"
        confirmVariant='primary'
      />
    </div>
  );
};

export default AgentDashboardClient; 