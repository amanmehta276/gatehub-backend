// models/File.js
// Mongoose schema for a PDF / resource asset stored in Cloudinary.

const mongoose = require('mongoose');

const FileSchema = new mongoose.Schema(
    {
        // Matches the _id keys used in BRANCH_DATA (e.g. 'eca', 'em_1', 'eps_1')
        subjectId: {
            type: String,
            required: [true, 'subjectId is required'],
            trim: true,
            lowercase: true,
            index: true,
        },

        // Human-readable file name shown in the UI (e.g. 'Single Phase Transformers.pdf')
        name: {
            type: String,
            required: [true, 'File name is required'],
            trim: true,
        },

        // Public URL returned by Cloudinary (or a manual Google Drive link)
        url: {
            type: String,
            required: [true, 'File URL is required'],
        },

        // Cloudinary public_id – needed to delete the asset later
        cloudinaryPublicId: {
            type: String,
            default: null,
        },

        // 'Cloudinary' | 'Google Drive' | 'Local'
        type: {
            type: String,
            default: 'Cloudinary',
        },

        // Formatted size string shown in the UI (e.g. '2.4 MB')
        size: {
            type: String,
            default: 'Cloud Access',
        },

        // Raw bytes (filled automatically after Cloudinary upload)
        bytes: {
            type: Number,
            default: 0,
        },

        // Soft-delete flag
        isActive: {
            type: Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('File', FileSchema);