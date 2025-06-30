import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { InquiryForm } from '../InquiryForm';

// Mock the global fetch function
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({}),
  })
);

const mockProps = {
  propertyId: 'prop123',
  propertyTitle: 'Luxury Villa',
  propertyAddress: '123 Ocean Drive, Miami, FL',
  onSuccess: jest.fn(),
};

describe('InquiryForm component', () => {
  beforeEach(() => {
    // Clear mock history before each test
    (fetch as jest.Mock).mockClear();
    mockProps.onSuccess.mockClear();
  });

  it('renders the form with property details', () => {
    render(<InquiryForm {...mockProps} />);
    expect(screen.getByText('Contact an Agent')).toBeInTheDocument();
    // Use a custom text matcher to handle the split text
    expect(screen.getByText((content, element) => element.textContent === `Regarding: ${mockProps.propertyTitle}`)).toBeInTheDocument();
    expect(screen.getByText(mockProps.propertyAddress)).toBeInTheDocument();
  });

  it('submits the form data correctly and calls onSuccess', async () => {
    render(<InquiryForm {...mockProps} />);
    
    fireEvent.change(screen.getByPlaceholderText('Your Name'), { target: { value: 'Jane Doe' } });
    fireEvent.change(screen.getByPlaceholderText('Your Email'), { target: { value: 'jane@test.com' } });
    fireEvent.change(screen.getByPlaceholderText('Your Message'), { target: { value: 'This message is more than ten characters.' } });

    fireEvent.click(screen.getByRole('button', { name: /submit inquiry/i }));

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Jane Doe', email: 'jane@test.com', message: 'This message is more than ten characters.', propertyId: 'prop123' }),
      });
    });

    await waitFor(() => {
      expect(mockProps.onSuccess).toHaveBeenCalled();
    });
  });

  it('shows validation errors for invalid input', async () => {
    render(<InquiryForm {...mockProps} />);

    fireEvent.click(screen.getByRole('button', { name: /submit inquiry/i }));

    expect(await screen.findByText('Name is required.')).toBeInTheDocument();
    expect(await screen.findByText('Email is required.')).toBeInTheDocument();
    expect(await screen.findByText('Message is required.')).toBeInTheDocument();
    
    // Test more specific validations
    fireEvent.change(screen.getByPlaceholderText('Your Name'), { target: { value: 'J' } });
    fireEvent.change(screen.getByPlaceholderText('Your Email'), { target: { value: 'not-an-email' } });
    fireEvent.change(screen.getByPlaceholderText('Your Message'), { target: { value: 'short' } });

    fireEvent.click(screen.getByRole('button', { name: /submit inquiry/i }));

    expect(await screen.findByText('Name must be 2-50 letters.')).toBeInTheDocument();
    expect(await screen.findByText('Invalid email address.')).toBeInTheDocument();
    expect(await screen.findByText('Message must be at least 10 characters.')).toBeInTheDocument();
  });
}); 