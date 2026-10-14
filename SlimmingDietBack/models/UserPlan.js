const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class UserPlan extends Model {}

UserPlan.init({
    user_id: { type: DataTypes.INTEGER, allowNull: false, unique: true },
    start_weight: { type: DataTypes.FLOAT, allowNull: false },
    target_weight: { type: DataTypes.FLOAT, allowNull: false },
    plan_days: { type: DataTypes.INTEGER, allowNull: false },
    start_date: { type: DataTypes.DATEONLY, allowNull: false },
    bmr: { type: DataTypes.FLOAT, allowNull: false },
    maintenance_calories: { type: DataTypes.FLOAT, allowNull: false },
    daily_calorie_target: { type: DataTypes.FLOAT, allowNull: false },
    planned_daily_deficit: { type: DataTypes.FLOAT, allowNull: false },
}, {
    sequelize,
    modelName: 'user_plans',
    tableName: 'user_plans',
    timestamps: true,
    underscored: true,
});

module.exports = UserPlan;
