// SlimmingDietBack/models/HealthyHabit.js
const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class HealthyHabit extends Model {}

HealthyHabit.init({
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    habit_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    days: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    active: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
}, {
    sequelize,
    modelName: 'healthy_habits',
    timestamps: false, // 启用自动时间戳
    underscored: true, // 使用下划线命名法
});

module.exports = HealthyHabit;