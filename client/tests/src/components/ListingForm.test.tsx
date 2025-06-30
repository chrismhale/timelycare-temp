// Mock useApi at the very top
jest.mock('hooks/useApi', () => ({
  useApi: () => ({ request: jest.fn() })
}));

import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ListingForm from '@/components/ListingForm';
import { AuthProvider } from '@/context/AuthContext';

const initialState = {
  title: '',
  price: '',
  address: '',
  bedrooms: '',
  bathrooms: '',
  description: '',
  status: 'active'
};

it('should call onClear when editing and cancel is clicked', () => {
  const onClear = jest.fn();
  render(
    <AuthProvider>
      <ListingForm editing={{ id: 1, ...initialState }} onSuccess={jest.fn()} onClear={onClear} />
    </AuthProvider>
  );
  fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
  expect(onClear).toHaveBeenCalled();
});

it('should call onClear after successful edit', async () => {
  const onClear = jest.fn();
  const onSuccess = jest.fn();
  render(
    <AuthProvider>
      <ListingForm editing={{ id: 1, ...initialState }} onSuccess={onSuccess} onClear={onClear} />
    </AuthProvider>
  );
  fireEvent.change(screen.getByPlaceholderText('Title'), { target: { value: 'Test Title' } });
  fireEvent.change(screen.getByPlaceholderText('Price'), { target: { value: '100000' } });
  fireEvent.change(screen.getByPlaceholderText('Address'), { target: { value: '123 Main St' } });
  fireEvent.change(screen.getByPlaceholderText('Bedrooms'), { target: { value: '3' } });
  fireEvent.change(screen.getByPlaceholderText('Bathrooms'), { target: { value: '2' } });
  fireEvent.change(screen.getByPlaceholderText('Description'), { target: { value: 'Nice house' } });
  fireEvent.click(screen.getByRole('button', { name: /update/i }));
  await waitFor(() => {
    expect(onClear).toHaveBeenCalled();
    expect(onSuccess).toHaveBeenCalled();
  });
}); 