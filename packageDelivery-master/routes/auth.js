
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');

router.post('/signup',authController.postSignup);
router.post('/verify',authController.postVerify);
router.post('/login',authController.postLogin);
router.post('/loginverify',authController.postLoginVerify)


module.exports = router;