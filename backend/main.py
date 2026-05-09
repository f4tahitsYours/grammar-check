from fastapi import FastAPI
from backend.routers.auth import router as auth_router
from backend.routers.student import router as student_router
from backend.routers.teacher import router as teacher_router
from backend.routers.admin import router as admin_router

app = FastAPI()

app.include_router(auth_router)
app.include_router(student_router)
app.include_router(teacher_router)
app.include_router(admin_router)

@app.get("/")
async def root():
    return {"message": "Backend running"}