const mongoose = require('mongoose');

const DownloadLinkSchema = new mongoose.Schema({
  movieId: {
    type: Number, // TMDB movie ID
    required: true,
    unique: true,
  },
  title: {
    type: String,
    required: true,
  },
  downloadLink: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('DownloadLink', DownloadLinkSchema);
