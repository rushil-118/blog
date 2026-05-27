process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-secret';
process.env.JWT_EXPIRES_IN = '1h';
process.env.CLIENT_ORIGIN = 'http://localhost:3000';

global.crypto = require('crypto').webcrypto;

const request = require('supertest');
const { MongoMemoryServer } = require('mongodb-memory-server');
const app = require('../src/app');
const { connectDB, disconnectDB } = require('../src/config/db');
const User = require('../src/models/User');
const Post = require('../src/models/Post');
const Comment = require('../src/models/Comment');

jest.setTimeout(120000);

let mongoServer;

const registerUser = async (overrides = {}) => {
  const payload = {
    name: 'Test User',
    username: `user${Math.random().toString(36).slice(2, 8)}`,
    email: `user${Math.random().toString(36).slice(2, 8)}@example.com`,
    password: 'password123',
    ...overrides,
  };

  const response = await request(app).post('/api/auth/register').send(payload).expect(201);
  return { ...response.body, password: payload.password, credentials: payload };
};

const authHeader = (token) => ({ Authorization: `Bearer ${token}` });

const createPost = async (token, overrides = {}) => {
  const payload = {
    title: `Post ${Math.random().toString(36).slice(2, 8)}`,
    body: 'This post body includes searchable backend content.',
    tags: ['backend', 'testing'],
    ...overrides,
  };

  const response = await request(app).post('/api/posts').set(authHeader(token)).send(payload).expect(201);
  return response.body.post;
};

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await connectDB(mongoServer.getUri());
});

afterEach(async () => {
  await Promise.all([Comment.deleteMany({}), Post.deleteMany({}), User.deleteMany({})]);
});

afterAll(async () => {
  await disconnectDB();
  await mongoServer.stop();
});

describe('health', () => {
  it('returns ok', async () => {
    const response = await request(app).get('/api/health').expect(200);
    expect(response.body).toEqual({ status: 'ok' });
  });
});

describe('auth', () => {
  it('registers a user and returns a token without passwordHash', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Ada Lovelace', username: 'ada', email: 'ada@example.com', password: 'password123' })
      .expect(201);

    expect(response.body.token).toBeTruthy();
    expect(response.body.user).toMatchObject({ username: 'ada', email: 'ada@example.com', name: 'Ada Lovelace' });
    expect(response.body.user.passwordHash).toBeUndefined();
  });

  it('rejects duplicate username or email registration', async () => {
    await registerUser({ username: 'duplicate', email: 'dupe@example.com' });

    const response = await request(app)
      .post('/api/auth/register')
      .send({ username: 'duplicate', email: 'other@example.com', password: 'password123' })
      .expect(409);

    expect(response.body.message).toMatch(/already exists/i);
  });

  it('logs in with username or email and rejects bad credentials', async () => {
    await registerUser({ username: 'loginuser', email: 'login@example.com', password: 'password123' });

    const success = await request(app)
      .post('/api/auth/login')
      .send({ username: 'login@example.com', password: 'password123' })
      .expect(200);

    expect(success.body.token).toBeTruthy();
    expect(success.body.user.username).toBe('loginuser');

    await request(app)
      .post('/api/auth/login')
      .send({ username: 'loginuser', password: 'wrong-password' })
      .expect(401);
  });

  it('returns the authenticated current user', async () => {
    const { token } = await registerUser({ username: 'currentuser' });

    const response = await request(app).get('/api/auth/me').set(authHeader(token)).expect(200);

    expect(response.body.user.username).toBe('currentuser');
  });
});

describe('environment configuration', () => {
  const originalEnv = process.env;

  afterEach(() => {
    process.env = originalEnv;
  });

  it('rejects the development JWT secret in production', () => {
    jest.isolateModules(() => {
      process.env = { ...originalEnv, NODE_ENV: 'production', JWT_SECRET: 'change-me-in-development' };

      expect(() => require('../src/config/env')).toThrow(/JWT_SECRET must be set/i);
    });
  });

  it('rejects short JWT secrets in production', () => {
    jest.isolateModules(() => {
      process.env = { ...originalEnv, NODE_ENV: 'production', JWT_SECRET: 'too-short' };

      expect(() => require('../src/config/env')).toThrow(/JWT_SECRET must be set/i);
    });
  });
});

describe('posts', () => {
  it('protects write endpoints from unauthenticated requests', async () => {
    const { token } = await registerUser();
    const post = await createPost(token);

    await request(app).post('/api/posts').send({ title: 'Nope', body: 'No token' }).expect(401);
    await request(app).patch(`/api/posts/${post.id}`).send({ title: 'Nope' }).expect(401);
    await request(app).delete(`/api/posts/${post.id}`).expect(401);
    await request(app).post(`/api/posts/${post.id}/comments`).send({ body: 'No token' }).expect(401);
    await request(app).post(`/api/posts/${post.id}/reactions`).send({ type: 'like' }).expect(401);
  });

  it('creates, updates, fetches, and deletes an authenticated user post', async () => {
    const { token } = await registerUser({ username: 'author' });

    const created = await createPost(token, {
      title: 'Original Title',
      body: 'Original body text',
      tags: ['node', 'api'],
    });

    expect(created.slug).toBe('original-title');
    expect(created.author.username).toBe('author');

    const updated = await request(app)
      .patch(`/api/posts/${created.id}`)
      .set(authHeader(token))
      .send({ title: 'Updated Title', body: 'Updated body text', tags: 'node, express' })
      .expect(200);

    expect(updated.body.post.slug).toBe('updated-title');
    expect(updated.body.post.tags).toEqual(['node', 'express']);

    const detail = await request(app).get(`/api/posts/${updated.body.post.slug}`).expect(200);
    expect(detail.body.post.title).toBe('Updated Title');
    expect(detail.body.post.comments).toEqual([]);

    await request(app).delete(`/api/posts/${created.id}`).set(authHeader(token)).expect(200);
    await request(app).get(`/api/posts/${created.id}`).expect(404);
  });

  it('lists posts with search and pagination newest first', async () => {
    const { token } = await registerUser({ username: 'pager' });
    await createPost(token, { title: 'Alpha Mongo Tips', body: 'Database article', tags: ['mongodb'] });
    await createPost(token, { title: 'Beta React Tips', body: 'Frontend article', tags: ['react'] });
    await createPost(token, { title: 'Gamma Express Tips', body: 'Backend article', tags: ['express'] });

    const page = await request(app).get('/api/posts?page=1&limit=2').expect(200);
    expect(page.body.posts).toHaveLength(2);
    expect(page.body.total).toBe(3);
    expect(page.body.totalPages).toBe(2);
    expect(new Date(page.body.posts[0].createdAt).getTime()).toBeGreaterThanOrEqual(
      new Date(page.body.posts[1].createdAt).getTime()
    );

    const search = await request(app).get('/api/posts?q=Mongo&limit=10').expect(200);
    expect(search.body.total).toBe(1);
    expect(search.body.posts[0].title).toBe('Alpha Mongo Tips');

    const tag = await request(app).get('/api/posts?tag=react').expect(200);
    expect(tag.body.total).toBe(1);
    expect(tag.body.posts[0].tags).toContain('react');
  });

  it('prevents non-authors from updating or deleting posts', async () => {
    const author = await registerUser({ username: 'owner' });
    const intruder = await registerUser({ username: 'intruder' });
    const post = await createPost(author.token);

    await request(app)
      .patch(`/api/posts/${post.id}`)
      .set(authHeader(intruder.token))
      .send({ title: 'Stolen' })
      .expect(403);

    await request(app).delete(`/api/posts/${post.id}`).set(authHeader(intruder.token)).expect(403);
  });
});

describe('comments and reactions', () => {
  it('creates, lists, and authorizes deletion of comments', async () => {
    const author = await registerUser({ username: 'postauthor' });
    const commenter = await registerUser({ username: 'commenter' });
    const other = await registerUser({ username: 'otheruser' });
    const post = await createPost(author.token);

    const created = await request(app)
      .post(`/api/posts/${post.id}/comments`)
      .set(authHeader(commenter.token))
      .send({ body: 'A thoughtful comment' })
      .expect(201);

    expect(created.body.comment.author.username).toBe('commenter');

    const list = await request(app).get(`/api/posts/${post.id}/comments`).expect(200);
    expect(list.body.comments).toHaveLength(1);
    expect(list.body.comments[0].body).toBe('A thoughtful comment');

    await request(app).delete(`/api/comments/${created.body.comment.id}`).set(authHeader(other.token)).expect(403);
    await request(app).delete(`/api/comments/${created.body.comment.id}`).set(authHeader(author.token)).expect(200);

    const afterDelete = await request(app).get(`/api/posts/${post.id}/comments`).expect(200);
    expect(afterDelete.body.comments).toHaveLength(0);
  });

  it('supports one reaction per user and clear reactions', async () => {
    const author = await registerUser({ username: 'reactionauthor' });
    const reader = await registerUser({ username: 'reactionreader' });
    const post = await createPost(author.token);

    const like = await request(app)
      .post(`/api/posts/${post.id}/reactions`)
      .set(authHeader(reader.token))
      .send({ type: 'like' })
      .expect(200);
    expect(like.body.reactions).toEqual({ likes: 1, dislikes: 0 });

    const dislike = await request(app)
      .post(`/api/posts/${post.id}/reactions`)
      .set(authHeader(reader.token))
      .send({ type: 'dislike' })
      .expect(200);
    expect(dislike.body.reactions).toEqual({ likes: 0, dislikes: 1 });

    const clear = await request(app)
      .post(`/api/posts/${post.id}/reactions`)
      .set(authHeader(reader.token))
      .send({ type: 'clear' })
      .expect(200);
    expect(clear.body.reactions).toEqual({ likes: 0, dislikes: 0 });
  });

  it('keeps concurrent same-user reactions idempotent', async () => {
    const author = await registerUser({ username: 'concurrentauthor' });
    const reader = await registerUser({ username: 'concurrentreader' });
    const post = await createPost(author.token);

    await Promise.all(
      Array.from({ length: 8 }, () =>
        request(app).post(`/api/posts/${post.id}/reactions`).set(authHeader(reader.token)).send({ type: 'like' }).expect(200)
      )
    );

    const detail = await request(app).get(`/api/posts/${post.id}`).expect(200);
    expect(detail.body.post.reactions).toEqual({ likes: 1, dislikes: 0 });
  });
});
