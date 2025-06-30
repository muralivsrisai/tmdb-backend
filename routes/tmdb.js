const express = require('express');
const axios = require('axios');
const router = express.Router();

const TMDB_API_KEY = process.env.TMDB_API_KEY;

router.get('/trending', async (req, res) => {
  try {
    const { page = 1 } = req.query;

    const response = await axios.get(`https://api.themoviedb.org/3/trending/movie/week`, {
      params: {
        api_key: TMDB_API_KEY,
        page
      }
    });

    res.json(response.data);
  } catch (err) {
    console.error('TMDB Proxy Error:', err.message);
    res.status(500).json({ error: 'Failed to fetch trending movies' });
  }
});

module.exports = router;
