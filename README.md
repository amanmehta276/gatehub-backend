# GateHub Backend

Node.js + Express REST API for the GateHub Engineering Resource Platform.

## 🚀 Live URL
```
https://gatehub-backend.onrender.com
```

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| Node.js + Express | Server framework |
| MongoDB Atlas | Database |
| Mongoose | ODM for MongoDB |
| Supabase Storage | PDF file storage |
| JWT | Authentication |
| bcryptjs | Password hashing |
| Multer | File upload handling |
| @supabase/supabase-js | Supabase SDK |

## 📁 Complete File Map

```
backend/
│
├── config/
│   ├── cloudinary.js          # Cloudinary config (unused, kept for reference)
│   └── db.js                  # MongoDB Atlas connection
│
├── controllers/
│   ├── fileController.js      # (reserved for future use)
│   └── subjectController.js   # (reserved for future use)
│
├── middleware/
│   ├── authJWT.js             # JWT verify + admin guard
│   └── upload.js              # Multer memory storage + Supabase upload helper
│
├── models/
│   ├── File.js                # File schema (subjectId, name, url, type, size)
│   ├── Subject.js             # Subject schema (_id, name, branch, icon, theme)
│   └── User.js                # User schema (name, email, password, role)
│
├── routes/
│   ├── auth.js                # POST /register, POST /login, GET /me
│   ├── files.js               # GET /:subjectId, POST /upload, POST /link, DELETE /:id
│   └── subjects.js            # GET /, POST /, DELETE /:id
│
├── scripts/
│   ├── createAdmin.js         # One-time script to create admin account
│   ├── seed.js                # One-time script to seed old Google Drive links
│   └── seedSubjects.js        # One-time script to seed all subjects into MongoDB
│
├── .env                       # Secret environment variables (NOT committed to GitHub)
├── .env.example               # Template showing which env vars are needed
├── .gitignore                 # Ignores node_modules and .env
├── package.json               # Project metadata and dependencies
├── package-lock.json          # Exact dependency versions
├── README.md                  # This file
└── server.js                  # Express app entry point — mounts all routes
```

## 🔌 API Endpoints

### Auth
```
POST   /api/auth/register    — Student registration
POST   /api/auth/login       — Login (student + admin)
GET    /api/auth/me          — Get current user from token
```

### Subjects
```
GET    /api/subjects         — Fetch all active subjects (public)
GET    /api/subjects?branch= — Fetch subjects filtered by branch (public)
POST   /api/subjects         — Create new subject (admin only)
DELETE /api/subjects/:id     — Soft delete subject (admin only)
```

### Files
```
GET    /api/files/:subjectId — Fetch all files for a subject (public)
POST   /api/files/upload     — Upload PDF to Supabase (admin only)
POST   /api/files/link       — Save external link (admin only)
DELETE /api/files/:fileId    — Soft delete file (admin only)
```

### Health
```
GET    /api/health           — Server health check
```

## ⚙️ Environment Variables

Create a `.env` file in the root of the backend folder:

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string/dbname?appName=Cluster0
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_KEY=your_supabase_service_role_key
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=7d
CLIENT_ORIGIN=https://your-frontend-url.netlify.app
```

## 📦 Dependencies

```json
{
  "@supabase/supabase-js": "^2.99.2",
  "bcryptjs": "^2.4.3",
  "cors": "^2.8.5",
  "dotenv": "^16.4.5",
  "express": "^4.19.2",
  "jsonwebtoken": "^9.0.2",
  "mongoose": "^8.5.1",
  "multer": "^1.4.5-lts.1",
  "streamifier": "^0.1.1"
}
```

## 🏃 Running Locally

```bash
# Install dependencies
npm install

# Start development server (auto-restarts on save)
npm run dev

# Start production server
npm start
```

## 🌱 Seeding the Database

Run these once after first setup:

```bash
# Seed all subjects into MongoDB
node scripts/seedSubjects.js

# Create the admin account
node scripts/createAdmin.js
```

## 🔐 How Auth Works

1. Student registers or logs in → server returns JWT token
2. Frontend stores token in localStorage
3. Every admin request sends `Authorization: Bearer <token>` header
4. `protect` middleware verifies token
5. `adminOnly` middleware checks role === 'admin'

## 📤 How File Upload Works

```
Admin selects PDF in modal
        ↓
POST /api/files/upload  (multipart/form-data)
        ↓
Multer buffers file in memory (no disk write)
        ↓
uploadToSupabase() streams buffer → Supabase Storage
        ↓
Supabase returns public URL
        ↓
MongoDB saves { subjectId, name, url, type, size }
        ↓
Frontend refreshes file list automatically
```

## 🚢 Deployment

Deployed on **Render** (free tier).

| Setting | Value |
|---|---|
| Runtime | Node |
| Build Command | `npm install` |
| Start Command | `npm start` |
| Region | Singapore |

All environment variables are set in the Render dashboard under Environment.

## 📝 Notes

- Free Render tier sleeps after 15 minutes of inactivity
- First request after sleep takes 2-3 minutes to wake up
- Supabase free tier: 1GB storage, no per-file size limit
- MongoDB free tier: 512MB database storage
- `.env` file is never committed — add all vars manually in Render dashboard
