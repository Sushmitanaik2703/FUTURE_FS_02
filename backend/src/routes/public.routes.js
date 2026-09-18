const express = require('express');
const router = express.Router();
const { publicSubmit } = require('../controllers/lead.controller');
const { validatePublicContactForm } = require('../middleware/validate.middleware');
const { publicContactLimiter } = require('../middleware/rateLimiter');

// Rate limited & validated public contact submission endpoint
router.post('/contact', publicContactLimiter, validatePublicContactForm, publicSubmit);

module.exports = router;
