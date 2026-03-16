// config/db.js
// Connects to MongoDB via Mongoose. Called once on server start.

const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`✅  MongoDB connected: ${conn.connection.host}`);
    } catch (err) {
        console.error(`❌  MongoDB connection error: ${err.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;