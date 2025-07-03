const express = require('express');
const router = express.Router();
const DownloadLink = require('../models/DownloadLink');
const { verifyToken } = require('../middleware/auth');

// 🟢 GET - Publicly fetch a download link
router.get('/movie-download/:movieId', async (req, res) => {
  try {
    const link = await DownloadLink.findOne({ movieId: req.params.movieId });
    if (!link) return res.status(404).json({ message: 'No download link found' });
    res.json(link);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

// 🔐 POST - Admin creates/updates a download link
router.post('/admin/movie-download', verifyToken, async (req, res) => {
  try {
    const { movieId, title, downloadLink } = req.body;

    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updated = await DownloadLink.findOneAndUpdate(
      { movieId },
      { title, downloadLink },
      { new: true, upsert: true }
    );

    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Failed to save download link' });
  }
});

// 🔐 DELETE - Admin deletes a download link
router.delete('/admin/movie-download/:movieId', verifyToken, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const deleted = await DownloadLink.findOneAndDelete({ movieId: req.params.movieId });

    if (!deleted) {
      return res.status(404).json({ message: 'Download link not found' });
    }

    res.status(200).json({ message: 'Download link deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Failed to delete download link' });
  }
});

// 🔐 PUT - Admin edits an existing download link
router.put('/admin/movie-download/:movieId', verifyToken, async (req, res) => {
  try {
    const { downloadLink } = req.body;

    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const updated = await DownloadLink.findOneAndUpdate(
      { movieId: req.params.movieId },
      { downloadLink },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: 'Download link not found' });
    }

    res.status(200).json(updated);
  } catch (err) {
    res.status(500).json({ message: 'Failed to update download link' });
  }
});

module.exports = router;
