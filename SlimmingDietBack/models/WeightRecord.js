// SlimmingDietBack/models/WeightRecord.js
const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class WeightRecord extends Model {}

WeightRecord.init({
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    current_weight: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    initial_weight: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    target_weight: {
        type: DataTypes.FLOAT,
        allowNull: false,
    },
    record_time: {
        type: DataTypes.DATE,
        allowNull: false,
    },
}, {
    sequelize,
    modelName: 'weight_records',
    timestamps: false, // 启用自动时间戳
    underscored: true, // 使用下划线命名法
});

module.exports = WeightRecord;