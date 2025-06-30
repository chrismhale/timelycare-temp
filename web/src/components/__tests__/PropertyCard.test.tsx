import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import PropertyCard from '../PropertyCard';

const mockProperty = {
  id: 'prop123',
  title: 'Beautiful Beach House',
  streetAddress1: '123 Ocean Ave',
  city: 'Malibu',
  state: 'CA',
  zipcode: '90265',
  price: 2500000,
  bedrooms: 4,
  bathrooms: 3,
  imageUrl: 'https://example.com/beach-house.jpg',
  description: 'A stunning house right on the beach.',
  status: 'active' as 'active' | 'pending' | 'sold',
};

describe('PropertyCard component', () => {
  it('renders all property details correctly', () => {
    render(<PropertyCard property={mockProperty} />);
    
    expect(screen.getByText('Beautiful Beach House')).toBeInTheDocument();
    expect(screen.getByText('123 Ocean Ave, Malibu, CA, 90265')).toBeInTheDocument();
    expect(screen.getByText('$2,500,000')).toBeInTheDocument();
    expect(screen.getByText('4 bed')).toBeInTheDocument();
    expect(screen.getByText('3 bath')).toBeInTheDocument();
  });

  it('renders the property image with correct alt text', () => {
    render(<PropertyCard property={mockProperty} />);
    const image = screen.getByRole('img');
    expect(image).toHaveAttribute('src', mockProperty.imageUrl);
    expect(image).toHaveAttribute('alt', `Image of ${mockProperty.title}`);
  });

  it('links to the correct property details page', () => {
    render(<PropertyCard property={mockProperty} />);
    const link = screen.getByRole('link', { name: /view details/i });
    expect(link).toHaveAttribute('href', `/property/${mockProperty.id}`);
  });

  it('calls onContactAgent when "Contact Agent" button is clicked', () => {
    const handleContact = jest.fn();
    render(<PropertyCard property={mockProperty} onContactAgent={handleContact} />);
    
    const contactButton = screen.getByRole('button', { name: /contact agent/i });
    fireEvent.click(contactButton);
    
    expect(handleContact).toHaveBeenCalledTimes(1);
    expect(handleContact).toHaveBeenCalledWith({
      id: mockProperty.id,
      title: mockProperty.title,
      address: '123 Ocean Ave, Malibu, CA, 90265',
    });
  });

  it('renders edit and delete buttons when handlers are provided', () => {
    const handleEdit = jest.fn();
    const handleDelete = jest.fn();
    render(<PropertyCard property={mockProperty} onEdit={handleEdit} onDelete={handleDelete} />);
    
    expect(screen.getByRole('button', { name: /edit/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /delete/i })).toBeInTheDocument();
  });
}); 