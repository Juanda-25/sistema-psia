const express = require('express');
const router = express.Router();
const { verifyToken } = require('../../middlewares/auth.middleware');
const { chat } = require('./ia.controller');

router.post('/chat', verifyToken, chat);

module.exports = router;