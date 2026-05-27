const express = require('express');
const {
  listPosts,
  getPost,
  createPost,
  updatePost,
  deletePost,
  reactToPost,
} = require('../controllers/postController');
const { listComments, createComment } = require('../controllers/commentController');
const { authenticate } = require('../middleware/auth');

const router = express.Router();

router.get('/', listPosts);
router.post('/', authenticate, createPost);
router.get('/:id/comments', listComments);
router.post('/:id/comments', authenticate, createComment);
router.post('/:id/reactions', authenticate, reactToPost);
router.get('/:idOrSlug', getPost);
router.patch('/:id', authenticate, updatePost);
router.delete('/:id', authenticate, deletePost);

module.exports = router;
