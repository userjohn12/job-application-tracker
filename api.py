
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from storage import load_applications, save_applications

app = FastAPI()


class Application(BaseModel):
    company: str
    role: str
    status: str
    location: str

class ApplicationUpdate(BaseModel):
    company: str | None = None
    role: str | None = None
    status: str | None = None
    location: str | None = None


@app.get("/")
def home():
    return {"message": "Welcome to Job Application Tracker!"}


@app.get("/applications")
def get_applications():
    return load_applications()


@app.post("/applications", status_code=201)
def create_application(application: Application):
    applications = load_applications()

    # Get the highest existing ID and add 1
    new_id = max(
        (app["id"] for app in applications),
        default=0
    ) + 1

    # Convert the Pydantic model into a dictionary
    new_application = application.model_dump()

    # Add the unique ID
    new_application["id"] = new_id

    # Add the application to the list
    applications.append(new_application)

    # Save the updated list to JSON
    save_applications(applications)

    return {
        "message": "Application added successfully!",
        "application": new_application
    }

@app.patch("/applications/{application_id}")
def update_application(
    application_id: int,
    update: ApplicationUpdate
):
    applications = load_applications()

    for application in applications:
        if application["id"] == application_id:

            changes = update.model_dump(exclude_unset=True)

            application.update(changes)

            save_applications(applications)

            return {
                "message": "Application updated successfully!",
                "application": application
            }

    return {"message": "Application not found"}

@app.delete("/applications/{application_id}")
def delete_application(application_id: int):
    applications = load_applications()

    for application in applications:
        if application["id"] == application_id:
            applications.remove(application)

            save_applications(applications)

            return {"message": "Application deleted successfully!"}

    raise HTTPException(
    status_code=404,
    detail="Application not found"
)
