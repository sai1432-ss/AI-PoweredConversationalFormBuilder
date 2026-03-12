
const express = require('express');
const router = express.Router();
const formController = require('./formController');

router.post('/generate', formController.generateForm); // Maps to /api/form/generate

module.exports = router;