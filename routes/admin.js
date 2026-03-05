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
router.post('/send-mail',protect, async (req, res) => {
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
    const moviesArr = trendingResp.data.results.slice(0, 10);

    // 2. Fetch target users
    const users = await User.find({ _id: { $in: userIds } });

    // 3. Send to each user
    const subject = "This Week's Top 7 Trending Movies on Gledati!";

await Promise.all(
  users.map(async (user) => {

    const movieItems = moviesArr.map(
      (movie, idx) => `
        <tr>
          <td style="padding: 10px; border-bottom: 1px solid #ddd;">
            <img src="https://image.tmdb.org/t/p/w200${movie.poster_path}" 
                 alt="${movie.title}" 
                 style="width:80px; border-radius:8px;">
          </td>
          <td style="padding: 10px; border-bottom: 1px solid #ddd;">
            <strong style="font-size:16px;">${idx + 1}. ${movie.title}</strong><br>
            <span style="color:#555;">
              ${movie.release_date.slice(0,4)} | ⭐ ${movie.vote_average}/10
            </span><br>
            <a href="https://gledati.vercel.app/movie/${movie.id}" 
               style="display:inline-block;margin-top:5px;padding:6px 10px;background:#ff4b2b;color:#fff;border-radius:5px;text-decoration:none;font-size:12px;">
               Watch Now
            </a>
          </td>
        </tr>
      `
    ).join('');

    const htmlMessage = `
<div style="font-family: Arial, sans-serif; background:#0f0f0f; padding:20px;">
  
  <div style="max-width:600px; margin:auto; background:#141414; border-radius:10px; overflow:hidden;">

    <!-- Header -->
    <div style="padding:20px; text-align:center; border-bottom:1px solid #222;">
      <h1 style="color:#ff4b2b; margin:0;">Gledati</h1>
      <p style="color:#bbb; margin-top:5px;">Weekly Trending Movies</p>
    </div>

    <!-- Greeting -->
    <div style="padding:20px;">
      <p style="color:#fff; font-size:16px;">
        Hi <strong>${user.username}</strong>,
      </p>
      <p style="color:#ccc;">
        Here are <strong>this week's hottest trending movies</strong> you shouldn't miss:
      </p>
    </div>

    <!-- Movie Cards -->
    <div style="padding:10px 20px 20px 20px;">

      ${moviesArr.map((movie, idx) => `
        <div style="display:flex; margin-bottom:15px; background:#1c1c1c; border-radius:8px; overflow:hidden;">
          
          <img 
            src="https://image.tmdb.org/t/p/w200${movie.poster_path}" 
            alt="${movie.title}"
            style="width:120px; object-fit:cover;"
          />

          <div style="padding:10px;">
            <h3 style="margin:0; color:#fff;">
              ${idx + 1}. ${movie.title}
            </h3>

            <p style="color:#aaa; font-size:13px; margin:5px 0;">
              ${movie.release_date.slice(0,4)} • ⭐ ${movie.vote_average}/10
            </p>

            <a 
              href="https://gledati.vercel.app/movie/${movie.id}"
              style="display:inline-block;
                     margin-top:8px;
                     padding:6px 12px;
                     background:#ff4b2b;
                     color:#fff;
                     text-decoration:none;
                     border-radius:5px;
                     font-size:12px;">
              Watch Now
            </a>

          </div>

        </div>
      `).join("")}

    </div>

    <!-- Footer -->
    <div style="text-align:center; padding:15px; background:#0f0f0f;">
      <p style="color:#777; font-size:12px;">
        Discover more movies on 
        <a href="https://gledati.vercel.app" style="color:#ff4b2b; text-decoration:none;">
          Gledati
        </a>
      </p>
      <p style="color:#555; font-size:11px;">
        © ${new Date().getFullYear()} Gledati. All rights reserved.
      </p>
    </div>

  </div>

</div>
`;

    return sendMail({
      to: user.email,
      subject,
      html: htmlMessage,
      text: `Hello ${user.username}, check out this week's trending movies on Gledati.`
    });

  })
);

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

router.get("/test-mail", async (req, res) => {
  try {
    await sendMail({
      to: "adabalamurali2728@gmail.com",
      subject: "Test Email",
      text: "Nodemailer working!"
    });

    res.send("Mail sent successfully");
  } catch (err) {
    console.log(err);
    res.send("Mail failed");
  }
});
module.exports = router;
