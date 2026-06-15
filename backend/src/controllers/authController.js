const authService = require('../services/authService');
const { body, validationResult } = require('express-validator');
const logger = require('../utils/logger');

class AuthController {
  register = [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('first_name').notEmpty().withMessage('First name is required'),
    body('last_name').notEmpty().withMessage('Last name is required'),
    async (req, res) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array()
          });
        }

        const deviceInfo = {
          device_id: req.headers['device-id'],
          device_type: req.headers['device-type'],
          device_os: req.headers['device-os'],
          app_version: req.headers['app-version'],
          ip_address: req.ip,
          user_agent: req.headers['user-agent']
        };

        const result = await authService.register({ ...req.body, ...deviceInfo });

        res.status(201).json({
          success: true,
          message: 'Registration successful',
          data: result
        });
      } catch (error) {
        logger.error('Register controller error:', error);
        res.status(400).json({
          success: false,
          message: error.message || 'Registration failed'
        });
      }
    }
  ];

  login = [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
    async (req, res) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array()
          });
        }

        const deviceInfo = {
          device_id: req.headers['device-id'],
          device_type: req.headers['device-type'],
          device_os: req.headers['device-os'],
          app_version: req.headers['app-version'],
          ip_address: req.ip,
          user_agent: req.headers['user-agent']
        };

        const result = await authService.login(req.body.email, req.body.password, deviceInfo);

        res.status(200).json({
          success: true,
          message: 'Login successful',
          data: result
        });
      } catch (error) {
        logger.error('Login controller error:', error);
        res.status(401).json({
          success: false,
          message: error.message || 'Login failed'
        });
      }
    }
  ];

  logout = async (req, res) => {
    try {
      const deviceId = req.headers['device-id'];
      await authService.logout(req.user.id, deviceId);

      res.status(200).json({
        success: true,
        message: 'Logout successful'
      });
    } catch (error) {
      logger.error('Logout controller error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Logout failed'
      });
    }
  };

  refreshToken = [
    body('refreshToken').notEmpty().withMessage('Refresh token is required'),
    async (req, res) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array()
          });
        }

        const result = await authService.refreshAccessToken(req.body.refreshToken);

        res.status(200).json({
          success: true,
          message: 'Token refreshed successfully',
          data: result
        });
      } catch (error) {
        logger.error('Refresh token controller error:', error);
        res.status(401).json({
          success: false,
          message: error.message || 'Token refresh failed'
        });
      }
    }
  ];

  verifyEmail = [
    body('token').notEmpty().withMessage('Token is required'),
    async (req, res) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array()
          });
        }

        const result = await authService.verifyEmail(req.body.token);

        res.status(200).json({
          success: true,
          message: result.message
        });
      } catch (error) {
        logger.error('Verify email controller error:', error);
        res.status(400).json({
          success: false,
          message: error.message || 'Email verification failed'
        });
      }
    }
  ];

  sendPasswordReset = [
    body('email').isEmail().withMessage('Valid email is required'),
    async (req, res) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array()
          });
        }

        const result = await authService.sendPasswordResetEmail(req.body.email);

        res.status(200).json({
          success: true,
          message: result.message
        });
      } catch (error) {
        logger.error('Send password reset controller error:', error);
        res.status(400).json({
          success: false,
          message: error.message || 'Failed to send password reset email'
        });
      }
    }
  ];

  resetPassword = [
    body('token').notEmpty().withMessage('Token is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    async (req, res) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array()
          });
        }

        const result = await authService.resetPassword(req.body.token, req.body.newPassword);

        res.status(200).json({
          success: true,
          message: result.message
        });
      } catch (error) {
        logger.error('Reset password controller error:', error);
        res.status(400).json({
          success: false,
          message: error.message || 'Password reset failed'
        });
      }
    }
  ];

  changePassword = [
    body('currentPassword').notEmpty().withMessage('Current password is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    async (req, res) => {
      try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array()
          });
        }

        const result = await authService.changePassword(
          req.user.id,
          req.body.currentPassword,
          req.body.newPassword
        );

        res.status(200).json({
          success: true,
          message: result.message
        });
      } catch (error) {
        logger.error('Change password controller error:', error);
        res.status(400).json({
          success: false,
          message: error.message || 'Password change failed'
        });
      }
    }
  ];

  getProfile = async (req, res) => {
    try {
      const { User } = require('../models');
      
      const user = await User.findByPk(req.user.id, {
        attributes: { exclude: ['password_hash'] },
        include: [
          { model: require('../models').Company, as: 'company' }
        ]
      });

      res.status(200).json({
        success: true,
        data: { user }
      });
    } catch (error) {
      logger.error('Get profile controller error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get profile'
      });
    }
  };

  updateProfile = async (req, res) => {
    try {
      const { User } = require('../models');
      
      const user = await User.findByPk(req.user.id);
      
      const allowedFields = ['first_name', 'last_name', 'phone', 'profile_photo_url', 'address', 'city', 'state', 'country', 'postal_code', 'emergency_contact_name', 'emergency_contact_phone'];
      
      allowedFields.forEach(field => {
        if (req.body[field] !== undefined) {
          user[field] = req.body[field];
        }
      });

      await user.save();

      res.status(200).json({
        success: true,
        message: 'Profile updated successfully',
        data: { user: user.toJSON() }
      });
    } catch (error) {
      logger.error('Update profile controller error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to update profile'
      });
    }
  };

  getSessions = async (req, res) => {
    try {
      const sessions = await authService.getActiveSessions(req.user.id);

      res.status(200).json({
        success: true,
        data: { sessions }
      });
    } catch (error) {
      logger.error('Get sessions controller error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get sessions'
      });
    }
  };

  revokeSession = async (req, res) => {
    try {
      const { Session } = require('../models');
      
      await Session.update(
        { is_active: false },
        { where: { id: req.params.sessionId, user_id: req.user.id } }
      );

      res.status(200).json({
        success: true,
        message: 'Session revoked successfully'
      });
    } catch (error) {
      logger.error('Revoke session controller error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to revoke session'
      });
    }
  };
}

module.exports = new AuthController();
