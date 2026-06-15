const nodemailer = require('nodemailer');
const twilio = require('twilio');
const admin = require('firebase-admin');
const logger = require('../utils/logger');

// Email transporter
const emailTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  }
});

// Twilio client (initialize if credentials are provided)
let twilioClient;
if (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN) {
  twilioClient = twilio(
    process.env.TWILIO_ACCOUNT_SID,
    process.env.TWILIO_AUTH_TOKEN
  );
}

// Firebase admin (initialize if credentials are provided)
let firebaseApp;
if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_PRIVATE_KEY) {
  try {
    const serviceAccount = {
      project_id: process.env.FIREBASE_PROJECT_ID,
      private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      client_email: process.env.FIREBASE_CLIENT_EMAIL
    };
    
    firebaseApp = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  } catch (error) {
    logger.error('Firebase initialization error:', error);
  }
}

class NotificationService {
  async sendEmail({ to, subject, html, text }) {
    try {
      const info = await emailTransporter.sendMail({
        from: process.env.SMTP_FROM || 'FieldForce Pro <noreply@fieldforcepro.com>',
        to,
        subject,
        html,
        text
      });

      logger.info(`Email sent to ${to}: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      logger.error('Send email error:', error);
      throw error;
    }
  }

  async sendSMS(to, message) {
    try {
      if (!twilioClient) {
        logger.warn('Twilio not initialized, skipping SMS');
        return { success: false, message: 'Twilio not initialized' };
      }

      const response = await twilioClient.messages.create({
        body: message,
        from: process.env.TWILIO_PHONE_NUMBER,
        to
      });

      logger.info(`SMS sent to ${to}: ${response.sid}`);
      return { success: true, sid: response.sid };
    } catch (error) {
      logger.error('Send SMS error:', error);
      throw error;
    }
  }

  async sendPushNotification(deviceToken, notification) {
    try {
      if (!firebaseApp) {
        logger.warn('Firebase not initialized, skipping push notification');
        return { success: false, message: 'Firebase not initialized' };
      }

      const message = {
        token: deviceToken,
        notification: {
          title: notification.title,
          body: notification.body
        },
        data: notification.data || {}
      };

      const response = await admin.messaging().send(message);
      logger.info(`Push notification sent: ${response}`);
      return { success: true, response };
    } catch (error) {
      logger.error('Send push notification error:', error);
      throw error;
    }
  }

  async sendBulkPushNotification(deviceTokens, notification) {
    try {
      if (!firebaseApp) {
        logger.warn('Firebase not initialized, skipping bulk push notification');
        return { success: false, message: 'Firebase not initialized' };
      }

      const message = {
        tokens: deviceTokens,
        notification: {
          title: notification.title,
          body: notification.body
        },
        data: notification.data || {}
      };

      const response = await admin.messaging().sendMulticast(message);
      logger.info(`Bulk push notification sent: ${response.successCount} successful`);
      return { success: true, response };
    } catch (error) {
      logger.error('Send bulk push notification error:', error);
      throw error;
    }
  }

  async sendInAppNotification(userId, notificationData) {
    try {
      const { Notification } = require('../models');
      
      const notification = await Notification.create({
        user_id: userId,
        company_id: notificationData.company_id,
        type: notificationData.type,
        title: notificationData.title,
        message: notificationData.message,
        data: notificationData.data || {},
        channels: notificationData.channels || ['in_app']
      });

      // Emit via Socket.IO if available
      if (global.io) {
        global.io.to(`user-${userId}`).emit('new-notification', notification);
      }

      logger.info(`In-app notification sent to user ${userId}`);
      return { success: true, notification };
    } catch (error) {
      logger.error('Send in-app notification error:', error);
      throw error;
    }
  }
}

module.exports = new NotificationService();
