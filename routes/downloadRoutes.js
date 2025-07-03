const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware'); // ✅ correct import

const DownloadLink = require('../models/DownloadLink');

// Admin-only route
router.post('/admin/movie-download', protect, async (req, res) => {
  const { movieId, title, downloadLink } = req.body;

  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Forbidden: Admins only' });
  }

  try {
    const saved = await DownloadLink.findOneAndUpdate(
      { movieId },
      { title, downloadLink },
      { upsert: true, new: true }
    );
    res.json(saved);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/movie-download/:movieId', async (req, res) => {
  try {
    const result = await DownloadLink.findOne({ movieId: req.params.movieId });
    if (!result) return res.json({ downloadLink: '' });
    res.json({ downloadLink: result.downloadLink });
  } catch (err) {
    res.status(500).json({ message: 'Error fetching link' });
  }
});

module.exports = router;
