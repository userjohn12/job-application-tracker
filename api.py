from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import Literal
from sqlalchemy import select

from database import SessionLocal
from models import ApplicationDB

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=False,
    allow_methods=["GET", "POST", "PATCH", "DELETE"],
    allow_headers=["Content-Type"],
)

class Application(BaseModel):
    company: str = Field(min_length=1, max_length=100)
    role: str = Field(min_length=1, max_length=100)
    status: Literal["Applied", "Interview", "Offer", "Rejected"]
    location: str = Field(min_length=1, max_length=100)

class ApplicationUpdate(BaseModel):
    company: str = Field(default=None, min_length=1, max_length=100)
    role: str = Field(default=None, min_length=1, max_length=100)
    status: Literal["Applied", "Interview", "Offer", "Rejected"] = None
    location: str = Field(default=None, min_length=1, max_length=100)

@app.get("/")
def home():
    return {"message": "Welcome to Job Application Tracker!"}


@app.get("/applications")
def get_applications():
    with SessionLocal() as db:
        statement = select(ApplicationDB)

        applications = db.scalars(statement).all()

        return [
            {
                "id": application.id,
                "company": application.company,
                "role": application.role,
                "status": application.status,
                "location": application.location
            }
            for application in applications
        ]


@app.post("/applications", status_code=201)
def create_application(application: Application):
    with SessionLocal() as db:

        new_application = ApplicationDB(
            **application.model_dump()
        )

        db.add(new_application)
        db.commit()
        db.refresh(new_application)

        return {
            "message": "Application added successfully!",
            "application": {
                "id": new_application.id,
                "company": new_application.company,
                "role": new_application.role,
                "status": new_application.status,
                "location": new_application.location
            }
        }

@app.patch("/applications/{application_id}")
def update_application(application_id: int, update: ApplicationUpdate):
    with SessionLocal() as db:

        application = db.get(ApplicationDB, application_id)

        if application is None:
            raise HTTPException(
                status_code=404,
                detail="Application not found"
            )

        changes = update.model_dump(exclude_unset=True)

        for field, value in changes.items():
            setattr(application, field, value)

        db.commit()
        db.refresh(application)

        return {
            "message": "Application updated successfully!",
            "application": {
                "id": application.id,
                "company": application.company,
                "role": application.role,
                "status": application.status,
                "location": application.location
            }
        }

@app.delete("/applications/{application_id}")
def delete_application(application_id: int):
    with SessionLocal() as db:

        application = db.get(ApplicationDB, application_id)

        if application is None:
            raise HTTPException(
                status_code=404,
                detail="Application not found"
            )

        db.delete(application)
        db.commit()

        return {
            "message": "Application deleted successfully!"
        }