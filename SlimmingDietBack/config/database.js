require('dotenv').config();
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize(
    process.env.DB_NAME || 'slim_diet',
    process.env.DB_USER || 'root',
    process.env.DB_PASSWORD || '123456',
    {
        host: process.env.DB_HOST || 'localhost',
        port: Number(process.env.DB_PORT || 3306),
        dialect: 'mysql',
        logging: process.env.DB_LOGGING === 'true' ? console.log : false,
        timezone: '+08:00',
    }
);

module.exports = sequelize;
