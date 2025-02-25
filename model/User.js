// models/User.js
const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const User = sequelize.define('User', {
  id: {
    type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true
  },
  fullName: {
    type: DataTypes.STRING, allowNull: false
  },
  dni: {
    type: DataTypes.STRING, allowNull: true
  },
  phone: {
    type: DataTypes.STRING, allowNull: true
  },
  dateOfBirth: {
    type: DataTypes.DATEONLY, allowNull: true  
  },
  address: {
    type: DataTypes.STRING, allowNull: true 
  },
  avatar: {
    type: DataTypes.STRING, allowNull: true 
  },
  qrCodeImage: {
    type: DataTypes.STRING,
    allowNull: true
  },
  email: {
    type: DataTypes.STRING, allowNull: false, unique: true
  },
  password: {
    type: DataTypes.STRING, allowNull: false
  },
  role: {
    type: DataTypes.ENUM('client', 'receptionist', 'admin'),
    defaultValue: 'client'
  },
  points: {
    type: DataTypes.INTEGER, defaultValue: 0
  },
  level: {
    type: DataTypes.ENUM('Blanco', 'Silver', 'Gold', 'Platinum'),
    defaultValue: 'Blanco'
  }
});

module.exports = User;
