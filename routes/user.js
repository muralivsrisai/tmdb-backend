const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { authenticateToken } = require('../middleware/authMiddleware');
const User = require('../models/User');

// Set up multer for image upload
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadPath = path.join(__dirname, '..', 'uploads');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath);
    }
    cb(null, uploadPath);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${file.fieldname}${ext}`);
  }
});

const upload = multer({ storage });

// PATCH /user/profile
router.patch('/profile', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    const { name } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : undefined;

    const updateData = {};
    if (name) updateData.name = name;
    if (imageUrl) updateData.profilePic = imageUrl;

    await User.findByIdAndUpdate(req.user.id, updateData);
    res.json({ message: 'Profile updated successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
