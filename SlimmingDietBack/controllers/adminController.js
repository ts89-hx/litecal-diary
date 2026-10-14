const jwt = require('jsonwebtoken');
const Admin = require('../models/admin');
// const bcrypt = require('bcrypt');

exports.login = async (req, res) => {
  const { username, password } = req.body;
  try {
    const admin = await Admin.findOne({ where: { username } });
    // if (admin && bcrypt.compareSync(password, admin.password)) {
    if (admin && password === admin.password) {
      const token = jwt.sign({ id: admin.id }, 'your_jwt_secret', { expiresIn: '1h' });
      return res.json({ success: true, token });
    }
    return res.status(401).json({ success: false, message: '用户名或密码错误' });
  } catch (err) {
    console.error('Login error:', err.message);
    return res.status(500).json({ success: false, message: '服务器错误' });
  }
}; 