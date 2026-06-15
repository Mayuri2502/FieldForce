const jwt = require('jsonwebtoken');
const { User } = require('../models');
const logger = require('../utils/logger');

const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Authentication token required'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    const user = await User.findByPk(decoded.id, {
      attributes: { exclude: ['password_hash'] }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'User not found'
      });
    }

    if (!user.is_active || user.is_deleted) {
      return res.status(401).json({
        success: false,
        message: 'User account is inactive or deleted'
      });
    }

    req.user = user;
    req.companyId = user.company_id;
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'You do not have permission to perform this action'
      });
    }
    next();
  };
};

const checkCompanyAccess = async (req, res, next) => {
  try {
    if (req.user.role === 'super_admin') {
      return next();
    }

    if (req.user.company_id !== req.companyId) {
      return res.status(403).json({
        success: false,
        message: 'You do not have access to this company'
      });
    }

    next();
  } catch (error) {
    logger.error('Company access check error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking company access'
    });
  }
};

module.exports = { authenticate, authorize, checkCompanyAccess };
