// middleware/upload.js
// Multer + Supabase Storage
// Free tier — 1GB storage, no per-file size limit, no credit card

const multer           = require('multer');
const { createClient } = require('@supabase/supabase-js');

// ─── Supabase client ──────────────────────────────────────────────────────────
const getSupabase = () => createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_KEY
);

// ─── Memory storage ───────────────────────────────────────────────────────────
const storage = multer.memoryStorage();

// ─── File type filter ─────────────────────────────────────────────────────────
const fileFilter = (req, file, cb) => {
    const allowed = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    ];
    if (allowed.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error('Only PDF and Office documents are allowed'), false);
    }
};

// ─── Multer instance — 200 MB cap ─────────────────────────────────────────────
const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 200 * 1024 * 1024 },
});

// ─── Upload buffer to Supabase Storage ────────────────────────────────────────
const uploadToSupabase = async (buffer, subjectId, originalName, mimetype) => {
    const supabase = getSupabase();
    const safeName = originalName.replace(/\s+/g, '_').replace(/[^\w.\-]/g, '');
    const filePath = `${subjectId}/${Date.now()}_${safeName}`;

    const { error } = await supabase.storage
        .from('pdfs')
        .upload(filePath, buffer, {
            contentType:  mimetype || 'application/pdf',
            cacheControl: '3600',
            upsert:       false,
        });

    if (error) throw new Error(error.message);

    const { data: urlData } = supabase.storage
        .from('pdfs')
        .getPublicUrl(filePath);

    const sizeStr = buffer.length
        ? `${(buffer.length / (1024 * 1024)).toFixed(2)} MB`
        : 'Cloud Access';

    return {
        url:  urlData.publicUrl,
        path: filePath,
        size: sizeStr,
    };
};

module.exports = { upload, uploadToSupabase };