const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');

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
  // Only allow admins
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied' });
  }

  const { userIds, subject, message } = req.body;
  if (!Array.isArray(userIds) || !subject || !message) {
    return res.status(400).json({ message: 'Invalid request payload' });
  }

  try {
    const users = await User.find({ _id: { $in: userIds } });
    const emails = users.map(u => u.email).filter(Boolean);

    await sendMail({
      to: emails, // You can use emails.join(', ') to send a single email to all, or loop to send individual messages
      subject,
      text: message
    });

    res.json({ message: 'Emails sent successfully', count: emails.length });
  } catch (error) {
    res.status(500).json({ message: 'Mail sending failed', error: error.message });
  }
});

module.exports = router;


module.exports = router;
