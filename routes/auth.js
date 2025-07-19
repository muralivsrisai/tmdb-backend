const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/authMiddleware');
require('dotenv').config();
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');

const router = express.Router();

// Generate JWT Token (no expiration for login/register)
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET
  );
};

// @route   POST /api/auth/register
router.post('/register', async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: 'User already exists' });

    const user = new User({ username, email, password, role });
    await user.save();

    const token = generateToken(user);
    res.status(201).json({ token, user: { id: user._id, username, email, role } });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// @route   POST /api/auth/login
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: 'Invalid email or password' });

    const isMatch = await user.matchPassword(password);
    if (!isMatch)
      return res.status(400).json({ message: 'Invalid email or password' });

    const token = generateToken(user);
    res.status(200).json({ token, user: { id: user._id, username: user.username, email, role: user.role } });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error });
  }
});

// @route   PUT /api/auth/profile
router.put('/profile', protect, async (req, res) => {
  const { username, profilePic, currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user.id);
  if (!user) return res.status(404).json({ message: 'User not found' });

  if (username) user.username = username;
  if (profilePic) user.profilePic = profilePic;

  if (newPassword) {
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Incorrect current password' });

    user.password = await bcrypt.hash(newPassword, 10);
  }

  await user.save();
  res.json({ username: user.username, email: user.email, profilePic: user.profilePic, role: user.role });
});

// @route   GET /api/auth/profile
router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching profile' });
  }
});

// @route   POST /api/auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;

  // Check if user exists
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: 'User not found' });

  // Generate a 6-digit reset code and expiry
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  user.resetCode = resetCode;
  user.resetCodeExpires = new Date(Date.now() + 15 * 60 * 1000); // 15 min from now

  try {
    await user.save();
  } catch (err) {
    return res.status(500).json({ message: 'Error saving reset code' });
  }

  // Prepare nodemailer transporter
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  // Prepare mail
  const mailOptions = {
    from: `"TMDB Support" <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: 'Your Password Reset Code',
    html: `<p>Your reset code is: <b>${resetCode}</b>. It is valid for 15 minutes.</p>`
  };

  // Send mail
  try {
    await transporter.sendMail(mailOptions);
    res.json({ message: 'Reset code sent to your email' });
  } catch (err) {
    res.status(500).json({ message: 'Error sending email' });
  }
});


// @route   POST /api/auth/reset-password
router.post('/reset-password', async (req, res) => {
  const { email, resetCode, newPassword } = req.body;

  const user = await User.findOne({ email, resetCode });
  if (!user) return res.status(400).json({ message: 'Invalid code or email' });

  if (user.resetCodeExpires < Date.now()) {
    return res.status(400).json({ message: 'Reset code expired' });
  }

  user.password = newPassword;
  user.resetCode = undefined;
  user.resetCodeExpires = undefined;
  await user.save();

  res.json({ message: 'Password reset successful' });
});


module.exports = router;
