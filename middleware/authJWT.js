// middleware/authJWT.js
// Verifies the JWT sent in the Authorization header.
// Attaches decoded user payload to req.user.

const jwt  = require('jsonwebtoken');
const User = require('../models/User');

// ── Must be logged in ─────────────────────────────────────────────────────────
const protect = async (req, res, next) => {
    let token;

    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
        token = authHeader.split(' ')[1];
    }

    if (!token) {
        return res.status(401).json({ success: false, message: 'Not authenticated. Please log in.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        // Attach live user record (without password)
        req.user = await User.findById(decoded.id).select('-password');
        if (!req.user || !req.user.isActive) {
            return res.status(401).json({ success: false, message: 'User no longer exists.' });
        }
        next();
    } catch (err) {
        return res.status(401).json({ success: false, message: 'Invalid or expired token.' });
    }
};

// ── Must be admin ─────────────────────────────────────────────────────────────
const adminOnly = (req, res, next) => {
    if (req.user?.role !== 'admin') {
        return res.status(403).json({ success: false, message: 'Admin access required.' });
    }
    next();
};

module.exports = { protect, adminOnly };