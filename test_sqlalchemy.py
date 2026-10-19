from sqlalchemy import select
from database import SessionLocal
from models import ApplicationDB

with SessionLocal() as db:
    statement = select(ApplicationDB)

    applications = db.scalars(statement).all()

    for application in applications:
        print(application.id)
        print(application.company)
        print(application.role)
        print(application.status)
        print(application.location)