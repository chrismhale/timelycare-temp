import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import PublicListings from '@/pages/PublicListings';
import { useApi } from 'hooks/useApi';

jest.mock('hooks/useApi');

const mockUseApi = useApi as jest.Mock;

const renderComponent = () =>
  render(
    <Router>
      <PublicListings />
    </Router>
  );

describe('PublicListings', () => {
  let requestMock: jest.Mock;

  beforeEach(() => {
    requestMock = jest.fn();
    mockUseApi.mockReturnValue({ request: requestMock });
  });

  it('should display a loading state initially', () => {
    requestMock.mockResolvedValue([]);
    renderComponent();
    expect(screen.getByText('Loading...')).toBeInTheDocument();
  });

  it('should display an error message if the API call fails', async () => {
    const errorMessage = 'Failed to load listings. Please try again later.';
    requestMock.mockRejectedValue(new Error('API Error'));
    renderComponent();
    
    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    expect(screen.getByText(errorMessage)).toBeInTheDocument();
  });

  it('should display "no properties" message when API returns an empty array', async () => {
    mockUseApi.mockReturnValue({ request: jest.fn().mockResolvedValue({ data: [] }) });
    renderComponent();

    await waitFor(() => expect(screen.queryByText('Loading...')).not.toBeInTheDocument());
    expect(screen.getByText(/no properties/i)).toBeInTheDocument();
  });

  it('should render property cards when the API returns data', async () => {
    const mockProperties = [{ id: '1', name: 'Test Home', location: 'Test Location', price: 500000, bedrooms: 3, bathrooms: 2 }];
    mockUseApi.mockReturnValue({ request: jest.fn().mockResolvedValue({ data: mockProperties }) });
    renderComponent();

    await waitFor(() => {
      expect(screen.queryByText('Loading...')).not.toBeInTheDocument();
    });

    expect(screen.getByText('Test Home')).toBeInTheDocument();
  });

  it('should filter properties by min price', async () => {
    const mockProperties = [
      { id: '1', name: 'Cheap Home', location: 'A', price: 100000, bedrooms: 2, bathrooms: 1 },
      { id: '2', name: 'Expensive Home', location: 'B', price: 900000, bedrooms: 4, bathrooms: 3 },
    ];
    mockUseApi.mockReturnValue({ request: jest.fn().mockResolvedValue({ data: mockProperties }) });
    renderComponent();
    await waitFor(() => expect(screen.queryByText('Loading...')).not.toBeInTheDocument());
    fireEvent.change(screen.getByLabelText(/min price/i), { target: { value: '500000' } });
    expect(screen.queryByText('Cheap Home')).not.toBeInTheDocument();
    expect(screen.getByText('Expensive Home')).toBeInTheDocument();
  });

  it('should filter properties by min bedrooms', async () => {
    const mockProperties = [
      { id: '1', name: 'Studio', location: 'A', price: 200000, bedrooms: 1, bathrooms: 1 },
      { id: '2', name: 'Family Home', location: 'B', price: 400000, bedrooms: 4, bathrooms: 2 },
    ];
    mockUseApi.mockReturnValue({ request: jest.fn().mockResolvedValue({ data: mockProperties }) });
    renderComponent();
    await waitFor(() => expect(screen.queryByText('Loading...')).not.toBeInTheDocument());
    fireEvent.change(screen.getByLabelText(/min bedrooms/i), { target: { value: '2' } });
    expect(screen.queryByText('Studio')).not.toBeInTheDocument();
    expect(screen.getByText('Family Home')).toBeInTheDocument();
  });

  it('should filter properties by location', async () => {
    const mockProperties = [
      { id: '1', name: 'City Home', location: 'New York', price: 300000, bedrooms: 2, bathrooms: 1 },
      { id: '2', name: 'Country Home', location: 'Rural', price: 250000, bedrooms: 3, bathrooms: 2 },
    ];
    mockUseApi.mockReturnValue({ request: jest.fn().mockResolvedValue({ data: mockProperties }) });
    renderComponent();
    await waitFor(() => expect(screen.queryByText('Loading...')).not.toBeInTheDocument());
    fireEvent.change(screen.getByLabelText(/location/i), { target: { value: 'new york' } });
    await waitFor(() => expect(screen.getByText('City Home')).toBeInTheDocument());
    expect(screen.queryByText('Country Home')).not.toBeInTheDocument();
  });

  it('should clear filters when Clear button is clicked', async () => {
    const mockProperties = [
      { id: '1', name: 'A', location: 'X', price: 100, bedrooms: 1, bathrooms: 1 },
      { id: '2', name: 'B', location: 'Y', price: 200, bedrooms: 2, bathrooms: 2 },
    ];
    mockUseApi.mockReturnValue({ request: jest.fn().mockResolvedValue({ data: mockProperties }) });
    renderComponent();
    await waitFor(() => expect(screen.queryByText('Loading...')).not.toBeInTheDocument());
    fireEvent.change(screen.getByLabelText(/min price/i), { target: { value: '150' } });
    expect(screen.queryByText('A')).not.toBeInTheDocument();
    fireEvent.click(screen.getByText(/clear/i));
    expect(screen.getByText('A')).toBeInTheDocument();
    expect(screen.getByText('B')).toBeInTheDocument();
  });

  it('shows error for malformed data format', async () => {
    mockUseApi.mockReturnValue({ request: jest.fn().mockResolvedValue({ data: {} }) });
    renderComponent();
    await waitFor(() => expect(screen.getByText(/unexpected data format/i)).toBeInTheDocument());
  });
}); 