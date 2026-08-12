const express = require('express');
const { verifyToken, authorize } = require('../middleware/auth');
const { getAllPosts, getPostById, createPost, updatePost, deletePost } = require('../data/posts');

const router = express.Router();

// Every route below requires a valid JWT.
router.use(verifyToken);

// GET /api/posts — Admin, Editor, Viewer can all view
router.get('/', authorize('admin', 'editor', 'viewer'), (req, res) => {
  res.json({ posts: getAllPosts() });
});

// GET /api/posts/:id — Admin, Editor, Viewer can all view a single post
router.get('/:id', authorize('admin', 'editor', 'viewer'), (req, res) => {
  const post = getPostById(req.params.id);
  if (!post) return res.status(404).json({ message: 'Post not found.' });
  res.json({ post });
});

// POST /api/posts — Admin ONLY can create
router.post('/', authorize('admin'), (req, res) => {
  const { title, content } = req.body;
  if (!title || !content) {
    return res.status(400).json({ message: 'Title and content are required.' });
  }
  const post = createPost({ title, content, author: req.user.username });
  res.status(201).json({ message: 'Post created.', post });
});

// PUT /api/posts/:id — Admin and Editor can update
router.put('/:id', authorize('admin', 'editor'), (req, res) => {
  const { title, content } = req.body;
  const updated = updatePost(req.params.id, { title, content });
  if (!updated) return res.status(404).json({ message: 'Post not found.' });
  res.json({ message: 'Post updated.', post: updated });
});

// DELETE /api/posts/:id — Admin ONLY can delete
router.delete('/:id', authorize('admin'), (req, res) => {
  const success = deletePost(req.params.id);
  if (!success) return res.status(404).json({ message: 'Post not found.' });
  res.json({ message: 'Post deleted.' });
});

module.exports = router;
