const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin');
const isAuth = require(`../middleware/is-auth`)


//  /admin/list
router.get('/list',adminController.getAllProductsList);

router.post('/modify',adminController.modifyProductStatus);

// /admin/generate 
/// generates paymnet link 

router.post('/payment',adminController.generateLink)

module.exports = router;