const jwt = require('jsonwebtoken');
const { User, Session, Company } = require('../models');
const sequelize = require('../config/database');
const logger = require('../utils/logger');
const { sendEmail, sendSMS } = require('./notificationService');

class AuthService {
  generateTokens(user) {
    const accessToken = jwt.sign(
      { id: user.id, email: user.email, role: user.role, company_id: user.company_id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    const refreshToken = jwt.sign(
      { id: user.id },
      process.env.JWT_REFRESH_SECRET,
      { expiresIn: process.env.JWT_REFRESH_EXPIRE || '30d' }
    );

    return { accessToken, refreshToken };
  }

  async register(data) {
    const transaction = await sequelize.transaction();
    try {
      const { email, password, company_name, ...userData } = data;

      // Check if user already exists
      const existingUser = await User.findOne({ where: { email }, transaction });
      if (existingUser) {
        throw new Error('User with this email already exists');
      }

      // Create company if not provided (for new company registration)
      let companyId = userData.company_id;
      if (!companyId && company_name) {
        const company = await Company.create({
          name: company_name,
          subscription_status: 'trial',
          subscription_start_date: new Date(),
          subscription_end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days trial
        }, { transaction });
        companyId = company.id;
      }

      // Create user
      const user = new User();
      user.email = email;
      await user.hashPassword(password);
      Object.assign(user, userData);
      user.company_id = companyId;
      await user.save({ transaction });

      // Generate tokens
      const tokens = this.generateTokens(user);

      // Create session
      await Session.create({
        user_id: user.id,
        device_id: data.device_id,
        device_type: data.device_type,
        device_os: data.device_os,
        app_version: data.app_version,
        ip_address: data.ip_address,
        user_agent: data.user_agent,
        refresh_token: tokens.refreshToken,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }, { transaction });

      await transaction.commit();

      // Send verification email (outside transaction)
      if (!user.email_verified) {
        await this.sendVerificationEmail(user);
      }

      logger.info(`User registered: ${user.email}`);
      return { user: user.toJSON(), tokens };
    } catch (error) {
      await transaction.rollback();
      logger.error('Registration error:', error);
      throw error;
    }
  }

  async login(email, password, deviceInfo = {}) {
    const transaction = await sequelize.transaction();
    try {
      const user = await User.findOne({
        where: { email, is_deleted: false },
        include: [{ model: Company, as: 'company' }],
        transaction
      });

      if (!user) {
        logger.warn(`Login attempt failed: User not found for email: ${email}`);
        throw new Error('Invalid credentials');
      }

      const isPasswordValid = await user.comparePassword(password);

      if (!isPasswordValid) {
        logger.warn(`Login attempt failed: Invalid password for email: ${email}`);
        throw new Error('Invalid credentials');
      }

      if (!user.is_active) {
        logger.warn(`Login attempt failed: Account inactive for email: ${email}`);
        throw new Error('Account is inactive');
      }

      // Update last login
      user.last_login_at = new Date();
      user.last_login_ip = deviceInfo.ip_address;
      user.device_info = deviceInfo;
      await user.save({ transaction });

      // Generate tokens
      const tokens = this.generateTokens(user);

      // Create session
      await Session.create({
        user_id: user.id,
        device_id: deviceInfo.device_id,
        device_type: deviceInfo.device_type,
        device_os: deviceInfo.device_os,
        app_version: deviceInfo.app_version,
        ip_address: deviceInfo.ip_address,
        user_agent: deviceInfo.user_agent,
        refresh_token: tokens.refreshToken,
        expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
      }, { transaction });

      await transaction.commit();

      logger.info(`User logged in: ${user.email}`);
      return { user: user.toJSON(), tokens };
    } catch (error) {
      await transaction.rollback();
      logger.error('Login error:', error);
      throw error;
    }
  }

  async logout(userId, deviceId = null) {
    try {
      const where = { user_id: userId, is_active: true };
      if (deviceId) {
        where.device_id = deviceId;
      }

      await Session.update(
        { is_active: false },
        { where }
      );

      logger.info(`User logged out: ${userId}`);
      return { message: 'Logged out successfully' };
    } catch (error) {
      logger.error('Logout error:', error);
      throw error;
    }
  }

  async refreshAccessToken(refreshToken) {
    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
      
      const session = await Session.findOne({
        where: {
          refresh_token: refreshToken,
          user_id: decoded.id,
          is_active: true,
          expires_at: { [require('sequelize').Op.gt]: new Date() }
        }
      });

      if (!session) {
        throw new Error('Invalid or expired refresh token');
      }

      const user = await User.findByPk(decoded.id);
      if (!user || !user.is_active) {
        throw new Error('User not found or inactive');
      }

      const tokens = this.generateTokens(user);

      // Update session with new refresh token
      session.refresh_token = tokens.refreshToken;
      await session.save();

      return { tokens };
    } catch (error) {
      logger.error('Token refresh error:', error);
      throw error;
    }
  }

  async sendVerificationEmail(user) {
    try {
      const verificationToken = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      const verificationUrl = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

      await sendEmail({
        to: user.email,
        subject: 'Verify Your Email - FieldForce Pro',
        html: `
          <h2>Welcome to FieldForce Pro!</h2>
          <p>Please verify your email address by clicking the link below:</p>
          <a href="${verificationUrl}">Verify Email</a>
          <p>This link will expire in 24 hours.</p>
        `
      });

      logger.info(`Verification email sent to: ${user.email}`);
    } catch (error) {
      logger.error('Send verification email error:', error);
      throw error;
    }
  }

  async verifyEmail(token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      const user = await User.findByPk(decoded.id);
      if (!user) {
        throw new Error('User not found');
      }

      user.email_verified = true;
      await user.save();

      logger.info(`Email verified: ${user.email}`);
      return { message: 'Email verified successfully' };
    } catch (error) {
      logger.error('Email verification error:', error);
      throw error;
    }
  }

  async sendPasswordResetEmail(email) {
    try {
      const user = await User.findOne({ where: { email } });
      if (!user) {
        throw new Error('User not found');
      }

      const resetToken = jwt.sign(
        { id: user.id, email: user.email },
        process.env.JWT_SECRET,
        { expiresIn: '1h' }
      );

      const resetUrl = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

      await sendEmail({
        to: user.email,
        subject: 'Reset Your Password - FieldForce Pro',
        html: `
          <h2>Password Reset Request</h2>
          <p>You requested a password reset. Click the link below to reset your password:</p>
          <a href="${resetUrl}">Reset Password</a>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this, please ignore this email.</p>
        `
      });

      logger.info(`Password reset email sent to: ${user.email}`);
      return { message: 'Password reset email sent' };
    } catch (error) {
      logger.error('Send password reset email error:', error);
      throw error;
    }
  }

  async resetPassword(token, newPassword) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      
      const user = await User.findByPk(decoded.id);
      if (!user) {
        throw new Error('User not found');
      }

      await user.hashPassword(newPassword);
      await user.save();

      // Invalidate all sessions
      await Session.update(
        { is_active: false },
        { where: { user_id: user.id } }
      );

      logger.info(`Password reset for: ${user.email}`);
      return { message: 'Password reset successfully' };
    } catch (error) {
      logger.error('Password reset error:', error);
      throw error;
    }
  }

  async changePassword(userId, currentPassword, newPassword) {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const isPasswordValid = await user.comparePassword(currentPassword);
      if (!isPasswordValid) {
        throw new Error('Current password is incorrect');
      }

      await user.hashPassword(newPassword);
      await user.save();

      // Invalidate all sessions for security
      await Session.update(
        { is_active: false },
        { where: { user_id: userId } }
      );

      logger.info(`Password changed for: ${user.email}`);
      return { message: 'Password changed successfully. Please login again.' };
    } catch (error) {
      logger.error('Change password error:', error);
      throw error;
    }
  }

  async getActiveSessions(userId) {
    try {
      const sessions = await Session.findAll({
        where: {
          user_id: userId,
          is_active: true,
          expires_at: { [require('sequelize').Op.gt]: new Date() }
        },
        order: [['created_at', 'DESC']]
      });

      return sessions;
    } catch (error) {
      logger.error('Get active sessions error:', error);
      throw error;
    }
  }
}

module.exports = new AuthService();
