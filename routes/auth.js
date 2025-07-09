const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const {protect} = require('../middleware/authMiddleware');
require('dotenv').config();

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


module.exports = router;
