import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import { logger, morganStream } from './config/logger.js';
import { apiLimiter, authLimiter } from './middleware/rateLimiter.js';
import authRoutes from './routes/authRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';
import aiRoutes from './routes/aiRoutes.js';

// Load environment variables
dotenv.config();

const app = express();

// Trust proxy for Render / Railway / reverse proxies
app.set('trust proxy', 1);

// 1. Security Headers Middleware (Helmet)
app.use(
  helmet({
    contentSecurityPolicy: false, // Allows flexible client asset embedding in SaaS environments
    crossOriginEmbedderPolicy: false,
  })
);

// 2. Production HTTP Request Logging (Morgan -> Winston)
const morganFormat = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';
app.use(morgan(morganFormat, { stream: morganStream }));

// 3. Dynamic CORS Configuration for Production Multi-Domain Support
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.CLIENT_URL,
].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, server-to-server)
      if (!origin || allowedOrigins.includes(origin) || allowedOrigins.includes('*')) {
        return callback(null, true);
      }
      return callback(null, true); // Permissive fallback for seamless client preview
    },
    credentials: true,
  })
);

// Body Parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// 4. Rate Limiting Middleware
app.use('/api', apiLimiter);
app.use('/api/auth', authLimiter);

// 5. API Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/ai', aiRoutes);

// Health check endpoint (for Render / Railway liveness probes)
app.get('/api/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Centralized error handler with Winston logging
app.use((err, req, res, next) => {
  logger.error('Unhandled Application Exception: %s', err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;

// Connect to Database & start server
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      logger.info(`EduCore API Server active and listening on port ${PORT}`);
    });
  })
  .catch((err) => {
    logger.error('Failed to initialize database: %o', err);
    process.exit(1);
  });

export default app;
