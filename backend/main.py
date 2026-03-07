from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.core.firebase_admin import init_firebase

# Initialize Firebase on startup
init_firebase()

app = FastAPI(title="Neeva API", description="AI Mental Wellness Companion API")

# CORS Configuration
origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://neeva-ai.vercel.app",
    "https://neevaai.vercel.app",
]

import os
_extra_origin = os.getenv("FRONTEND_URL")
if _extra_origin:
    origins.append(_extra_origin)

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from app.api.api import api_router
app.include_router(api_router, prefix="/api")

@app.get("/")
async def root():
    return {"message": "Welcome to Neeva API"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}
