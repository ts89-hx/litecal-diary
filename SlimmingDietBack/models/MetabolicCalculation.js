// SlimmingDietBack/models/MetabolicCalculation.js
const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class MetabolicCalculation extends Model {}

MetabolicCalculation.init({
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    bmr: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    bmi: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    body_fat_percentage: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    recommended_calories: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    recommended_carbs: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    recommended_proteins: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    recommended_fats: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    calculation_time: {
        type: DataTypes.DATE,
        allowNull: false,
    },
}, {
    sequelize,
    modelName: 'metabolic_calculations',
    timestamps: false, // 启用自动时间戳
    underscored: true, // 使用下划线命名法
});

module.exports = MetabolicCalculation;