import json

from sqlalchemy import select
from database import SessionLocal
from models import ApplicationDB

with open("applications.json", "r", encoding="utf-8") as file:
    old_applications = json.load(file)

with SessionLocal() as db:
    existing = db.scalars(select(ApplicationDB)).all()

    for application in old_applications:
        # Compare all four fields, not the old JSON ID
        already_exists = any(
            saved.company == application["company"]
            and saved.role == application["role"]
            and saved.status == application["status"]
            and saved.location == application["location"]
            for saved in existing
        )

        if already_exists:
            print(f"Skipping existing application: {application['company']}")
            continue

        new_application = ApplicationDB(
            company=application["company"],
            role=application["role"],
            status=application["status"],
            location=application["location"]
        )

        db.add(new_application)
        existing.append(new_application)

        print(f"Preparing to import: {application['company']}")

    db.commit()

print("Migration completed!")