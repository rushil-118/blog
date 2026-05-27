# Full-Stack Blog Platform

A MERN-style blog application with a React/CRA client, Express API, MongoDB persistence, JWT authentication, post CRUD, comments, reactions, search, and a responsive UI.

## Prerequisites

- Node.js 18+ and npm
- Docker and Docker Compose for local MongoDB
- Git

## Tech Stack

- **Client:** React 18, Create React App, React Router, Context API, SCSS, Axios
- **Server:** Node.js, Express, Mongoose, JWT, bcrypt
- **Database:** MongoDB
- **Testing:** Jest, Supertest, React Testing Library, mongodb-memory-server

## Environment Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create a local environment file from the example:

   ```bash
   cp .env.example .env
   ```

3. Review the default variables:

   ```dotenv
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/fullstack_blog
   JWT_SECRET=change-me-in-development
   JWT_EXPIRES_IN=7d
   CLIENT_ORIGIN=http://localhost:3000
   REACT_APP_API_URL=http://localhost:5000/api
   ```

   `REACT_APP_API_URL` is used by the React client at build time and during development. If it is omitted, the client falls back to `http://localhost:5000/api`. The CRA development server is also configured with `proxy: http://localhost:5000` for same-origin `/api` development requests if you choose to set `REACT_APP_API_URL=/api`.

## MongoDB with Docker Compose

Start MongoDB locally:

```bash
docker compose up -d mongo
```

Stop MongoDB when finished:

```bash
docker compose down
```

To also remove the local MongoDB volume, run:

```bash
docker compose down -v
```

## Seed Demo Data

After MongoDB is running and `.env` is configured, seed demo users, posts, comments, and reactions:

```bash
npm run seed
```

Demo credentials created by the seed script:

| Role | Username | Email | Password |
| --- | --- | --- | --- |
| Admin | `ada` | `ada@example.com` | `password123` |
| Reader | `riley` | `riley@example.com` | `password123` |

## Run the App

Run the Express API and React client together:

```bash
npm run dev
```

- React client: <http://localhost:3000>
- Express API: <http://localhost:5000>
- Health check: <http://localhost:5000/api/health>

You can also run each process separately:

```bash
npm run server
npm run client
```

## Build

Create a production React build:

```bash
npm run build
```

For production deployments where the API is on another origin, set `REACT_APP_API_URL` before building, for example:

```bash
REACT_APP_API_URL=https://api.example.com/api npm run build
```

If the frontend and API are served from the same origin, set `REACT_APP_API_URL=/api` before building.

## Tests

Run all automated checks once:

```bash
npm test
```

Run server tests only:

```bash
npm run test:server
```

Run client tests once:

```bash
npm run test:client
```

The backend tests use `mongodb-memory-server`, so they do not require the local Docker MongoDB service.

## Implementation Verification Log

The full-stack reform was verified during implementation with these checks:

| Check | Result |
| --- | --- |
| `npm run test:server` | Passed: backend Jest/Supertest suite covered health, auth, protected writes, post CRUD, search/pagination, comments, and reactions. |
| `npm run test:client` | Passed: React Testing Library suites covered auth, API services, protected routes, home/search, post detail interactions, dashboard actions, registration, and editor submission. |
| `npm run build` | Passed: production React build completed successfully. |
| `npm test` | Passed: combined backend and client test command completed successfully. |
| Browser smoke test | Passed against local MongoDB after `docker compose up -d mongo`, `npm run seed`, and `npm run dev`: register, login, home/search, detail, create, edit, comment, like, dislike, and clear-reaction flows were exercised with no failed browser console messages. |

## API Route Summary

Base URL: `http://localhost:5000/api`

### Health

- `GET /health` — API health check.

### Authentication

- `POST /auth/register` — create an account. Body: `{ name, username, email, password }`.
- `POST /auth/login` — log in with username or email. Body: `{ username, password }`.
- `GET /auth/me` — return the current user. Requires `Authorization: Bearer <token>`.

### Posts

- `GET /posts?page=&limit=&q=&tag=&author=` — list posts with pagination, search, tag, and author filters.
- `GET /posts/:idOrSlug` — get one post by Mongo id or slug, including latest comments.
- `POST /posts` — create a post. Requires auth. Body: `{ title, body, excerpt, coverImage, tags }`.
- `PATCH /posts/:id` — update a post as the author or admin. Requires auth.
- `DELETE /posts/:id` — delete a post as the author or admin. Requires auth.
- `POST /posts/:id/reactions` — set a reaction. Requires auth. Body: `{ type: "like" | "dislike" | "clear" }`.

### Comments

- `GET /posts/:id/comments` — list comments for a post.
- `POST /posts/:id/comments` — add a comment. Requires auth. Body: `{ body }`.
- `DELETE /comments/:id` — delete a comment as the comment author, post author, or admin. Requires auth.

## Manual Smoke Test Checklist

With MongoDB running, seed data loaded, and `npm run dev` active, verify these flows in the browser:

1. Register a new account.
2. Log in with the new account or the seeded `ada` / `password123` account.
3. View the home page post list, search, tag filters, and pagination.
4. Open a post detail page.
5. Create a new post from the authenticated navigation.
6. Edit the created post from the detail page or dashboard.
7. Add a comment on a post.
8. Like, dislike, and clear a reaction on a post.
9. Confirm changed posts/comments/reactions persist after a refresh.

## Useful Scripts

| Command | Description |
| --- | --- |
| `npm install` | Install dependencies. |
| `npm run seed` | Seed local MongoDB with demo data. |
| `npm run dev` | Run API and client concurrently. |
| `npm run server` | Run the Express server with nodemon. |
| `npm run client` | Run the CRA development server. |
| `npm run test:server` | Run backend tests. |
| `npm run test:client` | Run frontend tests once. |
| `npm test` | Run backend and frontend tests once. |
| `npm run build` | Build the React client. |
