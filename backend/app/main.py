from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api import sync

app = FastAPI(
    title="Tarkov Task Tracker API",
    description="Escape from Tarkov タスク進捗管理API",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {"message": "Tarkov Task Tracker API"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}


app.include_router(sync.router, prefix="/api", tags=["sync"])
