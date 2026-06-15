import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import mongoose from 'mongoose';
import env from './config/env.js';
import { loggerMiddleware } from './middlewares/logger.middleware.js';
import { errorMiddleware, notFoundMiddleware } from './middlewares/error.middleware.js';
import authRoutes from './routes/auth.routes.js';
import profileRoutes from './routes/profile.routes.js';
import resumeRoutes from './routes/resume.routes.js';
import analysisRoutes from './routes/analysis.routes.js';
import recommendationRoutes from './routes/recommendation.routes.js';

const app = express();
const allowedOriginPrefixes = [
  env.clientUrl,
  'http://localhost:',
  'http://127.0.0.1:',
  'http://[::1]:',
];

app.use(helmet());
app.use(
  cors({
    origin(origin, callback) {
      if (!origin) return callback(null, true);
      if (allowedOriginPrefixes.some((prefix) => origin.startsWith(prefix))) {
        return callback(null, true);
      }
      console.warn(`CORS blocked for origin: ${origin}`);
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(loggerMiddleware);

app.get('/', (_req, res) =>
  res.json({
    success: true,
    message: 'Smart Internship Analyzer API is running',
    health: '/health',
    apiBase: '/api',
  })
);
app.get('/health', (_req, res) =>
  res.json({
    success: true,
    message: 'OK',
    mongoState: mongoose.connection.readyState,
  })
);
app.use('/api/auth', authRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/recommendations', recommendationRoutes);
app.use(notFoundMiddleware);
app.use(errorMiddleware);

export default app;
