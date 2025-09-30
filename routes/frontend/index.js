const express = require('express');
const router = express.Router();

// Admin subroutes
router.use('/', require('./homeRoutes.js'));

module.exports = router;
