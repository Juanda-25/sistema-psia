const express = require('express');
const router = express.Router();
const { getProfile, updateProfile } = require('./users.controller');
const { verifyToken } = require('../../middlewares/auth.middleware');

router.get('/profile', verifyToken, getProfile);
router.put('/profile', verifyToken, updateProfile);

module.exports = router;