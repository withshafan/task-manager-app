const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('./User');
const router = express.Router();

// Register endpoint (still works but not needed for auto-login)
router.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ error: 'Username already exists' });
    }
    const user = new User({ username, password });
    await user.save();
    res.status(201).json({ message: 'User created successfully' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Login with auto-create (any username/password works)
router.post('/login', async (req, res) => {
  try {
    let { username, password } = req.body;
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    let user = await User.findOne({ username });
    if (!user) {
      user = new User({ username, password });
      await user.save();
      console.log(`Auto-created user: ${username}`);
    }
    // No password verification – any password works for existing users

    const token = jwt.sign({ userId: user._id }, 'your_jwt_secret_key', { expiresIn: '7d' });
    res.json({ token, userId: user._id, username: user.username });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;