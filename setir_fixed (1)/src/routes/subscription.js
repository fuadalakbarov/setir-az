const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const { getSubscription, updateSubscription } = require('../controllers/subscriptionController');
router.use(auth);
router.get('/', getSubscription);
router.put('/', updateSubscription);
module.exports = router;
