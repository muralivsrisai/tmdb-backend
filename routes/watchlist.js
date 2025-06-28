const express = require('express');
const Watchlist = require('../models/Watchlist');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// GET /api/watchlist
router.get('/', protect, async (req, res) => {
  const watchlist = await Watchlist.findOne({ userId: req.user._id });
  res.json(watchlist ? watchlist.movies : []);
});

// POST /api/watchlist
router.post('/', protect, async (req, res) => {
  const { movieId, title, posterPath, overview } = req.body;

  let watchlist = await Watchlist.findOne({ userId: req.user._id });
  if (!watchlist) {
    watchlist = new Watchlist({ userId: req.user._id, movies: [] });
  }

  // Avoid duplicates
  const exists = watchlist.movies.find(m => m.movieId === movieId);
  if (exists) return res.status(400).json({ message: 'Movie already in watchlist' });

  watchlist.movies.push({ movieId, title, posterPath, overview });
  await watchlist.save();

  res.status(201).json(watchlist.movies);
});

// DELETE /api/watchlist/:movieId
router.delete('/:movieId', protect, async (req, res) => {
  let watchlist = await Watchlist.findOne({ userId: req.user._id });

  if (!watchlist) return res.status(404).json({ message: 'Watchlist not found' });

  watchlist.movies = watchlist.movies.filter(m => m.movieId !== req.params.movieId);
  await watchlist.save();

  res.json(watchlist.movies);
});

module.exports = router;
