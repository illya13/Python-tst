# Python Developer Test Project

This project is designed to test **Python developers'** skills in building a backend service (FastAPI) that powers a React + Node.js application.

## 📚 Documentation

- **[Getting Started](./GETTING_STARTED.md)** – Python test setup guide
- **[Test Requirements](./TEST_REQUIREMENTS.md)** – Complete Python test requirements and evaluation criteria
- **[Test Summary](./TEST_SUMMARY.md)** – Quick overview of required tasks
- **[Candidate Checklist](./CANDIDATE_CHECKLIST.md)** – Track your progress

## Project Structure

```
python-test/
├── python-backend/   # FastAPI HTTP server (data source)
├── node-backend/     # Node.js Express API server (calls Python backend)
└── react-frontend/   # React frontend (calls Node.js backend)
```

## Architecture Flow

```
React Frontend (port 5173)
    ↓
Node.js Backend (port 3000)
    ↓
Python Backend (port 8080)
```

## Quick Start

**Important:** Start services in this order (inside `python-test/`):

### 1. Start Python Backend (Data Source)

```bash
cd python-backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\\Scripts\\activate
pip install -r requirements.txt
python -m app.main
```

The Python backend will run on `http://localhost:8080` and serves as the data source.

### 2. Start Node.js Backend (API Gateway)

In a new terminal:

```bash
cd node-backend
npm install
npm start
```

The Node.js backend will run on `http://localhost:3000` and proxies requests to the Python backend.

### 3. Start React Frontend

In a new terminal:

```bash
cd react-frontend
npm install
npm run dev
```

The React frontend will run on `http://localhost:5173` and calls the Node.js backend.

## Project Overview

### Python Backend (Data Source)
A FastAPI server that:
- Serves as the primary data source
- Stores users and tasks in-memory
- Exposes REST endpoints (`/api/users`, `/api/tasks`, `/api/stats`)
- Handles JSON requests/responses
- Uses a thread-safe in-memory data store

### Node.js Backend (API Gateway)
Same as other tests: proxies frontend requests to the Python backend.

### React Frontend
Same UI as other tests: shows users, tasks, stats, and health.

## Test Requirements

**📋 See [TEST_REQUIREMENTS.md](./TEST_REQUIREMENTS.md) for detailed Python test requirements and evaluation criteria.**
