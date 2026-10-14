const jwt = require('jsonwebtoken');

const whitelist = ['/auth/login', '/auth/sendVerificationCode', '/auth/wechat', '/auth/demo', '/admin/login'];

exports.verifyToken = (req, res, next) => {
    if (whitelist.includes(req.path)) {
        return next();
    }

    const token = req.headers.authorization;
    if (!token || !token.startsWith('Bearer ')) return res.status(403).json({ error: '未授权访问' });

    jwt.verify(token.slice(7), process.env.JWT_SECRET || 'litecal-demo-secret', (err, decoded) => {
        if (err) return res.status(401).json({ error: 'token认证失败' });
        req.user = decoded;
        next();
    });
}; 
