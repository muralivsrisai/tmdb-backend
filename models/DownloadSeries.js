const mongoose = require('mongoose');

const DownloadSeriesSchema = new mongoose.Schema({
  seriesId: {
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

module.exports = mongoose.model('DownloadSeries', DownloadSeriesSchema);
