import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ListingForm from '@/components/ListingForm';
import { useApi } from 'hooks/useApi';

const mockUseApi = useApi as jest.Mock;
jest.mock('hooks/useApi');

describe('ListingForm', () => {
  const onSuccess = jest.fn();

  beforeEach(() => {
    mockUseApi.mockReturnValue({
        request: jest.fn().mockResolvedValue({ data: {} })
    });
    onSuccess.mockClear();
  });

  it('submits a new listing and calls onSuccess', async () => {
    render(<ListingForm onSuccess={onSuccess} editing={null} />);
    
    fireEvent.change(screen.getByPlaceholderText(/Title/i), {
      target: { value: 'Test Home', name: 'title' }
    });
    fireEvent.change(screen.getByPlaceholderText(/Price/i), {
      target: { value: '500000', name: 'price' }
    });
    fireEvent.change(screen.getByPlaceholderText(/Address/i), {
      target: { value: '123 Main St', name: 'address' }
    });
    fireEvent.change(screen.getByPlaceholderText(/Bedrooms/i), {
      target: { value: '3', name: 'bedrooms' }
    });
    fireEvent.change(screen.getByPlaceholderText(/Bathrooms/i), {
      target: { value: '2', name: 'bathrooms' }
    });

    fireEvent.click(screen.getByRole('button', { name: /Create Listing/i }));

    await waitFor(() => {
      expect(onSuccess).toHaveBeenCalled();
    });
  });

  it('populates form with data when editing', () => {
    const propertyToEdit = {
        id: '1',
        title: 'Edit Home',
        price: '600000',
        address: '456 Edit Ave',
        bedrooms: '4',
        bathrooms: '3',
        description: '',
        status: 'active',
    } as const;
    render(<ListingForm onSuccess={onSuccess} editing={propertyToEdit} />);

    expect(screen.getByPlaceholderText(/Title/i)).toHaveValue('Edit Home');
    expect(screen.getByPlaceholderText(/Price/i)).toHaveValue(600000);
    expect(screen.getByRole('button', { name: /Update Listing/i })).toBeInTheDocument();
  });
});
