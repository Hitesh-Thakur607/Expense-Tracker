const mongoose = require("mongoose");
require('dotenv').config();

const connectdb = async () => {
    const uri = process.env.MONGO_URI || "mongodb://hitesht130_db_user:6c2YZNS70ZhKKSW7@hitesht169.cfwn7zq.mongodb.net/expense-tracker?retryWrites=true&w=majority";
    const dbName = process.env.MONGO_DBNAME || 'expense-tracker';

    try {
        await mongoose.connect(uri, {
            dbName,
            // Shorter selection timeout during development helps surface errors faster
            serverSelectionTimeoutMS: 20000,
        });
        console.log('MongoDB connected', mongoose.connection.host);
    } catch (err) {
        console.error('MongoDB connection error:', err);
    }
};

module.exports = connectdb;