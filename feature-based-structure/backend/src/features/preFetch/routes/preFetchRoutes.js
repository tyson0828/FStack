// src/features/preFetch/routes/preFetchRoutes.js

const express = require('express');
const router = express.Router();
const preFetchController = require('../controllers/preFetchController');

// REST API route to handle pre-fetch requests
router.post('/request', preFetchController.handlePreFetchRequest);

module.exports = router;

