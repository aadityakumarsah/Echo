### Clario
Clario is a private, voice-first companion for reflection and emotional clarity. Many people cannot keep a regular written journal or access therapy when they need it. Nights and off-hours are when distress often hits hardest, yet professionals are rarely available—and not everyone wants to type into a screen or keep a handwritten log when they need to get things out. Clario offers a structured, confidential space to speak freely, slow down, and make sense of stress, low mood, or overload—without replacing professional care when that is available to you.

### Features
Guided reflection: A calm, conversational flow that helps you put words to what you are feeling.

Privacy first: Built on Supabase for authentication and data practices designed around user privacy.

Voice journaling: Speak naturally; Clario listens and helps you trace patterns over time.

Support for everyday mental load: Useful for burnout, anxiety, and loneliness when you need an outlet between—or instead of—formal support options.  

## Screenshots

| Home (light) | Dashboard (dark) |
| :---: | :---: |
| ![Home page — light theme](project_screenshots/Home%20Page%20-%20Light.png) | ![Dashboard — dark theme](project_screenshots/Dashboard%20-%20Dark.png) |

| Active call (light) | Journal entry (dark) |
| :---: | :---: |
| ![Voice session — light theme](project_screenshots/Call%20-%20Light.png) | ![Journal entry — dark theme](project_screenshots/Journal%20Entry%20-%20Dark.png) |

| Session report (light) | About (dark) |
| :---: | :---: |
| ![Session report — light theme](project_screenshots/Report%20-%20Light.png) | ![About page — dark theme](project_screenshots/About%20Page%20-%20Dark.png) |

### Tech Stack
Frontend: Vite, React, Tailwind CSS

Backend: Python (FastAPI/Flask), PostgreSQL

Database & Auth: Supabase

AI Engine: Google Gemini AI


## Quick Start

### Development Setup (Local)

**Backend:**
```bash
cd clario-backend
pip install -r requirements.txt
cp .env.example .env  # Add your API keys
python run.py
# Runs on http://localhost:8000
```

**Frontend:**
```bash
cd clario-frontend
npm install
npm run dev
# Runs on http://localhost:8080
```

**API Documentation:** http://localhost:8000/docs (interactive Swagger UI)

### Docker Deployment

```bash
# Full stack with Docker Compose
docker-compose up -d

# Or individual builds
docker build -f clario-backend/Dockerfile -t clario-backend .
docker build -f clario-frontend/Dockerfile -t clario-frontend .
```

## Requirements & Documentation

### Backend Requirements
- **Python 3.11+** with pip or uv
- **Dependencies:** See `requirements.txt`
- **External APIs:** Supabase, Google Gemini
- **Full Guide:** See [BACKEND_REQUIREMENTS.md](clario-backend/BACKEND_REQUIREMENTS.md)

### Frontend Requirements
- **Node.js 18+** with npm, bun, or pnpm
- **No additional setup** beyond `npm install`

## Environment Variables

Template files provided:
- Backend: `clario-backend/.env.example` and `.env.production.example`
- Frontend: `clario-frontend/.env.example` and `.env.production.example`

See [HOSTING_SETUP.md](HOSTING_SETUP.md) for complete configuration guide.

## Deployment Guides

- **Quick Reference:** [DEPLOYMENT_QUICK_REFERENCE.md](DEPLOYMENT_QUICK_REFERENCE.md)
- **Full Setup Guide:** [HOSTING_SETUP.md](HOSTING_SETUP.md)
- **Backend Details:** [clario-backend/BACKEND_REQUIREMENTS.md](clario-backend/BACKEND_REQUIREMENTS.md)

### Popular Platforms
- **Vercel** (frontend) - See HOSTING_SETUP.md
- **Railway.app** (backend & frontend) - See HOSTING_SETUP.md
- **Docker** (any cloud) - See docker-compose.yml
- **AWS, Heroku, Render** (see HOSTING_SETUP.md)

## Project Structure

```
clario/
├── clario-backend/          # FastAPI server
│   ├── app/                 # Application code
│   ├── requirements.txt     # Python dependencies
│   ├── BACKEND_REQUIREMENTS.md
│   ├── Dockerfile           # Docker image
│   ├── Procfile            # Heroku deployment
│   ├── .env.example        # Development env template
│   └── .env.production.example # Production env template
├── clario-frontend/         # React + Vite app
│   ├── src/                # React components
│   ├── package.json        # Node dependencies
│   ├── Dockerfile          # Docker image
│   ├── .env.example        # Development env template
│   └── .env.production.example # Production env template
├── docker-compose.yml      # Full-stack Docker setup
├── HOSTING_SETUP.md        # Comprehensive deployment guide
└── DEPLOYMENT_QUICK_REFERENCE.md # Quick commands
```

## Features

- **Guided reflection:** Conversational AI helps process thoughts
- **Privacy first:** All data encrypted with Supabase
- **Voice journaling:** Speak naturally, AI transcribes and analyzes
- **Pattern tracking:** Identify emotional trends over time
- **Real-time interaction:** WebSocket-based live conversations

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, TailwindCSS |
| Backend | FastAPI, Uvicorn, Gunicorn |
| AI Engine | Google Gemini (real-time conversations) |
| Database | Supabase (PostgreSQL, Auth, Real-time) |
| Deployment | Docker, Docker Compose |

## Security

- ✅ Environment variables for all sensitive data
- ✅ Configurable CORS for production
- ✅ Service role keys for backend API calls
- ✅ Row-level security in Supabase
- ✅ HTTPS ready

## Health Checks

```bash
# Backend health
curl http://localhost:8000

# Frontend dev server
curl http://localhost:8080

# Docker container health
docker-compose ps
docker-compose logs backend
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| Backend won't start | Check Python 3.11+, install requirements.txt, verify .env |
| Frontend build fails | Clear node_modules, run npm install, check .env |
| CORS errors | Update ALLOWED_ORIGINS in backend .env |
| Port in use | Change PORT in .env or use different port |
| API 500 error | Check backend logs and API keys in .env |

See [HOSTING_SETUP.md](HOSTING_SETUP.md#troubleshooting) for more troubleshooting.

## API Documentation

Once running, access interactive API docs:
- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

## License

[Add your license here]

### Contributors
Aaditya Sah
Shubham Shakya
Subash Khatri
Suyasa Sigdel
Swastik Bhandari
