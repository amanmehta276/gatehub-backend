// models/Subject.js
const mongoose = require('mongoose');

const SubjectSchema = new mongoose.Schema(
    {
        _id: {
            type:      String,   // e.g. 'eca', 'em_1', 'dsp'
            required:  [true, 'Subject ID is required'],
            trim:      true,
            lowercase: true,
        },
        name: {
            type:     String,
            required: [true, 'Subject name is required'],
            trim:     true,
        },
        branch: {
            type:     String,
            required: [true, 'Branch is required'],
            enum:     ['Basic Science','Electrical', 'Electronics', 'CS & IT', 'Mechanical', 'Civil'],
        },
        description: {
            type:    String,
            default: '',
            trim:    true,
        },
        icon: {
            type:    String,
            default: 'book',
        },
        theme: {
            type:    String,
            default: 'branch-cs',
        },
        isMain: {
            type:    Boolean,
            default: false,
        },
        isActive: {
            type:    Boolean,
            default: true,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model('Subject', SubjectSchema);