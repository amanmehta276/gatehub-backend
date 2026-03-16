// scripts/seed.js
// One-time migration: inserts all existing Google Drive links into MongoDB.
// Run with:  node scripts/seed.js

require('dotenv').config({ path: '../.env' });
const mongoose = require('mongoose');
const File     = require('../models/File');

// ─── Paste your old ASSETS_REPOSITORY here ───────────────────────────────────
const ASSETS_REPOSITORY = {
    'eps_1': [
        { _id: 'eps_1_01', name: 'EPS-Resource-v1.pdf',                        url: 'https://drive.google.com/file/d/1XA4OlyouD4YUUZ7eyN_BM_M_ux91zTMR/view?usp=sharing',   type: 'Google Drive', size: 'Cloud Access' },
    ],
    'ea': [
        { _id: 'ea_01',    name: 'Energy Audit and Management.pdf',             url: 'https://drive.google.com/file/d/1q-MB2oD9q54au3KN1-sp952lm0JQjMDq/view?usp=drive_link', type: 'Google Drive', size: 'Cloud Access' },
    ],
    'em_1': [
        { _id: 'em_1_01',  name: 'Electromechanical Energy Conversion.pdf',    url: 'https://drive.google.com/file/d/1paAyns5WFiXfvUFVvkWKcGX_PR1rlQ6i/view?usp=drive_link', type: 'Google Drive', size: 'Cloud Access' },
        { _id: 'em_1_02',  name: 'Magnetic Circuits.pdf',                      url: 'https://drive.google.com/file/d/1jPGOSFCLSmawZdbUwmJJn3xJ7DXV159v/view?usp=drive_link', type: 'Google Drive', size: 'Cloud Access' },
        { _id: 'em_1_03',  name: 'Single Phase Transformers.pdf',              url: 'https://drive.google.com/file/d/1Z4YxkHqubPvCpmiXVbXIZ40rNyyMNb9X/view?usp=drive_link', type: 'Google Drive', size: 'Cloud Access' },
        { _id: 'em_1_04',  name: 'Autotransformers.pdf',                       url: 'https://drive.google.com/file/d/1ENHgCXk_4DAmtCYJoiiuJcFjoOEDPgIG/view?usp=drive_link', type: 'Google Drive', size: 'Cloud Access' },
        { _id: 'em_1_05',  name: 'EM_1-Resource-v5.pdf',                      url: 'https://drive.google.com/file/d/1gPzHy1BraToZNbDrnZrpypjQP8l3wPxR/view?usp=drive_link', type: 'Google Drive', size: 'Cloud Access' },
    ],
    'eca': [
        { _id: 'eca_01',   name: 'Electromechanical Energy Conversion.pdf',    url: 'https://drive.google.com/file/d/1paAyns5WFiXfvUFVvkWKcGX_PR1rlQ6i/view?usp=drive_link', type: 'Google Drive', size: 'Cloud Access' },
        { _id: 'eca_02',   name: 'Magnetic Circuits.pdf',                      url: 'https://drive.google.com/file/d/1jPGOSFCLSmawZdbUwmJJn3xJ7DXV159v/view?usp=drive_link', type: 'Google Drive', size: 'Cloud Access' },
        { _id: 'eca_03',   name: 'Single Phase Transformers.pdf',              url: 'https://drive.google.com/file/d/1Z4YxkHqubPvCpmiXVbXIZ40rNyyMNb9X/view?usp=drive_link', type: 'Google Drive', size: 'Cloud Access' },
        { _id: 'eca_04',   name: 'Autotransformers.pdf',                       url: 'https://drive.google.com/file/d/1ENHgCXk_4DAmtCYJoiiuJcFjoOEDPgIG/view?usp=drive_link', type: 'Google Drive', size: 'Cloud Access' },
        { _id: 'eca_05',   name: 'EM_1-Resource-v5.pdf',                      url: 'https://drive.google.com/file/d/1gPzHy1BraToZNbDrnZrpypjQP8l3wPxR/view?usp=drive_link', type: 'Google Drive', size: 'Cloud Access' },
    ],
    'dsp': [
        { _id: 'dsp_01',   name: 'Digital Signal Processing.pdf',              url: 'https://drive.google.com/file/d/19n76SyuXczw9eeUTsH1iSTJWSHJYClYk/view?usp=drive_link', type: 'Google Drive', size: 'Cloud Access' },
    ],
};

async function seed() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    let inserted = 0;
    let skipped  = 0;

    for (const [subjectId, files] of Object.entries(ASSETS_REPOSITORY)) {
        for (const f of files) {
            const exists = await File.findOne({ url: f.url });
            if (exists) { skipped++; continue; }

            await File.create({
                subjectId,
                name: f.name,
                url:  f.url,
                type: f.type,
                size: f.size,
            });
            inserted++;
            console.log(`  ✅  [${subjectId}] ${f.name}`);
        }
    }

    console.log(`\nSeed complete. Inserted: ${inserted} | Skipped (duplicate): ${skipped}`);
    await mongoose.disconnect();
}

seed().catch(err => { console.error(err); process.exit(1); });