import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { BrowserRouter as Router } from 'react-router-dom';
import AgentDashboard from '@/pages/AgentDashboard';
import { useApi } from 'hooks/useApi';
import { useAuth, AuthProvider } from '@/context/AuthContext';
import { toast } from 'react-toastify';

jest.mock('hooks/useApi');
jest.mock('react-toastify');

// Mock the AuthContext
jest.mock('@/context/AuthContext', () => ({
  ...jest.requireActual('@/context/AuthContext'),
  useAuth: jest.fn(),
}));


const mockUseAuth = useAuth as jest.Mock;
const mockUseApi = useApi as jest.Mock;

const mockProperties = [{ 
  id: '1',
  name: 'Agent Property 1',
  address: '123 Main St',
  price: 500000,
  bedrooms: 3,
  bathrooms: 2,
  status: 'active'
}];

const renderComponent = () =>
  render(
    <Router>
        <AuthProvider>
            <AgentDashboard />
        </AuthProvider>
    </Router>
  );

describe('AgentDashboard', () => {
  let requestMock: jest.Mock;
  let logoutMock: jest.Mock;

  beforeEach(() => {
    jest.clearAllMocks();
    logoutMock = jest.fn();
    requestMock = jest.fn().mockResolvedValue({ data: mockProperties });
    
    mockUseAuth.mockReturnValue({
      user: { name: 'Test Agent' },
      token: 'fake-token',
      logout: logoutMock,
    });

    mockUseApi.mockReturnValue({
      request: requestMock,
    });
  });

  it('should render the dashboard and properties', async () => {
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText('Agent Property 1')).toBeInTheDocument();
    });
  });

  it('should call logout when the logout button is clicked', async () => {
    renderComponent();
    
    await waitFor(() => {
      expect(screen.getByRole('button', { name: /logout/i })).toBeInTheDocument();
    });

    const logoutButton = screen.getByRole('button', { name: /logout/i });
    fireEvent.click(logoutButton);

    expect(logoutMock).toHaveBeenCalledTimes(1);
  });

  it('should delete a property when delete is confirmed', async () => {
    requestMock
      .mockResolvedValueOnce({ data: mockProperties }) // initial fetch
      .mockResolvedValueOnce({}) // DELETE call
      .mockResolvedValueOnce({ data: [] }); // refetch after delete

    renderComponent();
    
    await waitFor(() => {
        expect(screen.getByText('Agent Property 1')).toBeInTheDocument();
    });

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => {
        expect(screen.getByText(/Are you sure you want to delete/i)).toBeInTheDocument();
    });
    
    const confirmButton = screen.getByRole('button', { name: /Confirm Delete/i });
    fireEvent.click(confirmButton);

    await waitFor(() => {
        expect(requestMock).toHaveBeenCalledWith('/properties/1', { method: 'DELETE' });
    });

    expect(screen.queryByText('Agent Property 1')).not.toBeInTheDocument();
  });

  it('should show an error if property deletion fails', async () => {
    requestMock.mockResolvedValueOnce({ data: mockProperties }).mockRejectedValueOnce(new Error('Deletion failed'));
    renderComponent();
    await waitFor(() => expect(screen.getByText('Agent Property 1')).toBeInTheDocument());

    const deleteButtons = screen.getAllByRole('button', { name: /delete/i });
    fireEvent.click(deleteButtons[0]);

    await waitFor(() => expect(screen.getByText(/Are you sure/i)).toBeInTheDocument());
    const confirmButton = screen.getByRole('button', { name: /Confirm Delete/i });
    fireEvent.click(confirmButton);

    await waitFor(() => {
      expect(requestMock).toHaveBeenCalledWith('/properties/1', { method: 'DELETE' });
    });

    // Property should still be there
    expect(screen.getByText('Agent Property 1')).toBeInTheDocument();
    expect(toast.error).toHaveBeenCalledWith('Failed to delete property.');
  });

  it('should open the listing form in edit mode when edit is clicked', async () => {
    renderComponent();
    await waitFor(() => expect(screen.getByText('Agent Property 1')).toBeInTheDocument());

    const editButtons = screen.getAllByRole('button', { name: /edit/i });
    fireEvent.click(editButtons[0]);

    await waitFor(() => {
      expect(screen.getByText('Edit Listing')).toBeInTheDocument();
    });

    expect(screen.getByDisplayValue('Agent Property 1')).toBeInTheDocument();
    expect(screen.getByDisplayValue('500000')).toBeInTheDocument();
  });
}); 