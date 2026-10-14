const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class DietData extends Model {}

DietData.init({
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        unique: true,
    },
    total_calories: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    remaining_calories: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    record_time: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    }
}, {
    sequelize,
    modelName: 'diet_data',
    timestamps: false,
    underscored: true,
});

module.exports = DietData; 