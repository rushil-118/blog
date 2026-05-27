import { render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './ProtectedRoute';
import { AuthProvider } from '../../context/authContext';

jest.mock('../../services/authApi', () => ({
    login: jest.fn(),
    register: jest.fn(),
    me: jest.fn()
}));

const renderProtected = () => render(
    <MemoryRouter initialEntries={['/dashboard']}>
        <AuthProvider>
            <Routes>
                <Route path="/login" element={<div>Login page</div>} />
                <Route path="/dashboard" element={<ProtectedRoute><div>Dashboard page</div></ProtectedRoute>} />
            </Routes>
        </AuthProvider>
    </MemoryRouter>
);

describe('ProtectedRoute', () => {
    beforeEach(() => localStorage.clear());

    test('redirects unauthenticated users to login', () => {
        renderProtected();

        expect(screen.getByText(/login page/i)).toBeInTheDocument();
        expect(screen.queryByText(/dashboard page/i)).not.toBeInTheDocument();
    });
});
