// routes/subjects.js
// GET    /api/subjects          — fetch all active subjects (public)
// GET    /api/subjects/:branch  — fetch by branch (public)
// POST   /api/subjects          — create subject (admin only)
// DELETE /api/subjects/:id      — delete subject (admin only)

const express  = require('express');
const router   = express.Router();
const Subject  = require('../models/Subject');
const { protect, adminOnly } = require('../middleware/authJWT');

// GET /api/subjects — all active subjects
router.get('/', async (req, res) => {
    try {
        const { branch } = req.query; // optional ?branch=Electrical
        const query = { isActive: true };
        if (branch && branch !== 'All') query.branch = branch;

        const subjects = await Subject.find(query).sort({ branch: 1, name: 1 });
        res.json({ success: true, subjects });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// POST /api/subjects — create new subject (admin only)
router.post('/', protect, adminOnly, async (req, res) => {
    try {
        const { _id, name, branch, description, icon, theme, isMain } = req.body;

        if (!_id || !name || !branch) {
            return res.status(400).json({ success: false, message: '_id, name and branch are required.' });
        }

        // Auto-generate theme from branch if not provided
        const themeMap = {
            'Electrical': 'branch-elec',
            'Electronics': 'branch-extc',
            'CS & IT': 'branch-cs',
            'Mechanical': 'branch-mech',
            'Civil': 'branch-civil',
        };

        const iconMap = {
            'Electrical': 'zap',
            'Electronics': 'activity',
            'CS & IT': 'cpu',
            'Mechanical': 'settings',
            'Civil': 'home',
        };

        const subject = await Subject.create({
            _id:         _id.toLowerCase().replace(/\s+/g, '_'),
            name,
            branch,
            description: description || '',
            icon:        icon  || iconMap[branch]  || 'book',
            theme:       theme || themeMap[branch] || 'branch-cs',
            isMain:      isMain || false,
        });

        res.status(201).json({ success: true, subject });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(409).json({ success: false, message: 'A subject with this ID already exists.' });
        }
        res.status(500).json({ success: false, message: err.message });
    }
});

// DELETE /api/subjects/:id — soft delete (admin only)
router.delete('/:id', protect, adminOnly, async (req, res) => {
    try {
        const subject = await Subject.findByIdAndUpdate(
            req.params.id,
            { isActive: false },
            { new: true }
        );
        if (!subject) return res.status(404).json({ success: false, message: 'Subject not found.' });
        res.json({ success: true, message: 'Subject removed.' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;