const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const { login, getMe, logout, changePassword } = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/login', [
  body('email').isEmail().withMessage('Valid email required'),
  body('password').notEmpty().withMessage('Password required')
], login);

router.get('/me', protect, getMe);
router.post('/logout', protect, logout);
router.put('/change-password', protect, changePassword);

module.exports = router;
