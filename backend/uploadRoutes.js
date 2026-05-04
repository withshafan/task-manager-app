const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Task = require('./taskModel');
const auth = require('./auth');
const router = express.Router();

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

// POST /api/tasks/:id/upload – upload file for a specific task
router.post('/:id/upload', auth, upload.single('file'), async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    if (!req.file) return res.status(400).json({ message: 'No file uploaded' });

    const attachment = {
      filename: req.file.filename,
      originalName: req.file.originalname,
      filePath: `/uploads/${req.file.filename}`,
      uploadedAt: new Date()
    };
    task.attachments.push(attachment);
    await task.save();

    res.status(201).json({ message: 'File uploaded', attachment });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/tasks/:taskId/attachments/:attachmentId – remove attachment
router.delete('/:taskId/attachments/:attachmentId', auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.taskId);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    const attachment = task.attachments.id(req.params.attachmentId);
    if (!attachment) return res.status(404).json({ message: 'Attachment not found' });
    // Delete file from disk
    const filePath = path.join(__dirname, attachment.filePath);
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
    attachment.remove();
    await task.save();
    res.json({ message: 'Attachment deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;