const mongoose = require('mongoose');

const watchlistSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  movies: [
    {
      movieId: String,
      title: String,
      posterPath: String,
      overview: String
    }
  ]
});

module.exports = mongoose.model('Watchlist', watchlistSchema);
