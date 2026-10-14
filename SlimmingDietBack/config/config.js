require('dotenv').config();
const sequelize = require('./database');

const connectDB = async () => {
    try {
        await sequelize.authenticate();
        console.log('MySQL connected');
        return sequelize;
    } catch (err) {
        console.error('Database connection error:', err.message);
        throw err;
    }
};

module.exports = { connectDB }; 
