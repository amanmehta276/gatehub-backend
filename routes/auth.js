// routes/auth.js
// POST /api/auth/register  — create student account
// POST /api/auth/login     — login (student or admin)
// GET  /api/auth/me        — get current user from token

const express = require('express');
const router  = express.Router();
const jwt     = require('jsonwebtoken');
const User    = require('../models/User');
const { protect } = require('../middleware/authJWT');

// ── Helper: sign a JWT ────────────────────────────────────────────────────────
const signToken = (id) =>
    jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN || '7d',
    });

// ── Helper: send token response ───────────────────────────────────────────────
const sendToken = (user, statusCode, res) => {
    const token = signToken(user._id);
    res.status(statusCode).json({
        success: true,
        token,
        user: {
            _id:   user._id,
            name:  user.name,
            email: user.email,
            role:  user.role,
        },
    });
};

// ─────────────────────────────────────────────────────────────────────────────
//  POST /api/auth/register
//  Body: { name, email, password }
//  Creates a student account (admins are created via seed or manually in DB)
// ─────────────────────────────────────────────────────────────────────────────
router.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ success: false, message: 'Name, email and password are required.' });
        }

        const existing = await User.findOne({ email });
        if (existing) {
            return res.status(409).json({ success: false, message: 'An account with this email already exists.' });
        }

        const user = await User.create({ name, email, password, role: 'student' });
        sendToken(user, 201, res);
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
//  POST /api/auth/login
//  Body: { email, password }
//  Works for both students and admins
// ─────────────────────────────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ success: false, message: 'Email and password are required.' });
        }

        // Explicitly select password (it's hidden by default in schema)
        const user = await User.findOne({ email }).select('+password');
        if (!user || !(await user.matchPassword(password))) {
            return res.status(401).json({ success: false, message: 'Invalid email or password.' });
        }

        if (!user.isActive) {
            return res.status(403).json({ success: false, message: 'Your account has been deactivated.' });
        }

        sendToken(user, 200, res);
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
//  GET /api/auth/me
//  Returns the currently logged-in user from their JWT
// ─────────────────────────────────────────────────────────────────────────────
router.get('/me', protect, (req, res) => {
    res.json({ success: true, user: req.user });
});

module.exports = router;