// SlimmingDietBack/models/SportRecord.js
const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class SportRecord extends Model {}

SportRecord.init({
    user_id: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    activity_name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    activity_key: { type: DataTypes.STRING, allowNull: true },
    met: { type: DataTypes.FLOAT, allowNull: true },
    calories: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    duration: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    duration_seconds: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
    started_at: { type: DataTypes.DATE, allowNull: true },
    ended_at: { type: DataTypes.DATE, allowNull: true },
    record_time: {
        type: DataTypes.DATE,
        allowNull: false,
    },
    time_of_day: {
        type: DataTypes.STRING,
        allowNull: false,
    },
}, {
    sequelize,
    modelName: 'sport_records',
    timestamps: false, // 启用自动时间戳
    underscored: true, // 使用下划线命名法
});

module.exports = SportRecord;
