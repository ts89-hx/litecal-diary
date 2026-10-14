// SlimmingDietBack/models/DietRecord.js
const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class DietRecord extends Model {}

DietRecord.init({
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    meal_type: {
        type: DataTypes.ENUM('breakfast', 'lunch', 'dinner', 'snack'),
        allowNull: false,
    },
    food_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    calories: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    portion_g: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 100 },
    plate_portion_g: { type: DataTypes.FLOAT, allowNull: true },
    consumed_percent: { type: DataTypes.FLOAT, allowNull: true },
    reference_portion_g: { type: DataTypes.FLOAT, allowNull: true },
    portion_basis: { type: DataTypes.STRING, allowNull: true },
    nutrition_source: { type: DataTypes.STRING, allowNull: true },
    nutrition_snapshot: { type: DataTypes.JSON, allowNull: true },
    calories_per_100g: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 0 },
    source: { type: DataTypes.STRING, allowNull: false, defaultValue: 'manual' },
    confidence: { type: DataTypes.FLOAT, allowNull: true },
    carbs: {
        type: DataTypes.FLOAT,
        allowNull: true,
        defaultValue: 0,
    },
    fats: {
        type: DataTypes.FLOAT,
        allowNull: true,
        defaultValue: 0,
    },
    proteins: {
        type: DataTypes.FLOAT,
        allowNull: true,
        defaultValue: 0,
    },
    record_time: {
        type: DataTypes.DATE,
        allowNull: false,
    },
}, {
    sequelize,
    modelName: 'diet_records',
    timestamps: false, // 启用自动时间戳
    underscored: true, // 使用下划线命名法
});

module.exports = DietRecord;
