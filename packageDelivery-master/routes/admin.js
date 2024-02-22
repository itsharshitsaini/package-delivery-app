const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin');

router.get('/list',adminController.getAllProductsList);
router.post('/modify',adminController.modifyProductStatus);
/// generates paymnet link 
router.post('/payment',adminController.generateLink)

module.exports = router;