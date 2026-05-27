import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import DashboardPage from './DashboardPage';
import { AuthProvider, AUTH_TOKEN_KEY, AUTH_USER_KEY } from '../../context/authContext';
import postsApi from '../../services/postsApi';

jest.mock('../../services/postsApi', () => ({
  listPosts: jest.fn(),
  deletePost: jest.fn()
}));

jest.mock('../../services/authApi', () => ({
  login: jest.fn(),
  register: jest.fn(),
  me: jest.fn()
}));

const renderDashboard = () => render(
  <MemoryRouter>
    <AuthProvider>
      <DashboardPage />
    </AuthProvider>
  </MemoryRouter>
);

describe('DashboardPage workflows', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem(AUTH_TOKEN_KEY, 'token');
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify({ id: 'u1', name: 'Ada' }));
    jest.clearAllMocks();
    postsApi.listPosts.mockResolvedValue({ posts: [
      { id: 'p1', slug: 'first-post', title: 'First Post', excerpt: 'One', tags: ['react'] },
      { id: 'p2', slug: 'second-post', title: 'Second Post', excerpt: 'Two', tags: ['api'] }
    ] });
    postsApi.deletePost.mockResolvedValue({});
  });

  test('shows author posts with create, edit, and delete actions', async() => {
    renderDashboard();

    expect(await screen.findByText('First Post')).toBeInTheDocument();
    expect(postsApi.listPosts).toHaveBeenCalledWith({ author: 'u1', limit: 50 });
    expect(screen.getByRole('link', { name: /create post/i })).toHaveAttribute('href', '/posts/new');
    expect(screen.getAllByRole('link', { name: /edit/i })[0]).toHaveAttribute('href', '/posts/p1/edit');

    userEvent.click(screen.getAllByRole('button', { name: /delete/i })[0]);
    await waitFor(() => expect(postsApi.deletePost).toHaveBeenCalledWith('p1'));
    await waitFor(() => expect(screen.queryByText('First Post')).not.toBeInTheDocument());
    expect(screen.getByText('Second Post')).toBeInTheDocument();
  });

  test('shows delete failures and keeps the post in place', async() => {
    postsApi.deletePost.mockRejectedValue({ response: { data: { message: 'Delete forbidden' } } });
    renderDashboard();

    expect(await screen.findByText('First Post')).toBeInTheDocument();
    userEvent.click(screen.getAllByRole('button', { name: /delete/i })[0]);

    expect(await screen.findByRole('alert')).toHaveTextContent('Delete forbidden');
    expect(screen.getByText('First Post')).toBeInTheDocument();
  });
});
