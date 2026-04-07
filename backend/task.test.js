const request = require('supertest');
const express = require('express');
const mongoose = require('mongoose');
const taskRoutes = require('./taskRoutes');
const Task = require('./taskModel');

const app = express();
app.use(express.json());
app.use('/tasks', taskRoutes);

// Mock auth middleware to always set userId
jest.mock('./auth', () => (req, res, next) => {
  req.userId = 'mockUserId';
  next();
});

describe('Task API', () => {
  beforeAll(async () => {
    const url = `mongodb://127.0.0.1/taskmanager_test`;
    await mongoose.connect(url);
  });

  afterAll(async () => {
    await mongoose.connection.db.dropDatabase();
    await mongoose.connection.close();
  });

  it('should create a new task', async () => {
    const newTask = {
      title: 'Test Task',
      description: 'Test Description',
      status: 'Pending',
      dueDate: '2025-12-31'
    };
    const response = await request(app)
      .post('/tasks')
      .send(newTask)
      .expect(201);
    expect(response.body.title).toBe('Test Task');
  });
});