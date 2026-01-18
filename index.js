import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

import { userRouter } from './src/routes/user.routes.js';
import { authRouter } from './src/routes/auth.routes.js';
import { bankRouter } from './src/routes/bank.routes.js';
import { addressRouter } from './src/routes/address.routes.js';
import { loanRouter } from './src/routes/loan.route.js';
import { transactionRouter } from './src/routes/transaction.router.js';
import { notificationRouter } from './src/routes/nofification.routes.js';
import { adminRouter } from './src/routes/admin.routes.js';

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



// ============================ Routes ============================ //
app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to Mudra Plus API',
    status: 'Server is running'
  });
});

//============================== Health check route ==============================//
app.get('/health', async (req, res) => {
  try {
    // Test database connection
    await prisma.$queryRaw`SELECT 1`;
    res.json({ 
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'unhealthy',
      database: 'disconnected',
      error: error.message 
    });
  }
});

//========================= Define routes ========================//
app.use('/api/v1/user', userRouter);
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/bank', bankRouter);
app.use('/api/v1/address', addressRouter);
app.use('/api/v1/loan', loanRouter);
app.use('/api/v1/transaction', transactionRouter);
app.use('/api/v1/notification', notificationRouter);
app.use('/api/v1/admin', adminRouter);


// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server is running on http://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
