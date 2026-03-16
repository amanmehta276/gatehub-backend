// models/User.js
const mongoose = require('mongoose');
const bcrypt   = require('bcryptjs');

const UserSchema = new mongoose.Schema(
    {
        name: {
            type:     String,
            required: [true, 'Name is required'],
            trim:     true,
        },
        email: {
            type:      String,
            required:  [true, 'Email is required'],
            unique:    true,
            lowercase: true,
            trim:      true,
            match:     [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
        },
        password: {
            type:     String,
            required: [true, 'Password is required'],
            minlength: [6, 'Password must be at least 6 characters'],
            select:   false, // never returned in queries by default
        },
        // 'student' | 'admin'
        role: {
            type:    String,
            enum:    ['student', 'admin'],
            default: 'student',
        },
        isActive: {
            type:    Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

// ── Hash password before saving ───────────────────────────────────────────────
UserSchema.pre('save', async function (next) {
    if (!this.isModified('password')) return next();
    const salt    = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

// ── Instance method: compare plain password with hash ─────────────────────────
UserSchema.methods.matchPassword = async function (plain) {
    return bcrypt.compare(plain, this.password);
};

module.exports = mongoose.model('User', UserSchema);