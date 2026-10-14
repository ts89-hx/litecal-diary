const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class SportSelection extends Model {}

SportSelection.init({
  activity_key: { type: DataTypes.STRING, allowNull: true, unique: true },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  calories: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false
  },
  met: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 3.5 }
}, {
  sequelize,
  modelName: 'sport_selection',
  timestamps: false, // 启用自动时间戳
  underscored: true, // 使用下划线命名法
});

module.exports = SportSelection; 
