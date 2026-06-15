const { Sequelize } = require('sequelize');
const path = require('path');
const logger = require('../utils/logger');
require('dotenv').config();

// Validate required environment variables
const requiredEnvVars = ['JWT_SECRET', 'JWT_REFRESH_SECRET'];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
  logger.error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
  throw new Error(`Missing required environment variables: ${missingEnvVars.join(', ')}`);
}

const dbPath = process.env.DB_PATH || path.join(process.cwd(), 'database.sqlite');
logger.info('[DATABASE CONFIG] Database path:', dbPath);
logger.info('[DATABASE CONFIG] Current working directory:', process.cwd());

const sequelize = new Sequelize(
  process.env.DB_NAME || 'fieldforce_pro',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || '',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: process.env.DB_DIALECT || 'sqlite',
    storage: process.env.DB_DIALECT === 'sqlite' ? dbPath : undefined,
    logging: false,
    pool: {
      max: 20,
      min: 5,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: false,
      createdAt: 'created_at',
      updatedAt: 'updated_at'
    }
  }
);

// Test connection
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    logger.info('Database connection established successfully');
    return true;
  } catch (error) {
    logger.error('Unable to connect to the database:', error);
    return false;
  }
};

module.exports = sequelize;
module.exports.testConnection = testConnection;
