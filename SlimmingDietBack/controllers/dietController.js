const { Op } = require('sequelize');
const DietSelection = require('../models/dietSelection');

// 获取所有饮食记录
exports.getAllDietRecords = async (req, res) => {
  try {
    const records = await DietSelection.findAll();
    res.json(records);
  } catch (err) {
    console.error('Error fetching diet records:', err.message);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
};

// 模糊查询饮食记录
exports.searchDietRecords = async (req, res) => {
  const { query } = req.query;
  try {
    const records = await DietSelection.findAll({
      where: {
        name: {
          [Op.like]: `%${query}%`
        }
      }
    });
    res.json(records);
  } catch (err) {
    console.error('Error searching diet records:', err.message);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
};

// 创建新饮食记录
exports.createDietRecord = async (req, res) => {
  const { name, calories, carbs, fats, proteins, category } = req.body;
  try {
    const newRecord = await DietSelection.create({ name, calories, carbs, fats, proteins, category });
    res.json({ success: true, record: newRecord });
  } catch (err) {
    console.error('Error creating diet record:', err.message);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
};

// 更新饮食记录
exports.updateDietRecord = async (req, res) => {
  const { id } = req.params;
  const { name, calories, carbs, fats, proteins, category } = req.body;
  try {
    const record = await DietSelection.findByPk(id);
    if (!record) {
      return res.status(404).json({ success: false, message: '记录未找到' });
    }
    await record.update({ name, calories, carbs, fats, proteins, category });
    res.json({ success: true, record });
  } catch (err) {
    console.error('Error updating diet record:', err.message);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
};

// 删除饮食记录
exports.deleteDietRecord = async (req, res) => {
  const { id } = req.params;
  try {
    const record = await DietSelection.findByPk(id);
    if (!record) {
      return res.status(404).json({ success: false, message: '记录未找到' });
    }
    await record.destroy();
    res.json({ success: true, message: '记录已删除' });
  } catch (err) {
    console.error('Error deleting diet record:', err.message);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
}; 