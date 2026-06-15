const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const { authRateLimiter } = require('../middleware/rateLimiter');

// Public routes
router.post('/register', authRateLimiter, authController.register);
router.post('/login', authRateLimiter, authController.login);
router.post('/refresh-token', authRateLimiter, authController.refreshToken);
router.post('/verify-email', authController.verifyEmail);
router.post('/send-password-reset', authRateLimiter, authController.sendPasswordReset);
router.post('/reset-password', authController.resetPassword);

// Protected routes
router.use(authenticate);
router.post('/logout', authController.logout);
router.post('/change-password', authController.changePassword);
router.get('/profile', authController.getProfile);
router.put('/profile', authController.updateProfile);
router.get('/sessions', authController.getSessions);
router.delete('/sessions/:sessionId', authController.revokeSession);

module.exports = router;
