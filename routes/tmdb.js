const express = require('express');
const axios = require('axios');
const router = express.Router();

const API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

const instance = axios.create({
  baseURL: BASE_URL,
  params: { api_key: API_KEY },
});

// ✅ 1. /trending?type=movie|tv&page=1
router.get('/trending', async (req, res) => {
  try {
    const { type = 'movie', page = 1 } = req.query;
    const response = await instance.get(`/trending/${type}/week`, { params: { page } });
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch trending content' });
  }
});

// ✅ 2. /search?query=...&type=movie|tv&page=...
router.get('/search', async (req, res) => {
  try {
    const { query, type = 'movie', page = 1 } = req.query;
    const response = await instance.get(`/search/${type}`, { params: { query, page } });
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: 'Search failed' });
  }
});

// ✅ 3. /details/:type/:id
router.get('/details/:type/:id', async (req, res) => {
  try {
    const { type, id } = req.params;
    const response = await instance.get(`/${type}/${id}`, {
      params: { append_to_response: 'videos,credits' }
    });
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: `${type} details fetch failed` });
  }
});

// ✅ 4. /upcoming?page=... (only for movies)
router.get('/upcoming', async (req, res) => {
  try {
    const { page = 1 } = req.query;
    const response = await instance.get('/movie/upcoming', { params: { page } });
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: 'Upcoming movies fetch failed' });
  }
});

// ✅ 5. /genres?type=movie|tv
router.get('/genres', async (req, res) => {
  try {
    const { type = 'movie' } = req.query;
    const response = await instance.get(`/genre/${type}/list`);
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: 'Genres fetch failed' });
  }
});

// ✅ 6. /discover?type=movie|tv&genreId=...&page=...
router.get('/discover', async (req, res) => {
  try {
    const { type = 'movie', genreId, page = 1 } = req.query;
    const response = await instance.get(`/discover/${type}`, {
      params: { with_genres: genreId, page }
    });
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: 'Genre discover failed' });
  }
});

// ✅ 7. /representative?type=movie|tv&genreId=...
router.get('/representative', async (req, res) => {
  try {
    const { type = 'movie', genreId } = req.query;
    const response = await instance.get(`/discover/${type}`, {
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

// ✅ 9. /providers/:type/:id (for both movie and tv)
router.get('/providers/:type/:id', async (req, res) => {
  try {
    const { type, id } = req.params;
    const response = await instance.get(`/${type}/${id}/watch/providers`);
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: 'Watch providers fetch failed' });
  }
});

module.exports = router;
