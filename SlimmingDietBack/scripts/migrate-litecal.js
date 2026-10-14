require('dotenv').config();
const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');
const UserPlan = require('../models/UserPlan');
const SportSelection = require('../models/sportSelection');
const { migrateFoodCatalog } = require('./migrate-food-catalog');

const SPORT_SEEDS = [
    ['walk', '步行', '日常活动', 3.3],
    ['brisk_walk', '快走', '有氧运动', 4.3],
    ['jog', '慢跑', '有氧运动', 7.0],
    ['swim', '游泳', '有氧运动', 6.0],
    ['cycling', '骑行', '有氧运动', 6.8],
    ['rope', '跳绳', '有氧运动', 10.0],
    ['tennis', '网球', '球类运动', 7.3],
    ['strength', '力量训练', '力量训练', 5.0],
];

async function addMissingColumns(table, definitions) {
    const queryInterface = sequelize.getQueryInterface();
    const current = await queryInterface.describeTable(table);
    for (const [column, definition] of Object.entries(definitions)) {
        if (!current[column]) await queryInterface.addColumn(table, column, definition);
    }
}

async function run() {
    await sequelize.authenticate();
    await UserPlan.sync();
    await addMissingColumns('diet_records', {
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
    });
    await addMissingColumns('sport_records', {
        activity_key: { type: DataTypes.STRING, allowNull: true },
        met: { type: DataTypes.FLOAT, allowNull: true },
        duration_seconds: { type: DataTypes.INTEGER, allowNull: false, defaultValue: 0 },
        started_at: { type: DataTypes.DATE, allowNull: true },
        ended_at: { type: DataTypes.DATE, allowNull: true },
    });
    await addMissingColumns('diet_selections', {
        default_portion_g: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 100 },
        nutrition_source: { type: DataTypes.STRING, allowNull: true },
        nutrition_note: { type: DataTypes.TEXT, allowNull: true },
    });
    await migrateFoodCatalog();
    await addMissingColumns('sport_selections', {
        activity_key: { type: DataTypes.STRING, allowNull: true },
        met: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 3.5 },
    });
    await sequelize.query("ALTER TABLE diet_records MODIFY meal_type ENUM('早餐','午餐','晚餐','加餐','breakfast','lunch','dinner','snack') NOT NULL");
    await sequelize.query("UPDATE diet_records SET meal_type = CASE meal_type WHEN '早餐' THEN 'breakfast' WHEN '午餐' THEN 'lunch' WHEN '晚餐' THEN 'dinner' WHEN '加餐' THEN 'snack' ELSE meal_type END");
    await sequelize.query("ALTER TABLE diet_records MODIFY meal_type ENUM('breakfast','lunch','dinner','snack') NOT NULL");
    await sequelize.query('UPDATE sport_records SET duration_seconds = duration * 60 WHERE duration_seconds = 0 AND duration > 0');
    for (const [activityKey, name, category, met] of SPORT_SEEDS) {
        const calories = Math.round(met * 3.5 * 60 / 200 * 30);
        const existing = await SportSelection.findOne({ where: { activity_key: activityKey } });
        if (existing) await existing.update({ name, category, met, calories });
        else await SportSelection.create({ activity_key: activityKey, name, category, met, calories });
    }
    console.log('轻卡日记数据库迁移完成');
}

run().catch(error => {
    console.error('迁移失败:', error.message);
    process.exitCode = 1;
}).finally(() => sequelize.close());
