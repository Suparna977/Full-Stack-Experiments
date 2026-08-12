// Mock "database" of users.
// In a real system this would live in MongoDB (User model) — for this
// experiment we keep it in-memory and hash passwords with bcrypt so the
// experiment still demonstrates real password hashing + verification.

const bcrypt = require('bcryptjs');

// Plaintext demo passwords (documented here ONLY for the lab experiment).
// Real systems must never store or log plaintext passwords like this.
const DEMO_CREDENTIALS = {
  admin: 'Admin@123',
  editor: 'Editor@123',
  viewer: 'Viewer@123',
};

const users = [
  {
    id: 1,
    username: 'admin',
    passwordHash: bcrypt.hashSync(DEMO_CREDENTIALS.admin, 10),
    role: 'admin',
    name: 'Aisha Khan',
  },
  {
    id: 2,
    username: 'editor',
    passwordHash: bcrypt.hashSync(DEMO_CREDENTIALS.editor, 10),
    role: 'editor',
    name: 'Rohan Mehta',
  },
  {
    id: 3,
    username: 'viewer',
    passwordHash: bcrypt.hashSync(DEMO_CREDENTIALS.viewer, 10),
    role: 'viewer',
    name: 'Priya Sharma',
  },
];

function findUserByUsername(username) {
  return users.find((u) => u.username === username);
}

module.exports = { users, findUserByUsername, DEMO_CREDENTIALS };
