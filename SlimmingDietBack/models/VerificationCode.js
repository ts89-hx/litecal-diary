// SlimmingDietBack/models/VerificationCode.js
const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class VerificationCode extends Model {}

VerificationCode.init({
    phone_number: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    code: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW, // 自动设置为当前时间
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW, // 自动设置为当前时间
  }
}, {
    sequelize,
    modelName: 'verification_codes',
    timestamps: false, // 启用自动时间戳
    underscored: true, // 使用下划线命名法
});

module.exports = VerificationCode;