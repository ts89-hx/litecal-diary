const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/database');

class DietSelection extends Model {}

DietSelection.init({
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  calories: {
    type: DataTypes.FLOAT,
    allowNull: false
  },
  carbs: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  fats: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  proteins: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  category: {
    type: DataTypes.STRING,
    allowNull: false
  },
  default_portion_g: { type: DataTypes.FLOAT, allowNull: false, defaultValue: 100 },
  nutrition_source: { type: DataTypes.STRING, allowNull: true },
  nutrition_note: { type: DataTypes.TEXT, allowNull: true },
  catalog_key: { type: DataTypes.STRING, allowNull: true, unique: true },
  is_ready_to_eat: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  meal_types: { type: DataTypes.JSON, allowNull: true },
  aliases: { type: DataTypes.JSON, allowNull: true },
  serving_label: { type: DataTypes.STRING, allowNull: true },
  recognition_label: { type: DataTypes.STRING, allowNull: true },
  nutrition_method: { type: DataTypes.STRING, allowNull: true },
  source_url: { type: DataTypes.STRING(1024), allowNull: true },
  source_food_id: { type: DataTypes.STRING, allowNull: true },
  nutrition_evidence: { type: DataTypes.JSON, allowNull: true }
}, {
  sequelize,
  modelName: 'diet_selection',
  timestamps: false, // 启用自动时间戳
  underscored: true, // 使用下划线命名法
});

module.exports = DietSelection; 
