// SlimmingDietBack/models/DietGoal.js
const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class DietGoal extends Model {}

DietGoal.init({
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    carbs_goal: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    fats_goal: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    proteins_goal: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
}, {
    sequelize,
    modelName: 'diet_goals',
    timestamps: false, // 启用自动时间戳
    underscored: true, // 使用下划线命名法
});

module.exports = DietGoal;