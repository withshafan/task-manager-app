const express = require('express');
const router = express.Router();
const Task = require('./taskModel');
const User = require('./User');
const Notification = require('./Notification');    // NEW
const auth = require('./auth');
const { body, validationResult } = require('express-validator');

// Helper to get Socket.IO instance from app
function getIO(req) {
  return req.app.get('io');
}

// Helper: check access to task
async function hasAccess(task, userId) {
  if (!task) return false;
  if (task.owner.toString() === userId.toString()) return true;
  return task.sharedWith.some(id => id.toString() === userId.toString());
}

// Helper: send real‑time notification and save to DB
async function notifyUser(userId, type, message, taskId, io) {
  // Save to database
  const notification = new Notification({
    userId,
    type,
    message,
    taskId
  });
  await notification.save();
  // Emit via Socket.IO to the user's room
  io.to(`user_${userId}`).emit('notification', notification);
}

// ========== GET all tasks (own + shared) ==========
router.get('/', auth, async (req, res) => {
  try {
    const tasks = await Task.find({
      $or: [
        { owner: req.userId },
        { sharedWith: { $in: [req.userId] } }
      ]
    }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ========== GET tasks shared with me (exclude own) ==========
router.get('/shared', auth, async (req, res) => {
  try {
    const tasks = await Task.find({
      sharedWith: { $in: [req.userId] },
      owner: { $ne: req.userId }
    }).sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ========== GET single task ==========
router.get('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    if (!(await hasAccess(task, req.userId))) {
      return res.status(403).json({ message: 'Access denied' });
    }
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ========== CREATE task ==========
router.post('/', auth, [
  body('title').notEmpty().withMessage('Title required'),
  body('description').notEmpty().withMessage('Description required'),
  body('dueDate').isISO8601().withMessage('Valid due date required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const task = new Task({
    owner: req.userId,
    title: req.body.title,
    description: req.body.description,
    status: req.body.status || 'Pending',
    dueDate: req.body.dueDate
  });
  try {
    const newTask = await task.save();
    res.status(201).json(newTask);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// ========== UPDATE task (with notification on status change) ==========
router.put('/:id', auth, [
  body('title').optional().notEmpty(),
  body('description').optional().notEmpty(),
  body('dueDate').optional().isISO8601(),
  body('status').optional().isIn(['Pending', 'In Progress', 'Completed'])
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    if (!(await hasAccess(task, req.userId))) {
      return res.status(403).json({ message: 'Access denied' });
    }
    const oldStatus = task.status;
    task.title = req.body.title || task.title;
    task.description = req.body.description || task.description;
    task.status = req.body.status || task.status;
    task.dueDate = req.body.dueDate || task.dueDate;
    const updatedTask = await task.save();

    // If status changed, notify all users with access (owner + sharedWith)
    if (req.body.status && req.body.status !== oldStatus) {
      const io = getIO(req);
      const affectedUserIds = [task.owner, ...task.sharedWith].filter(
        id => id.toString() !== req.userId.toString()
      );
      const message = `Task "${task.title}" status changed from ${oldStatus} to ${task.status}`;
      for (const userId of affectedUserIds) {
        await notifyUser(userId, 'task_status_updated', message, task._id, io);
      }
    }
    res.json(updatedTask);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// ========== DELETE task ==========
router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    if (task.owner.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: 'Only owner can delete' });
    }
    await task.deleteOne();
    res.json({ message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// ========== SHARE task with another user (owner only) ==========
router.put('/:id/share', auth, [
  body('username').notEmpty().withMessage('Username to share with is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    if (task.owner.toString() !== req.userId.toString()) {
      return res.status(403).json({ message: 'Only the owner can share this task' });
    }
    const userToShare = await User.findOne({ username: req.body.username });
    if (!userToShare) return res.status(404).json({ message: 'User not found' });
    if (task.sharedWith.includes(userToShare._id)) {
      return res.status(400).json({ message: 'Task already shared with this user' });
    }
    task.sharedWith.push(userToShare._id);
    await task.save();

    // Send notification to the user who received the shared task
    const io = getIO(req);
    const message = `Task "${task.title}" has been shared with you by ${req.userId}`;
    await notifyUser(userToShare._id, 'task_shared', message, task._id, io);

    res.json({ message: `Task shared with ${userToShare.username}`, task });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;