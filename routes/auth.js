const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const {protect} = require('../middleware/authMiddleware');
require('dotenv').config();
const bcrypt = require('bcrypt');


const nodemailer = require('nodemailer');
const router = express.Router();

// Generate JWT Token
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
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

router.get('/profile', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Error fetching profile' });
  }
});


// POST /auth/forgot-password
router.post('/forgot-password', async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) return res.status(404).json({ message: 'User not found' });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '15m' });

  const resetLink = `${process.env.FRONTEND_URL}/reset-password/${token}`;

  // Email setup using nodemailer
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER, // your Gmail address
      pass: process.env.EMAIL_PASS  // app password or Gmail password
    }
  });

  const mailOptions = {
    from: `"TMDB Support" <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: 'Password Reset Link',
    html: `<p>Click <a href="${resetLink}">here</a> to reset your password. Link valid for 15 minutes.</p>`
  };

  try {
    await transporter.sendMail(mailOptions);
    res.json({ message: 'Reset link sent to your email' });
  } catch (err) {
    res.status(500).json({ message: 'Error sending email' });
  }
});


// POST /auth/reset-password
router.post('/reset-password', async (req, res) => {
  const { token, newPassword } = req.body;
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    res.status(400).json({ message: 'Invalid or expired token' });
  }
});



module.exports = router;
