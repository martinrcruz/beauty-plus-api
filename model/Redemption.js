// models/Redemption.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');
const Coupon = require('./Coupon');

const Redemption = sequelize.define('Redemption', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  status: { type: DataTypes.STRING, defaultValue: 'pending' },
  redeemCode: { type: DataTypes.STRING, allowNull: true },
  qrCodeImage: { type: DataTypes.STRING, allowNull: true }
}, {
  indexes: [
    {
      unique: true,
      fields: ['userId', 'couponId']
    }
  ]
});

User.hasMany(Redemption, { foreignKey: 'userId' });
Redemption.belongsTo(User, { foreignKey: 'userId' });

Coupon.hasMany(Redemption, { foreignKey: 'couponId' });
Redemption.belongsTo(Coupon, { foreignKey: 'couponId' });

module.exports = Redemption;
