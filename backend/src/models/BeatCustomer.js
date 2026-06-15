const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const BeatCustomer = sequelize.define('BeatCustomer', {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  beat_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'beats',
      key: 'id'
    }
  },
  customer_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'customers',
      key: 'id'
    }
  },
  sequence_number: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  visit_duration_minutes: {
    type: DataTypes.INTEGER,
    defaultValue: 30
  },
  is_mandatory: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  tableName: 'beat_customers',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = BeatCustomer;
