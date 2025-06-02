const express = require('express');
const router = express.Router();
const { generateMessages } = require('../controllers/messageController');
const auth = require('../middleware/authMiddleware');

// Generate personalized messages
router.post('/generate-messages', auth, generateMessages);

module.exports = router; 