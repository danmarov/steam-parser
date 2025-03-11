import uvicorn
from fastapi import FastAPI
from app.database import engine, Base
from app.routes import auth, profile

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.include_router(auth.router)
app.include_router(profile.router)

if __name__ == "__main__":
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
