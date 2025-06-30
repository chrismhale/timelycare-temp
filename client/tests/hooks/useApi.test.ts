import { renderHook, act } from '@testing-library/react';
import { useApi } from 'hooks/useApi';
import { useAuth } from '@/context/AuthContext';
import { toast } from 'react-toastify';

jest.mock('@/context/AuthContext');
jest.mock('react-toastify');

const mockUseAuth = useAuth as jest.Mock;
const mockToast = toast as jest.Mocked<typeof toast>;

describe('useApi', () => {

    beforeEach(() => {
        jest.clearAllMocks();
        mockUseAuth.mockReturnValue({ token: 'test-token', logout: jest.fn() });
        
        globalThis.fetch = jest.fn(() =>
            Promise.resolve({
                ok: true,
                status: 200,
                text: () => Promise.resolve(JSON.stringify({ data: 'success' })),
            } as Response)
        );
    });

    it('makes a request with authorization header if token exists', async () => {
        const { result } = renderHook(() => useApi());

        await act(async () => {
            await result.current.request('/test-auth');
        });

        expect(fetch).toHaveBeenCalledWith(
            'http://localhost:5173/api/test-auth',
            expect.objectContaining({
                headers: expect.anything(),
            })
        );
    });

    it('makes a request without authorization header if token is null', async () => {
        mockUseAuth.mockReturnValue({ token: null, logout: jest.fn() });
        const { result } = renderHook(() => useApi());

        await act(async () => {
            await result.current.request('/test-no-auth');
        });

        const fetchCall = (fetch as jest.Mock).mock.calls[0];
        const headers = new Headers(fetchCall[1]?.headers);
        expect(headers.has('Authorization')).toBe(false);
    });

    it('shows a success toast message on successful request', async () => {
        const { result } = renderHook(() => useApi());

        await act(async () => {
            await result.current.request('/test-success', { successMessage: 'It worked!' });
        });

        expect(mockToast.success).toHaveBeenCalledWith('It worked!');
    });

    it('shows an error toast message on failed request', async () => {
        globalThis.fetch = jest.fn(() =>
            Promise.resolve({
                ok: false,
                status: 500,
                text: () => Promise.resolve(JSON.stringify({ message: 'Server Error' })),
            } as Response)
        );

        const { result } = renderHook(() => useApi());

        await act(async () => {
            await expect(result.current.request('/test-fail', { errorMessage: 'It failed!' })).rejects.toThrow('Server Error');
        });

        expect(mockToast.error).toHaveBeenCalledWith('It failed!');
    });
});
