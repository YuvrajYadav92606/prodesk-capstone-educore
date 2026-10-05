import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import authRoutes from './routes/authRoutes.js';
import courseRoutes from './routes/courseRoutes.js';
import paymentRoutes from './routes/paymentRoutes.js';

// Load environment variables
dotenv.config();

const app = express();

// Middleware
app.use(cors({
  origin: '*', // Allow client connections
  credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/payment', paymentRoutes);

// Health check route
app.get('/api/health', (req, res) => {
  res.json({
    status: 'online',
    timestamp: new Date().toISOString(),
    service: 'EduCore LMS Auth Engine'
  });
});

// Centralized error handler
app.use((err, req, res, next) => {
  console.error('Unhandled Server Error:', err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

const PORT = process.env.PORT || 5000;

// Connect to Database & start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`[Server] EduCore Server running on port ${PORT}`);
  });
});

export default app;
