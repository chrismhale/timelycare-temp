import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter as Router, MemoryRouter, Route, Routes } from 'react-router-dom';
import PropertyDetails from '@/pages/PropertyDetails';
import { useApi } from 'hooks/useApi';

jest.mock('hooks/useApi');
const mockUseApi = useApi as jest.Mock;

const renderComponent = (id = '1') =>
  render(
    <MemoryRouter initialEntries={[`/property/${id}`]}>
      <Routes>
        <Route path="/property/:id" element={<PropertyDetails />} />
      </Routes>
    </MemoryRouter>
  );

describe('PropertyDetails', () => {
  beforeEach(() => {
    mockUseApi.mockReturnValue({ request: jest.fn() });
  });

  it('shows loading state', () => {
    mockUseApi.mockReturnValue({ request: jest.fn() });
    renderComponent();
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it('shows error if API fails', async () => {
    mockUseApi.mockReturnValue({ request: jest.fn().mockRejectedValue(new Error('fail')) });
    renderComponent();
    await waitFor(() => expect(screen.getByText(/failed to load property/i)).toBeInTheDocument());
  });

  it('shows property details and inquiry form', async () => {
    const property = {
      id: '1',
      title: 'Test Home',
      address: '123 Main St',
      bedrooms: 3,
      bathrooms: 2,
      price: 500000,
      status: 'active',
      description: 'A great home',
      imageUrl: '',
    };
    mockUseApi.mockReturnValue({ request: jest.fn().mockResolvedValue({ data: property }) });
    renderComponent('1');
    await waitFor(() => expect(screen.getByText('Test Home')).toBeInTheDocument());
    expect(screen.getByText('123 Main St')).toBeInTheDocument();
    expect(screen.getByText(/3 bed/i)).toBeInTheDocument();
    expect(screen.getByText(/2 bath/i)).toBeInTheDocument();
    expect(screen.getByText(/active/i)).toBeInTheDocument();
    expect(screen.getByText(/a great home/i)).toBeInTheDocument();
    expect(screen.getByText(/send an inquiry/i)).toBeInTheDocument();
  });

  it('shows not found if property is null', async () => {
    mockUseApi.mockReturnValue({ request: jest.fn().mockResolvedValue({ data: null }) });
    renderComponent('2');
    await waitFor(() => expect(screen.getByText(/property not found/i)).toBeInTheDocument());
  });
}); 