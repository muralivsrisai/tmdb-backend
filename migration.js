// migration.js
const mongoose = require('mongoose');
const DownloadLink = require('./models/DownloadLink');

mongoose.connect('mongodb+srv://murali:FYRje8EWdNzijjJb@cluster0.skxx9oj.mongodb.net/', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

(async () => {
  try {
    const outdated = await DownloadLink.find({ downloadLink: { $exists: true } });

    for (let doc of outdated) {
      doc.downloadLinks = { '1080p': doc.downloadLink };
      doc.downloadLink = undefined; // remove old field
      await doc.save();
    }

    console.log('Migration complete.');
    process.exit();
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
