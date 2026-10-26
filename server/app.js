import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import connectToDatabase from './db.js';
import foodRoutes from './routes/foodRoutes.js';
import orderRoutes from './routes/orderRoutes.js';
import authRoutes from './routes/authRoutes.js';
import chatRoutes from './routes/chatRoutes.js';
import profileRoutes from './routes/profileRoutes.js';

const app = express();
const allowedOrigins = (process.env.CLIENT_ORIGIN || 'http://localhost:5173')
  .split(',')
  .map(origin => origin.trim())
  .filter(Boolean);

app.use(helmet());
app.use(cors({
  origin(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('This origin is not allowed to access the FoodEase API.'));
  }
}));
app.use(express.json({ limit: '1mb' }));
app.use(async (_req, res, next) => {
  try {
    await connectToDatabase();
    return next();
  } catch (error) {
    console.error('MongoDB connection failed:', error.message);
    return res.status(503).json({ message: 'The FoodEase API could not connect to its database.' });
  }
});
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));
app.use('/api/foods', foodRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/profile', profileRoutes);
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Server error' });
});

export default app;
