const SportSelection = require('../models/sportSelection');

// 获取所有运动记录
exports.getAllSportRecords = async (req, res) => {
  try {
    const records = await SportSelection.findAll();
    res.json(records);
  } catch (err) {
    console.error('Error fetching sport records:', err.message);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
};

// 创建新运动记录
exports.createSportRecord = async (req, res) => {
  const { name, calories, category } = req.body;
  try {
    const newRecord = await SportSelection.create({ name, calories, category });
    res.json({ success: true, record: newRecord });
  } catch (err) {
    console.error('Error creating sport record:', err.message);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
};

// 更新运动记录
exports.updateSportRecord = async (req, res) => {
  const { id } = req.params;
  const { name, calories, category } = req.body;
  try {
    const record = await SportSelection.findByPk(id);
    if (!record) {
      return res.status(404).json({ success: false, message: '记录未找到' });
    }
    await record.update({ name, calories, category });
    res.json({ success: true, record });
  } catch (err) {
    console.error('Error updating sport record:', err.message);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
};

// 删除运动记录
exports.deleteSportRecord = async (req, res) => {
  const { id } = req.params;
  try {
    const record = await SportSelection.findByPk(id);
    if (!record) {
      return res.status(404).json({ success: false, message: '记录未找到' });
    }
    await record.destroy();
    res.json({ success: true, message: '记录已删除' });
  } catch (err) {
    console.error('Error deleting sport record:', err.message);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
}; 