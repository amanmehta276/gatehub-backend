// scripts/seedSubjects.js
// Run ONCE to migrate all hardcoded subjects into MongoDB.
// node scripts/seedSubjects.js

require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const mongoose = require('mongoose');
const Subject  = require('../models/Subject');

const SUBJECTS = [
    // Electrical
    { _id: 'eca',   name: 'Electrical Circuit Analysis',   branch: 'Electrical', description: 'Circuit laws, network theorems and analysis.',   icon: 'zap', theme: 'branch-elec', isMain: true  },
    { _id: 'em_1',  name: 'Electrical Machines 1',          branch: 'Electrical', description: 'DC machines and transformers.',                  icon: 'zap', theme: 'branch-elec', isMain: false },
    { _id: 'em2',   name: 'Electrical Machines 2',          branch: 'Electrical', description: 'Induction and synchronous machines.',            icon: 'zap', theme: 'branch-elec', isMain: false },
    { _id: 'e4',    name: 'Network Analysis and Synthesis',  branch: 'Electrical', description: 'Two port networks and network theorems.',        icon: 'zap', theme: 'branch-elec', isMain: false },
    { _id: 'eps_1', name: 'Electrical Power System',        branch: 'Electrical', description: 'Generation, transmission and distribution.',     icon: 'zap', theme: 'branch-elec', isMain: true  },
    { _id: 'e6',    name: 'Power Electronics',               branch: 'Electrical', description: 'Converters, inverters and power devices.',       icon: 'zap', theme: 'branch-elec', isMain: false },
    { _id: 'ea',    name: 'Energy Audit and Management',     branch: 'Electrical', description: 'Energy Audit and Management.',                  icon: 'zap', theme: 'branch-elec', isMain: false },
    { _id: 'e7',    name: 'Electrical Drives',               branch: 'Electrical', description: 'Speed control of electric motors.',             icon: 'zap', theme: 'branch-elec', isMain: false },
    // Electronics
    { _id: 'x1',    name: 'Electronic Devices and Circuits', branch: 'Electronics', description: 'Diodes, transistors and amplifiers.',          icon: 'activity', theme: 'branch-extc', isMain: false },
    { _id: 'x2',    name: 'Digital Electronics',             branch: 'Electronics', description: 'Logic gates, flip flops and counters.',        icon: 'activity', theme: 'branch-extc', isMain: true  },
    { _id: 'x3',    name: 'Microprocessor and Microcontroller', branch: 'Electronics', description: '8085 architecture and embedded systems.',   icon: 'activity', theme: 'branch-extc', isMain: true  },
    { _id: 'dsp',   name: 'Digital Signal Processing',       branch: 'Electronics', description: 'Discrete signals and digital filters.',        icon: 'activity', theme: 'branch-extc', isMain: false },
    { _id: 'x5',    name: 'Modern Instrumentation Techniques', branch: 'Electronics', description: 'Sensors and measurement systems.',           icon: 'activity', theme: 'branch-extc', isMain: false },
    // CS & IT
    { _id: 'c1',    name: 'Software Engineering',            branch: 'CS & IT', description: 'Development lifecycles and methodologies.',        icon: 'layers', theme: 'branch-cs', isMain: true },
    { _id: 'c2',    name: 'Operating Systems',               branch: 'CS & IT', description: 'Kernel logic and process scheduling.',             icon: 'cpu',    theme: 'branch-cs', isMain: true },
];

async function run() {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    let inserted = 0;
    let skipped  = 0;

    for (const s of SUBJECTS) {
        const exists = await Subject.findById(s._id);
        if (exists) { skipped++; continue; }
        await Subject.create(s);
        console.log(`  ✅  [${s.branch}] ${s.name}`);
        inserted++;
    }

    console.log(`\nDone. Inserted: ${inserted} | Skipped: ${skipped}`);
    await mongoose.disconnect();
}

run().catch(err => { console.error(err); process.exit(1); });