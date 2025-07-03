const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const watchlistRoutes = require('./routes/watchlist');
const tmdbRoutes = require('./routes/tmdb');
const downloadRoutes = require('./routes/downloadRoutes'); // ✅ NEW

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/watchlist', watchlistRoutes);
app.use('/api/tmdb', tmdbRoutes);
app.use('/api/download', downloadRoutes); // ✅ NEW

// DB + Server Init
const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => console.error(err));
