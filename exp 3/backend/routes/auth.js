const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { findUserByUsername } = require('../data/users');
const { verifyToken } = require('../middleware/auth');

const router = express.Router();

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1h';

// POST /api/auth/login
// Body: { username, password }
router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Username and password are required.' });
  }

  const user = findUserByUsername(username);
  if (!user) {
    return res.status(401).json({ message: 'Invalid username or password.' });
  }

  const isMatch = await bcrypt.compare(password, user.passwordHash);
  if (!isMatch) {
    return res.status(401).json({ message: 'Invalid username or password.' });
  }

  // Payload kept minimal — never put sensitive data (like password hashes) in a JWT.
  const payload = { id: user.id, username: user.username, role: user.role, name: user.name };

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });

  res.json({
    message: 'Login successful',
    token,
    user: { id: user.id, username: user.username, role: user.role, name: user.name },
  });
});

// GET /api/auth/me — lets the frontend verify/re-fetch identity from an existing token
router.get('/me', verifyToken, (req, res) => {
  res.json({ user: req.user });
});

module.exports = router;
