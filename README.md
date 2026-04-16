# Scholar X — Free Online Learning Platform

This is the Mini Project Of Full Stack Development Lab 
---
A full-stack online learning platform inspired by Google Classroom + Physics Wallah. Built with React, Node.js, MongoDB, Socket.io, and WebRTC. 100% free, no payment system.
This is the Mini Project Of Full Stack Development Lab 

---

## Tech Stack

| Layer      | Technology                            |
|------------|---------------------------------------|
| Frontend   | React 18 + Vite, Tailwind CSS, Axios  |
| Backend    | Node.js + Express.js                  |
| Database   | MongoDB + Mongoose                    |
| Auth       | JWT + bcryptjs                        |
| Realtime   | Socket.io + WebRTC                    |
| Uploads    | Multer (local file storage)           |

---

## Features

- **Role-based auth** — Student & Teacher dashboards
- **Course management** — Create courses with unique join codes
- **Lectures** — Upload video files (Multer) or embed YouTube/URL
- **Assignments** — Create, submit, grade with file uploads
- **Announcements** — Course-level announcements feed
- **Live Classes** — Full WebRTC video/audio calls with chat
- **Profile** — Update name, bio, avatar, change password

---

## Project Structure

```
scholarx/
├── backend/
│   ├── controllers/       # Business logic
│   ├── middleware/        # Auth + error handler
│   ├── models/            # Mongoose schemas
│   ├── routes/            # Express routes
│   ├── utils/             # DB, Socket, Multer
│   ├── uploads/           # Uploaded files (auto-created)
│   ├── server.js
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── components/    # Layout + reusable UI
    │   ├── context/       # Auth context
    │   ├── hooks/         # Custom React hooks
    │   ├── pages/         # All page components
    │   ├── services/      # Axios instance
    │   └── utils/         # Helper functions
    ├── index.html
    └── .env.example
```

---

## Local Setup (macOS / Linux / Windows)

### Prerequisites

1. **Node.js LTS** — https://nodejs.org  
   Verify: `node -v` (should be 18+)

2. **MongoDB** — Install MongoDB Community Edition or use MongoDB Compass  
   - macOS: `brew tap mongodb/brew && brew install mongodb-community`  
   - Start: `brew services start mongodb-community`  
   - Or use MongoDB Compass GUI: https://www.mongodb.com/products/compass

3. **Git** — https://git-scm.com

---

### Step 1 — Clone or extract the project

```bash
# If using git
git clone <your-repo-url> scholarx
cd scholarx

# Or extract the ZIP and cd into it
```

---

### Step 2 — Backend Setup

```bash
cd backend
npm install
```

Create the `.env` file:
```bash
cp .env.example .env
```

Edit `.env`:
```env
PORT=5050
MONGO_URI=mongodb://127.0.0.1:27017/scholarx
JWT_SECRET=change_this_to_a_long_random_string_in_production
CLIENT_URL=http://localhost:5173
```

Start the backend:
```bash
# Development (with auto-restart)
npm run dev

# Production
npm start
```

You should see:
```
Scholar X server running on port 5050
MongoDB connected: 127.0.0.1
```

---

### Step 3 — Frontend Setup

Open a new terminal:
```bash
cd frontend
npm install
```

Create the `.env` file:
```bash
cp .env.example .env
```

Edit `.env`:
```env
VITE_API_URL=http://localhost:5050
```

Start the frontend:
```bash
npm run dev
```

You should see:
```
VITE v5.x.x ready
➜  Local: http://localhost:5173/
```

---

### Step 4 — Open the app

Visit: **http://localhost:5173**

1. Click "Get Started Free"
2. Register as a **Teacher** → Create a course → Copy the course code
3. Open a new incognito window → Register as a **Student** → Join with the code
4. Explore lectures, assignments, live class!

---

## API Endpoints Reference

### Auth
| Method | Endpoint           | Description       |
|--------|--------------------|-------------------|
| POST   | /api/auth/register | Register new user |
| POST   | /api/auth/login    | Login             |
| GET    | /api/auth/me       | Get current user  |

### Courses
| Method | Endpoint                              | Role    |
|--------|---------------------------------------|---------|
| POST   | /api/courses                          | Teacher |
| GET    | /api/courses/my-courses               | Teacher |
| GET    | /api/courses/enrolled                 | Student |
| POST   | /api/courses/join                     | Student |
| GET    | /api/courses/:id                      | Both    |
| PUT    | /api/courses/:id                      | Teacher |
| DELETE | /api/courses/:id/students/:studentId  | Teacher |

### Lectures
| Method | Endpoint                    | Role    |
|--------|-----------------------------|---------|
| POST   | /api/lectures               | Teacher |
| GET    | /api/lectures/course/:id    | Both    |
| DELETE | /api/lectures/:id           | Teacher |

### Assignments
| Method | Endpoint                                    | Role    |
|--------|---------------------------------------------|---------|
| POST   | /api/assignments                            | Teacher |
| GET    | /api/assignments/course/:id                 | Both    |
| DELETE | /api/assignments/:id                        | Teacher |
| GET    | /api/assignments/:id/submissions            | Teacher |
| PATCH  | /api/assignments/:id/submissions/:sid/grade | Teacher |

### Submissions
| Method | Endpoint            | Role    |
|--------|---------------------|---------|
| POST   | /api/submissions    | Student |
| GET    | /api/submissions/mine | Student |

### Announcements
| Method | Endpoint                         | Role    |
|--------|----------------------------------|---------|
| POST   | /api/announcements               | Teacher |
| GET    | /api/announcements/course/:id    | Both    |
| DELETE | /api/announcements/:id           | Teacher |

### Live Class
| Method | Endpoint                         | Role    |
|--------|----------------------------------|---------|
| POST   | /api/live/start                  | Teacher |
| GET    | /api/live/course/:id/active      | Both    |
| PATCH  | /api/live/:id/end                | Teacher |
| GET    | /api/live/course/:id/history     | Both    |

### Users
| Method | Endpoint                  | Role |
|--------|---------------------------|------|
| PUT    | /api/users/profile        | Both |
| PUT    | /api/users/change-password | Both |

---

## Deployment Guide

### Step 1 — Push to GitHub

```bash
# In the root scholarx/ folder
git init
git add .
git commit -m "Initial commit: Scholar X"
git branch -M main
git remote add origin https://github.com/<your-username>/scholarx.git
git push -u origin main
```

Make sure `.gitignore` files exist (see below).

---

### Step 2 — Set up MongoDB Atlas (Cloud Database)

1. Go to https://cloud.mongodb.com
2. Create a free account → Create a free M0 cluster
3. Under **Database Access** → Add a user (username + password)
4. Under **Network Access** → Add IP: `0.0.0.0/0` (allow all)
5. Click **Connect** → **Compass** or **Drivers** → Copy the connection string:
   ```
   mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/scholarx?retryWrites=true&w=majority
   ```

---

### Step 3 — Deploy Backend on Render

1. Go to https://render.com → Sign up with GitHub
2. Click **New → Web Service** → Connect your repo
3. Configure:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
   - **Node Version**: 18
4. Under **Environment Variables**, add:
   ```
   PORT=5050
   MONGO_URI=<your Atlas connection string>
   JWT_SECRET=<strong random string>
   CLIENT_URL=https://your-vercel-app.vercel.app
   ```
5. Click **Deploy** — note the URL: `https://scholarx-api.onrender.com`

---

### Step 4 — Deploy Frontend on Vercel

1. Go to https://vercel.com → Sign up with GitHub
2. Click **New Project** → Import your repo
3. Configure:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Under **Environment Variables**, add:
   ```
   VITE_API_URL=https://scholarx-api.onrender.com
   ```
5. Click **Deploy** — note the URL: `https://scholarx.vercel.app`

---

### Step 5 — Fix CORS After Deployment

Go back to Render → Your backend service → Environment Variables  
Update `CLIENT_URL` to your actual Vercel URL:
```
CLIENT_URL=https://scholarx.vercel.app
```
Redeploy the backend.

---

### Step 6 — Verify Everything Works

- Visit your Vercel URL
- Register a teacher account
- Create a course, add a lecture
- Open incognito → Register a student → Join with course code
- Test live class (requires HTTPS in production — Vercel + Render both provide this)

---

## .gitignore Files

**backend/.gitignore**
```
node_modules/
uploads/
.env
*.log
```

**frontend/.gitignore**
```
node_modules/
dist/
.env
.env.local
```

---

## Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| `ECONNREFUSED` on backend | MongoDB not running — run `brew services start mongodb-community` |
| Port 5050 already in use | `lsof -ti:5050 \| xargs kill` |
| CORS error in production | Set `CLIENT_URL` env var to exact Vercel URL (no trailing slash) |
| Camera not working in Live Class | Must use HTTPS (works on Vercel/Render, not `http://localhost` in some browsers) |
| Files not uploading | Check `uploads/` directory exists — it auto-creates on first upload |
| 401 Unauthorized | JWT token expired — log out and log in again |
| Render cold starts slow | Free tier sleeps after inactivity — first request takes ~30s |

---

## Environment Variables Summary

### Backend (.env)
```env
PORT=5050
MONGO_URI=mongodb://127.0.0.1:27017/scholarx
JWT_SECRET=your_super_secret_jwt_key_min_32_chars
CLIENT_URL=http://localhost:5173
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5050
```

---

👨‍💻 Author
Pritesh Bagul
B.Tech Computer Engineering Student
