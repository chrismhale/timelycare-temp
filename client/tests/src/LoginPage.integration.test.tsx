import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import LoginPage from '@/pages/LoginPage';
import { useApi } from 'hooks/useApi';
import { MemoryRouter, useNavigate } from 'react-router-dom';
import { AuthProvider } from '@/context/AuthContext';

jest.mock('hooks/useApi');
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: jest.fn(),
}));

const mockUseApi = useApi as jest.Mock;

describe('LoginPage Integration', () => {
    let navigateFn: jest.Mock;

    beforeEach(() => {
        navigateFn = jest.fn();
        (useNavigate as jest.Mock).mockReturnValue(navigateFn);
        mockUseApi.mockImplementation(() => ({ request: jest.fn() }));
    });

    test('logs in with correct token and redirects', async () => {
        render(
            <MemoryRouter>
                <AuthProvider>
                    <LoginPage />
                </AuthProvider>
            </MemoryRouter>
        );

        fireEvent.change(screen.getByPlaceholderText(/Enter token/i), {
            target: { value: 'agent-token-123' },
        });
        fireEvent.click(screen.getByRole('button', { name: /login/i }));

        await waitFor(() => {
            expect(navigateFn).toHaveBeenCalledWith('/dashboard');
        });
    });

    test('shows error on wrong token', async () => {
        render(
            <MemoryRouter>
                <AuthProvider>
                    <LoginPage />
                </AuthProvider>
            </MemoryRouter>
        );

        fireEvent.change(screen.getByPlaceholderText(/Enter token/i), {
            target: { value: 'invalid-token' },
        });
        fireEvent.click(screen.getByRole('button', { name: /login/i }));

        expect(await screen.findByText(/invalid token/i)).toBeInTheDocument();
    });

    it('should show an error toast on failed login', async () => {
        const requestMock = jest.fn().mockRejectedValue(new Error('Invalid credentials'));
        mockUseApi.mockReturnValue({ request: requestMock });

        render(
            <MemoryRouter>
                <AuthProvider>
                    <LoginPage />
                </AuthProvider>
            </MemoryRouter>
        );

        fireEvent.change(screen.getByPlaceholderText('Enter token'), { target: { value: 'fail-token' } });
        fireEvent.click(screen.getByRole('button', { name: /login/i }));

        expect(await screen.findByText(/invalid token/i)).toBeInTheDocument();
    });

    it('renders error message on failed login', async () => {
        render(
            <MemoryRouter>
                <AuthProvider>
                    <LoginPage />
                </AuthProvider>
            </MemoryRouter>
        );
        fireEvent.change(screen.getByPlaceholderText('Enter token'), { target: { value: 'fail-token' } });
        fireEvent.click(screen.getByRole('button', { name: /login/i }));
        expect(await screen.findByText(/invalid token/i)).toBeInTheDocument();
    });
});