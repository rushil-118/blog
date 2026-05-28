import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import SingleBlogPage from './SingleBlogPage';
import Comment from '../../components/Comment/Comment';
import { AuthProvider, AUTH_TOKEN_KEY, AUTH_USER_KEY } from '../../context/authContext';
import postsApi from '../../services/postsApi';
import commentsApi from '../../services/commentsApi';

jest.mock('../../services/postsApi', () => ({
  getPost: jest.fn(),
  reactToPost: jest.fn(),
  deletePost: jest.fn()
}));

jest.mock('../../services/commentsApi', () => ({
  listComments: jest.fn(),
  createComment: jest.fn()
}));

jest.mock('../../services/authApi', () => ({
  login: jest.fn(),
  register: jest.fn(),
  me: jest.fn()
}));

const renderDetail = () => render(
  <MemoryRouter initialEntries={["/blog/react-patterns"]}>
    <AuthProvider>
      <Routes>
        <Route path="/blog/:idOrSlug" element={<SingleBlogPage />} />
        <Route path="/dashboard" element={<div>Dashboard route</div>} />
      </Routes>
    </AuthProvider>
  </MemoryRouter>
);

describe('SingleBlogPage workflows', () => {
  beforeEach(() => {
    localStorage.clear();
    localStorage.setItem(AUTH_TOKEN_KEY, 'token');
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify({ id: 'u1', username: 'ada' }));
    jest.clearAllMocks();
    postsApi.getPost.mockResolvedValue({
      post: {
        id: 'p1',
        slug: 'react-patterns',
        title: 'React Patterns',
        excerpt: 'A concise summary',
        body: 'Full post body',
        tags: ['react'],
        author: { id: 'u1', name: 'Ada Lovelace', username: 'ada' },
        reactions: { likes: 2, dislikes: 1 }
      },
      comments: [{ id: 'c1', body: 'Great read', author: { username: 'grace' } }]
    });
    postsApi.reactToPost.mockResolvedValue({ reactions: { likes: 3, dislikes: 1 } });
    commentsApi.createComment.mockResolvedValue({ comment: { id: 'c2', body: 'Thanks!' } });
    commentsApi.listComments.mockResolvedValue({ comments: [{ id: 'c2', body: 'Thanks!', author: { username: 'ada' } }] });
  });

  test('renders full post, author actions, reactions, and comment form', async() => {
    renderDetail();

    expect((await screen.findAllByRole('heading', { name: 'React Patterns' })).length).toBeGreaterThan(0);
    expect(screen.getByText('Full post body')).toBeInTheDocument();
    expect(screen.getByText('Edit post')).toBeInTheDocument();
    expect(screen.getByText('Great read')).toBeInTheDocument();

    userEvent.click(screen.getByRole('button', { name: 'Like' }));
    await waitFor(() => expect(postsApi.reactToPost).toHaveBeenCalledWith('p1', 'like'));

    userEvent.type(screen.getByLabelText(/add a comment/i), 'Thanks!');
    userEvent.click(screen.getByRole('button', { name: /post comment/i }));
    await waitFor(() => expect(commentsApi.createComment).toHaveBeenCalledWith('p1', 'Thanks!'));
    expect(await screen.findByText('Thanks!')).toBeInTheDocument();
  });

  test('shows delete failures without navigating away', async() => {
    postsApi.deletePost.mockRejectedValue({ response: { data: { message: 'Token expired' } } });
    renderDetail();

    expect(await screen.findByText('Edit post')).toBeInTheDocument();
    userEvent.click(screen.getByRole('button', { name: /delete post/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Token expired');
    expect(screen.getByText('Full post body')).toBeInTheDocument();
  });

  test('renders author and comment avatars only when provided', async() => {
    postsApi.getPost.mockResolvedValueOnce({
      post: {
        id: 'p1',
        slug: 'avatar-post',
        title: 'Avatar Post',
        body: 'Body',
        author: { id: 'u1', name: 'Ada Lovelace', username: 'ada', avatar: 'https://example.com/ada.jpg' },
        reactions: { likes: 0, dislikes: 0 }
      },
      comments: [{ id: 'c1', body: 'Comment with avatar', author: { username: 'grace', avatar: 'https://example.com/grace.jpg' } }]
    });

    renderDetail();

    expect(await screen.findByRole('img', { name: 'Ada Lovelace' })).toHaveAttribute('src', 'https://example.com/ada.jpg');
    expect(screen.getByRole('img', { name: 'grace' })).toHaveAttribute('src', 'https://example.com/grace.jpg');

    const { container } = render(<Comment comment={{ id: 'c2', body: 'No avatar', author: { username: 'no-photo' } }} />);
    expect(container.querySelector('img')).toBeNull();
  });
});
