const express = require('express');
const router = express.Router();
const {
  getAllBlogs,
  getBlogBySlug,
  getFeaturedBlogs,
  getBlogCategories,
  getRecentBlogs,
  getPopularBlogs
} = require('../controllers/blogController');

// Blog routes
router.get('/', getAllBlogs);
router.get('/featured', getFeaturedBlogs);
router.get('/recent', getRecentBlogs);
router.get('/popular', getPopularBlogs);
router.get('/categories', getBlogCategories);
router.get('/:slug', getBlogBySlug);

module.exports = router;