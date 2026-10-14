// SlimmingDietBack/models/User.js
const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database'); // 确保路径正确

class User extends Model {}

User.init({
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true
    },
    avatar: {
        type: DataTypes.STRING,
        allowNull: true
    },
    password: {
        type: DataTypes.STRING,
        allowNull: true,
        defaultValue: ''
    },
    height: {
        type: DataTypes.FLOAT,
        allowNull: true
    },
    gender: {
        type: DataTypes.ENUM('male', 'female'),
        allowNull: true
    },
    age: {
        type: DataTypes.INTEGER,
        allowNull: true
    },
    target: {
        type: DataTypes.ENUM('lose_weight', 'gain_weight', 'lose_fat', 'gain_muscle'),
        allowNull: true
    },
    activity_level: {
        type: DataTypes.ENUM('sedentary', 'light', 'regular', 'intense'),
        allowNull: true
    },
    wechat_open_id: {
        type: DataTypes.STRING,
        allowNull: true,
        unique: true
    }
}, {
    sequelize,
    modelName: 'users',
    timestamps: false, // 启用自动时间戳
    underscored: true, // 使用下划线命名法
});

module.exports = User;