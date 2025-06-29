const express = require('express');
const router = express.Router();
const {
  submitContact,
  getAllContacts,
  subscribeNewsletter,
  unsubscribeNewsletter,
  getNewsletterSubscribers
} = require('../controllers/contactController');

// Contact routes
router.post('/contact', submitContact);
router.get('/contact', getAllContacts);

// Newsletter routes
router.post('/newsletter/subscribe', subscribeNewsletter);
router.post('/newsletter/unsubscribe', unsubscribeNewsletter);
router.get('/newsletter/subscribers', getNewsletterSubscribers);

module.exports = router;