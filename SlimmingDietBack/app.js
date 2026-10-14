const express = require('express');
const authRoutes = require('./routes/authRoutes');
const recordRoutes = require('./routes/recordRoutes');
const adminRoutes = require('./routes/adminRoutes');
// const logRoutes = require('./routes/logRoutes'); // 注释掉这行
const { connectDB } = require('./config/config');
const authMiddleware = require('./middlewares/authMiddleware');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const path = require('path');
const dietRoutes = require('./routes/dietRoutes');
const sportRoutes = require('./routes/sportRoutes');
const mvpRoutes = require('./routes/mvpRoutes');

const userRoutes = require('./routes/userRoutes');


const app = express();

// 使用中间件
app.use(cors());
app.use(express.json()); // 解析 JSON 请求体
app.use(express.urlencoded({ extended: true })); // 解析 URL 编码的请求体
app.use(fileUpload()); // 处理文件上传

// 提供静态文件服务
app.use('/avatar', express.static(path.join(__dirname, 'avatar')));

// 使用中间件
app.use(authMiddleware.verifyToken);

// Register routes
app.use('/auth', authRoutes);
app.use('/records', recordRoutes);
app.use('/admin', adminRoutes);
// app.use('/log', logRoutes); // 注释掉这行
app.use('/admin/users', userRoutes);
app.use('/admin/diet-records', dietRoutes);
app.use('/admin/sport-records', sportRoutes);
app.use('/', mvpRoutes);

const PORT = process.env.PORT || 3000;
if (require.main === module) {
    connectDB().then(() => {
        app.listen(PORT, () => {
            console.log(`轻卡日记服务运行于 http://localhost:${PORT}`);
            if((process.env.RECOGNITION_PROVIDER||'local')==='local')require('./services/recognition/localProvider').start()
                .then(()=>console.log('本地食物识别模型已就绪'))
                .catch(error=>console.error(error.message));
        });
    }).catch(() => process.exit(1));
}

module.exports = app;
