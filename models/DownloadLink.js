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
  downloadLinks: {
    type: Map,
    of: String, // quality: link
    default: {},
  },
});

module.exports = mongoose.model('DownloadLink', DownloadLinkSchema);
