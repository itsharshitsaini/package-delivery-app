
const express = require('express');
const router = express.Router();
const productController = require('../controllers/products');

router.post('/add',productController.addProduct);
router.get('/list',productController.getOrdersList);
router.post('/location',productController.getLocation);
router.post('/feedback',productController.postFeedback);



module.exports = router;
