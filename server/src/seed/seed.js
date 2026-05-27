const bcrypt = require('bcryptjs');
const { connectDB, disconnectDB } = require('../config/db');
const User = require('../models/User');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const { createUniqueSlug } = require('../utils/slug');

const demoPassword = 'password123';

const posts = [
  {
    title: 'Building a Calm Morning Routine',
    excerpt: 'Small habits that make mornings feel easier and more productive.',
    body: 'A calm morning routine starts the night before. Pick one priority, prepare your space, and protect the first quiet minutes of the day.',
    tags: ['life', 'productivity'],
  },
  {
    title: 'A Practical Guide to React State',
    excerpt: 'When to keep state local, lift it up, or move it into context.',
    body: 'React state is easiest to maintain when it lives close to where it is used. Lift it only when multiple components truly need to coordinate.',
    tags: ['react', 'javascript'],
  },
  {
    title: 'Why Persistence Changes Blog Apps',
    excerpt: 'Moving from mock APIs to MongoDB-backed workflows.',
    body: 'Persistence turns a demo into a product. Users can return, posts keep history, and comments become conversations instead of temporary UI state.',
    tags: ['mongodb', 'backend'],
  },
  {
    title: 'Designing Better Search Experiences',
    excerpt: 'Search should be forgiving, fast, and obvious.',
    body: 'Great search experiences support partial terms, useful empty states, and filters that help readers narrow a large archive quickly.',
    tags: ['ux', 'search'],
  },
  {
    title: 'Notes from a Weekend Hike',
    excerpt: 'What a mountain trail teaches about focus.',
    body: 'The trail rewards steady movement. Software projects do too: choose the next step, keep the feedback loop short, and enjoy the view.',
    tags: ['travel', 'life'],
  },
  {
    title: 'Securing JSON APIs with JWT',
    excerpt: 'A concise introduction to protected Express routes.',
    body: 'JWT authentication works well for JSON APIs when tokens are signed with a strong secret, sent as bearer tokens, and validated on protected routes.',
    tags: ['express', 'security'],
  },
];

const seed = async () => {
  await connectDB();

  await Promise.all([Comment.deleteMany({}), Post.deleteMany({}), User.deleteMany({})]);

  const passwordHash = await bcrypt.hash(demoPassword, 10);
  const [admin, reader] = await User.create([
    {
      name: 'Ada Admin',
      username: 'ada',
      email: 'ada@example.com',
      passwordHash,
      role: 'admin',
      bio: 'Editor of the demo blog.',
      avatar: 'https://i.pravatar.cc/120?img=47',
    },
    {
      name: 'Riley Reader',
      username: 'riley',
      email: 'riley@example.com',
      passwordHash,
      role: 'reader',
      bio: 'Curious reader and occasional writer.',
      avatar: 'https://i.pravatar.cc/120?img=12',
    },
  ]);

  const createdPosts = [];
  for (const [index, post] of posts.entries()) {
    // eslint-disable-next-line no-await-in-loop
    const created = await Post.create({
      ...post,
      slug: await createUniqueSlug(post.title),
      author: index % 2 === 0 ? admin._id : reader._id,
      likedBy: index % 2 === 0 ? [reader._id] : [admin._id],
      dislikedBy: index === 3 ? [admin._id] : [],
    });
    createdPosts.push(created);
  }

  await Comment.create([
    { post: createdPosts[0]._id, author: reader._id, body: 'This made my morning easier already.' },
    { post: createdPosts[1]._id, author: admin._id, body: 'Keeping state close to usage is such a good rule.' },
    { post: createdPosts[2]._id, author: reader._id, body: 'Persistence makes demos feel real.' },
    { post: createdPosts[5]._id, author: admin._id, body: 'Bearer token examples are helpful.' },
  ]);

  // eslint-disable-next-line no-console
  console.log('Seed data created. Demo login credentials:');
  // eslint-disable-next-line no-console
  console.log(`Admin:  username=ada    email=ada@example.com    password=${demoPassword}`);
  // eslint-disable-next-line no-console
  console.log(`Reader: username=riley  email=riley@example.com  password=${demoPassword}`);

  await disconnectDB();
};

seed().catch(async (error) => {
  // eslint-disable-next-line no-console
  console.error('Seed failed:', error);
  await disconnectDB();
  process.exit(1);
});
