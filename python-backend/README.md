# Python Backend Test Project

This is the **Python developer test project** backend. It mirrors the Go backend's API and behavior using **FastAPI**.

## Stack

- Python 3.13 (works with 3.9+)
- FastAPI
- Uvicorn

## Project Structure

```
python-backend/
├── app/
│   ├── __init__.py
│   └── main.py          # FastAPI application
├── requirements.txt      # Python dependencies
└── README.md
```

## API Overview

The Python backend exposes the same read-only endpoints as the Go backend:

- `GET /health` – Health check
- `GET /api/users` – Get all users
- `GET /api/users/{id}` – Get a single user by ID
- `GET /api/tasks` – Get tasks, supports filters:
  - `GET /api/tasks?status=pending`
  - `GET /api/tasks?userId=1`
  - `GET /api/tasks?status=pending&userId=1`
- `GET /api/stats` – Aggregate statistics for users and tasks

Data is stored **in-memory** with a thread-safe `DataStore`, matching the Go backend's sample data and behavior.

## Running the Python Backend

From the repository root:

```bash
cd python-backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\\Scripts\\activate
pip install -r requirements.txt
python -m app.main
```

The backend will start on:

- `http://localhost:8080`

You can override the port with the `PORT` environment variable:

```bash
PORT=8081 python -m app.main
```

## Endpoints (Details)

### `GET /health`
- **Response**:
  ```json
  {"status": "ok", "message": "Python backend is running"}
  ```

### `GET /api/users`
- **Response**:
  ```json
  {
    "users": [ { "id": 1, "name": "John Doe", ... } ],
    "count": 3
  }
  ```

### `GET /api/users/{id}`
- Returns `404` if user is not found.

### `GET /api/tasks`
- Query params:
  - `status`: `"pending" | "in-progress" | "completed"`
  - `userId`: integer user ID

### `GET /api/stats`
- **Response**:
  ```json
  {
    "users": { "total": 3 },
    "tasks": {
      "total": 3,
      "pending": 1,
      "inProgress": 1,
      "completed": 1
    }
  }
  ```

## For Python Candidates

As a Python developer, you will primarily work in the `python-backend/` folder.

Typical test tasks (analogous to the Go test) would be:
- Implement `POST /api/users` – create user
- Implement `POST /api/tasks` – create task
- Implement `PUT /api/tasks/{id}` – update task
- Add structured request logging
- (Optionally) add persistence, validation middleware, etc.

Focus on writing clean, idiomatic Python with FastAPI best practices.
