// scripts/createAdmin.js
// Creates the first admin account in MongoDB.
// Run ONCE:  node scripts/createAdmin.js
// Change the values below before running.

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const User     = require('../models/User');

const ADMIN = {
    name:     'Admin',
    email:    'admin@gatehub.com',   // ← change this
    password: 'Admin@1234',          // ← change this (min 6 chars)
    role:     'admin',
};

async function run() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const exists = await User.findOne({ email: ADMIN.email });
    if (exists) {
        console.log(`⚠️  Admin already exists: ${ADMIN.email}`);
        await mongoose.disconnect();
        return;
    }

    await User.create(ADMIN);
    console.log(`✅  Admin created: ${ADMIN.email}`);
    await mongoose.disconnect();
}

run().catch(err => { console.error(err); process.exit(1); });