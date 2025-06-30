import React from 'react';
import { render, screen, fireEvent, within, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import PropertyListingsClient from '../PropertyListingsClient';

// Mock child components to keep the test lightweight
jest.mock('../PropertyCard', () => ({
  __esModule: true,
  default: ({ property, onContactAgent }) => (
    <div data-testid="mock-property-card">
      <span>{property.title || property.name}</span>
      <button onClick={() => onContactAgent({ id: property.id, title: property.title || property.name, address: '123 Main' })}>
        Contact
      </button>
    </div>
  ),
}));

jest.mock('../InquiryForm', () => ({
  __esModule: true,
  default: ({ propertyTitle, onSuccess }) => (
    <div data-testid="mock-inquiry-form">
      <h2>Inquiry for {propertyTitle}</h2>
      <button onClick={onSuccess}>Send</button>
    </div>
  ),
}));

jest.mock('../Modal', () => ({
  __esModule: true,
  default: ({ isOpen, children }) => (isOpen ? <div data-testid="mock-modal">{children}</div> : null),
}));

const mockProperties = [
  {
    id: '1',
    title: 'A House',
    streetAddress1: '1 Main St',
    city: 'Townsville',
    state: 'TX',
    price: 200000,
    bedrooms: 3,
  },
  {
    id: '2',
    title: 'B Cabin',
    streetAddress1: '2 Forest Rd',
    city: 'Woodland',
    state: 'CO',
    price: 800000,
    bedrooms: 4,
  },
  {
    id: '3',
    title: 'C Condo',
    streetAddress1: '3 Ocean Dr',
    city: 'Beach City',
    state: 'CA',
    price: 500000,
    bedrooms: 2,
  },
];

describe('PropertyListingsClient', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders cards initially and switches to table view', () => {
    render(<PropertyListingsClient initialProperties={mockProperties} />);

    // Card view should render all PropertyCard mocks
    expect(screen.getAllByTestId('mock-property-card')).toHaveLength(3);

    fireEvent.click(screen.getByRole('button', { name: 'Table View' }));

    // Headers visible in table view
    expect(screen.getByText('Address')).toBeInTheDocument();
  });

  it('sorts properties by title in table view', async () => {
    render(<PropertyListingsClient initialProperties={mockProperties} />);
    fireEvent.click(screen.getByRole('button', { name: 'Table View' }));

    const titleHeader = screen.getByText(/Title/);
    // First click -> asc (A, B, C)
    fireEvent.click(titleHeader);
    let rows = screen.getAllByRole('row');
    expect(rows[1]).toHaveTextContent('A House');
    expect(rows[2]).toHaveTextContent('B Cabin');

    // Second click -> desc (C, B, A)
    fireEvent.click(titleHeader);
    rows = screen.getAllByRole('row');
    expect(rows[1]).toHaveTextContent('C Condo');
    expect(rows[3]).toHaveTextContent('A House');
  });

  it('filters properties by minimum price', () => {
    render(<PropertyListingsClient initialProperties={mockProperties} />);

    const minPriceSelect = screen.getByLabelText('Min Price');

    fireEvent.change(minPriceSelect, { target: { value: '700000' } });

    // Only B Cabin (800k) should remain visible
    expect(screen.getByText('B Cabin')).toBeInTheDocument();
    expect(screen.queryByText('A House')).not.toBeInTheDocument();
    expect(screen.queryByText('C Condo')).not.toBeInTheDocument();
  });

  it('opens and closes the inquiry modal', async () => {
    render(<PropertyListingsClient initialProperties={mockProperties} />);
    fireEvent.click(screen.getAllByTestId('mock-property-card')[0].querySelector('button'));

    expect(screen.getByTestId('mock-modal')).toBeInTheDocument();
    expect(screen.getByTestId('mock-inquiry-form')).toBeInTheDocument();

    // Close via InquiryForm success
    fireEvent.click(screen.getByText('Send'));
    await waitFor(() => {
      expect(screen.queryByTestId('mock-modal')).not.toBeInTheDocument();
    });
  });
}); 