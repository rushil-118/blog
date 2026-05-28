import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import RegisterPage from './RegisterPage';
import { AuthProvider, AUTH_TOKEN_KEY, AUTH_USER_KEY } from '../../context/authContext';
import authApi from '../../services/authApi';

const mockNavigate = jest.fn();

jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockNavigate
}));

jest.mock('../../services/authApi', () => ({
    login: jest.fn(),
    register: jest.fn(),
    me: jest.fn()
}));

const renderRegister = () => render(
    <MemoryRouter>
        <AuthProvider>
            <RegisterPage />
        </AuthProvider>
    </MemoryRouter>
);

describe('RegisterPage', () => {
    beforeEach(() => {
        localStorage.clear();
        jest.clearAllMocks();
    });

    test('submits account details, stores auth data, and navigates to dashboard', async() => {
        authApi.register.mockResolvedValue({ token: 'register-token', user: { id: '2', username: 'grace' } });
        renderRegister();

        userEvent.type(screen.getByLabelText(/^name$/i), 'Grace Hopper');
        userEvent.type(screen.getByLabelText(/username/i), 'grace');
        userEvent.type(screen.getByLabelText(/email/i), 'grace@example.com');
        userEvent.type(screen.getByLabelText(/photo url/i), 'https://example.com/grace.jpg');
        userEvent.type(screen.getByLabelText(/password/i), 'password123');
        userEvent.click(screen.getByRole('button', { name: /register/i }));

        await waitFor(() => expect(authApi.register).toHaveBeenCalledWith({
            name: 'Grace Hopper',
            username: 'grace',
            email: 'grace@example.com',
            avatar: 'https://example.com/grace.jpg',
            password: 'password123'
        }));
        await waitFor(() => expect(localStorage.getItem(AUTH_TOKEN_KEY)).toBe('register-token'));
        expect(JSON.parse(localStorage.getItem(AUTH_USER_KEY))).toEqual({ id: '2', username: 'grace' });
        expect(mockNavigate).toHaveBeenCalledWith('/dashboard');
    });

    test('renders an error message when registration fails', async() => {
        authApi.register.mockRejectedValue({ response: { data: { message: 'Username already exists' } } });
        renderRegister();

        userEvent.type(screen.getByLabelText(/username/i), 'grace');
        userEvent.type(screen.getByLabelText(/email/i), 'grace@example.com');
        userEvent.type(screen.getByLabelText(/password/i), 'password123');
        userEvent.click(screen.getByRole('button', { name: /register/i }));

        expect(await screen.findByRole('alert')).toHaveTextContent('Username already exists');
        expect(localStorage.getItem(AUTH_TOKEN_KEY)).toBeNull();
        expect(mockNavigate).not.toHaveBeenCalled();
    });
});
