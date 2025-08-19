const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');
const axios = require('axios');

// Get all users (Admin only)
router.get('/users', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const users = await User.find({}, 'username email role'); // only return necessary fields
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});

const { sendMail } = require('../utils/mailer');

// POST /admin/send-mail
router.post('/send-mail', protect, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied' });
  }
  const { userIds } = req.body;
  if (!Array.isArray(userIds)) {
    return res.status(400).json({ message: 'Invalid request payload' });
  }

  try {
    // 1. Fetch trending movies from your own API (recommended)
    const trendingResp = await axios.get('https://tmdb-backend-2o43.onrender.com/api/tmdb/trending'); // replace with your actual route
    const moviesArr = trendingResp.data.results.slice(0, 7);

    // Make a pretty list
    const moviesText = moviesArr
  .map((movie, idx) =>
    `${idx + 1}. ${movie.title} (${movie.release_date.slice(0,4)}) [${movie.vote_average}/10]`
  ).join('\n');


    // 2. Fetch target users
    const users = await User.find({ _id: { $in: userIds } });

    // 3. Send to each
    for (const user of users) {
      const subject = "Don't Miss This Week's 7 Trending Movies!";
      const message = `Hello ${user.username},

Here are this week's top trending movies on Gledati:

${moviesText}

Catch up on these movies and more on our platform. Don't miss out!

Enjoy,
The Gledati Team`;

      await sendMail({
        to: user.email,
        subject,
        text: message,
      });
    }

    res.json({ message: 'Emails sent successfully', count: users.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Mail sending failed', error: error.message });
  }
});

const DownloadLink = require('../models/DownloadLink');

// ✅ Get all download links
router.get('/download-links', protect, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const links = await DownloadLink.find({});
    res.json(links);
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
});



module.exports = router;
