# GateHub Backend

Node.js + Express backend that replaces the static `ASSETS_REPOSITORY`
with a real API backed by **MongoDB** and **Cloudinary**.

---

## Folder Structure

```
gatehub-backend/
├── config/
│   ├── cloudinary.js      # Cloudinary SDK init
│   └── db.js              # MongoDB connection
├── middleware/
│   ├── auth.js            # Admin secret guard
│   └── upload.js          # Multer (memory) + Cloudinary stream helper
├── models/
│   └── File.js            # Mongoose schema for file metadata
├── routes/
│   └── files.js           # All /api/files & /api/upload routes
├── scripts/
│   └── seed.js            # One-time migration of old Google Drive links
├── .env.example           # Template — copy to .env and fill in values
├── .gitignore
├── package.json
├── server.js              # Express entry point
└── script.js              # ← REPLACE your frontend script.js with this file
```

---

## Quick Start

### 1. Prerequisites

| Tool | Min version |
|------|-------------|
| Node.js | 18 |
| npm | 9 |
| MongoDB Atlas account | free tier OK |
| Cloudinary account | free tier OK |

---

### 2. Install dependencies

```bash
cd gatehub-backend
npm install
```

---

### 3. Configure environment variables

```bash
cp .env.example .env
```

Open `.env` and fill in:

```
PORT=5000
MONGO_URI=mongodb+srv://<user>:<pass>@cluster.mongodb.net/gatehub
CLOUDINARY_CLOUD_NAME=xxxxx
CLOUDINARY_API_KEY=xxxxx
CLOUDINARY_API_SECRET=xxxxx
ADMIN_SECRET=pick_a_strong_secret
CLIENT_ORIGIN=http://127.0.0.1:5500    # your frontend origin
```

#### Getting MongoDB URI
1. Go to https://cloud.mongodb.com
2. Create a free cluster → Connect → Drivers
3. Copy the connection string and replace `<password>`

#### Getting Cloudinary credentials
1. Go to https://cloudinary.com → Dashboard
2. Copy Cloud Name, API Key, API Secret

---

### 4. Migrate existing Google Drive links (one-time)

```bash
node scripts/seed.js
```

This inserts all your old links into MongoDB so they appear immediately
without any re-upload.

---

### 5. Start the backend

```bash
# Development (auto-restarts on save)
npm run dev

# Production
npm start
```

You should see:
```
✅  MongoDB connected: cluster0.xxxxx.mongodb.net
🚀  GateHub backend running on http://localhost:5000
```

---

### 6. Connect the frontend

1. **Replace** your old `script.js` with the `script.js` file from this folder.
2. Open it and set `API_BASE` to your backend URL:
   ```js
   // Local development
   const API_BASE = 'http://localhost:5000/api';

   // After deploying (e.g. Render / Railway)
   const API_BASE = 'https://gatehub-api.onrender.com/api';
   ```
3. Set `ADMIN_SECRET` to match the value in your `.env`.
4. Keep your `index.html` and `style.css` exactly as they are — zero changes needed.

---

## API Reference

### `GET /api/files/:subjectId`
Returns all active files for a subject.

```json
{
  "success": true,
  "files": [
    { "_id": "...", "name": "EPS-Resource-v1.pdf", "url": "https://...", "type": "Cloudinary", "size": "2.40 MB" }
  ]
}
```

---

### `POST /api/upload` *(admin)*
Upload a PDF to Cloudinary. Requires header `x-admin-secret`.

**Form fields:**
| Field | Required | Description |
|-------|----------|-------------|
| `file` | ✅ | Binary (PDF / Office doc, max 50 MB) |
| `subjectId` | ✅ | e.g. `eca`, `em_1`, `dsp` |
| `name` | optional | Display name shown in UI |

---

### `POST /api/files/link` *(admin)*
Save an external (Google Drive) link without uploading. Requires header `x-admin-secret`.

**JSON body:**
```json
{ "subjectId": "eca", "name": "My Notes.pdf", "url": "https://drive.google.com/..." }
```

---

### `DELETE /api/files/:fileId` *(admin)*
Soft-deletes a file (removes from UI, purges from Cloudinary if applicable).
Requires header `x-admin-secret`.

---

## Deploying the Backend

Recommended free options: **Render**, **Railway**, or **Fly.io**

### Render (easiest)
1. Push this folder to a GitHub repo
2. New Web Service → connect repo
3. Build command: `npm install`
4. Start command: `npm start`
5. Add environment variables in the Render dashboard
6. Copy the generated URL into `API_BASE` in `script.js`

---

## How the Upload Flow Works Now

```
Admin selects PDF in modal
        │
        ▼
POST /api/upload  (multipart, x-admin-secret header)
        │
        ▼
Multer buffers file in memory  (no disk write)
        │
        ▼
streamUploadToCloudinary()  pipes buffer → Cloudinary
        │
        ▼
Cloudinary returns { secure_url, public_id, bytes }
        │
        ▼
MongoDB saves { subjectId, name, url, type, size, cloudinaryPublicId }
        │
        ▼
Frontend GET /api/files/:subjectId  refreshes the list automatically
```

No more manual link-pasting. No redeployment needed.