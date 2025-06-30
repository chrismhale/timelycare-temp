import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import InquiryForm from '@/components/InquiryForm';
import { useApi } from 'hooks/useApi';
import { toast } from 'react-toastify';

// Mock dependencies
jest.mock('hooks/useApi');
jest.mock('react-toastify');

const mockUseApi = useApi as jest.Mock;
const mockToast = toast as jest.Mocked<typeof toast>;

describe('InquiryForm', () => {
  let requestMock: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    requestMock = jest.fn();
    mockUseApi.mockReturnValue({
      request: requestMock,
    });
  });

  it('renders the inquiry form with a heading', () => {
    render(
      <Router>
        <InquiryForm propertyId="123" />
      </Router>
    );
    expect(screen.getByRole('heading', { name: /Submit an Inquiry/i })).toBeInTheDocument();
  });

  it('allows the user to fill out and submit the form successfully', async () => {
    requestMock.mockResolvedValue({ message: 'Success' });
    render(
      <Router>
        <InquiryForm propertyId="123" />
      </Router>
    );

    fireEvent.change(screen.getByPlaceholderText('Your Name'), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByPlaceholderText('Your Email'), { target: { value: 'john.doe@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Your Message'), { target: { value: 'I am very interested in this property.' } });
    fireEvent.click(screen.getByRole('button', { name: /submit inquiry/i }));

    await waitFor(() => {
      expect(requestMock).toHaveBeenCalledWith('/inquiries', {
        method: 'POST',
        body: JSON.stringify({
          name: 'John Doe',
          email: 'john.doe@example.com',
          message: 'I am very interested in this property.',
          propertyId: '123',
        }),
        errorMessage: "Failed to submit inquiry. Please try again."
      });
      expect(mockToast.success).toHaveBeenCalledWith('Inquiry submitted successfully!');
    });
  });

  it('shows an error toast if form submission fails', async () => {
    requestMock.mockRejectedValue(new Error('Network Error'));

    render(
      <Router>
        <InquiryForm propertyId="123" />
      </Router>
    );
    
    // Fill out the form to ensure submission handler is called
    fireEvent.change(screen.getByPlaceholderText('Your Name'), { target: { value: 'John Doe' } });
    fireEvent.change(screen.getByPlaceholderText('Your Email'), { target: { value: 'john.doe@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Your Message'), { target: { value: 'This is a test.' } });

    fireEvent.click(screen.getByRole('button', { name: /submit inquiry/i }));

    await waitFor(() => {
      expect(requestMock).toHaveBeenCalled();
    });
  });

  it('should call console.error on API failure', async () => {
    const error = new Error('Network Error');
    requestMock.mockRejectedValue(error);
    const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <Router>
        <InquiryForm propertyId="123" />
      </Router>
    );
    fireEvent.change(screen.getByPlaceholderText('Your Name'), { target: { value: 'Test' } });
    fireEvent.change(screen.getByPlaceholderText('Your Email'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Your Message'), { target: { value: 'Hello' } });
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));

    await waitFor(() => {
      expect(errorSpy).toHaveBeenCalledWith(error);
    });
    errorSpy.mockRestore();
  });

  it('shows error if propertyId is missing', () => {
    render(<InquiryForm />);
    fireEvent.change(screen.getByPlaceholderText('Your Name'), { target: { value: 'Test' } });
    fireEvent.change(screen.getByPlaceholderText('Your Email'), { target: { value: 'test@example.com' } });
    fireEvent.change(screen.getByPlaceholderText('Your Message'), { target: { value: 'Hello' } });
    fireEvent.click(screen.getByRole('button', { name: /submit/i }));
    expect(toast.error).toHaveBeenCalledWith('Property ID is missing.');
  });

  it('disables submit button when loading', () => {
    jest.spyOn(require('hooks/useApi'), 'useApi').mockReturnValue({ request: jest.fn(), isLoading: true });
    render(<InquiryForm propertyId="123" />);
    expect(screen.getByRole('button', { name: /submit/i })).toBeDisabled();
  });
}); 