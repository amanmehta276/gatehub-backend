// server.js
require('dotenv').config();

const express         = require('express');
const cors            = require('cors');
const connectDB       = require('./config/db');
const authRoutes      = require('./routes/auth');
const fileRoutes      = require('./routes/files');
const subjectRoutes   = require('./routes/subjects');

const app  = express();
const PORT = process.env.PORT || 5000;

connectDB();

app.use(cors({
    origin:         process.env.CLIENT_ORIGIN || '*',
    methods:        ['GET', 'POST', 'DELETE','PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

app.use('/api/auth',     authRoutes);
app.use('/api/files',    fileRoutes);
app.use('/api/subjects', subjectRoutes);

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal server error',
    });
});

app.listen(PORT, () => {
    console.log(`🚀  GateHub backend running on http://localhost:${PORT}`);
});