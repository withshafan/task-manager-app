const express = require('express');
const router = express.Router();
const Task = require('./taskModel');
const auth = require('./auth');
const { body, validationResult } = require('express-validator');

// GET all tasks (no userId filter for demo)
router.get('/', auth, async (req, res) => {
  try {
    const tasks = await Task.find().sort({ createdAt: -1 });
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// GET single task
router.get('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json(task);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// POST new task
router.post('/', auth, [
  body('title').notEmpty().withMessage('Title required'),
  body('description').notEmpty().withMessage('Description required'),
  body('dueDate').isISO8601().withMessage('Valid due date required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });
  const task = new Task({
    userId: req.userId,
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

// PUT update task
router.put('/:id', auth, [
  body('title').optional().notEmpty(),
  body('description').optional().notEmpty(),
  body('dueDate').optional().isISO8601(),
  body('status').optional().isIn(['Pending', 'In Progress', 'Completed'])
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    task.title = req.body.title || task.title;
    task.description = req.body.description || task.description;
    task.status = req.body.status || task.status;
    task.dueDate = req.body.dueDate || task.dueDate;
    const updatedTask = await task.save();
    res.json(updatedTask);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE task
router.delete('/:id', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    await task.deleteOne();
    res.json({ message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;