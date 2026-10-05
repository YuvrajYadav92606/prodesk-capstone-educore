import express from 'express';
import { register, login, getMe } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = express.Router();

// Public routes with brute-force rate limiter
router.post('/register', authLimiter, register);
router.post('/login', authLimiter, login);

// Protected routes (Cryptographically verified by protect middleware)
router.get('/me', protect, getMe);

export default router;
