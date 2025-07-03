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
router.get('/users', isAdmin, async (req, res) => {
  const users = await User.find().select('-password');
  res.json(users);
});

module.exports = router;
