import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import PropertyDetailsPage from '../page';
import { notFound } from 'next/navigation';

jest.mock('@/components/InquiryForm', () => ({
  __esModule: true,
  default: () => <div data-testid="mock-inquiry-form" />,
}));

jest.mock('next/navigation', () => ({
  notFound: jest.fn(() => {
    throw new Error('NOT_FOUND');
  }),
}));

global.fetch = jest.fn((url) =>
  Promise.resolve({ ok: true, json: () => Promise.resolve({
    id: '1',
    title: 'Test Home',
    streetAddress1: '1 Main',
    city: 'Town',
    state: 'TX',
    price: 123000,
    bedrooms: 3,
    bathrooms: 2,
    status: 'active'
  }) })
) as jest.Mock;

describe('PropertyDetailsPage', () => {
  it('renders property details', async () => {
    const ui = await PropertyDetailsPage({ params: { id: '1' } });
    render(ui as React.ReactElement);

    await waitFor(() => {
      expect(screen.getByText('Test Home')).toBeInTheDocument();
      expect(screen.getByTestId('mock-inquiry-form')).toBeInTheDocument();
    });
  });

  it('calls notFound for missing property', async () => {
    (global.fetch as jest.Mock).mockImplementationOnce(() => Promise.resolve({ status: 404, ok: false }));
    await expect(PropertyDetailsPage({ params: { id: 'missing' } })).rejects.toThrow('NOT_FOUND');
  });
}); 