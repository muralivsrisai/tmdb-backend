const express = require('express');
const Watchlist = require('../models/Watchlist');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// ✅ GET /api/watchlist
router.get('/', protect, async (req, res) => {
  try {
    const watchlist = await Watchlist.findOne({ userId: req.user._id });
    res.json(watchlist ? watchlist.movies : []);
  } catch (error) {
    res.status(500).json({ message: 'Server error fetching watchlist' });
  }
});

// ✅ POST /api/watchlist
router.post('/', protect, async (req, res) => {
  try {
    const { movieId, title, posterPath, overview } = req.body;

    // always store movieId as string for consistency
    const movieIdStr = String(movieId);

    let watchlist = await Watchlist.findOne({ userId: req.user._id });
    if (!watchlist) {
      watchlist = new Watchlist({ userId: req.user._id, movies: [] });
    }

    // avoid duplicates
    const exists = watchlist.movies.some(m => m.movieId === movieIdStr);
    if (exists) {
      return res.status(400).json({ message: 'Movie already in watchlist' });
    }

    // push new movie
    watchlist.movies.push({ movieId: movieIdStr, title, posterPath, overview });
    await watchlist.save();

    const addedMovie = watchlist.movies[watchlist.movies.length - 1];
    res.status(201).json(addedMovie);
  } catch (error) {
    res.status(500).json({ message: 'Server error adding to watchlist' });
  }
});

// ✅ DELETE /api/watchlist/:movieId
router.delete('/:movieId', protect, async (req, res) => {
  try {
    const movieIdStr = String(req.params.movieId);
    let watchlist = await Watchlist.findOne({ userId: req.user._id });

    if (!watchlist) {
      return res.status(404).json({ message: 'Watchlist not found' });
    }

    watchlist.movies = watchlist.movies.filter(m => m.movieId !== movieIdStr);
    await watchlist.save();

    res.json({ message: 'Movie removed from watchlist', movies: watchlist.movies });
  } catch (error) {
    res.status(500).json({ message: 'Server error removing from watchlist' });
  }
});

module.exports = router;
