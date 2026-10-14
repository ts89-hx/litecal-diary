const express = require('express');
const { sendVerificationCode, verifyAndLogin, wechatLogin } = require('../controllers/authController');
const { demoLogin } = require('../controllers/mvpController');
const router = express.Router();

router.post('/sendVerificationCode', sendVerificationCode);
router.post('/login', verifyAndLogin);
router.post('/wechat', wechatLogin);
router.post('/demo', demoLogin);
module.exports = router; 
