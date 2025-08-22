const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');
const axios = require('axios');
const { sendMail } = require('../utils/mailer');
const DownloadLink = require('../models/DownloadLink');

// ✅ Get all users (Admin only)
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

// ✅ Send Trending Movies Email (Styled HTML)
router.post('/send-mail', protect, async (req, res) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied' });
  }

  const { userIds } = req.body;
  if (!Array.isArray(userIds)) {
    return res.status(400).json({ message: 'Invalid request payload' });
  }

  try {
    // 1. Fetch trending movies from your API
    const trendingResp = await axios.get('https://tmdb-backend-2o43.onrender.com/api/tmdb/trending');
    const moviesArr = trendingResp.data.results.slice(0, 7);

    // 2. Fetch target users
    const users = await User.find({ _id: { $in: userIds } });

    // 3. Send to each user
    for (const user of users) {
      const subject = "🔥 This Week's Top 7 Trending Movies on Gledati!";

      // Generate movie list with posters
      const movieItems = moviesArr.map(
        (movie, idx) => `
          <tr>
            <td style="padding: 10px; border-bottom: 1px solid #ddd;">
              <img src="https://image.tmdb.org/t/p/w200${movie.poster_path}" alt="${movie.title}" style="width:80px; border-radius:8px;">
            </td>
            <td style="padding: 10px; border-bottom: 1px solid #ddd;">
              <strong style="font-size:16px;">${idx + 1}. ${movie.title}</strong><br>
              <span style="color:#555;">${movie.release_date.slice(0,4)} | ⭐ ${movie.vote_average}/10</span><br>
              <a href="https://gledati.vercel.app/movie/${movie.id}" style="display:inline-block;margin-top:5px;padding:6px 10px;background:#ff4b2b;color:#fff;border-radius:5px;text-decoration:none;font-size:12px;">Watch Now</a>
            </td>
          </tr>
        `
      ).join('');

      const htmlMessage = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin:auto; background:#ffffff; border-radius:10px; overflow:hidden; box-shadow:0 4px 8px rgba(0,0,0,0.1);">
          <div style="background:#141414; color:#fff; padding:20px; text-align:center;">
            <h1 style="margin:0;">Gledati Weekly Picks</h1>
          </div>
          <div style="padding:20px;">
            <p>Hi <strong>${user.username}</strong>,</p>
            <p>Here are <strong>this week's top 7 trending movies</strong> you shouldn’t miss:</p>
            <table style="width:100%; border-collapse: collapse;">
              ${movieItems}
            </table>
            <p style="margin-top:20px;">Catch these and more on <a href="https://gledati.com" style="color:#ff4b2b; text-decoration:none;">Gledati</a>!</p>
          </div>
          <div style="background:#f4f4f4; padding:10px; text-align:center; font-size:12px; color:#666;">
            © ${new Date().getFullYear()} Gledati. All Rights Reserved.
          </div>
        </div>
      `;

      await sendMail({
        to: user.email,
        subject,
        html: htmlMessage,
        text: `Hello ${user.username},\n\nCheck out this week's top trending movies on Gledati.\n\n${moviesArr.map((m, i) => `${i + 1}. ${m.title}`).join('\n')}\n\nEnjoy!`,
      });
    }

    res.json({ message: 'Emails sent successfully', count: users.length });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Mail sending failed', error: error.message });
  }
});

// ✅ Get all download links (Admin only)
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
