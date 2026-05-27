import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import PostEditorPage from './PostEditorPage';
import postsApi from '../../services/postsApi';

jest.mock('../../services/postsApi', () => ({
  getPost: jest.fn(),
  createPost: jest.fn(),
  updatePost: jest.fn()
}));

const renderCreateEditor = () => render(
  <MemoryRouter initialEntries={["/posts/new"]}>
    <Routes>
      <Route path="/posts/new" element={<PostEditorPage />} />
      <Route path="/blog/:slug" element={<div>Saved post page</div>} />
    </Routes>
  </MemoryRouter>
);

describe('PostEditorPage workflows', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    postsApi.createPost.mockResolvedValue({ post: { id: 'p1', slug: 'new-post', title: 'New Post' } });
  });

  test('validates title/body and submits a create payload', async() => {
    renderCreateEditor();

    userEvent.click(screen.getByRole('button', { name: /save post/i }));
    expect(await screen.findByRole('alert')).toHaveTextContent(/title and body are required/i);
    expect(postsApi.createPost).not.toHaveBeenCalled();

    userEvent.type(screen.getByLabelText(/title/i), 'New Post');
    userEvent.type(screen.getByLabelText(/excerpt/i), 'Short summary');
    userEvent.type(screen.getByLabelText(/cover image url/i), 'https://example.com/cover.jpg');
    userEvent.type(screen.getByLabelText(/tags/i), 'react, testing');
    userEvent.type(screen.getByLabelText(/body/i), 'This is the full post body.');
    userEvent.click(screen.getByRole('button', { name: /save post/i }));

    await waitFor(() => expect(postsApi.createPost).toHaveBeenCalledWith({
      title: 'New Post',
      excerpt: 'Short summary',
      coverImage: 'https://example.com/cover.jpg',
      tags: ['react', 'testing'],
      body: 'This is the full post body.'
    }));
    expect(await screen.findByText('Saved post page')).toBeInTheDocument();
  });
});
