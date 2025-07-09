const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const DownloadLink = require('../models/DownloadLink');

// ✅ Admin: Add or update a download link (by quality)
router.post('/admin/movie-download', protect, async (req, res) => {
  const { movieId, title, downloadLink, quality } = req.body;

  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden: Admins only' });
  }

  if (!movieId || !title || !downloadLink || !quality) {
    return res.status(400).json({ message: 'All fields required: movieId, title, downloadLink, quality' });
  }

  try {
    const updated = await DownloadLink.findOneAndUpdate(
      { movieId },
      {
        $set: {
          title,
          [`downloadLinks.${quality}`]: downloadLink,
        },
      },
      { upsert: true, new: true }
    );
    res.json(updated);
  } catch (err) {
    console.error('Error saving link:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Admin: Delete a specific quality link
router.delete('/admin/movie-download/:movieId/:quality', protect, async (req, res) => {
  const { movieId, quality } = req.params;

  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden: Admins only' });
  }

  try {
    const movie = await DownloadLink.findOne({ movieId });
    if (!movie) return res.status(404).json({ message: 'Movie not found' });

    if (movie.downloadLinks.has(quality)) {
      movie.downloadLinks.delete(quality);
      await movie.save();
      return res.json({ message: 'Link deleted' });
    } else {
      return res.status(404).json({ message: 'Quality not found' });
    }
  } catch (err) {
    console.error('Error deleting link:', err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ✅ Public: Get all download links for a movie
router.get('/movie-download/:movieId', async (req, res) => {
  try {
    const result = await DownloadLink.findOne({ movieId: req.params.movieId });
    if (!result) return res.json({ downloadLinks: {} });
    res.json({ downloadLinks: result.downloadLinks });
  } catch (err) {
    console.error('Error fetching link:', err);
    res.status(500).json({ message: 'Error fetching link' });
  }
});

module.exports = router;
