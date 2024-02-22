const express = require('express');
const router = express.Router();
const driverController = require('../controllers/driver');

router.post('/update',driverController.modifyStatus);
router.get('/update',driverController.getOrder);

module.exports = router;