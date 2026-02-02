# Python Developer Test Requirements

## Overview

This test project evaluates a **Python developer's** ability to work with HTTP APIs (FastAPI), data structures, error handling, and best practices. The project consists of a three-tier architecture where React calls Node.js, which calls the Python backend.

## Architecture

```
React Frontend (port 5173)
    ↓
Node.js Backend (port 3000) – API Gateway
    ↓
Python Backend (port 8080) – Data Source
```

## Current State

The project is set up with:
- **Python Backend**: FastAPI server serving users and tasks data
- **Node.js Backend**: API gateway that proxies requests to the Python backend
- **React Frontend**: UI that displays data from Node.js backend

## Test Requirements

### Phase 1: Understanding & Setup (30 minutes)

1. **Fork/Clone the repository** (or use the provided `python-test/` folder)
2. **Set up the development environment**
   - Ensure Python 3.9+ is installed
   - Ensure Node.js 16+ is installed
   - Install dependencies for Python, Node.js, and React
3. **Run all three services (inside `python-test/`)**
   - Start Python backend on port 8080
   - Start Node.js backend on port 3000
   - Start React frontend on port 5173
4. **Verify the application works**
   - Test all endpoints manually
   - Verify data flows correctly through all layers

### Phase 2: Core Requirements (2–3 hours)

#### 2.1 Add User Creation Endpoint (Required)

**Task**: Implement a POST endpoint in the Python backend to create new users.

**Requirements**:
- Add `POST /api/users` endpoint in `python-backend/app/main.py`
- Accept JSON body with: `name`, `email`, `role`
- Validate all fields are present and non-empty
- Validate email format (basic validation is acceptable)
- Generate a unique ID (increment from max existing ID)
- Return the created user with status 201
- Handle errors appropriately (400 for validation, 500 for server errors)

**Expected Behavior**:
- Successfully create users via API
- New users should appear in the GET `/api/users` response
- Invalid requests should return appropriate error messages

#### 2.2 Add Task Creation Endpoint (Required)

**Task**: Implement a POST endpoint in the Python backend to create new tasks.

**Requirements**:
- Add `POST /api/tasks` endpoint
- Accept JSON body with: `title`, `status`, `userId`
- Validate all fields are present
- Validate `status` is one of: `"pending"`, `"in-progress"`, `"completed"`
- Validate `userId` exists in the users list
- Generate a unique ID
- Return the created task with status 201
- Handle errors appropriately

**Expected Behavior**:
- Successfully create tasks via API
- New tasks should appear in the GET `/api/tasks` response
- Invalid `userId` should return 400 error
- Invalid `status` should return 400 error

#### 2.3 Implement Task Update Endpoint (Required)

**Task**: Implement a PUT endpoint to update existing tasks.

**Requirements**:
- Add `PUT /api/tasks/{id}` endpoint
- Accept JSON body with optional fields: `title`, `status`, `userId`
- Update only provided fields (partial updates)
- Validate `status` if provided
- Validate `userId` exists if provided
- Return 404 if task not found
- Return updated task with status 200
- Handle errors appropriately

**Expected Behavior**:
- Successfully update task fields
- Partial updates work correctly
- Non-existent task IDs return 404

#### 2.4 Add Request Logging (Required)

**Task**: Add structured logging for all HTTP requests in the Python backend.

**Requirements**:
- Log all incoming requests with:
  - HTTP method
  - Request path
  - Response status code
  - Response time (duration)
- Use Python logging or FastAPI middleware
- Format logs consistently
- Log errors with appropriate detail

**Expected Behavior**:
- All API requests are logged to console
- Logs are readable and informative
- Error logs include relevant context

### Phase 3: Advanced Requirements (2–3 hours, Optional)

You can adapt the Go/Java advanced requirements to Python if you have time:
- Persistence (e.g., SQLite, Postgres, or JSON file)
- Caching
- Validation middleware
- Enhanced health checks

### Phase 4: Code Quality & Best Practices (Ongoing)

- Follow Python and FastAPI best practices
- Organize code into logical modules
- Keep functions focused and single-purpose
- Add meaningful comments for complex logic
- Remove unused code

### Phase 5: Bonus Tasks (Optional)

- Authentication (API keys, JWT, etc.)
- Rate limiting
- Metrics/observability
- Database integration

## Evaluation Criteria

- **Technical Skills**: correctness, error handling, tests
- **Python/FastAPI Best Practices**: idiomatic code, use of framework features
- **Problem Solving**: architecture, handling edge cases, documentation

## Time Expectations

- **Minimum**: Complete Phase 2 (Core Requirements) – 2–3 hours
- **Recommended**: Phase 2 + some Phase 3 – 4–5 hours
- **Excellent**: Phase 2 + Phase 3 + strong code quality – 6–8 hours

## Notes

- Focus on code quality over quantity
- It's better to complete fewer features well than many features poorly
- Document your thought process in code comments

**Good luck!**
