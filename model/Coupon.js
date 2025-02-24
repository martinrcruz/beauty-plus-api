const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Coupon = sequelize.define('Coupon', {
  id: {
    type: DataTypes.INTEGER,
    autoIncrement: true,
    primaryKey: true
  },
  title: { type: DataTypes.STRING, allowNull: false },
  image: { type: DataTypes.STRING, allowNull: true },
  costInPoints: { type: DataTypes.INTEGER, allowNull: false },
  discountBlanco: { type: DataTypes.INTEGER, defaultValue: 0 },
  discountSilver: { type: DataTypes.INTEGER, defaultValue: 0 },
  discountGold: { type: DataTypes.INTEGER, defaultValue: 0 },
  discountPlatinum: { type: DataTypes.INTEGER, defaultValue: 0 },
  isHighlighted: { type: DataTypes.BOOLEAN, defaultValue: false },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true },
  productType: { type: DataTypes.STRING, allowNull: true },
  productDescription: { type: DataTypes.TEXT, allowNull: true },
  invoiceNumber: { type: DataTypes.STRING, allowNull: true },
  redemptionDate: { type: DataTypes.DATEONLY, allowNull: true },
  redeemCode: { type: DataTypes.STRING, allowNull: true },
  couponImage: { type: DataTypes.TEXT, allowNull: true } // guardará el QR code en formato base64
});

module.exports = Coupon;
