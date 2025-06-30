import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import AgentDashboard from '@/pages/AgentDashboard';
import { useApi } from 'hooks/useApi';
import { MemoryRouter } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import * as fetchStateModule from 'hooks/useFetchState';

jest.mock('hooks/useApi');
jest.mock('@/context/AuthContext', () => ({
  ...jest.requireActual('@/context/AuthContext'),
  useAuth: jest.fn(),
}));

const mockUseApi = useApi as jest.Mock;
const mockUseAuth = useAuth as jest.Mock;

const mockAgentProperties = [
    {
        id: "1",
        title: "Agent Property",
        address: "456 Oak",
        price: 600000,
        bedrooms: 4,
        bathrooms: 3,
        status: "active"
    }
];

const fetchStateMock = (overrides = {}) => ({
  data: [],
  setData: jest.fn(),
  isLoading: false,
  setLoading: jest.fn(),
  error: null,
  setError: jest.fn(),
  handle: jest.fn(),
  clear: jest.fn(),
  ...overrides
});

describe('AgentDashboard', () => {
  let useFetchStateSpy: jest.SpyInstance;

  beforeEach(() => {
    jest.resetAllMocks();
    mockUseApi.mockReturnValue({
        request: jest.fn().mockResolvedValue({ data: mockAgentProperties })
    });
    mockUseAuth.mockReturnValue({
      user: { name: 'Test User' },
      logout: jest.fn(),
    });
  });

  afterEach(() => {
    if (useFetchStateSpy) useFetchStateSpy.mockRestore();
  });

  const renderComponent = () => 
    render(
      <MemoryRouter>
        <AuthProvider>
          <AgentDashboard />
        </AuthProvider>
      </MemoryRouter>
    );

  it('displays fetched agent listings', async () => {
    useFetchStateSpy = jest.spyOn(fetchStateModule, 'useFetchState').mockReturnValue(fetchStateMock({
      data: mockAgentProperties
    }));
    renderComponent();
    await waitFor(() => {
        expect(screen.queryByText('🔄 Loading your listings...')).not.toBeInTheDocument();
    });
    expect(await screen.findByText("Agent Property")).toBeInTheDocument();
    expect(screen.getByText("456 Oak")).toBeInTheDocument();
  });

  it('opens the confirm modal when delete is clicked', async () => {
    useFetchStateSpy = jest.spyOn(fetchStateModule, 'useFetchState').mockReturnValue(fetchStateMock({
      data: mockAgentProperties
    }));
    renderComponent();
    await waitFor(() => {
        expect(screen.queryByText('🔄 Loading your listings...')).not.toBeInTheDocument();
    });
    const deleteButton = await screen.findByText("Delete");
    fireEvent.click(deleteButton);
    expect(screen.getByText('Are you sure you want to delete "Agent Property"?')).toBeInTheDocument();
  });

  it('shows an error message if fetching listings fails', async () => {
    useFetchStateSpy = jest.spyOn(fetchStateModule, 'useFetchState').mockReturnValue(fetchStateMock({
      data: [],
      error: 'Failed to fetch'
    }));
    mockUseApi.mockReturnValue({
      request: jest.fn().mockRejectedValue(new Error('Failed to fetch'))
    });
    renderComponent();
    await waitFor(() => {
      expect(screen.getByText(/Failed to fetch/i)).toBeInTheDocument();
    });
  });

  it('cancels the delete modal', async () => {
    useFetchStateSpy = jest.spyOn(fetchStateModule, 'useFetchState').mockReturnValue(fetchStateMock({
      data: mockAgentProperties
    }));
    renderComponent();
    await waitFor(() => {
        expect(screen.queryByText('🔄 Loading your listings...')).not.toBeInTheDocument();
    });
    fireEvent.click(await screen.findByText("Delete"));
    const cancel = screen.getByText("Cancel");
    fireEvent.click(cancel);
    await waitFor(() =>
      expect(screen.queryByText(/Are you sure you want to delete/)).not.toBeInTheDocument()
    );
  });

  it('renders dashboard with no user', () => {
    mockUseAuth.mockReturnValue({ user: null, logout: jest.fn() });
    useFetchStateSpy = jest.spyOn(fetchStateModule, 'useFetchState').mockReturnValue(fetchStateMock());
    render(<AgentDashboard />);
    expect(screen.getByText('Agent Dashboard')).toBeInTheDocument();
  });

  it('renders dashboard with empty properties', () => {
    useFetchStateSpy = jest.spyOn(fetchStateModule, 'useFetchState').mockReturnValue(fetchStateMock());
    render(<AgentDashboard />);
    expect(screen.getByText((content) => content.includes('no listings'))).toBeInTheDocument();
  });
});
