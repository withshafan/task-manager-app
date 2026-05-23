const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const { Server } = require('socket.io');
const http = require('http');
require('dotenv').config();

const taskRoutes = require('./taskRoutes');
const authRoutes = require('./authRoutes');
const notificationRoutes = require('./notificationRoutes');
const analyticsRoutes = require('./analyticsRoutes');
const uploadRoutes = require('./uploadRoutes');

const app = express();
const server = http.createServer(app);

// CORS for Vercel frontend
app.use(cors({
  origin: process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:5173',
  credentials: true
}));

app.use(express.json());
app.use('/uploads', express.static('uploads'));

// Socket.IO – not supported on Vercel serverless, but will keep code for local dev
const io = new Server(server, { cors: { origin: "*" } });
app.set('io', io);

// Connect to MongoDB (cached for serverless)
let cachedDb = null;
async function connectToDb() {
  if (cachedDb) return cachedDb;
  await mongoose.connect(process.env.MONGO_URI);
  cachedDb = mongoose.connection;
  console.log('MongoDB connected');
  return cachedDb;
}

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/tasks', uploadRoutes);

// For serverless, export the app; also keep a local server for development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 5000;
  server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

// For Vercel, we export the Express app (without listening)
module.exports = app;