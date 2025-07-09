const express = require('express');
const router = express.Router();
const Movie = require('../models/Movie');
const User = require('../models/User');

function isAdmin(req, res, next) {
  if (req.user && req.user.role === 'admin') next();
  else res.status(403).json({ error: 'Unauthorized' });
}

// Add a movie with only download link
router.post('/add-download', isAdmin, async (req, res) => {
  const { title, downloadLink } = req.body;
  if (!title || !downloadLink) {
    return res.status(400).json({ error: 'All fields are required' });
  }

  const movie = new Movie({ title, downloadLink });
  await movie.save();
  res.json({ message: 'Download link added successfully' });
});

// Get all users
// routes/admin.js
router.get('/users', protect, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden: Admins only' });
  }

  try {
    const users = await User.find({}, 'username email');
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});


module.exports = router;
