const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const DownloadLink = require('../models/DownloadLink');

// ⬇️ Add or Update a link for a quality
router.post('/admin/movie-download', protect, async (req, res) => {
  const { movieId, title, quality, link } = req.body;

  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden: Admins only' });
  }

  if (!quality || !link) {
    return res.status(400).json({ message: 'Quality and link are required' });
  }

  try {
    let existing = await DownloadLink.findOne({ movieId });

    if (!existing) {
      existing = new DownloadLink({
        movieId,
        title,
        links: { [quality]: link },
      });
    } else {
      existing.title = title;
      existing.links.set(quality, link);
    }

    await existing.save();
    res.json(existing);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

// ⬇️ Get all quality-wise links for a movie
router.get('/movie-download/:movieId', async (req, res) => {
  try {
    const result = await DownloadLink.findOne({ movieId: req.params.movieId });
    if (!result) return res.json({ downloadLinks: {} });
    res.json({ downloadLinks: result.links });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error fetching links' });
  }
});

// ⬇️ Delete a specific quality link
router.delete('/admin/movie-download', protect, async (req, res) => {
  const { movieId, quality } = req.body;

  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden: Admins only' });
  }

  try {
    const movie = await DownloadLink.findOne({ movieId });
    if (!movie) return res.status(404).json({ message: 'Movie not found' });

    movie.links.delete(quality);

    if (movie.links.size === 0) {
      await DownloadLink.deleteOne({ movieId });
    } else {
      await movie.save();
    }

    res.json({ message: 'Download link deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error deleting link' });
  }
});

module.exports = router;
