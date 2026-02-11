from fastapi import FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Literal
from threading import RLock
import os
import logging
import time
import re

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

DEFAULT_PORT = 8080


class User(BaseModel):
    id: int
    name: str
    email: str
    role: str


class Task(BaseModel):
    id: int
    title: str
    status: str
    userId: int


class UsersResponse(BaseModel):
    users: List[User]
    count: int


class TasksResponse(BaseModel):
    tasks: List[Task]
    count: int


class UsersStats(BaseModel):
    total: int


class TasksStats(BaseModel):
    total: int
    pending: int
    inProgress: int
    completed: int


class StatsResponse(BaseModel):
    users: UsersStats
    tasks: TasksStats


class HealthResponse(BaseModel):
    status: str
    message: str


# Request models for input validation
class UserCreate(BaseModel):
    name: str
    email: str
    role: str


class TaskCreate(BaseModel):
    title: str
    status: Literal["pending", "in-progress", "completed"]
    userId: int


class TaskUpdate(BaseModel):
    title: Optional[str] = None
    status: Optional[Literal["pending", "in-progress", "completed"]] = None
    userId: Optional[int] = None


# Email validation regex pattern
EMAIL_PATTERN = re.compile(r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$")


class DataStore:
    def __init__(self) -> None:
        self._lock = RLock()
        self._users: List[User] = [
            User(id=1, name="John Doe", email="john@example.com", role="developer"),
            User(id=2, name="Jane Smith", email="jane@example.com", role="designer"),
            User(id=3, name="Bob Johnson", email="bob@example.com", role="manager"),
        ]
        self._tasks: List[Task] = [
            Task(id=1, title="Implement authentication", status="pending", userId=1),
            Task(id=2, title="Design user interface", status="in-progress", userId=2),
            Task(id=3, title="Review code changes", status="completed", userId=3),
        ]

    def get_users(self) -> List[User]:
        with self._lock:
            return list(self._users)

    def get_user_by_id(self, user_id: int) -> Optional[User]:
        with self._lock:
            for user in self._users:
                if user.id == user_id:
                    return user
        return None

    def get_tasks(self, status: str = "", user_id: str = "") -> List[Task]:
        with self._lock:
            filtered: List[Task] = []
            for task in self._tasks:
                match_status = not status or task.status == status
                match_user_id = True
                if user_id:
                    try:
                        uid = int(user_id)
                        match_user_id = task.userId == uid
                    except ValueError:
                        match_user_id = False
                if match_status and match_user_id:
                    filtered.append(task)
            return filtered

    def get_stats(self) -> StatsResponse:
        with self._lock:
            users_total = len(self._users)
            tasks_total = len(self._tasks)
            pending = in_progress = completed = 0
            for task in self._tasks:
                if task.status == "pending":
                    pending += 1
                elif task.status == "in-progress":
                    in_progress += 1
                elif task.status == "completed":
                    completed += 1

            return StatsResponse(
                users=UsersStats(total=users_total),
                tasks=TasksStats(
                    total=tasks_total,
                    pending=pending,
                    inProgress=in_progress,
                    completed=completed,
                ),
            )

    def add_user(self, name: str, email: str, role: str) -> User:
        with self._lock:
            max_id = max((u.id for u in self._users), default=0)
            new_user = User(id=max_id + 1, name=name, email=email, role=role)
            self._users.append(new_user)
            return new_user

    def add_task(self, title: str, status: str, user_id: int) -> Task:
        with self._lock:
            max_id = max((t.id for t in self._tasks), default=0)
            new_task = Task(id=max_id + 1, title=title, status=status, userId=user_id)
            self._tasks.append(new_task)
            return new_task

    def get_task_by_id(self, task_id: int) -> Optional[Task]:
        with self._lock:
            for task in self._tasks:
                if task.id == task_id:
                    return task
            return None

    def update_task(
        self,
        task_id: int,
        title: Optional[str] = None,
        status: Optional[str] = None,
        user_id: Optional[int] = None,
    ) -> Optional[Task]:
        with self._lock:
            for i, task in enumerate(self._tasks):
                if task.id == task_id:
                    updated = Task(
                        id=task.id,
                        title=title if title is not None else task.title,
                        status=status if status is not None else task.status,
                        userId=user_id if user_id is not None else task.userId,
                    )
                    self._tasks[i] = updated
                    return updated
            return None


store = DataStore()
app = FastAPI(title="Python Backend Test Project")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.middleware("http")
async def log_requests(request: Request, call_next):
    start_time = time.time()
    response = await call_next(request)
    duration_ms = (time.time() - start_time) * 1000
    logger.info(f"{request.method} {request.url.path} - {response.status_code} - {duration_ms:.2f}ms")
    return response


@app.get("/health", response_model=HealthResponse)
async def health() -> HealthResponse:
    return HealthResponse(status="ok", message="Python backend is running")


@app.get("/api/users", response_model=UsersResponse)
async def get_users() -> UsersResponse:
    users = store.get_users()
    return UsersResponse(users=users, count=len(users))


@app.get("/api/users/{user_id}", response_model=User)
async def get_user_by_id(user_id: int) -> User:
    user = store.get_user_by_id(user_id)
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@app.post("/api/users", response_model=User, status_code=201)
async def create_user(user_data: UserCreate) -> User:
    # Validate non-empty fields
    if not user_data.name or not user_data.name.strip():
        raise HTTPException(status_code=400, detail="Name is required")
    if not user_data.email or not user_data.email.strip():
        raise HTTPException(status_code=400, detail="Email is required")
    if not user_data.role or not user_data.role.strip():
        raise HTTPException(status_code=400, detail="Role is required")

    # Validate email format
    if not EMAIL_PATTERN.match(user_data.email):
        raise HTTPException(status_code=400, detail="Invalid email format")

    return store.add_user(
        name=user_data.name.strip(),
        email=user_data.email.strip(),
        role=user_data.role.strip(),
    )


@app.get("/api/tasks", response_model=TasksResponse)
async def get_tasks(status: str = "", userId: str = "") -> TasksResponse:  # noqa: N803
    tasks = store.get_tasks(status=status, user_id=userId)
    return TasksResponse(tasks=tasks, count=len(tasks))


@app.post("/api/tasks", response_model=Task, status_code=201)
async def create_task(task_data: TaskCreate) -> Task:
    # Validate non-empty title
    if not task_data.title or not task_data.title.strip():
        raise HTTPException(status_code=400, detail="Title is required")

    # Validate userId exists
    if store.get_user_by_id(task_data.userId) is None:
        raise HTTPException(status_code=400, detail="User not found")

    return store.add_task(
        title=task_data.title.strip(),
        status=task_data.status,
        user_id=task_data.userId,
    )


@app.put("/api/tasks/{task_id}", response_model=Task)
async def update_task(task_id: int, task_data: TaskUpdate) -> Task:
    # Check if task exists
    existing_task = store.get_task_by_id(task_id)
    if existing_task is None:
        raise HTTPException(status_code=404, detail="Task not found")

    # Validate userId if provided
    if task_data.userId is not None and store.get_user_by_id(task_data.userId) is None:
        raise HTTPException(status_code=400, detail="User not found")

    # Validate title if provided
    if task_data.title is not None and not task_data.title.strip():
        raise HTTPException(status_code=400, detail="Title cannot be empty")

    updated_task = store.update_task(
        task_id=task_id,
        title=task_data.title.strip() if task_data.title else None,
        status=task_data.status,
        user_id=task_data.userId,
    )

    if updated_task is None:
        raise HTTPException(status_code=404, detail="Task not found")

    return updated_task


@app.get("/api/stats", response_model=StatsResponse)
async def get_stats() -> StatsResponse:
    return store.get_stats()


def get_port() -> int:
    port_str = os.getenv("PORT", str(DEFAULT_PORT))
    try:
        return int(port_str)
    except ValueError:
        return DEFAULT_PORT


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("app.main:app", host="0.0.0.0", port=get_port(), reload=False)
