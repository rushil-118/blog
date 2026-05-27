import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import HomePage from './HomePage';
import postsApi from '../../services/postsApi';

jest.mock('../../services/postsApi', () => ({
  listPosts: jest.fn()
}));

const mockPosts = [
  {
    id: '1',
    slug: 'react-patterns',
    title: 'React Patterns',
    excerpt: 'Practical component advice.',
    author: { name: 'Ada Lovelace' },
    tags: ['react', 'ui'],
    reactions: { likes: 4, dislikes: 1 },
    comments: [{ id: 'c1' }],
    createdAt: '2024-01-01T00:00:00.000Z'
  },
  {
    id: '2',
    slug: 'api-design',
    title: 'API Design',
    body: 'Backend details',
    author: { username: 'grace' },
    tags: ['api'],
    reactions: { likes: 2, dislikes: 0 },
    commentCount: 3
  }
];

const renderHome = () => render(<MemoryRouter><HomePage /></MemoryRouter>);

describe('HomePage workflows', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    postsApi.listPosts.mockResolvedValue({ posts: mockPosts, total: 2, totalPages: 1 });
  });

  test('renders landing content and mocked post cards', async() => {
    renderHome();

    expect(screen.getByRole('heading', { name: /discover thoughtful stories/i })).toBeInTheDocument();
    expect(await screen.findByText('React Patterns')).toBeInTheDocument();
    expect(screen.getByText('Practical component advice.')).toBeInTheDocument();
    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument();
    expect(screen.getAllByText('api').length).toBeGreaterThan(0);
  });

  test('submits search and applies a tag filter', async() => {
    renderHome();
    await screen.findByText('React Patterns');

    userEvent.type(screen.getByRole('searchbox', { name: /search posts/i }), 'react');
    userEvent.click(screen.getByRole('button', { name: /search/i }));

    await waitFor(() => expect(postsApi.listPosts).toHaveBeenCalledWith(expect.objectContaining({ q: 'react' })));

    userEvent.click(screen.getByRole('button', { name: 'react' }));
    await waitFor(() => expect(postsApi.listPosts).toHaveBeenCalledWith(expect.objectContaining({ q: 'react', tag: 'react' })));
  });
});
