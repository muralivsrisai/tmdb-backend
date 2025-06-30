const express = require('express');
const axios = require('axios');
const router = express.Router();

const API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

const instance = axios.create({
  baseURL: BASE_URL,
  params: { api_key: API_KEY },
});

// ✅ 1. /trending?page=1
router.get('/trending', async (req, res) => {
  try {
    const { page = 1 } = req.query;
    const response = await instance.get('/trending/movie/week', { params: { page } });
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch trending movies' });
  }
});

// ✅ 2. /search?query=...&page=...
router.get('/search', async (req, res) => {
  try {
    const { query, page = 1 } = req.query;
    const response = await instance.get('/search/movie', { params: { query, page } });
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: 'Search failed' });
  }
});

// ✅ 3. /movie/:id
router.get('/movie/:id', async (req, res) => {
  try {
    const response = await instance.get(`/movie/${req.params.id}`, {
      params: { append_to_response: 'videos,credits' }
    });
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: 'Movie fetch failed' });
  }
});

// ✅ 4. /upcoming?page=...
router.get('/upcoming', async (req, res) => {
  try {
    const { page = 1 } = req.query;
    const response = await instance.get('/movie/upcoming', { params: { page } });
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: 'Upcoming movies fetch failed' });
  }
});

// ✅ 5. /genres
router.get('/genres', async (req, res) => {
  try {
    const response = await instance.get('/genre/movie/list');
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: 'Genres fetch failed' });
  }
});

// ✅ 6. /discover?genreId=...&page=...
router.get('/discover', async (req, res) => {
  try {
    const { genreId, page = 1 } = req.query;
    const response = await instance.get('/discover/movie', {
      params: { with_genres: genreId, page }
    });
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: 'Genre discover failed' });
  }
});

// ✅ 7. /representative?genreId=...
router.get('/representative', async (req, res) => {
  try {
    const { genreId } = req.query;
    const response = await instance.get('/discover/movie', {
      params: {
        with_genres: genreId,
        sort_by: 'vote_average.desc',
        'vote_count.gte': 1000
      }
    });
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: 'Representative fetch failed' });
  }
});

// ✅ 8. /actor/:id
router.get('/actor/:id', async (req, res) => {
  try {
    const response = await instance.get(`/person/${req.params.id}`);
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: 'Actor details fetch failed' });
  }
});

module.exports = router;
