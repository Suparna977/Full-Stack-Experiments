// Mock "user database" — simulates what would normally live in a backend
// database table. Passwords are still hashed with bcrypt (bcryptjs works
// fine in the browser, it's pure JS) so the experiment still demonstrates
// real password hashing instead of storing/comparing plain text.
//
// Demo credentials (documented here only for this lab experiment):
//   admin  / Admin@123
//   editor / Editor@123
//   viewer / Viewer@123

import bcrypt from 'bcryptjs';

const DEMO_CREDENTIALS = {
  admin: 'Admin@123',
  editor: 'Editor@123',
  viewer: 'Viewer@123',
};

export const users = [
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

export function findUserByUsername(username) {
  return users.find((u) => u.username === username);
}

export { DEMO_CREDENTIALS };
