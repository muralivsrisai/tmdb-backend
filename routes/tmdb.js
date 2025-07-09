const express = require('express');
const axios = require('axios');
const router = express.Router();

const API_KEY = process.env.TMDB_API_KEY;
const BASE_URL = 'https://api.themoviedb.org/3';

const instance = axios.create({
  baseURL: BASE_URL,
  params: { api_key: API_KEY },
});

// ✅ 1. Trending Movies
router.get('/trending', async (req, res) => {
  try {
    const { page = 1 } = req.query;
    const response = await instance.get('/trending/movie/week', { params: { page } });
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch trending movies' });
  }
});

// ✅ 2. Search Movies
router.get('/search', async (req, res) => {
  try {
    const { query, page = 1 } = req.query;
    const response = await instance.get('/search/movie', { params: { query, page } });
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: 'Search failed' });
  }
});

// ✅ 3. Movie Details
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

// ✅ 4. Upcoming Movies
router.get('/upcoming', async (req, res) => {
  try {
    const { page = 1 } = req.query;
    const response = await instance.get('/movie/upcoming', { params: { page } });
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: 'Upcoming movies fetch failed' });
  }
});

// ✅ 5. Genre List
router.get('/genres', async (req, res) => {
  try {
    const response = await instance.get('/genre/movie/list');
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: 'Genres fetch failed' });
  }
});

// ✅ 6. Movies by Genre
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

// ✅ 7. Representative Movie by Genre
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

// ✅ 8. Actor Details
router.get('/actor/:id', async (req, res) => {
  try {
    const response = await instance.get(`/person/${req.params.id}`);
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: 'Actor details fetch failed' });
  }
});

// ✅ 9. Watch Providers
router.get('/movie/:id/providers', async (req, res) => {
  try {
    const response = await instance.get(`/movie/${req.params.id}/watch/providers`);
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: 'Watch providers fetch failed' });
  }
});

// ✅ 10. Language List
router.get('/languages', async (req, res) => {
  try {
    const response = await instance.get('/configuration/languages');
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: 'Languages fetch failed' });
  }
});

// ✅ 11. Discover Movies by Language
router.get('/discover-language', async (req, res) => {
  try {
    const { lang, page = 1 } = req.query;
    const response = await instance.get('/discover/movie', {
      params: { with_original_language: lang, page }
    });
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: 'Language discover failed' });
  }
});

// ✅ 11. /language-movies?langCode=xx&page=1
router.get('/language-movies', async (req, res) => {
  try {
    const { langCode, page = 1 } = req.query;
    const response = await instance.get('/discover/movie', {
      params: {
        with_original_language: langCode,
        sort_by: 'popularity.desc',
        page,
      },
    });
    res.json(response.data);
  } catch (err) {
    res.status(500).json({ error: 'Language-based movies fetch failed' });
  }
});


module.exports = router;
