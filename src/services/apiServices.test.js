import authApi from './authApi';
import postsApi from './postsApi';
import commentsApi from './commentsApi';
import api from '../api/axios';

jest.mock('../api/axios', () => ({
    get: jest.fn(),
    post: jest.fn(),
    patch: jest.fn(),
    delete: jest.fn()
}));

describe('API services request shape', () => {
    beforeEach(() => jest.clearAllMocks());

    test('authApi.login posts credentials to the backend auth endpoint', async() => {
        api.post.mockResolvedValue({ data: { token: 'token', user: { username: 'ada' } } });

        await expect(authApi.login({ username: 'ada', password: 'password123' })).resolves.toEqual({ token: 'token', user: { username: 'ada' } });

        expect(api.post).toHaveBeenCalledWith('/auth/login', { username: 'ada', password: 'password123' });
    });

    test('authApi.register posts account details to the backend register endpoint', async() => {
        const details = { name: 'Ada Lovelace', username: 'ada', email: 'ada@example.com', password: 'password123' };
        api.post.mockResolvedValue({ data: { token: 'token', user: { username: 'ada' } } });

        await expect(authApi.register(details)).resolves.toEqual({ token: 'token', user: { username: 'ada' } });

        expect(api.post).toHaveBeenCalledWith('/auth/register', details);
    });

    test('postsApi forms list, detail, mutation, and reaction requests', async() => {
        api.get.mockResolvedValue({ data: { posts: [] } });
        api.post.mockResolvedValue({ data: { post: { id: 'post-1' }, reactions: { likes: 1, dislikes: 0 } } });
        api.patch.mockResolvedValue({ data: { post: { id: 'post-1' } } });
        api.delete.mockResolvedValue({ data: { message: 'Post deleted' } });

        await postsApi.listPosts({ q: 'react', page: 2 });
        await postsApi.getPost('hello-world');
        await postsApi.createPost({ title: 'Hello', body: 'World' });
        await postsApi.updatePost('post-1', { title: 'Updated' });
        await postsApi.reactToPost('post-1', 'like');
        await postsApi.deletePost('post-1');

        expect(api.get).toHaveBeenNthCalledWith(1, '/posts', { params: { q: 'react', page: 2 } });
        expect(api.get).toHaveBeenNthCalledWith(2, '/posts/hello-world');
        expect(api.post).toHaveBeenNthCalledWith(1, '/posts', { title: 'Hello', body: 'World' });
        expect(api.patch).toHaveBeenCalledWith('/posts/post-1', { title: 'Updated' });
        expect(api.post).toHaveBeenNthCalledWith(2, '/posts/post-1/reactions', { type: 'like' });
        expect(api.delete).toHaveBeenCalledWith('/posts/post-1');
    });

    test('commentsApi forms comment list, create, and delete requests', async() => {
        api.get.mockResolvedValue({ data: { comments: [] } });
        api.post.mockResolvedValue({ data: { comment: { body: 'Nice' } } });
        api.delete.mockResolvedValue({ data: { message: 'Comment deleted' } });

        await commentsApi.listComments('post-1');
        await commentsApi.createComment('post-1', 'Nice post');
        await commentsApi.deleteComment('comment-1');

        expect(api.get).toHaveBeenCalledWith('/posts/post-1/comments');
        expect(api.post).toHaveBeenCalledWith('/posts/post-1/comments', { body: 'Nice post' });
        expect(api.delete).toHaveBeenCalledWith('/comments/comment-1');
    });
});
