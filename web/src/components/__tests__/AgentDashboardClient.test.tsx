import React from 'react';
import { render, screen, fireEvent, waitFor, within } from '@testing-library/react';
import '@testing-library/jest-dom';
import AgentDashboardClient from '../AgentDashboardClient';
import { useAuth } from '@/context/AuthContext';

// Mock child components and hooks
jest.mock('@/context/AuthContext');
jest.mock('../ListingForm', () => ({
  __esModule: true,
  default: ({ onSuccess, editingListing }) => (
    <div data-testid="mock-listing-form">
      <h2>{editingListing ? 'Edit Listing' : 'Create Listing'}</h2>
      <button onClick={onSuccess}>Success</button>
    </div>
  ),
}));
jest.mock('../ConfirmModal', () => ({
  __esModule: true,
  default: ({ isOpen, onConfirm, onClose, title, message }) => {
    if (!isOpen) return null;
    return (
      <div data-testid="mock-confirm-modal">
        <h3>{title}</h3>
        <p>{message}</p>
        <button onClick={onConfirm}>Confirm</button>
        <button onClick={onClose}>Cancel</button>
      </div>
    );
  },
}));
jest.mock('../Modal', () => ({
  __esModule: true,
  default: ({ isOpen, onClose, children }) => {
    if (!isOpen) return null;
    return <div data-testid="mock-modal" onClick={onClose}>{children}</div>;
  },
}));

const mockUseAuth = useAuth as jest.Mock;
const mockFetch = jest.fn();
global.fetch = mockFetch;

const mockProperties = [
  { id: '1', title: 'Beach House', price: 500000, status: 'active' },
  { id: '2', title: 'Mountain Cabin', price: 250000, status: 'sold' },
  { id: '3', title: 'City Apartment', price: 750000, status: 'pending' },
];

const mockInquiries = [
  { id: 'inq1', propertyId: '1', name: 'John Doe', email: 'john@test.com', message: 'I am very interested in the Beach House!' },
  { id: 'inq2', propertyId: '3', name: 'Jane Smith', email: 'jane@test.com', message: 'A very long message that is definitely going to be over one hundred characters long so that we can effectively test the show more and show less functionality for the inquiries table on the agent dashboard page.' },
];

const renderAndWait = async () => {
    render(<AgentDashboardClient />);
    // Wait for both tables to be present before proceeding, using exact names
    await screen.findByRole('table', { name: /^My Properties$/i });
    await screen.findByRole('table', { name: /^Inquiries for My Properties$/i });
};

describe('AgentDashboardClient component', () => {
  beforeEach(() => {
    mockUseAuth.mockReturnValue({ user: { name: 'Test Agent' }, logout: jest.fn() });
    mockFetch.mockImplementation((url) => {
      if (url.includes('/api/agent-properties')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ properties: mockProperties }) });
      }
      if (url.includes('/api/inquiries')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ inquiries: mockInquiries }) });
      }
      if (url.includes('/api/properties/1')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve({}) });
    });
    mockFetch.mockClear();
  });

  it('shows loading state and then renders fetched data in correct tables', async () => {
    render(<AgentDashboardClient />);
    expect(screen.getByText('Loading dashboard...')).toBeInTheDocument();

    const propertiesTable = await screen.findByRole('table', { name: /^My Properties$/i });
    const inquiriesTable = await screen.findByRole('table', { name: /^Inquiries for My Properties$/i });

    expect(within(propertiesTable).getByText('Beach House')).toBeInTheDocument();
    expect(within(inquiriesTable).getByText('John Doe')).toBeInTheDocument();
  });

  it('sorts properties when table headers are clicked', async () => {
    await renderAndWait();
    
    const propertiesTable = screen.getByRole('table', { name: /^My Properties$/i });
    const titleHeader = within(propertiesTable).getByText(/Title/);
    
    // Check initial order
    let rows = within(propertiesTable).getAllByRole('row');
    expect(rows[1]).toHaveTextContent('Beach House');

    // Sort ascending by title
    fireEvent.click(titleHeader);
    
    await waitFor(() => {
        rows = within(propertiesTable).getAllByRole('row');
        expect(rows[1]).toHaveTextContent('Beach House');
        expect(rows[2]).toHaveTextContent('City Apartment');
        expect(rows[3]).toHaveTextContent('Mountain Cabin');
    });

    // Sort descending by title
    fireEvent.click(titleHeader);
    await waitFor(() => {
      rows = within(propertiesTable).getAllByRole('row');
      expect(rows[1]).toHaveTextContent('Mountain Cabin');
      expect(rows[2]).toHaveTextContent('City Apartment');
      expect(rows[3]).toHaveTextContent('Beach House');
    });
  });

  it('opens the listing form in create mode when "Add New Listing" is clicked', async () => {
    await renderAndWait();
    fireEvent.click(screen.getByRole('button', { name: /Add New Listing/i }));

    await waitFor(() => {
      expect(screen.getByTestId('mock-listing-form')).toBeInTheDocument();
      expect(screen.getByText('Create Listing')).toBeInTheDocument();
    });
  });

  it('opens the listing form in edit mode when an "Edit" button is clicked', async () => {
    await renderAndWait();
    const propertiesTable = screen.getByRole('table', { name: /^My Properties$/i });
    const editButtons = within(propertiesTable).getAllByRole('button', { name: /Edit/i });
    fireEvent.click(editButtons[0]);

    await waitFor(() => {
      expect(screen.getByTestId('mock-listing-form')).toBeInTheDocument();
      expect(screen.getByText('Edit Listing')).toBeInTheDocument();
    });
  });

  it('handles the delete process correctly', async () => {
    await renderAndWait();
    const propertiesTable = screen.getByRole('table', { name: /^My Properties$/i });
    
    const deleteButton = within(propertiesTable).getAllByRole('button', { name: /Delete/i })[0];
    fireEvent.click(deleteButton);

    await waitFor(() => {
      expect(screen.getByTestId('mock-confirm-modal')).toBeInTheDocument();
    });
    
    expect(screen.getByText(/Are you sure you want to delete "Beach House"/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: 'Confirm' }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith('/api/properties/1', { method: 'DELETE' });
    });
  });

  it('expands and collapses long inquiry messages', async () => {
    await renderAndWait();
    const inquiriesTable = screen.getByRole('table', { name: /^Inquiries for My Properties$/i });

    const showMoreButton = within(inquiriesTable).getByRole('button', { name: /Show More/i });
    expect(showMoreButton).toBeInTheDocument();
    
    expect(within(inquiriesTable).queryByText(mockInquiries[1].message)).not.toBeInTheDocument();

    fireEvent.click(showMoreButton);

    await waitFor(() => {
      expect(within(inquiriesTable).getByText(mockInquiries[1].message)).toBeInTheDocument();
    });

    const showLessButton = within(inquiriesTable).getByRole('button', { name: /Show Less/i });
    fireEvent.click(showLessButton);

    await waitFor(() => {
      expect(within(inquiriesTable).queryByText(mockInquiries[1].message)).not.toBeInTheDocument();
    });
  });

  it('handles fetch errors gracefully', async () => {
    mockFetch.mockRejectedValue(new Error('API is down'));
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(<AgentDashboardClient />);
    
    await waitFor(() => {
      expect(screen.queryByText('Loading dashboard...')).not.toBeInTheDocument();
    });

    expect(consoleErrorSpy).toHaveBeenCalledWith('Failed to fetch data:', expect.any(Error));
    consoleErrorSpy.mockRestore();
  });
}); 