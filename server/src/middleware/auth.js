import jwt from 'jsonwebtoken';
import User from '../models/User.js';

/**
 * Protect middleware:
 * Intercepts incoming requests, parses Authorization Bearer header,
 * cryptographically verifies JWT, and attaches user to req.user.
 */
export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Extract token from Bearer <token>
      token = req.headers.authorization.split(' ')[1];

      // Cryptographically verify token
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET || 'educore_super_secret_jwt_key_2026'
      );

      // Fetch user from DB and attach to req (excluding password)
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Not authorized: User no longer exists',
        });
      }

      next();
    } catch (error) {
      console.error('JWT Verification Error:', error.message);
      return res.status(401).json({
        success: false,
        message: 'Not authorized: Invalid or expired token',
        error: error.name === 'TokenExpiredError' ? 'TokenExpired' : 'InvalidToken',
      });
    }
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Not authorized: No Bearer token provided in headers',
    });
  }
};

/**
 * Optional Role-Based Access Control (RBAC) middleware
 */
export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role '${req.user.role}' is not authorized to access this route`,
      });
    }
    next();
  };
};
