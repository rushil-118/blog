import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import LoginPage from './LoginPage';
import { AuthProvider, AUTH_TOKEN_KEY, AUTH_USER_KEY } from '../../context/authContext';
import authApi from '../../services/authApi';

jest.mock('../../services/authApi', () => ({
    login: jest.fn(),
    register: jest.fn(),
    me: jest.fn()
}));

const renderLogin = () => render(
    <MemoryRouter>
        <AuthProvider>
            <LoginPage />
        </AuthProvider>
    </MemoryRouter>
);

describe('LoginPage', () => {
    beforeEach(() => {
        localStorage.clear();
        jest.clearAllMocks();
    });

    test('submits username and password, stores auth data, and renders success', async() => {
        authApi.login.mockResolvedValue({ token: 'token-123', user: { id: '1', username: 'ada' } });
        renderLogin();

        userEvent.type(screen.getByLabelText(/username/i), 'ada');
        userEvent.type(screen.getByLabelText(/password/i), 'password123');
        userEvent.click(screen.getByRole('button', { name: /login/i }));

        await waitFor(() => expect(authApi.login).toHaveBeenCalledWith({ username: 'ada', password: 'password123' }));
        expect(await screen.findByRole('status')).toHaveTextContent(/login successful/i);
        expect(localStorage.getItem(AUTH_TOKEN_KEY)).toBe('token-123');
        expect(JSON.parse(localStorage.getItem(AUTH_USER_KEY))).toEqual({ id: '1', username: 'ada' });
    });

    test('renders an error message when login fails', async() => {
        authApi.login.mockRejectedValue({ response: { data: { message: 'Invalid credentials' } } });
        renderLogin();

        userEvent.type(screen.getByLabelText(/username/i), 'ada');
        userEvent.type(screen.getByLabelText(/password/i), 'wrong-password');
        userEvent.click(screen.getByRole('button', { name: /login/i }));

        expect(await screen.findByRole('alert')).toHaveTextContent('Invalid credentials');
        expect(localStorage.getItem(AUTH_TOKEN_KEY)).toBeNull();
    });
});
