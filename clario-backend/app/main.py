import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routers import websocket_router, auth_router, settings_router, sessions_router
from app.core.database import init_db

app = FastAPI()

@app.on_event("startup")
def on_startup():
    init_db()

# Configure CORS based on environment
ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS", 
    "http://localhost:3000,http://localhost:5173,http://localhost:8080"
).split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(settings_router)
app.include_router(sessions_router)
app.include_router(websocket_router)

@app.get("/", tags=['Root'])
def read_root():
    return {"message": "Clario Backend!"}



