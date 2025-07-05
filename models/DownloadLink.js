const mongoose = require('mongoose');

const DownloadLinkSchema = new mongoose.Schema({
  movieId: {
    type: Number,
    required: true,
    unique: true,
  },
  title: {
    type: String,
    required: true,
  },
  links: {
    type: Map,
    of: String, // key = quality (e.g. '720p'), value = URL string
    required: true,
  },
});

module.exports = mongoose.model('DownloadLink', DownloadLinkSchema);
