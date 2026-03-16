// routes/files.js — Supabase Storage version
const express  = require('express');
const router   = express.Router();
const File     = require('../models/File');
const { upload, uploadToSupabase } = require('../middleware/upload');
const { protect, adminOnly }       = require('../middleware/authJWT');

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

        res.status(201).json({
            success: true,
            message: 'File uploaded successfully.',
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