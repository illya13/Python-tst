# Getting Started - Python Developer Test

Welcome! This guide will help you get started with the **Python** test project.

## Step 1: Read the Requirements

1. **Start here**: Read [TEST_REQUIREMENTS.md](./TEST_REQUIREMENTS.md)
2. **Quick reference**: Check [TEST_SUMMARY.md](./TEST_SUMMARY.md)
3. **Track progress**: Use [CANDIDATE_CHECKLIST.md](./CANDIDATE_CHECKLIST.md)

## Step 2: Set Up Your Environment

### Prerequisites

- **Python 3.9+** (you have 3.13+)
  ```bash
  python --version
  ```

- **Node.js 16+**
  ```bash
  node --version
  npm --version
  ```

### Install Dependencies

From `python-test/`:

1. **Python Backend**
   ```bash
   cd python-backend
   python -m venv .venv
   source .venv/bin/activate  # Windows: .venv\\Scripts\\activate
   pip install -r requirements.txt
   ```

2. **Node.js Backend**
   ```bash
   cd ../node-backend
   npm install
   ```

3. **React Frontend**
   ```bash
   cd ../react-frontend
   npm install
   ```

## Step 3: Start the Services

**Important**: Start services in this order (inside `python-test/`):

### Terminal 1: Python Backend
```bash
cd python-backend
source .venv/bin/activate
python -m app.main
```

### Terminal 2: Node.js Backend
```bash
cd node-backend
npm start
```

### Terminal 3: React Frontend
```bash
cd react-frontend
npm run dev
```

## Step 4: Verify Everything Works

- `curl http://localhost:8080/health`
- `curl http://localhost:8080/api/users`
- `curl http://localhost:3000/health`
- Open `http://localhost:5173` in a browser

## Implementation Tasks

See [TEST_REQUIREMENTS.md](./TEST_REQUIREMENTS.md) and [TEST_SUMMARY.md](./TEST_SUMMARY.md) for details. You will implement `POST`/`PUT` endpoints and logging in the Python backend (`app/main.py`).
