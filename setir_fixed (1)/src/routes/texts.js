// This file intentionally minimal - texts route
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
router.use(auth);
router.get('/', (req, res) => res.json([]));
module.exports = router;
