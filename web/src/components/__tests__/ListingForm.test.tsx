import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import ListingForm, { Listing } from '../ListingForm';
import { useRouter } from 'next/navigation';

// Mock the global fetch function
global.fetch = jest.fn();

const mockOnSuccess = jest.fn();

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

describe('ListingForm component', () => {

  beforeEach(() => {
    (fetch as jest.Mock).mockClear();
    mockOnSuccess.mockClear();
  });

  const fillOutForm = () => {
    fireEvent.change(screen.getByLabelText('Property Title'), { target: { value: 'Test Title' } });
    fireEvent.change(screen.getByLabelText('Street Address 1'), { target: { value: '123 Main St' } });
    fireEvent.change(screen.getByLabelText('City'), { target: { value: 'Testville' } });
    fireEvent.change(screen.getByLabelText('Zip Code'), { target: { value: '12345' } });
    fireEvent.change(screen.getByLabelText('State'), { target: { value: 'CA' } });
    fireEvent.change(screen.getByLabelText('Bedrooms'), { target: { value: '3' } });
    fireEvent.change(screen.getByLabelText('Bathrooms'), { target: { value: '2' } });
    fireEvent.change(screen.getByLabelText('Price'), { target: { value: '500000' } });
    fireEvent.change(screen.getByLabelText(/property description/i), { target: { value: 'A beautiful test property.' } });
    fireEvent.change(screen.getByLabelText('Status'), { target: { value: 'active' } });
  };

  it('renders in "create" mode and submits a new listing', async () => {
    (fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => ({}) });
    render(<ListingForm onSuccess={mockOnSuccess} />);

    expect(screen.getByText('Create New Property Listing')).toBeInTheDocument();
    
    fillOutForm();
    fireEvent.click(screen.getByRole('button', { name: /create listing/i }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/properties', expect.any(Object));
      expect(mockOnSuccess).toHaveBeenCalledTimes(1);
    });
  });

  it('renders in "edit" mode with pre-filled data and submits an update', async () => {
    const editingListing: Listing = {
      id: 'prop123',
      title: 'Existing Home',
      price: '750000',
      streetAddress1: '456 Old Rd',
      city: 'Oldtown',
      state: 'TX',
      zipcode: '54321',
      bedrooms: '5',
      bathrooms: '4',
      description: 'An old house',
      status: 'pending',
    };
    (fetch as jest.Mock).mockResolvedValueOnce({ ok: true, json: async () => ({}) });

    render(<ListingForm onSuccess={mockOnSuccess} editingListing={editingListing} />);

    expect(screen.getByText('Edit Property Listing')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Existing Home')).toBeInTheDocument();
    expect(screen.getByDisplayValue('750000')).toBeInTheDocument();

    // Change a value to test the update payload
    fireEvent.change(screen.getByLabelText('Price'), { target: { value: '800000' } });

    fireEvent.click(screen.getByRole('button', { name: /update listing/i }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/properties/prop123', expect.objectContaining({
        method: 'PUT',
        body: expect.stringContaining('"price":800000'),
      }));
      expect(mockOnSuccess).toHaveBeenCalledTimes(1);
    });
  });

  it('calls the cancel button handler', () => {
    render(<ListingForm onSuccess={mockOnSuccess} />);
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(mockOnSuccess).toHaveBeenCalledTimes(1);
  });
}); 