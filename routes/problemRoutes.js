// routes/problemRoutes.js
const express = require('express');
const router = express.Router();
const problemController = require('../controllers/problemController');

router.post('/', problemController.createProblem);
router.get('/', problemController.getProblems);

module.exports = router;
