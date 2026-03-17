// routes/files.js — Supabase Storage version with storage warning
const express              = require('express');
const router               = express.Router();
const File                 = require('../models/File');
const { createClient }     = require('@supabase/supabase-js');
const { upload, uploadToSupabase } = require('../middleware/upload');
const { protect, adminOnly }       = require('../middleware/authJWT');

// ─── Helper: check total Supabase storage used ────────────────────────────────
const checkStorageWarning = async () => {
    try {
        const supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_SERVICE_KEY
        );

        // Get total bytes from MongoDB (all active Supabase files)
        const files = await File.find({ type: 'Supabase', isActive: true });
        const totalBytes = files.reduce((sum, f) => sum + (f.bytes || 0), 0);
        const totalMB    = totalBytes / (1024 * 1024);
        const totalGB    = totalMB / 1024;

        // Warn at 800 MB (80% of 1 GB free tier)
        if (totalGB >= 0.8) {
            return `⚠️ Storage Warning: ${totalMB.toFixed(0)} MB / 1000 MB used. Create a new Supabase account soon.`;
        }
        return null;
    } catch (err) {
        return null; // non-fatal
    }
};

// GET /api/files/:subjectId  (public)
router.get('/:subjectId', async (req, res) => {
    try {
        const files = await File.find({
            subjectId: req.params.subjectId.toLowerCase(),
            isActive:  true,
        }).sort({ createdAt: -1 });

        res.json({
            success: true,
            files: files.map(f => ({
                _id:  f._id,
                name: f.name,
                url:  f.url,
                type: f.type,
                size: f.size,
            })),
        });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Server error fetching files.' });
    }
});

// POST /api/files/upload  (admin only)
router.post('/upload', protect, adminOnly, upload.single('file'), async (req, res) => {
    try {
        const { subjectId, name } = req.body;

        if (!req.file)  return res.status(400).json({ success: false, message: 'No file provided.' });
        if (!subjectId) return res.status(400).json({ success: false, message: 'subjectId is required.' });

        const displayName = name?.trim() || req.file.originalname;

        const { url, path: storagePath, size } = await uploadToSupabase(
            req.file.buffer,
            subjectId.toLowerCase(),
            req.file.originalname,
            req.file.mimetype
        );

        const newFile = await File.create({
            subjectId:          subjectId.toLowerCase(),
            name:               displayName,
            url,
            cloudinaryPublicId: storagePath,
            type:               'Supabase',
            size,
            bytes:              req.file.buffer.length,
        });

        // Check storage warning after upload
        const warning = await checkStorageWarning();

        res.status(201).json({
            success: true,
            message: 'File uploaded successfully.',
            warning: warning || undefined,
            file: {
                _id:  newFile._id,
                name: newFile.name,
                url:  newFile.url,
                type: newFile.type,
                size: newFile.size,
            },
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ success: false, message: err.message || 'Upload failed.' });
    }
});

// POST /api/files/link  (admin only)
router.post('/link', protect, adminOnly, async (req, res) => {
    try {
        const { subjectId, name, url, type, size } = req.body;
        if (!subjectId || !name || !url) {
            return res.status(400).json({ success: false, message: 'subjectId, name and url are required.' });
        }
        const newFile = await File.create({
            subjectId: subjectId.toLowerCase(),
            name, url,
            type: type || 'External',
            size: size || 'Cloud Access',
        });
        res.status(201).json({ success: true, file: newFile });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Failed to save link.' });
    }
});

// DELETE /api/files/:fileId  (admin only)
router.delete('/:fileId', protect, adminOnly, async (req, res) => {
    try {
        const file = await File.findById(req.params.fileId);
        if (!file) return res.status(404).json({ success: false, message: 'File not found.' });
        file.isActive = false;
        await file.save();
        res.json({ success: true, message: 'File removed.' });
    } catch (err) {
        res.status(500).json({ success: false, message: 'Delete failed.' });
    }
});

module.exports = router;