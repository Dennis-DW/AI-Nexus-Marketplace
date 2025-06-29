const express = require('express');
const router = express.Router();
const {
  getCookiePreferences,
  updateCookiePreferences,
  getCookieConsent,
  clearAllCookies
} = require('../controllers/cookieController');

// Cookie preference routes
router.get('/preferences/:userId', getCookiePreferences);
router.put('/preferences/:userId', updateCookiePreferences);
router.get('/consent/:userId', getCookieConsent);
router.delete('/clear/:userId', clearAllCookies);

module.exports = router;