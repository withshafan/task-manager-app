const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const taskRoutes = require('./taskRoutes');
const authRoutes = require('./authRoutes');
const notificationRoutes = require('./notificationRoutes');
const analyticsRoutes = require('./analyticsRoutes');
const uploadRoutes = require('./uploadRoutes');

const app = express();
const server = http.createServer(app);

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));
app.set('io', io);

// Database connection
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB connected'))
  .catch((err) => console.log('MongoDB connection error:', err));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/tasks', taskRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/tasks', uploadRoutes);

// Socket.IO
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  socket.on('register', (userId) => {
    socket.join(`user_${userId}`);
    console.log(`User ${userId} joined room user_${userId}`);
  });
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

const PORT = process.env.BACKEND_PORT || 3000;
server.listen(PORT, 'localhost', () => {
  console.log(`Server running on port ${PORT}`);
});
