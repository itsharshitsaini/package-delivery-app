// get order details 

// set status payment pending 

const express = require('express');
const router = express.Router();
const driverController = require('../controllers/driver');

// /driver/update
router.post('/update',driverController.modifyStatus);


// /driver/

router.get('/update',driverController.getOrder);

module.exports = router;