const User = require('../models/user');
const path = require('path');
const fs = require('fs');

// 获取所有用户
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.findAll();
    res.json(users);
  } catch (err) {
    console.error('Error fetching users:', err.message);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
};

// 创建新用户
exports.createUser = async (req, res) => {
  const { username, password, avatar, height, gender, age, target, activity_level } = req.body;
  try {
    const newUser = await User.create({ username, password, avatar, height, gender, age, target, activity_level });
    res.json({ success: true, user: newUser });
  } catch (err) {
    console.error('Error creating user:', err.message);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
};

// 更新用户
exports.updateUser = async (req, res) => {
  const { id } = req.params;
  const { username, password, avatar, height, gender, age, target, activity_level } = req.body;
  try {
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ success: false, message: '用户未找到' });
    }
    await user.update({ username, password, avatar, height, gender, age, target, activity_level });
    res.json({ success: true, user });
  } catch (err) {
    console.error('Error updating user:', err.message);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
};

// 删除用户
exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const user = await User.findByPk(id);
    if (!user) {
      return res.status(404).json({ success: false, message: '用户未找到' });
    }
    await user.destroy();
    res.json({ success: true, message: '用户已删除' });
  } catch (err) {
    console.error('Error deleting user:', err.message);
    res.status(500).json({ success: false, message: '服务器错误' });
  }
};

// 上传头像
// exports.uploadAvatar = async (req, res) => {
//     const { userId } = req.params;
//     const avatar = req.files?.avatar;

//     console.log('uploadAvatar params:', req.body);

//     try {
//         const user = await User.findByPk(userId);
//         if (!user) {
//             return res.status(404).json({ success: false, message: '用户未找到' });
//         }

//         if (avatar) {
//             const avatarDir = path.join(__dirname, '../avatar');
//             if (!fs.existsSync(avatarDir)) {
//                 fs.mkdirSync(avatarDir, { recursive: true });
//             }
//             const avatarPath = path.join(avatarDir, `${userId}_${avatar.name}`);
//             avatar.mv(avatarPath, (err) => {
//                 if (err) {
//                     console.error('文件保存错误:', err);
//                     return res.status(500).json({ success: false, message: '文件保存失败' });
//                 }
//             });
//             user.avatar = `/uploads/avatar/${userId}_${avatar.name}`;
//         }

//         await user.save();
//         return res.json({ success: true, message: '头像上传成功', url: user.avatar });
//     } catch (err) {
//         console.error('头像上传错误:', err.message);
//         return res.status(500).json({ success: false, message: '头像上传失败' });
//     }
// }; 