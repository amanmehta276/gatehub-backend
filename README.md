# GateHub Backend

Node.js + Express REST API for the GateHub Engineering Resource Platform. Handles authentication, subject management, and file storage via Supabase.

## 🌐 Live URL

```
https://gatehub-backend.onrender.com
```

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| Node.js + Express | Server framework |
| MongoDB Atlas | Database (db: `aman`) |
| Mongoose | ODM for MongoDB |
| Supabase Storage | PDF file storage (bucket: `pdfs`) |
| JWT | Authentication tokens |
| bcryptjs | Password hashing |
| Multer | File upload handling (memory storage) |
| @supabase/supabase-js | Supabase SDK |
| dotenv | Environment variable management |
| cors | Cross-origin request handling |

## 📁 File Structure

```
backend/
│
├── config/
│   ├── db.js                  # MongoDB Atlas connection via Mongoose
│   └── cloudinary.js          # Cloudinary config (unused, kept for reference)
│
├── controllers/
│   ├── subjectController.js   # Reserved for future refactor
│   └── fileController.js      # Reserved for future refactor
│
├── middleware/
│   ├── authJWT.js             # JWT verify middleware + admin guard
│   └── upload.js              # Multer memory storage + Supabase upload helper
│
├── models/
│   ├── User.js                # User schema
│   ├── Subject.js             # Subject schema
│   └── File.js                # File schema
│
├── routes/
│   ├── auth.js                # Auth routes
│   ├── subjects.js            # Subject CRUD routes
│   └── files.js               # File upload/fetch/delete routes
│
├── scripts/
│   ├── createAdmin.js         # One-time script to seed admin account
│   ├── seedSubjects.js        # One-time script to seed all subjects
│   └── seed.js                # One-time script to seed Google Drive links
│
├── .env                       # Secret environment variables (NOT committed)
├── .env.example               # Template for required env vars
├── .gitignore                 # Ignores node_modules and .env
├── package.json               # Dependencies and scripts
└── server.js                  # Express app entry point
```

## 🗄️ Database Schemas

### User

```js
{
    name: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
    },
    password: {
        type: String,
        required: true,
        minlength: 6,
        // Stored as bcrypt hash — never plain text
    },
    role: {
        type: String,
        enum: ['student', 'admin'],
        default: 'student',
    },
    isActive: {
        type: Boolean,
        default: true,
    },
    createdAt: Date,  // auto via timestamps
    updatedAt: Date,  // auto via timestamps
}
```

### Subject

```js
{
    _id: {
        type: String,
        // Custom string ID e.g. 'em_1', 'dsp', 'eca'
        // Auto-generated on create: name.toLowerCase().replace spaces → _ + timestamp suffix
    },
    name: {
        type: String,
        required: true,
        trim: true,
        // e.g. 'Electrical Machines 1'
    },
    branch: {
        type: String,
        required: true,
        enum: ['Electrical', 'Electronics', 'CS & IT', 'Mechanical', 'Civil'],
    },
    description: {
        type: String,
        default: '',
        // Short summary shown on subject card
    },
    icon: {
        type: String,
        default: 'book',
        // Lucide icon name e.g. 'zap', 'cpu', 'activity', 'settings', 'home'
    },
    theme: {
        type: String,
        default: 'branch-cs',
        // CSS class for card color: 'branch-elec' | 'branch-extc' | 'branch-cs' | 'branch-mech' | 'branch-civ'
    },
    isMain: {
        type: Boolean,
        default: false,
        // true = shown on 'All Streams' default view
    },
    isActive: {
        type: Boolean,
        default: true,
        // false = soft deleted, hidden from all queries
    },
    createdAt: Date,
    updatedAt: Date,
}
```

### File

```js
{
    subjectId: {
        type: String,
        required: true,
        lowercase: true,
        // References Subject._id e.g. 'em_1'
    },
    name: {
        type: String,
        required: true,
        trim: true,
        // Display name shown in UI e.g. 'Single Phase Transformers.pdf'
    },
    url: {
        type: String,
        required: true,
        // Public URL — Supabase public URL or Google Drive link
    },
    cloudinaryPublicId: {
        type: String,
        default: '',
        // Stores Supabase storage path e.g. 'em_1/1720000000_notes.pdf'
        // Used for future deletion from Supabase
    },
    type: {
        type: String,
        default: 'Supabase',
        // 'Supabase' | 'Google Drive' | 'External'
    },
    size: {
        type: String,
        default: 'Cloud Access',
        // Human-readable e.g. '4.20 MB' or 'Cloud Access'
    },
    bytes: {
        type: Number,
        default: 0,
        // Raw byte count — used for storage usage calculation
    },
    isActive: {
        type: Boolean,
        default: true,
        // false = soft deleted
    },
    createdAt: Date,
    updatedAt: Date,
}
```

## 🔌 API Endpoints

### Auth — `/api/auth`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/register` | None | Register a new student account |
| POST | `/login` | None | Login for student or admin |
| GET | `/me` | Bearer token | Get current logged-in user |

**POST `/register`** request body:
```json
{
    "name": "John Doe",
    "email": "john@college.edu",
    "password": "mypassword"
}
```

**POST `/login`** request body:
```json
{
    "email": "admin@gatehub.com",
    "password": "Admin@1234"
}
```

**Response (both auth routes):**
```json
{
    "success": true,
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
        "_id": "64abc...",
        "name": "John Doe",
        "email": "john@college.edu",
        "role": "student"
    }
}
```

---

### Subjects — `/api/subjects`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/` | None | Fetch all active subjects |
| GET | `/?branch=Electrical` | None | Fetch subjects filtered by branch |
| POST | `/` | Admin only | Create a new subject |
| PATCH | `/:id` | Admin only | Edit subject name/branch/description |
| DELETE | `/:id` | Admin only | Soft delete a subject |

**POST `/`** request body:
```json
{
    "_id": "my_subject_1234",
    "name": "My Subject",
    "branch": "Electrical",
    "description": "Optional description",
    "icon": "zap",
    "theme": "branch-elec",
    "isMain": false
}
```

**PATCH `/:id`** request body:
```json
{
    "name": "Updated Subject Name",
    "branch": "Electronics",
    "description": "Updated description"
}
```

**GET `/` response:**
```json
{
    "success": true,
    "subjects": [
        {
            "_id": "em_1",
            "name": "Electrical Machines 1",
            "branch": "Electrical",
            "description": "DC machines and transformers.",
            "icon": "zap",
            "theme": "branch-elec",
            "isMain": false,
            "isActive": true
        }
    ]
}
```

---

### Files — `/api/files`

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/:subjectId` | None | Fetch all active files for a subject |
| POST | `/upload` | Admin only | Upload PDF to Supabase Storage |
| POST | `/link` | Admin only | Save an external/Google Drive link |
| DELETE | `/:fileId` | Admin only | Soft delete a file |

**POST `/upload`** — multipart/form-data:
```
file        → PDF or document file (max 200 MB)
subjectId   → e.g. 'em_1'
name        → optional display name
```

**POST `/link`** request body:
```json
{
    "subjectId": "em_1",
    "name": "Electrical Machines Notes.pdf",
    "url": "https://drive.google.com/file/d/...",
    "type": "Google Drive",
    "size": "Cloud Access"
}
```

**GET `/:subjectId` response:**
```json
{
    "success": true,
    "files": [
        {
            "_id": "64xyz...",
            "name": "Single Phase Transformers.pdf",
            "url": "https://chcqisnvvsrpicelthbw.supabase.co/storage/v1/object/public/pdfs/em_1/...",
            "type": "Supabase",
            "size": "4.20 MB"
        }
    ]
}
```

---

### Health — `/api/health`

| Method | Endpoint | Description |
|---|---|---|
| GET | `/api/health` | Server health check |

```json
{ "status": "ok" }
```

## 🔐 Auth Middleware

**`protect`** — verifies JWT from `Authorization: Bearer <token>` header, attaches `req.user`.

**`adminOnly`** — checks `req.user.role === 'admin'`, returns 403 if not.

Usage in routes:
```js
router.patch('/:id', protect, adminOnly, async (req, res) => { ... });
```

## 📤 File Upload Flow

```
Admin selects PDF in modal
        ↓
POST /api/files/upload  (multipart/form-data)
        ↓
Multer buffers file in memory (no disk write)
        ↓
uploadToSupabase() streams buffer → Supabase Storage bucket 'pdfs'
        ↓
Supabase returns public URL
        ↓
MongoDB saves { subjectId, name, url, type, size, bytes }
        ↓
Backend checks total storage (warns at 800 MB / 1 GB free tier)
        ↓
Frontend refreshes file list automatically
```

## ⚙️ Environment Variables

Create a `.env` file in the backend root:

```env
PORT=5000
MONGO_URI=mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/aman?appName=Cluster0
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_SERVICE_KEY=<your-supabase-service-role-key>
JWT_SECRET=<your-jwt-secret>
JWT_EXPIRES_IN=7d
CLIENT_ORIGIN=https://projectalps.netlify.app
```

> ⚠️ Never commit `.env` — it is in `.gitignore`. Add all vars manually in the Render dashboard.

## 🌱 Seeding the Database

Run these scripts once after first setup:

```bash
# Create the admin account
node scripts/createAdmin.js

# Seed all subjects into MongoDB
node scripts/seedSubjects.js

# (Optional) Seed old Google Drive file links
node scripts/seed.js
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

Server runs on `http://localhost:5000`

## 🚢 Deployment

Hosted on **Render** (free tier).

| Setting | Value |
|---|---|
| Runtime | Node |
| Build Command | `npm install` |
| Start Command | `npm start` |
| Region | Singapore |

> Free Render tier sleeps after 15 minutes of inactivity. First request after sleep takes ~2 minutes to wake up.

## 📦 Storage Plan

| Provider | Free Tier | Status |
|---|---|---|
| Supabase Storage | 1 GB | ✅ Active |
| Cloudflare R2 | 10 GB | 🔜 Planned migration at ~800 MB |

Migration will only require updating `upload.js` and `files.js`.

## 🔗 Related

- **Frontend Repo**: [gatehub-frontend](https://github.com/amanmehta276/gatehub-frontend)
- **Live Frontend**: https://projectalps.netlify.app