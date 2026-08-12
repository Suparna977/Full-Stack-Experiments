const jwt = require('jsonwebtoken');

const JWT_SECRET = process.env.JWT_SECRET;

// Verifies the JWT sent in the Authorization header (Bearer <token>).
// On success, attaches the decoded payload (id, username, role) to req.user.
function verifyToken(req, res, next) {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Access denied. No token provided.' });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded; // { id, username, role, iat, exp }
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Token expired. Please log in again.' });
    }
    return res.status(403).json({ message: 'Invalid token.' });
  }
}

// Factory: returns middleware that only allows the given roles through.
// Usage: authorize('admin'), authorize('admin', 'editor')
function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Not authenticated.' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. Role '${req.user.role}' is not permitted to perform this action.`,
      });
    }
    next();
  };
}

module.exports = { verifyToken, authorize };
