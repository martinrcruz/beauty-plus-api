// models/Purchase.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./User');

const Purchase = sequelize.define('Purchase', {
  id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
  amountInEuros: { type: DataTypes.FLOAT, allowNull: false },
  pointsAssigned: { type: DataTypes.INTEGER, allowNull: false },
  // Nuevos campos:
  purchaseDate: { type: DataTypes.DATEONLY, allowNull: true },
  invoiceNumber: { type: DataTypes.STRING, allowNull: true },
  observation: { type: DataTypes.TEXT, allowNull: true }
});

User.hasMany(Purchase, { foreignKey: 'userId' });
Purchase.belongsTo(User, { foreignKey: 'userId' });

module.exports = Purchase;
