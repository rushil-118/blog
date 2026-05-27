const mongoose = require('mongoose');
const Post = require('../models/Post');
const Comment = require('../models/Comment');
const User = require('../models/User');
const { AppError, asyncHandler } = require('../middleware/error');
const { createUniqueSlug } = require('../utils/slug');
const { authorFields, escapeRegex, isValidObjectId, normalizeString, normalizeTags, sameId } = require('../utils/request');

const findPostByIdOrSlug = (idOrSlug) => {
  const query = isValidObjectId(idOrSlug) ? { $or: [{ _id: idOrSlug }, { slug: idOrSlug }] } : { slug: idOrSlug };
  return Post.findOne(query).populate('author', authorFields);
};

const ensurePost = async (id) => {
  const post = await Post.findById(id);
  if (!post) {
    throw new AppError('Post not found', 404);
  }
  return post;
};

const ensureCanModifyPost = (post, user) => {
  if (user.role !== 'admin' && !sameId(post.author, user._id)) {
    throw new AppError('You are not allowed to modify this post', 403);
  }
};

const listPosts = asyncHandler(async (req, res) => {
  const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
  const limit = Math.min(Math.max(parseInt(req.query.limit, 10) || 10, 1), 50);
  const query = {};

  if (req.query.q) {
    const regex = new RegExp(escapeRegex(normalizeString(req.query.q)), 'i');
    query.$or = [{ title: regex }, { body: regex }, { tags: regex }];
  }

  if (req.query.tag) {
    query.tags = normalizeString(req.query.tag).toLowerCase();
  }

  if (req.query.author) {
    const author = normalizeString(req.query.author).toLowerCase();
    if (isValidObjectId(author)) {
      query.author = author;
    } else {
      const user = await User.findOne({ username: author });
      query.author = user ? user._id : new mongoose.Types.ObjectId();
    }
  }

  const [posts, total] = await Promise.all([
    Post.find(query)
      .populate('author', authorFields)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Post.countDocuments(query),
  ]);

  res.json({ posts, page, limit, total, totalPages: Math.ceil(total / limit) || 0 });
});

const getPost = asyncHandler(async (req, res) => {
  const post = await findPostByIdOrSlug(req.params.idOrSlug);
  if (!post) {
    throw new AppError('Post not found', 404);
  }

  const comments = await Comment.find({ post: post._id })
    .populate('author', authorFields)
    .sort({ createdAt: -1 })
    .limit(20);

  res.json({ post: { ...post.toJSON(), comments } });
});

const createPost = asyncHandler(async (req, res) => {
  const title = normalizeString(req.body.title);
  const body = normalizeString(req.body.body);

  if (!title || !body) {
    throw new AppError('Title and body are required', 400);
  }

  const post = await Post.create({
    title,
    body,
    excerpt: normalizeString(req.body.excerpt),
    coverImage: normalizeString(req.body.coverImage),
    tags: normalizeTags(req.body.tags),
    slug: await createUniqueSlug(title),
    author: req.user._id,
  });

  await post.populate('author', authorFields);
  res.status(201).json({ post });
});

const updatePost = asyncHandler(async (req, res) => {
  const post = await ensurePost(req.params.id);
  ensureCanModifyPost(post, req.user);

  if (Object.prototype.hasOwnProperty.call(req.body, 'title')) {
    const title = normalizeString(req.body.title);
    if (!title) throw new AppError('Title is required', 400);
    if (title !== post.title) {
      post.title = title;
      post.slug = await createUniqueSlug(title, post._id);
    }
  }

  if (Object.prototype.hasOwnProperty.call(req.body, 'body')) {
    const body = normalizeString(req.body.body);
    if (!body) throw new AppError('Body is required', 400);
    post.body = body;
  }

  ['excerpt', 'coverImage'].forEach((field) => {
    if (Object.prototype.hasOwnProperty.call(req.body, field)) {
      post[field] = normalizeString(req.body[field]);
    }
  });

  if (Object.prototype.hasOwnProperty.call(req.body, 'tags')) {
    post.tags = normalizeTags(req.body.tags);
  }

  await post.save();
  await post.populate('author', authorFields);
  res.json({ post });
});

const deletePost = asyncHandler(async (req, res) => {
  const post = await ensurePost(req.params.id);
  ensureCanModifyPost(post, req.user);

  await Comment.deleteMany({ post: post._id });
  await post.deleteOne();

  res.json({ message: 'Post deleted' });
});

const reactToPost = asyncHandler(async (req, res) => {
  const { type } = req.body;
  if (!['like', 'dislike', 'clear'].includes(type)) {
    throw new AppError('Reaction type must be like, dislike, or clear', 400);
  }

  const userId = new mongoose.Types.ObjectId(req.user._id);
  const update = [
    {
      $set: {
        likedBy: { $filter: { input: '$likedBy', as: 'id', cond: { $ne: ['$$id', userId] } } },
        dislikedBy: { $filter: { input: '$dislikedBy', as: 'id', cond: { $ne: ['$$id', userId] } } },
      },
    },
  ];

  if (type === 'like') update.push({ $set: { likedBy: { $setUnion: ['$likedBy', [userId]] } } });
  if (type === 'dislike') update.push({ $set: { dislikedBy: { $setUnion: ['$dislikedBy', [userId]] } } });

  const post = await Post.findByIdAndUpdate(req.params.id, update, { new: true });
  if (!post) {
    throw new AppError('Post not found', 404);
  }

  res.json({ reactions: { likes: post.likedBy.length, dislikes: post.dislikedBy.length } });
});

module.exports = { listPosts, getPost, createPost, updatePost, deletePost, reactToPost };
