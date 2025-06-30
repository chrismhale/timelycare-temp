'use client';

import React, { useEffect, useState } from 'react';
import Input from './ui/Input';
import Textarea from './ui/Textarea';
import Button from './ui/Button';
import Select from './ui/Select';
import { states } from '@/utils/states';

export type Listing = {
  id?: string;
  title: string;
  price: string;
  streetAddress1: string;
  streetAddress2?: string;
  city: string;
  state: string;
  zipcode: string;
  bedrooms: string;
  bathrooms: string;
  description: string;
  status: 'active' | 'pending' | 'sold';
};

interface ListingFormProps {
  onSuccess: (listing: Listing) => void;
  onClose: () => void;
  property?: Listing | null;
}

const initialState: Listing = {
  title: '',
  price: '',
  streetAddress1: '',
  streetAddress2: '',
  city: '',
  state: '',
  zipcode: '',
  bedrooms: '',
  bathrooms: '',
  description: '',
  status: 'active'
};

const ListingForm: React.FC<ListingFormProps> = ({ onSuccess, onClose, property: editingListing }) => {
  const [form, setForm] = useState<Listing>(initialState);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (editingListing) {
      setForm({ ...initialState, ...editingListing });
    } else {
      setForm(initialState);
    }
  }, [editingListing]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const method = editingListing ? 'PUT' : 'POST';
    const url = editingListing ? `/api/properties/${editingListing.id}` : '/api/properties';
    
    try {
        const body = JSON.stringify({ ...form, price: Number(form.price), bedrooms: Number(form.bedrooms), bathrooms: Number(form.bathrooms) });
        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body,
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to save listing');
        }
        
        // alert(editingListing ? 'Listing updated successfully!' : 'Listing created successfully!');
        const result = await response.json();
        onSuccess(result);
    } catch (error: any) {
        console.error(error);
        // alert(error.message);
    } finally {
        setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md w-full max-w-2xl mx-auto space-y-4">
      <h2 className="text-2xl font-semibold mb-4 text-center">{editingListing ? 'Edit' : 'Create New'} Property Listing</h2>
      
      <Input name="title" label="Property Title" value={form.title} onChange={handleChange} placeholder="Property Title" required />
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Input name="streetAddress1" label="Street Address 1" value={form.streetAddress1} onChange={handleChange} placeholder="Street Address 1" required />
        <Input name="streetAddress2" label="Street Address 2 (Optional)" value={form.streetAddress2} onChange={handleChange} placeholder="Street Address 2 (Optional)" />
        <Input name="city" label="City" value={form.city} onChange={handleChange} placeholder="City" required />
        <Input name="zipcode" label="Zip Code" value={form.zipcode} onChange={handleChange} placeholder="Zip Code" required />
        <Select name="state" label="State" value={form.state} onChange={handleChange} required>
          <option value="">Select State</option>
          {states.map(s => <option key={s} value={s}>{s}</option>)}
        </Select>
        <Input name="bedrooms" label="Bedrooms" type="number" value={form.bedrooms} onChange={handleChange} placeholder="Bedrooms" required />
        <Input name="bathrooms" label="Bathrooms" type="number" value={form.bathrooms} onChange={handleChange} placeholder="Bathrooms" required />
        <Input name="price" label="Price" type="number" value={form.price} onChange={handleChange} placeholder="Price" required className="md:col-span-2" />
      </div>

      <Textarea name="description" label="Property Description" value={form.description} onChange={handleChange} placeholder="Property Description..." rows={6} />
      
      <Select name="status" label="Status" value={form.status} onChange={handleChange}>
        <option value="active">Active</option>
        <option value="pending">Pending</option>
        <option value="sold">Sold</option>
      </Select>

      <div className="flex justify-end gap-4 pt-4">
        <Button type="button" variant="outline" onClick={onClose}>Cancel</Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? 'Saving...' : editingListing ? 'Update Listing' : 'Create Listing'}
        </Button>
      </div>
    </form>
  );
};

export default ListingForm; 