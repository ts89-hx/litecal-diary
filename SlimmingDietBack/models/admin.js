const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class Admin extends Model {}

Admin.init({
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false
  }
}, {
  sequelize,
  modelName: 'admin_users',
  timestamps: false,
  underscored: true,
});

module.exports = Admin; 