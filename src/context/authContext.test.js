import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuthContext, AUTH_TOKEN_KEY, AUTH_USER_KEY } from './authContext';
import authApi from '../services/authApi';

jest.mock('../services/authApi', () => ({
    login: jest.fn(),
    register: jest.fn(),
    me: jest.fn()
}));

const AuthConsumer = () => {
    const { user, token, isAuthenticated, login, register, logout } = useAuthContext();

    return (
        <div>
            <span data-testid="username">{user?.username || 'none'}</span>
            <span data-testid="token">{token || 'none'}</span>
            <span data-testid="authenticated">{String(isAuthenticated)}</span>
            <button onClick={() => login({ username: 'ada', password: 'password123' })}>login</button>
            <button onClick={() => register({ name: 'Ada', username: 'ada', email: 'ada@example.com', password: 'password123' })}>register</button>
            <button onClick={logout}>logout</button>
        </div>
    );
}

describe('AuthProvider persistence', () => {
    beforeEach(() => {
        localStorage.clear();
        jest.clearAllMocks();
    });

    test('initializes from localStorage', () => {
        localStorage.setItem(AUTH_TOKEN_KEY, 'stored-token');
        localStorage.setItem(AUTH_USER_KEY, JSON.stringify({ id: '1', username: 'ada' }));

        render(<AuthProvider><AuthConsumer /></AuthProvider>);

        expect(screen.getByTestId('username')).toHaveTextContent('ada');
        expect(screen.getByTestId('token')).toHaveTextContent('stored-token');
        expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
    });

    test('persists login response and removes it on logout', async() => {
        authApi.login.mockResolvedValue({ token: 'new-token', user: { id: '1', username: 'ada' } });

        render(<AuthProvider><AuthConsumer /></AuthProvider>);
        userEvent.click(screen.getByRole('button', { name: /login/i }));

        await waitFor(() => expect(localStorage.getItem(AUTH_TOKEN_KEY)).toBe('new-token'));
        expect(JSON.parse(localStorage.getItem(AUTH_USER_KEY))).toEqual({ id: '1', username: 'ada' });
        expect(screen.getByTestId('authenticated')).toHaveTextContent('true');

        userEvent.click(screen.getByRole('button', { name: /logout/i }));
        expect(localStorage.getItem(AUTH_TOKEN_KEY)).toBeNull();
        expect(localStorage.getItem(AUTH_USER_KEY)).toBeNull();
        expect(screen.getByTestId('authenticated')).toHaveTextContent('false');
    });

    test('persists register response', async() => {
        authApi.register.mockResolvedValue({ token: 'register-token', user: { id: '2', username: 'grace' } });

        render(<AuthProvider><AuthConsumer /></AuthProvider>);
        userEvent.click(screen.getByRole('button', { name: /register/i }));

        await waitFor(() => expect(localStorage.getItem(AUTH_TOKEN_KEY)).toBe('register-token'));
        expect(JSON.parse(localStorage.getItem(AUTH_USER_KEY))).toEqual({ id: '2', username: 'grace' });
        expect(screen.getByTestId('username')).toHaveTextContent('grace');
        expect(screen.getByTestId('authenticated')).toHaveTextContent('true');
    });
});
