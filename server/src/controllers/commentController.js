const Post = require('../models/Post');
const Comment = require('../models/Comment');
const { AppError, asyncHandler } = require('../middleware/error');
const { authorFields, normalizeString, sameId } = require('../utils/request');

const listComments = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    throw new AppError('Post not found', 404);
  }

  const comments = await Comment.find({ post: post._id })
    .populate('author', authorFields)
    .sort({ createdAt: -1 });

  res.json({ comments });
});

const createComment = asyncHandler(async (req, res) => {
  const post = await Post.findById(req.params.id);
  if (!post) {
    throw new AppError('Post not found', 404);
  }

  const body = normalizeString(req.body.body);
  if (!body) {
    throw new AppError('Comment body is required', 400);
  }

  const comment = await Comment.create({ post: post._id, author: req.user._id, body });
  await comment.populate('author', authorFields);

  res.status(201).json({ comment });
});

const deleteComment = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id).populate('post');
  if (!comment) {
    throw new AppError('Comment not found', 404);
  }

  const canDelete =
    req.user.role === 'admin' ||
    sameId(comment.author, req.user._id) ||
    (comment.post && sameId(comment.post.author, req.user._id));

  if (!canDelete) {
    throw new AppError('You are not allowed to delete this comment', 403);
  }

  await comment.deleteOne();
  res.json({ message: 'Comment deleted' });
});

module.exports = { listComments, createComment, deleteComment };
