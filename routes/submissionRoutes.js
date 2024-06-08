// routes/submissionRoutes.js
const express = require('express');
const router = express.Router();
const submissionController = require('../controllers/submissionController');

router.post('/', submissionController.createSubmission);

module.exports = router;
